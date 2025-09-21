// Utility to load AC-level target data from CSV
export interface ACTargetRowData {
  Zone: string;
  'Org District': string;
  AC: string;
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

export interface ACTargetData {
  [zone: string]: {
    [orgDistrict: string]: {
      name: string;
      panchayat: { total: number; targetWin: number; targetOpposition: number };
      municipality: { total: number; targetWin: number; targetOpposition: number };
      corporation: { total: number; targetWin: number; targetOpposition: number };
    }[];
  };
}

let acTargetDataCache: ACTargetData | null = null;

export async function loadACTargetData(): Promise<ACTargetData> {
  if (acTargetDataCache) {
    return acTargetDataCache;
  }

  try {
    const response = await fetch('/data/targetdata/ac_target.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch AC target data: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    // Skip header rows (first 2 lines)
    const dataLines = lines.slice(2);
    
    const data: ACTargetData = {};
    
    dataLines.forEach(line => {
      const columns = line.split(',');
      if (columns.length >= 12) {
        const zone = columns[0]?.trim();
        const orgDistrict = columns[1]?.trim();
        const ac = columns[2]?.trim();
        
        if (zone && orgDistrict && ac) {
          if (!data[zone]) {
            data[zone] = {};
          }
          if (!data[zone][orgDistrict]) {
            data[zone][orgDistrict] = [];
          }
          
          data[zone][orgDistrict].push({
            name: ac,
            panchayat: {
              total: parseInt(columns[3]) || 0,
              targetWin: parseInt(columns[4]) || 0,
              targetOpposition: parseInt(columns[5]) || 0
            },
            municipality: {
              total: parseInt(columns[6]) || 0,
              targetWin: parseInt(columns[7]) || 0,
              targetOpposition: parseInt(columns[8]) || 0
            },
            corporation: {
              total: parseInt(columns[9]) || 0,
              targetWin: parseInt(columns[10]) || 0,
              targetOpposition: parseInt(columns[11]) || 0
            }
          });
        }
      }
    });
    
    acTargetDataCache = data;
    return data;
  } catch (error) {
    console.error('Error loading AC target data:', error);
    return {};
  }
}

export function getACTargetData(zone: string, orgDistrict: string): any[] {
  if (!acTargetDataCache) {
    return [];
  }
  
  const zoneData = acTargetDataCache[zone];
  if (!zoneData) {
    return [];
  }
  
  const orgData = zoneData[orgDistrict];
  if (!orgData) {
    return [];
  }
  
  return orgData.map(item => ({
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
