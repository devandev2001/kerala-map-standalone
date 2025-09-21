// Utility to load Mandal-level contact data from CSV
export interface MandalContactRowData {
  'S. No': string;
  Zone: string;
  'Org District': string;
  Mandal: string;
  President: string;
  'Contact Number': string;
  Prabhari: string;
  Contact: string;
}

export interface MandalContactData {
  [zone: string]: {
    [orgDistrict: string]: {
      [ac: string]: {
        name: string;
        president: { name: string; phone: string };
        prabhari: { name: string; phone: string };
      }[];
    };
  };
}

let mandalContactDataCache: MandalContactData | null = null;

export async function loadMandalContactData(): Promise<MandalContactData> {
  if (mandalContactDataCache) {
    return mandalContactDataCache;
  }

  try {
    const response = await fetch('/data/contacts/mandal_contacts.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch mandal contact data: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    // Skip header rows (first 2 lines)
    const dataLines = lines.slice(2);
    
    const data: MandalContactData = {};
    
    dataLines.forEach(line => {
      const columns = line.split(',');
      if (columns.length >= 8) {
        const zone = columns[1]?.trim();
        const orgDistrict = columns[2]?.trim();
        const mandal = columns[3]?.trim();
        const president = columns[4]?.trim();
        const presidentPhone = columns[5]?.trim();
        const prabhari = columns[6]?.trim();
        const prabhariPhone = columns[7]?.trim();
        
        if (zone && orgDistrict && mandal) {
          if (!data[zone]) {
            data[zone] = {};
          }
          if (!data[zone][orgDistrict]) {
            data[zone][orgDistrict] = {};
          }
          
          // For now, we'll group mandals under a generic "AC" since we don't have AC mapping
          // This can be enhanced later when AC-Mandal mapping is available
          const acKey = 'All ACs';
          if (!data[zone][orgDistrict][acKey]) {
            data[zone][orgDistrict][acKey] = [];
          }
          
          data[zone][orgDistrict][acKey].push({
            name: mandal,
            president: {
              name: president || 'NA',
              phone: (presidentPhone && presidentPhone.trim() !== 'NA' && presidentPhone.trim() !== '') ? presidentPhone : 'NA'
            },
            prabhari: {
              name: (prabhari && prabhari.trim() !== 'NA' && prabhari.trim() !== '') ? prabhari : 'NA',
              phone: (prabhariPhone && prabhariPhone.trim() !== 'NA' && prabhariPhone.trim() !== '') ? prabhariPhone : 'NA'
            }
          });
        }
      }
    });
    
    mandalContactDataCache = data;
    console.log(`Loaded mandal contact data for ${Object.keys(data).length} zones`);
    return data;
  } catch (error) {
    console.error('Error loading mandal contact data:', error);
    return {};
  }
}

export function getMandalContactData(zone: string, orgDistrict: string): any[] {
  if (!mandalContactDataCache) {
    return [];
  }
  
  const zoneData = mandalContactDataCache[zone];
  if (!zoneData) {
    return [];
  }
  
  const orgData = zoneData[orgDistrict];
  if (!orgData) {
    return [];
  }
  
  // Return all mandals for this org district (across all ACs)
  const allMandals: any[] = [];
  Object.values(orgData).forEach(acMandals => {
    allMandals.push(...acMandals);
  });
  
  return allMandals;
}
