// Utility to load Zone-level target data from CSV
export interface ZoneTargetData {
  name: string;
  panchayat: { total: number; targetWin: number; targetOpposition: number };
  municipality: { total: number; targetWin: number; targetOpposition: number };
  corporation: { total: number; targetWin: number; targetOpposition: number };
}[]

let zoneTargetDataCache: ZoneTargetData | null = null;

export async function loadZoneTargetData(): Promise<ZoneTargetData> {
  if (zoneTargetDataCache) {
    return zoneTargetDataCache;
  }

  try {
    const response = await fetch('/data/targetdata/map - zone_target.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch Zone target data: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    // Skip header rows (first 2 lines) and total row (last line)
    const dataLines = lines.slice(2, -1);
    
    const data: ZoneTargetData = [];
    
    dataLines.forEach(line => {
      const columns = line.split(',');
      if (columns.length >= 10) {
        const zoneName = columns[0]?.trim();
        
        if (zoneName) {
          data.push({
            name: zoneName,
            panchayat: {
              total: parseInt(columns[1]) || 0,
              targetWin: parseInt(columns[2]) || 0,
              targetOpposition: parseInt(columns[3]) || 0
            },
            municipality: {
              total: parseInt(columns[4]) || 0,
              targetWin: parseInt(columns[5]) || 0,
              targetOpposition: parseInt(columns[6]) || 0
            },
            corporation: {
              total: parseInt(columns[7]) || 0,
              targetWin: parseInt(columns[8]) || 0,
              targetOpposition: parseInt(columns[9]) || 0
            }
          });
        }
      }
    });
    
    zoneTargetDataCache = data;
    return data;
  } catch (error) {
    console.error('Error loading Zone target data:', error);
    return [];
  }
}

export function getZoneTargetData(): any[] {
  if (!zoneTargetDataCache) {
    return [];
  }
  
  return zoneTargetDataCache.map(item => ({
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
