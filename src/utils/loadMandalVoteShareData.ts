import { normalizeACName, normalizeOrgDistrictName, normalizeZoneName } from './nameNormalization';
import { loadCSVWithRetry, getLoadingState, subscribeToLoadingState, clearDataCache } from './dataLoadingManager';
import { cleanDataField, parsePercentage, parseNumeric } from './csvParser';

// Utility to load Mandal-level vote share data from CSV
export interface MandalVoteShareRowData {
  Zone: string;
  'Org District': string;
  AC: string;
  'Org Mandal': string;
  '2020 LSG VS': string;
  '2020 LSG Votes': string;
  '2024 GE VS': string;
  '2024 GE Votes': string;
  '2025 LSG VS': string;
  '2025 LSG Votes': string;
}

export interface MandalVoteShareData {
  [zone: string]: {
    [orgDistrict: string]: {
      [ac: string]: {
        name: string;
        lbName: string;
        lsg2020: { vs: string; votes: string };
        ge2024: { vs: string; votes: string };
        target2025: { vs: string; votes: string };
      }[];
    };
  };
}

let mandalVoteShareDataCache: MandalVoteShareData | null = null;

export async function loadMandalVoteShareData(): Promise<MandalVoteShareData> {
  if (mandalVoteShareDataCache) {
    console.log('🎯 Returning cached Mandal vote share data');
    return mandalVoteShareDataCache;
  }

  const result = await loadCSVWithRetry<MandalVoteShareData>(
    'mandal-vote-share',
    '/data/votesharetarget/Local Body Target - Org Mandal Level - Vote Share (1).csv',
    (parseResult) => {
      const data: MandalVoteShareData = {};
      const errors: string[] = [];
      
      console.log(`📊 Processing ${parseResult.rows.length} rows of Mandal vote share data`);
      
      parseResult.rows.forEach((row, index) => {
        try {
          // Validate minimum column count
          if (row.length < 10) {
            errors.push(`Row ${index + 3}: Insufficient columns (${row.length}), skipping`);
            return;
          }
          
          const zone = cleanDataField(row[0]);
          const orgDistrict = cleanDataField(row[1]);
          const ac = cleanDataField(row[2]);
          const mandal = cleanDataField(row[3]);
          const lsg2020VS = parsePercentage(row[4]);
          const lsg2020Votes = row[5]?.trim() || '0';
          const ge2024VS = parsePercentage(row[6]);
          const ge2024Votes = row[7]?.trim() || '0';
          const target2025VS = parsePercentage(row[8]);
          const target2025Votes = row[9]?.trim() || '0';
          
          // Validate required fields
          if (!zone || !orgDistrict || !ac || !mandal) {
            errors.push(`Row ${index + 3}: Missing required fields (zone, orgDistrict, AC, or mandal), skipping`);
            return;
          }
          
          const normalizedZone = normalizeZoneName(zone);
          const normalizedOrgDistrict = normalizeOrgDistrictName(orgDistrict);
          const normalizedAC = normalizeACName(ac);
          
          if (!data[normalizedZone]) {
            data[normalizedZone] = {};
          }
          if (!data[normalizedZone][normalizedOrgDistrict]) {
            data[normalizedZone][normalizedOrgDistrict] = {};
          }
          if (!data[normalizedZone][normalizedOrgDistrict][normalizedAC]) {
            data[normalizedZone][normalizedOrgDistrict][normalizedAC] = [];
          }
          
          data[normalizedZone][normalizedOrgDistrict][normalizedAC].push({
            name: mandal,
            lbName: mandal, // Using mandal name as local body name
            lsg2020: { vs: lsg2020VS, votes: lsg2020Votes },
            ge2024: { vs: ge2024VS, votes: ge2024Votes },
            target2025: { vs: target2025VS, votes: target2025Votes }
          });
          
        } catch (error) {
          errors.push(`Row ${index + 3}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });
      
      if (errors.length > 0) {
        console.warn(`⚠️ Mandal vote share data loaded with ${errors.length} errors:`, errors);
      }
      
      console.log('✅ Mandal vote share data processed successfully');
      console.log(`📊 Zones loaded: ${Object.keys(data).length}`);
      Object.keys(data).forEach(zone => {
        console.log(`   📍 ${zone}: ${Object.keys(data[zone]).length} org districts`);
        Object.keys(data[zone]).forEach(org => {
          console.log(`      🏛️ ${org}: ${Object.keys(data[zone][org]).length} ACs`);
          Object.keys(data[zone][org]).forEach(ac => {
            console.log(`         🏘️ ${ac}: ${data[zone][org][ac].length} mandals`);
          });
        });
      });
      
      return data;
    },
    {
      skipHeaderLines: 2,
      cacheKey: 'mandal-vote-share',
      retries: 3,
      timeout: 30000
    }
  );
  
  if (result.errors.length > 0) {
    console.error('❌ Errors loading Mandal vote share data:', result.errors);
  }
  
  if (result.warnings.length > 0) {
    console.warn('⚠️ Warnings loading Mandal vote share data:', result.warnings);
  }
  
  mandalVoteShareDataCache = result.data;
  return result.data;
}

export function getMandalVoteShareData(ac: string, orgDistrict: string, zone: string): any[] {
  if (!mandalVoteShareDataCache) {
    console.warn('⚠️ Mandal vote share data not loaded yet');
    return [];
  }
  
  // Normalize names to handle spelling variations
  const normalizedAC = normalizeACName(ac);
  const normalizedOrg = normalizeOrgDistrictName(orgDistrict);
  const normalizedZone = normalizeZoneName(zone);
  
  console.log('🏘️ Getting Mandal data with normalization:', { 
    original: { ac, orgDistrict, zone },
    normalized: { ac: normalizedAC, orgDistrict: normalizedOrg, zone: normalizedZone }
  });
  
  console.log('🏘️ Available zones:', Object.keys(mandalVoteShareDataCache));
  if (mandalVoteShareDataCache[normalizedZone]) {
    console.log(`🏘️ Available orgs in ${normalizedZone}:`, Object.keys(mandalVoteShareDataCache[normalizedZone]));
    if (mandalVoteShareDataCache[normalizedZone][normalizedOrg]) {
      console.log(`🏘️ Available ACs in ${normalizedOrg}:`, Object.keys(mandalVoteShareDataCache[normalizedZone][normalizedOrg]));
    }
  }
  
  const result = mandalVoteShareDataCache[normalizedZone]?.[normalizedOrg]?.[normalizedAC] || [];
  console.log(`🏘️ Mandal data result for ${normalizedAC} in ${normalizedOrg}, ${normalizedZone}:`, result.length, 'mandals');
  
  return result;
}

// Export loading state functions
export const getMandalVoteShareLoadingState = () => getLoadingState('mandal-vote-share');
export const subscribeToMandalVoteShareLoading = (listener: (state: any) => void) => 
  subscribeToLoadingState('mandal-vote-share', listener);
export const clearMandalVoteShareCache = () => {
  clearDataCache('mandal-vote-share');
  mandalVoteShareDataCache = null;
};