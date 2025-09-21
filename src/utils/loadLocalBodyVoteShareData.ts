import { normalizeACName, normalizeOrgDistrictName, normalizeZoneName } from './nameNormalization';

// Utility to load Local Body-level vote share data from CSV
export interface LocalBodyVoteShareRowData {
  Zone: string;
  'Org District': string;
  AC: string;
  'Org Mandal': string;
  LBName: string;
  'LB Type': string;
  '2020 LSG VS': string;
  '2020 LSG Votes': string;
  '2024 GE VS': string;
  '2024 GE Votes': string;
  '2025 LSG VS': string;
  '2025 LSG Votes': string;
}

export interface LocalBodyVoteShareData {
  [zone: string]: {
    [orgDistrict: string]: {
      [ac: string]: {
        [mandal: string]: {
          name: string;
          type: string;
          lsg2020: { vs: string; votes: string };
          ge2024: { vs: string; votes: string };
          target2025: { vs: string; votes: string };
        }[];
      };
    };
  };
}

let localBodyVoteShareDataCache: LocalBodyVoteShareData | null = null;

export async function loadLocalBodyVoteShareData(): Promise<LocalBodyVoteShareData> {
  if (localBodyVoteShareDataCache) {
    return localBodyVoteShareDataCache;
  }

  try {
    const response = await fetch('/data/votesharetarget/Local Body Target - Local Body Level - Vote Share.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n');
    console.log('Local Body CSV loaded, total lines:', lines.length);
    
    // Skip header lines (first 2 lines)
    const dataLines = lines.slice(2).filter(line => line.trim());
    
    const data: LocalBodyVoteShareData = {};
    
    dataLines.forEach(line => {
      const columns = line.split('\t'); // Use tab separator as your CSV uses tabs
      if (columns.length >= 11) { // Your CSV has 11 columns, not 12
        const zone = columns[0]?.trim();
        const orgDistrict = columns[1]?.trim();
        const ac = columns[2]?.trim();
        const orgMandal = columns[3]?.trim();
        const lbName = columns[4]?.trim();
        // No lbType column in your CSV - will use default
        const lsg2020VS = columns[5]?.trim();
        const lsg2020Votes = columns[6]?.trim();
        const ge2024VS = columns[7]?.trim();
        const ge2024Votes = columns[8]?.trim();
        const target2025VS = columns[9]?.trim();
        const target2025Votes = columns[10]?.trim().replace(/"/g, ''); // Remove quotes

        if (zone && orgDistrict && ac && orgMandal && lbName) {
          // Initialize zone if not exists
          if (!data[zone]) {
            data[zone] = {};
          }
          
          // Initialize org district if not exists
          if (!data[zone][orgDistrict]) {
            data[zone][orgDistrict] = {};
          }

          // Initialize AC if not exists
          if (!data[zone][orgDistrict][ac]) {
            data[zone][orgDistrict][ac] = {};
          }

          // Initialize Mandal if not exists
          if (!data[zone][orgDistrict][ac][orgMandal]) {
            data[zone][orgDistrict][ac][orgMandal] = [];
          }

          // Add Local Body data
          data[zone][orgDistrict][ac][orgMandal].push({
            name: lbName,
            type: 'Gram Panchayat', // Default type since not in CSV
            lsg2020: { 
              vs: lsg2020VS === "NA" ? "0%" : (lsg2020VS || "0%"), 
              votes: lsg2020Votes === "NA" ? "0" : (lsg2020Votes || "0")
            },
            ge2024: { 
              vs: ge2024VS === "NA" ? "0%" : (ge2024VS || "0%"), 
              votes: ge2024Votes === "NA" ? "0" : (ge2024Votes || "0")
            },
            target2025: { 
              vs: target2025VS === "NA" ? "0%" : (target2025VS || "0%"), 
              votes: target2025Votes === "NA" ? "0" : (target2025Votes || "0")
            }
          });
        }
      }
    });

    console.log('Local Body data processed, total zones:', Object.keys(data).length);
    console.log('Sample data structure:', Object.keys(data).slice(0, 2).map(zone => ({
      zone,
      orgDistricts: Object.keys(data[zone]).length,
      sampleOrgDistrict: Object.keys(data[zone])[0]
    })));

    localBodyVoteShareDataCache = data;
    return data;
  } catch (error) {
    console.error('Error loading Local Body vote share data:', error);
    return {};
  }
}

export function getLocalBodyVoteShareData(mandal: string, ac: string, orgDistrict: string, zone: string): any[] {
  if (!localBodyVoteShareDataCache) {
    console.log('Local Body cache not loaded yet');
    return [];
  }
  
  // Normalize names to handle spelling variations
  const normalizedAC = normalizeACName(ac);
  const normalizedOrg = normalizeOrgDistrictName(orgDistrict);
  const normalizedZone = normalizeZoneName(zone);
  
  console.log('🏡 Getting Local Body data with normalization:', { 
    original: { mandal, ac, orgDistrict, zone },
    normalized: { mandal, ac: normalizedAC, orgDistrict: normalizedOrg, zone: normalizedZone }
  });
  
  const result = localBodyVoteShareDataCache[normalizedZone]?.[normalizedOrg]?.[normalizedAC]?.[mandal] || [];
  console.log(`Getting Local Body data for: ${normalizedZone} > ${normalizedOrg} > ${normalizedAC} > ${mandal}`, result.length, 'items');
  
  return result;
}
