// Utility to load Local Body-level contact data from CSV
// Note: The CSV has duplicate "Contact Number" column names, so we parse by position instead of using this interface for direct mapping
export interface LocalBodyContactRowData {
  Zone: string;
  'Org District': string;
  AC: string;
  'Org Mandal': string;
  'Local Body Name': string;
  'Panchayat/Area/Cluster': string;
  'Panchayat/ Area President': string;
  'Contact Number (President)': string; // President phone (column 8)
  Incharge: string;
  'Contact Number (Incharge)': string; // Incharge phone (column 10, duplicate column name handled by position)
  'General Secretary': string;
  Contact: string; // Secretary phone
}

export interface LocalBodyContactData {
  [zone: string]: {
    [orgDistrict: string]: {
      [ac: string]: {
        [mandal: string]: {
          name: string;
          area: string; // New field for Panchayat/Area/Cluster
          type: string;
          president: { name: string; phone: string };
          incharge: { name: string; phone: string };
          secretary: { name: string; phone: string }; // Updated from coIncharge
        }[];
      };
    };
  };
}

let localBodyContactDataCache: LocalBodyContactData | null = null;

// Helper function to clean and validate data
function cleanData(value: string | undefined): string {
  if (!value) return 'N/A';
  const cleaned = value.trim();
  return cleaned === '' || cleaned.toLowerCase() === 'na' || cleaned.toLowerCase() === 'n/a' ? 'N/A' : cleaned;
}

// Helper function to validate required fields
function validateRequiredFields(zone: string, orgDistrict: string, ac: string, mandal: string, localBodyName: string): boolean {
  return !!(zone && zone !== 'N/A' && 
           orgDistrict && orgDistrict !== 'N/A' && 
           ac && ac !== 'N/A' && 
           mandal && mandal !== 'N/A' && 
           localBodyName && localBodyName !== 'N/A');
}

export async function loadLocalBodyContactData(): Promise<LocalBodyContactData> {
  if (localBodyContactDataCache) {
    return localBodyContactDataCache;
  }

  try {
    const response = await fetch('/data/contacts/Local Body Target - lb_contacts.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch local body contact data: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    // Skip header row (first line)
    const dataLines = lines.slice(1);
    
    const data: LocalBodyContactData = {};
    let processedRows = 0;
    let skippedRows = 0;
    
    dataLines.forEach((line, index) => {
      const columns = line.split(',');
      
      // Validate minimum column count
      if (columns.length < 12) {
        console.warn(`Row ${index + 2}: Insufficient columns (${columns.length}), skipping`);
        skippedRows++;
        return;
      }
      
      // Parse columns according to new structure
      // Column positions: area in column 6 (index 5), duplicate "Contact Number" columns in positions 8 and 10 (indices 7 and 9)
      const zone = cleanData(columns[0]);
      const orgDistrict = cleanData(columns[1]);
      const ac = cleanData(columns[2]);
      const mandal = cleanData(columns[3]);
      const localBodyName = cleanData(columns[4]);
      const area = cleanData(columns[5]); // Column 6: Panchayat/Area/Cluster
      const president = cleanData(columns[6]); // Column 7: Panchayat/ Area President
      const presidentPhone = cleanData(columns[7]); // Column 8: Contact Number (President)
      const incharge = cleanData(columns[8]); // Column 9: Incharge
      const inchargePhone = cleanData(columns[9]); // Column 10: Contact Number (Incharge) - duplicate column name
      const secretary = cleanData(columns[10]); // Column 11: General Secretary
      const secretaryPhone = cleanData(columns[11]); // Column 12: Contact (Secretary)
      
      // Validate required fields
      if (!validateRequiredFields(zone, orgDistrict, ac, mandal, localBodyName)) {
        console.warn(`Row ${index + 2}: Missing required fields, skipping. Zone: ${zone}, Org District: ${orgDistrict}, AC: ${ac}, Mandal: ${mandal}, Local Body: ${localBodyName}`);
        skippedRows++;
        return;
      }
      
      // Initialize nested structure
      if (!data[zone]) {
        data[zone] = {};
      }
      if (!data[zone][orgDistrict]) {
        data[zone][orgDistrict] = {};
      }
      if (!data[zone][orgDistrict][ac]) {
        data[zone][orgDistrict][ac] = {};
      }
      if (!data[zone][orgDistrict][ac][mandal]) {
        data[zone][orgDistrict][ac][mandal] = [];
      }
      
      // Determine local body type from name
      let type = 'Panchayat';
      const lowerName = localBodyName.toLowerCase();
      if (lowerName.includes('municipality')) {
        type = 'Municipality';
      } else if (lowerName.includes('corporation')) {
        type = 'Corporation';
      }
      
      // Add local body data - focusing only on President, Incharge, and General Secretary
      data[zone][orgDistrict][ac][mandal].push({
        name: localBodyName,
        area: area, // Panchayat/Area/Cluster information
        type: type,
        president: {
          name: president,
          phone: presidentPhone
        },
        incharge: {
          name: incharge,
          phone: inchargePhone
        },
        secretary: {
          name: secretary,
          phone: secretaryPhone
        }
      });
      
      processedRows++;
    });
    
    console.log(`Local body contact data loaded: ${processedRows} rows processed, ${skippedRows} rows skipped`);
    
    localBodyContactDataCache = data;
    return data;
  } catch (error) {
    console.error('Error loading local body contact data:', error);
    return {};
  }
}

export function getLocalBodyContactData(zone: string, orgDistrict: string, ac?: string, mandal?: string): any[] {
  if (!localBodyContactDataCache) {
    return [];
  }
  
  const zoneData = localBodyContactDataCache[zone];
  if (!zoneData) {
    return [];
  }
  
  const orgData = zoneData[orgDistrict];
  if (!orgData) {
    return [];
  }
  
  if (ac && mandal) {
    // Return local bodies for specific AC and Mandal
    const acData = orgData[ac];
    if (!acData) return [];
    
    const mandalData = acData[mandal];
    if (!mandalData) return [];
    
    return mandalData;
  } else if (ac) {
    // Return all local bodies for specific AC
    const acData = orgData[ac];
    if (!acData) return [];
    
    const allLocalBodies: any[] = [];
    Object.values(acData).forEach(mandalBodies => {
      allLocalBodies.push(...mandalBodies);
    });
    
    return allLocalBodies;
  } else {
    // Return all local bodies for org district
    const allLocalBodies: any[] = [];
    Object.values(orgData).forEach(acData => {
      Object.values(acData).forEach(mandalBodies => {
        allLocalBodies.push(...mandalBodies);
      });
    });
    
    return allLocalBodies;
  }
}
