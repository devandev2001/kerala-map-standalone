// AC Name mapping and normalization utility
// This handles spelling inconsistencies between map context and CSV data

// Common AC name mappings to handle spelling variations
const AC_NAME_MAPPINGS: Record<string, string> = {
  // Handle Kazhakkoottam variations
  'Kazhakoottam': 'Kazhakkoottam',
  'kazhakuttam': 'Kazhakkoottam',
  'Kazhakuttam': 'Kazhakkoottam',
  
  // Add other known variations here as they're discovered
  'neyyatinkara': 'Neyyattinkara',
  'Neyyatinkara': 'Neyyattinkara',
  
  // Thodupuzha (example - add if needed)
  'thodupuzha': 'Thodupuzha',
  'Thodupuzha': 'Thodupuzha',
  
  // Punalur/Punaloor mapping
  'Punalur': 'Punaloor',
  'punalur': 'Punaloor',
  
  // Thrissur City mapping
  'Thrissur City': 'Thrissur City',
  'thrissur city': 'Thrissur City',
};

/**
 * Normalizes AC names to match CSV data format
 * Handles common spelling variations and case differences
 */
export function normalizeACName(acName: string): string {
  if (!acName) return acName;
  
  // First, check direct mapping
  if (AC_NAME_MAPPINGS[acName]) {
    console.log(`🔧 Mapped AC name: ${acName} → ${AC_NAME_MAPPINGS[acName]}`);
    return AC_NAME_MAPPINGS[acName];
  }
  
  // Check case-insensitive mapping
  const lowerAC = acName.toLowerCase();
  for (const [key, value] of Object.entries(AC_NAME_MAPPINGS)) {
    if (key.toLowerCase() === lowerAC) {
      console.log(`🔧 Mapped AC name (case): ${acName} → ${value}`);
      return value;
    }
  }
  
  // Return original if no mapping found
  return acName;
}

/**
 * Normalizes Org District names to match CSV data format
 */
export function normalizeOrgDistrictName(orgName: string): string {
  if (!orgName) return orgName;
  
  // Add org district mappings if needed
  const ORG_MAPPINGS: Record<string, string> = {
    'Thiruvananthapuram City': 'Thiruvananthapuram City',
    // Add more as discovered
  };
  
  return ORG_MAPPINGS[orgName] || orgName;
}

/**
 * Normalizes Zone names to match CSV data format
 */
export function normalizeZoneName(zoneName: string): string {
  if (!zoneName) return zoneName;
  
  // Add zone mappings if needed
  const ZONE_MAPPINGS: Record<string, string> = {
    'Thiruvananthapuram': 'Thiruvananthapuram',
    'Ernakulam': 'Ernakulam',
    'ernakulam': 'Ernakulam',
    // Add more as discovered
  };
  
  return ZONE_MAPPINGS[zoneName] || zoneName;
}

/**
 * Normalizes Local Body names to match CSV data format
 */
export function normalizeLocalBodyName(localBodyName: string): string {
  if (!localBodyName) return localBodyName;
  
  // Add local body mappings if needed
  const LOCAL_BODY_MAPPINGS: Record<string, string> = {
    // Pathanapuram mappings
    'Pathanapuram': 'Pathanapuram Gramapanchayath',
    'pathanapuram': 'Pathanapuram Gramapanchayath',
    
    // Kulathupuzha mappings
    'Kulathupuzha': 'Kulathupuzha Gramapanchayath',
    'kulathupuzha': 'Kulathupuzha Gramapanchayath',
    
    // Anchal mappings
    'Anchal': 'Anchal Gramapanchayath',
    'anchal': 'Anchal Gramapanchayath',
    
    // Piravanthur mappings
    'Piravanthur': 'Piravanthur Gramapanchayat',
    'piravanthur': 'Piravanthur Gramapanchayat',
    
    // Pattazhi Vadakkekara mappings
    'Pattazhi_Vadakkekara': 'Pattazhi Vadakkekara Gramapanchayath',
    'Pattazhi Vadakkekara': 'Pattazhi Vadakkekara Gramapanchayath',
    'pattazhi_vadakkekara': 'Pattazhi Vadakkekara Gramapanchayath',
    'pattazhi vadakkekara': 'Pattazhi Vadakkekara Gramapanchayath',
    
    // Perayam mappings
    'Perayam': 'Perayam Gramapanchayath',
    'perayam': 'Perayam Gramapanchayath',
    
    // Kottarakara mappings (this one doesn't have Gramapanchayath suffix)
    'Kottarakara': 'Kottarakara',
    'kottarakara': 'Kottarakara',
    
    // Thrissur mappings (Corporation - no Gramapanchayath suffix)
    'Thrissur': 'Thrissur',
    'thrissur': 'Thrissur',
    
    // Add more mappings as discovered
  };
  
  // First, check direct mapping
  if (LOCAL_BODY_MAPPINGS[localBodyName]) {
    console.log(`🔧 Mapped Local Body name: ${localBodyName} → ${LOCAL_BODY_MAPPINGS[localBodyName]}`);
    return LOCAL_BODY_MAPPINGS[localBodyName];
  }
  
  // Check case-insensitive mapping
  const lowerLB = localBodyName.toLowerCase();
  for (const [key, value] of Object.entries(LOCAL_BODY_MAPPINGS)) {
    if (key.toLowerCase() === lowerLB) {
      console.log(`🔧 Mapped Local Body name (case): ${localBodyName} → ${value}`);
      return value;
    }
  }
  
  // Return original if no mapping found
  return localBodyName;
}

/**
 * Normalizes Ward names to match CSV data format
 */
export function normalizeWardName(wardName: string): string {
  if (!wardName) return wardName;
  
  // Add ward name mappings if needed
  const WARD_NAME_MAPPINGS: Record<string, string> = {
    // KADASSERY variations
    'KADASSERY': 'KADASSERI',
    'kadassery': 'KADASSERI',
    'Kadassery': 'KADASSERI',
    
    // THENGAMANMADOM variations
    'THENGAMANMADOM': 'THENGAMANMADAM',
    'thengamanmadom': 'THENGAMANMADAM',
    'Thengamanmadom': 'THENGAMANMADAM',
    
    // ERATHUVADAKKU variations (case insensitive)
    'erathuvadakku': 'ERATHUVADAKKU',
    'Erathuvadakku': 'ERATHUVADAKKU',
    
    // Thrissur ward name variations
    'Krishnapuram': 'Krishnapuram',
    'krishnapuram': 'Krishnapuram',
    'MISSION QUARTERS': 'MISSION QUARTERS',
    'mission quarters': 'MISSION QUARTERS',
    'Mission Quarters': 'MISSION QUARTERS',
    
    // Add more ward name mappings as discovered
  };
  
  // First, check direct mapping
  if (WARD_NAME_MAPPINGS[wardName]) {
    console.log(`🔧 Mapped Ward name: ${wardName} → ${WARD_NAME_MAPPINGS[wardName]}`);
    return WARD_NAME_MAPPINGS[wardName];
  }
  
  // Check case-insensitive mapping
  const lowerWard = wardName.toLowerCase();
  for (const [key, value] of Object.entries(WARD_NAME_MAPPINGS)) {
    if (key.toLowerCase() === lowerWard) {
      console.log(`🔧 Mapped Ward name (case): ${wardName} → ${value}`);
      return value;
    }
  }
  
  // Return original if no mapping found
  return wardName;
}