// Utility to load Org District-level target data from CSV
export interface OrgDistrictTargetRowData {
  'Org District': string;
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

export interface OrgDistrictTargetData {
  [zone: string]: {
    name: string;
    panchayat: { total: number; targetWin: number; targetOpposition: number };
    municipality: { total: number; targetWin: number; targetOpposition: number };
    corporation: { total: number; targetWin: number; targetOpposition: number };
  }[];
}

let orgDistrictTargetDataCache: OrgDistrictTargetData | null = null;

export async function loadOrgDistrictTargetData(): Promise<OrgDistrictTargetData> {
  if (orgDistrictTargetDataCache) {
    return orgDistrictTargetDataCache;
  }

  try {
    const response = await fetch('/data/targetdata/Org Dist_Target.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch org district target data: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    // Skip header rows (first 2 lines)
    const dataLines = lines.slice(2);
    
    const data: OrgDistrictTargetData = {};
    
    // We need to map org districts to zones - using existing zone mapping
    const zoneMapping: { [orgDistrict: string]: string } = {
      // Thiruvananthapuram Zone
      'Kollam East': 'Thiruvananthapuram',
      'Kollam West': 'Thiruvananthapuram', 
      'Pathanamthitta': 'Thiruvananthapuram',
      'Thiruvananthapuram City': 'Thiruvananthapuram',
      'Thiruvananthapuram North': 'Thiruvananthapuram',
      'Thiruvananthapuram South': 'Thiruvananthapuram',
      
      // Alappuzha Zone
      'Alappuzha North': 'Alappuzha',
      'Alappuzha South': 'Alappuzha',
      'Idukki North': 'Alappuzha',
      'Idukki South': 'Alappuzha',
      'Kottayam East': 'Alappuzha',
      'Kottayam West': 'Alappuzha',
      
      // Ernakulam Zone
      'Ernakulam City': 'Ernakulam',
      'Ernakulam East': 'Ernakulam',
      'Ernakulam North': 'Ernakulam',
      'Thrissur City': 'Ernakulam',
      'Thrissur North': 'Ernakulam',
      'Thrissur South': 'Ernakulam',
      
      // Palakkad Zone
      'Malappuram Central': 'Palakkad',
      'Malappuram East': 'Palakkad',
      'Malappuram West': 'Palakkad',
      'Palakkad East': 'Palakkad',
      'Palakkad West': 'Palakkad',
      'Wayanad': 'Palakkad',
      
      // Kozhikode Zone
      'Kannur North': 'Kozhikode',
      'Kannur South': 'Kozhikode',
      'Kasaragod': 'Kozhikode',
      'Kozhikode City': 'Kozhikode',
      'Kozhikode North': 'Kozhikode',
      'Kozhikode Rural': 'Kozhikode'
    };
    
    dataLines.forEach(line => {
      const columns = line.split(',');
      if (columns.length >= 10) {
        const orgDistrict = columns[0]?.trim();
        if (orgDistrict && orgDistrict !== 'Grand Total') {
          const zone = zoneMapping[orgDistrict];
          if (zone) {
            if (!data[zone]) {
              data[zone] = [];
            }
            
            data[zone].push({
              name: orgDistrict,
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
      }
    });
    
    orgDistrictTargetDataCache = data;
    return data;
  } catch (error) {
    console.error('Error loading org district target data:', error);
    return {};
  }
}

export function getOrgDistrictTargetData(zone: string): any[] {
  if (!orgDistrictTargetDataCache) {
    return [];
  }
  
  const zoneData = orgDistrictTargetDataCache[zone];
  if (!zoneData) {
    return [];
  }
  
  return zoneData.map(item => ({
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
