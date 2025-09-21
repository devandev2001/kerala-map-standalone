import { normalizeOrgDistrictName, normalizeZoneName } from './nameNormalization';

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

  try {
    console.log('📊 Loading AC vote share data from CSV...');
    const response = await fetch('/data/votesharetarget/Local Body Target - AC level - Vote Share.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n');
    
    console.log(`📋 Total lines in CSV: ${lines.length}`);
    console.log(`📋 First few lines:`, lines.slice(0, 5));
    
    // Skip header lines (first 2 lines)
    const dataLines = lines.slice(2).filter(line => line.trim() && !line.startsWith(',,,'));
    
    console.log(`📊 Processing ${dataLines.length} AC data lines...`);
    
    const data: ACVoteShareData = {};
    
    dataLines.forEach((line, index) => {
      const columns = line.split(',').map(col => col.trim().replace(/["\r\n]/g, ''));
      
      // Debug first few entries
      if (index < 3) {
        console.log(`🔍 Line ${index + 3}: "${line}"`);
        console.log(`🔍 Columns:`, columns.map((col, idx) => `[${idx}]: "${col}"`));
      }
      
      if (columns.length >= 9) {
        const zone = columns[0];
        const orgDistrict = columns[1];
        const ac = columns[2];
        const lsg2020VS = columns[3] || "0%";
        const lsg2020Votes = columns[4] || "0";
        const ge2024VS = columns[5] || "0%";
        const ge2024Votes = columns[6] || "0";
        const target2025VS = columns[7] || "0%";
        const target2025Votes = columns[8] || "0";

        // Debug first few entries
        if (index < 3) {
          console.log(`🔍 AC ${index + 1}: ${ac}`);
          console.log(`   Zone: "${zone}", Org: "${orgDistrict}"`);
          console.log(`   LSG 2020: ${lsg2020VS} / ${lsg2020Votes}`);
          console.log(`   GE 2024: ${ge2024VS} / ${ge2024Votes}`);
          console.log(`   Target 2025: ${target2025VS} / ${target2025Votes}`);
        }

        if (zone && orgDistrict && ac) {
          // Initialize zone if not exists
          if (!data[zone]) {
            data[zone] = {};
          }
          
          // Initialize org district if not exists
          if (!data[zone][orgDistrict]) {
            data[zone][orgDistrict] = [];
          }

          // Add AC data
          data[zone][orgDistrict].push({
            name: ac,
            lsg2020: { 
              vs: (lsg2020VS === "NA" || lsg2020VS === "0") ? "0%" : (lsg2020VS || "0%"), 
              votes: (lsg2020Votes === "NA" || lsg2020Votes === "0") ? "0" : (lsg2020Votes || "0")
            },
            ge2024: { 
              vs: (ge2024VS === "NA" || ge2024VS === "0") ? "0%" : (ge2024VS || "0%"), 
              votes: (ge2024Votes === "NA" || ge2024Votes === "0") ? "0" : (ge2024Votes || "0")
            },
            target2025: { 
              vs: (target2025VS === "NA" || target2025VS === "0") ? "0%" : (target2025VS || "0%"), 
              votes: (target2025Votes === "NA" || target2025Votes === "0") ? "0" : (target2025Votes || "0")
            }
          });
          
          // Debug logging for Thiruvananthapuram City entries
          if (orgDistrict === "Thiruvananthapuram City") {
            console.log(`✅ Added AC: ${ac} to Thiruvananthapuram City`);
          }
        } else {
          console.warn(`⚠️ Skipping line ${index + 3} - missing required fields:`, { zone, orgDistrict, ac });
        }
      } else {
        console.warn(`⚠️ Skipping line ${index + 3} - insufficient columns (${columns.length}): ${line}`);
      }
    });

    acVoteShareDataCache = data;
    console.log('✅ AC Vote Share data loaded successfully');
    console.log(`📊 Zones loaded: ${Object.keys(data).length}`);
    Object.keys(data).forEach(zone => {
      console.log(`   📍 ${zone}: ${Object.keys(data[zone]).length} org districts`);
      Object.keys(data[zone]).forEach(org => {
        console.log(`      🏛️ ${org}: ${data[zone][org].length} ACs`);
      });
    });
    
    return data;
  } catch (error) {
    console.error('Error loading AC vote share data:', error);
    return {};
  }
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
