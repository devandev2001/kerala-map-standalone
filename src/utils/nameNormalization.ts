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
    // Add more as discovered
  };
  
  return ZONE_MAPPINGS[zoneName] || zoneName;
}