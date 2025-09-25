import { normalizeOrgDistrictName, normalizeZoneName } from './nameNormalization';
import { loadCSVWithRetry, getLoadingState, subscribeToLoadingState, clearDataCache } from './dataLoadingManager';
import { cleanDataField, parsePercentage, parseNumeric } from './csvParser';

// Utility to load AC-level vote share data from CSV
export interface ACVoteShareRowData {
  Zone: string;
  'Org District': string;
  AC: string;
  '2020 LSG VS': string;
  '2020 LSG Votes': string;
  '2024 GE VS': string;
  '2024 GE Votes': string;
  '2025 LSG VS': string;
  '2025 LSG Votes': string;
}

export interface ACVoteShareData {
  [zone: string]: {
    [orgDistrict: string]: {
      name: string;
      lsg2020: { vs: string; votes: string };
      ge2024: { vs: string; votes: string };
      target2025: { vs: string; votes: string };
    }[];
  };
}

let acVoteShareDataCache: ACVoteShareData | null = null;

export async function loadACVoteShareData(): Promise<ACVoteShareData> {
  if (acVoteShareDataCache) {
    console.log('🎯 Returning cached AC vote share data');
    return acVoteShareDataCache;
  }

  const result = await loadCSVWithRetry<ACVoteShareData>(
    'ac-vote-share',
    '/data/votesharetarget/Local Body Target - AC level - Vote Share.csv',
    (parseResult) => {
      const data: ACVoteShareData = {};
      const errors: string[] = [];
      
      console.log(`📊 Processing ${parseResult.rows.length} rows of AC vote share data`);
      
      parseResult.rows.forEach((row, index) => {
        try {
          // Validate minimum column count
          if (row.length < 9) {
            errors.push(`Row ${index + 3}: Insufficient columns (${row.length}), skipping`);
            return;
          }
          
          const zone = cleanDataField(row[0]);
          const orgDistrict = cleanDataField(row[1]);
          const ac = cleanDataField(row[2]);
          const lsg2020VS = parsePercentage(row[3]);
          const lsg2020Votes = row[4]?.trim() || '0';
          const ge2024VS = parsePercentage(row[5]);
          const ge2024Votes = row[6]?.trim() || '0';
          const target2025VS = parsePercentage(row[7]);
          const target2025Votes = row[8]?.trim() || '0';
          
          // Validate required fields
          if (!zone || !orgDistrict || !ac) {
            errors.push(`Row ${index + 3}: Missing required fields (zone, orgDistrict, or AC), skipping`);
            return;
          }
          
          const normalizedZone = normalizeZoneName(zone);
          const normalizedOrgDistrict = normalizeOrgDistrictName(orgDistrict);
          
          if (!data[normalizedZone]) {
            data[normalizedZone] = {};
          }
          if (!data[normalizedZone][normalizedOrgDistrict]) {
            data[normalizedZone][normalizedOrgDistrict] = [];
          }
          
          data[normalizedZone][normalizedOrgDistrict].push({
            name: ac,
            lsg2020: { vs: lsg2020VS, votes: lsg2020Votes },
            ge2024: { vs: ge2024VS, votes: ge2024Votes },
            target2025: { vs: target2025VS, votes: target2025Votes }
          });
          
        } catch (error) {
          errors.push(`Row ${index + 3}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });
      
      if (errors.length > 0) {
        console.warn(`⚠️ AC vote share data loaded with ${errors.length} errors:`, errors);
      }
      
      console.log('✅ AC vote share data processed successfully');
      console.log(`📊 Zones loaded: ${Object.keys(data).length}`);
      Object.keys(data).forEach(zone => {
        console.log(`   📍 ${zone}: ${Object.keys(data[zone]).length} org districts`);
        Object.keys(data[zone]).forEach(org => {
          console.log(`      🏛️ ${org}: ${data[zone][org].length} ACs`);
        });
      });
      
      return data;
    },
    {
      skipHeaderLines: 2,
      cacheKey: 'ac-vote-share',
      retries: 3,
      timeout: 30000
    }
  );
  
  if (result.errors.length > 0) {
    console.error('❌ Errors loading AC vote share data:', result.errors);
  }
  
  if (result.warnings.length > 0) {
    console.warn('⚠️ Warnings loading AC vote share data:', result.warnings);
  }
  
  acVoteShareDataCache = result.data;
  return result.data;
}

export function getACVoteShareData(orgDistrict: string, zone: string): any[] {
  if (!acVoteShareDataCache) {
    console.warn('⚠️ AC vote share data not loaded yet');
    return [];
  }
  
  // Normalize names to handle spelling variations
  const normalizedOrg = normalizeOrgDistrictName(orgDistrict);
  const normalizedZone = normalizeZoneName(zone);
  
  console.log('🏛️ Getting AC data with normalization:', { 
    original: { orgDistrict, zone },
    normalized: { orgDistrict: normalizedOrg, zone: normalizedZone }
  });
  
  console.log('🏛️ Available zones:', Object.keys(acVoteShareDataCache));
  if (acVoteShareDataCache[normalizedZone]) {
    console.log(`🏛️ Available orgs in ${normalizedZone}:`, Object.keys(acVoteShareDataCache[normalizedZone]));
  }
  
  const result = acVoteShareDataCache[normalizedZone]?.[normalizedOrg] || [];
  console.log(`🏛️ AC data result for ${normalizedOrg} in ${normalizedZone}:`, result.length, 'ACs');
  
  return result;
}

// Export loading state functions
export const getACVoteShareLoadingState = () => getLoadingState('ac-vote-share');
export const subscribeToACVoteShareLoading = (listener: (state: any) => void) => 
  subscribeToLoadingState('ac-vote-share', listener);
export const clearACVoteShareCache = () => {
  clearDataCache('ac-vote-share');
  acVoteShareDataCache = null;
};