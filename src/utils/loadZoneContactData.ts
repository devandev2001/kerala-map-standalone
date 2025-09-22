export interface ZoneContact {
  name: string;
  inchargeName: string;
  inchargePhone: string;
  presidentName: string;
  presidentPhone: string;
}

let zoneContactDataCache: ZoneContact[] | null = null;

export const loadZoneContactData = async (): Promise<ZoneContact[]> => {
  if (zoneContactDataCache) {
    return zoneContactDataCache;
  }

  try {
    const response = await fetch('/data/contacts/map - Sheet3.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch zone contact data: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    console.log('📄 CSV lines:', lines);
    
    // Skip header rows (first 6 lines) and get data starting from line 7
    const dataLines = lines.slice(6);
    
    console.log('📊 Data lines after slice(6):', dataLines);
    
    const data: ZoneContact[] = [];
    
    dataLines.forEach((line, index) => {
      const columns = line.split(',');
      console.log(`📋 Line ${index + 7}:`, columns);
      
      // Check if we have enough columns and the line contains actual data
      if (columns.length >= 9 && columns[4] && columns[4].trim()) {
        const zone = columns[4]?.trim();
        const inchargeName = columns[5]?.trim();
        const inchargePhone = columns[6]?.trim();
        const presidentName = columns[7]?.trim();
        const presidentPhone = columns[8]?.trim();
        
        console.log(`🔍 Parsed data:`, { zone, inchargeName, inchargePhone, presidentName, presidentPhone });
        
        if (zone && inchargeName && inchargePhone && presidentName && presidentPhone) {
          data.push({
            name: zone,
            inchargeName: inchargeName,
            inchargePhone: inchargePhone,
            presidentName: presidentName,
            presidentPhone: presidentPhone
          });
        }
      }
    });

    zoneContactDataCache = data;
    console.log('✅ Zone contact data loaded successfully:', data);
    return data;
  } catch (error) {
    console.error('Error loading zone contact data:', error);
    // Return fallback data if CSV loading fails
    return [
      { name: "Thiruvananthapuram", inchargeName: "K Soman", inchargePhone: "9656404105", presidentName: "Shri.B.B Gopakumar", presidentPhone: "9447472265" },
      { name: "Alappuzha", inchargeName: "Adv P Sudheer", inchargePhone: "9847303220", presidentName: "Shri.N Hari", presidentPhone: "9446924053" },
      { name: "Ernakulam", inchargeName: "KV Unnikrishanan Master", inchargePhone: "9447630600", presidentName: "Shri.A Nagesh", presidentPhone: "9061176089" },
      { name: "Palakkad", inchargeName: "Adv K K Aneesh Kumar", inchargePhone: "9895236524", presidentName: "Shri.K.Narayanan Master", presidentPhone: "9447004994" },
      { name: "Kozhikode", inchargeName: "Adv B Gopalakrishnan", inchargePhone: "9447032898", presidentName: "Adv.Sreekanth", presidentPhone: "9446569074" },
    ];
  }
};

export function getZoneContactData(): ZoneContact[] {
  if (zoneContactDataCache) {
    return zoneContactDataCache;
  }
  
  // Return fallback data if cache is empty
  console.log('⚠️ Zone contact data cache is empty, returning fallback data');
  return [
    { name: "Thiruvananthapuram", inchargeName: "K Soman", inchargePhone: "9656404105", presidentName: "Shri.B.B Gopakumar", presidentPhone: "9447472265" },
    { name: "Alappuzha", inchargeName: "Adv P Sudheer", inchargePhone: "9847303220", presidentName: "Shri.N Hari", presidentPhone: "9446924053" },
    { name: "Ernakulam", inchargeName: "KV Unnikrishanan Master", inchargePhone: "9447630600", presidentName: "Shri.A Nagesh", presidentPhone: "9061176089" },
    { name: "Palakkad", inchargeName: "Adv K K Aneesh Kumar", inchargePhone: "9895236524", presidentName: "Shri.K.Narayanan Master", presidentPhone: "9447004994" },
    { name: "Kozhikode", inchargeName: "Adv B Gopalakrishnan", inchargePhone: "9447032898", presidentName: "Adv.Sreekanth", presidentPhone: "9446569074" },
  ];
}
