// Utility to load Mandal-level target data from CSV
export interface MandalTargetRowData {
  Zone: string;
  'Org District': string;
  AC: string;
  'Org Mandal': string;
  'Panchayat Total': string;
  'Panchayat Target Win': string;
  'Panchayat Target Opposition': string;
  'Municipality Total': string;
  'Municipality Target Win': string;
  'Municipality Target Opposition': string;
  'Corporation Total': string;
  'Corporation Target Win': string;
  'Corporation Target Opposition': string;
}

export interface MandalTargetData {
  [zone: string]: {
    [orgDistrict: string]: {
      [ac: string]: {
        name: string;
        panchayat: { total: number; targetWin: number; targetOpposition: number };
        municipality: { total: number; targetWin: number; targetOpposition: number };
        corporation: { total: number; targetWin: number; targetOpposition: number };
      }[];
    };
  };
}

let mandalTargetDataCache: MandalTargetData | null = null;

export async function loadMandalTargetData(): Promise<MandalTargetData> {
  if (mandalTargetDataCache) {
    return mandalTargetDataCache;
  }

  try {
    const response = await fetch('/data/targetdata/mandal_target.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch Mandal target data: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    // Skip header rows (first 2 lines)
    const dataLines = lines.slice(2);
    
    const data: MandalTargetData = {};
    
    dataLines.forEach(line => {
      const columns = line.split(',');
      if (columns.length >= 13) {
        const zone = columns[0]?.trim();
        const orgDistrict = columns[1]?.trim();
        const ac = columns[2]?.trim();
        const mandal = columns[3]?.trim();
        
        if (zone && orgDistrict && ac && mandal) {
          if (!data[zone]) {
            data[zone] = {};
          }
          if (!data[zone][orgDistrict]) {
            data[zone][orgDistrict] = {};
          }
          if (!data[zone][orgDistrict][ac]) {
            data[zone][orgDistrict][ac] = [];
          }
          
          data[zone][orgDistrict][ac].push({
            name: mandal,
            panchayat: {
              total: parseInt(columns[4]) || 0,
              targetWin: parseInt(columns[5]) || 0,
              targetOpposition: parseInt(columns[6]) || 0
            },
            municipality: {
              total: parseInt(columns[7]) || 0,
              targetWin: parseInt(columns[8]) || 0,
              targetOpposition: parseInt(columns[9]) || 0
            },
            corporation: {
              total: parseInt(columns[10]) || 0,
              targetWin: parseInt(columns[11]) || 0,
              targetOpposition: parseInt(columns[12]) || 0
            }
          });
        }
      }
    });
    
    mandalTargetDataCache = data;
    return data;
  } catch (error) {
    console.error('Error loading Mandal target data:', error);
    return {};
  }
}

export function getMandalTargetData(zone: string, orgDistrict: string, ac: string): any[] {
  if (!mandalTargetDataCache) {
    return [];
  }
  
  const zoneData = mandalTargetDataCache[zone];
  if (!zoneData) {
    return [];
  }
  
  const orgData = zoneData[orgDistrict];
  if (!orgData) {
    return [];
  }
  
  const acData = orgData[ac];
  if (!acData) {
    return [];
  }
  
  return acData.map(item => ({
    name: item.name,
    lsgTotal: item.panchayat.total,
    lsgTargetWin: item.panchayat.targetWin,
    lsgTargetOpposition: item.panchayat.targetOpposition,
    municipalityTotal: item.municipality.total,
    municipalityTargetWin: item.municipality.targetWin,
    municipalityTargetOpposition: item.municipality.targetOpposition,
    corporationTotal: item.corporation.total,
    corporationTargetWin: item.corporation.targetWin,
    corporationTargetOpposition: item.corporation.targetOpposition
  }));
}
