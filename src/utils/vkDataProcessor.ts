import { VKDataRow, VKTabUrls, VKFilterState, VKFilterOptions, VKFilterCounts } from '../types/vkDashboard';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'vk_dashboard_cache';

interface CacheData {
  data: VKDataRow[];
  timestamp: number;
  errors: string[];
}

// In-memory cache for faster subsequent loads
let memoryCache: CacheData | null = null;

// Save to localStorage
function saveToCache(data: VKDataRow[], errors: string[]) {
  const cacheData: CacheData = {
    data,
    errors,
    timestamp: Date.now()
  };
  
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    memoryCache = cacheData;
  } catch (error) {
    console.warn('Failed to save to localStorage cache:', error);
  }
}

// Load from cache
function loadFromCache(): CacheData | null {
  // Check memory cache first
  if (memoryCache && (Date.now() - memoryCache.timestamp) < CACHE_DURATION) {
    return memoryCache;
  }
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const cacheData: CacheData = JSON.parse(cached);
      if ((Date.now() - cacheData.timestamp) < CACHE_DURATION) {
        memoryCache = cacheData;
        return cacheData;
      }
    }
  } catch (error) {
    console.warn('Failed to load from localStorage cache:', error);
  }
  
  return null;
}

// Clear cache
function clearCache() {
  memoryCache = null;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn('Failed to clear localStorage cache:', error);
  }
}

// Helper function to check if a header contains digits
function containsDigitInHeader(header: string): boolean {
  return /\d/.test(header);
}

// Helper function to check if a value is numeric or resembles a phone number
function isNumericOrPhoneNumber(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  
  const trimmedValue = value.trim();
  
  // Check if it's purely numeric
  if (/^\d+$/.test(trimmedValue)) return true;
  
  // Check if it resembles a phone number (contains mostly digits with some formatting)
  if (/^[\d\s\-\+\(\)]{8,}$/.test(trimmedValue) && /\d{6,}/.test(trimmedValue)) return true;
  
  return false;
}

export async function fetchAllData(
  tabUrls: VKTabUrls, 
  useCache: boolean = true,
  onProgress?: (loaded: number, total: number) => void
): Promise<{ data: VKDataRow[], errors: string[] }> {
  // Check cache first if enabled
  if (useCache) {
    const cached = loadFromCache();
    if (cached) {
      console.log('📦 Loading VK data from cache');
      return { data: cached.data, errors: cached.errors };
    }
  }
  
  console.log('🌐 Fetching fresh VK data from Google Sheets');
  const errors: string[] = [];
  const totalTabs = Object.keys(tabUrls).length;
  let loadedTabs = 0;
  
  const fetchPromises = Object.entries(tabUrls).map(async ([tabName, url], index) => {
    if (url.startsWith('YOUR_')) {
      console.warn(`Skipping fetch for ${tabName} due to placeholder URL.`);
      loadedTabs++;
      onProgress?.(loadedTabs, totalTabs);
      return [];
    }

    try {
      // Add timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Network request failed for ${tabName}.`);
      }
      
      const text = await response.text();
      const result = processSheetData(text, tabName);
      
      loadedTabs++;
      onProgress?.(loadedTabs, totalTabs);
      
      return result;
    } catch (error) {
      console.error(`Error processing sheet ${tabName}:`, error);
      
      if (error.name === 'AbortError') {
        errors.push(`<strong>${tabName}</strong> ഷീറ്റ് ലോഡ് ചെയ്യാൻ വളരെ സമയമെടുത്തു (15s timeout).`);
      } else {
        errors.push(`<strong>${tabName}</strong> ഷീറ്റിൽ നിന്ന് ഡാറ്റ പ്രോസസ്സ് ചെയ്യാൻ കഴിഞ്ഞില്ല. ഇത് ഓഫ്‌ലൈൻ ആകാം അല്ലെങ്കിൽ URL തെറ്റായിരിക്കാം.`);
      }
      
      loadedTabs++;
      onProgress?.(loadedTabs, totalTabs);
      return [];
    }
  });

  const results = await Promise.all(fetchPromises);
  const allData = results.flat();
  
  // Save to cache for next time
  if (allData.length > 0) {
    saveToCache(allData, errors);
  }
  
  return { data: allData, errors };
}

// Export cache management functions
export { clearCache, loadFromCache };

export function processSheetData(csvText: string, tabName: string): VKDataRow[] {
  const rows = csvText.trim().split('\n').map(row => 
    row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
  );
  
  if (rows.length === 0) return [];
  
  const headers = rows.shift() || [];
  
  console.log(`--- Processing Sheet: ${tabName} ---`);
  console.log('Raw Headers:', headers);

  // Find column indices using regex patterns and exact matches
  const districtRegex = /സംഘടന.*ജില്ല/;
  const assemblyMandalRegex = /നിയോജക/;
  const orgMandalRegex = /സംഘടനാ.*മണ്ഡലം/;
  
  // Define desired panchayat-related headers (exact matches)
  const desiredPanchayatHeaders = [
    'കോർപറേഷൻ',
    'കോർപ്പറേഷൻ',
    'പഞ്ചായത്ത്പഞ്ചായത്ത് / മുനിസിപ്പാലിറ്റി',
    'പഞ്ചായത്ത്/ കോർപറേഷൻ',
    'പഞ്ചായത്ത്/ കോർപ്പറേഷൻ',
    'പഞ്ചായത്ത്/ മുനിസിപ്പാലിറ്റി',
    'പഞ്ചായത്ത്/കോർപ്പറേഷൻ',
    'പഞ്ചായത്ത്/മുനിസിപ്പാലിറ്റി',
    'മുനിസിപ്പാലിറ്റി',
    'മുനിസിപ്പാലിറ്റി / കോർപ്പറേഷൻ',
    'പഞ്ചായത്ത്',
    'പഞ്ചായത്ത് ', // With trailing space
    'പഞ്ചായത്ത്/  മുനിസിപ്പാലിറ്റി', // With double space
    'പഞ്ചായത്ത് / കോർപ്പറേഷൻ',
    'പഞ്ചായത്ത് /  മുനിസിപ്പാലിറ്റി', // With double space
    'പഞ്ചായത്ത് / മുനിസിപ്പാലിറ്റി',
    'പഞ്ചായത്ത്/ മുനിസിപ്പാലിറ്റി ', // With trailing space
    'പഞ്ചായത്ത്/ മുനിസിപ്പാലിറ്റി  ', // With double trailing space
    'പഞ്ചായത്ത്/കോർപ്പറേഷൻ', 
    'പഞ്ചായത്ത്/ കോർപറേഷൻ ', // With trailing space
    'പഞ്ചായത്ത്/കോർപറേഷൻ ', // With trailing space
  ];

  // Define the exact headers to explicitly exclude
  const excludedPanchayatHeaders = [
    'ക്ലസ്റ്റർ / പഞ്ചായത്ത്',
    'വാർഡിന്റെ പേര്',
    'വാർഡ് ടൈപ്പ്',
    'വാർഡ് കൺവീനറിന്റെ പേര്',
    'വാർഡ് കൺവീനറിന്റെ ചുമതല',
    'വാർഡ് കൺവീനറിന്റെ ഫോൺ നമ്പർ',
    'വാർഡ് കോ കൺവീനറിന്റെ പേര്',
    'വാർഡ് കോ കൺവീനറിന്റെ ചുമതല',
    'വാർഡ് കോ കൺവീനറിന്റെ ഫോൺ നമ്പർ',
    'ജനറൽ വിഭാഗത്തിലെ പ്രതിനിധിയുടെ പേര്',
    'ജനറൽ വിഭാഗത്തിലെ പ്രതിനിധിയുടെ ചുമതല',
    'ജനറൽ വിഭാഗത്തിലെ പ്രതിനിധിയുടെ ഫോൺ നമ്പർ',
    'വനിതാ പ്രതിനിധിയുടെ പേര്',
    'വനിതാ പ്രതിനിധിയുടെ ചുമതല',
    'വനിതാ പ്രതിനിധിയുടെ ഫോൺ നമ്പർ',
    'SC വിഭാഗത്തിലെ പ്രതിനിധിയുടെ പേര്',
    'SC വിഭാഗത്തിലെ പ്രതിനിധിയുടെ ചുമതല',
    'SC വിഭാഗത്തിലെ പ്രതിനിധിയുടെ ഫോൺ നമ്പർ', 
    'പ്രഭാരിയുടെ പേര്', 
    'Column 251', 
    'Column 249', 
    'Column 204', 
    'Column 108', 
    'Column 39'    
  ];

  // Find index for district, excluding if it contains digits or is in the excluded list
  const districtIndex = headers.findIndex(h => 
    districtRegex.test(h) && 
    !containsDigitInHeader(h) && 
    !excludedPanchayatHeaders.includes(h.trim())
  );
  
  // Find indices for assembly mandal, excluding if they contain digits or are in the excluded list
  const assemblyMandalIndices = headers
    .map((h, i) => 
      assemblyMandalRegex.test(h) && 
      !containsDigitInHeader(h) && 
      !excludedPanchayatHeaders.includes(h.trim()) ? i : -1
    )
    .filter(i => i !== -1);

  // Find indices for org mandal, excluding if they contain digits or are in the excluded list
  const orgMandalIndices = headers
    .map((h, i) => 
      orgMandalRegex.test(h) && 
      !containsDigitInHeader(h) && 
      !excludedPanchayatHeaders.includes(h.trim()) ? i : -1
    )
    .filter(i => i !== -1);
  
  // Find indices for panchayat columns, explicitly including only desired headers and excluding the specified ones and those with digits
  const panchayatIndices = headers
    .map((h, i) => {
      const normalizedHeader = h.trim();
      // Only include if the header is one of the desired exact headers AND not in the excluded list AND does not contain digits
      if (desiredPanchayatHeaders.includes(normalizedHeader) && 
          !excludedPanchayatHeaders.includes(normalizedHeader) && 
          !containsDigitInHeader(normalizedHeader)) {
        return i;
      }
      return -1;
    })
    .filter(i => i !== -1);

  console.log('Identified Panchayat Column Indices:', panchayatIndices);
  console.log('Identified Assembly Mandal Column Indices:', assemblyMandalIndices);
  console.log('Identified Org Mandal Column Indices:', orgMandalIndices);

  if (districtIndex === -1) {
    console.warn(`CRITICAL: 'സംഘടന ജില്ല' column not found or is excluded in sheet: ${tabName}`);
    return [];
  }

  // Helper function to clean panchayat names
  const cleanPanchayatName = (name: string): string => {
    if (!name) return '';
    return name.trim();
  };

  const processedRows = rows
    .filter(row => row.length > 0 && row.some(cell => cell.trim()))
    .map(row => ({
      tab: tabName,
      district: (() => {
        let districtName = row[districtIndex] || '';
        // Special handling for Palakkad district names
        if (tabName === 'Palakkad' && districtName.includes('-')) {
          districtName = districtName.split('-')[0].trim();
        }
        return districtName;
      })(),
      // Filter out numeric/phone number values from assemblyMandals
      assemblyMandals: assemblyMandalIndices
        .map(i => row[i])
        .filter(Boolean)
        .filter(value => !isNumericOrPhoneNumber(value)),
      // Filter out numeric/phone number values from orgMandals
      orgMandals: orgMandalIndices
        .map(i => row[i])
        .filter(Boolean)
        .filter(value => !isNumericOrPhoneNumber(value)),
      // Apply cleanPanchayatName here to standardize data at the source
      panchayats: panchayatIndices
        .map(i => row[i]) // Get all raw panchayat values
        .filter(Boolean) // Remove any empty/null/undefined values
        .map(p => cleanPanchayatName(p)) // Clean each remaining value
    }))
    .filter(row => row.district); // Only include rows with district data

  console.log(`Sample processed data for ${tabName} (first 5 rows):`, processedRows.slice(0, 5));
  
  return processedRows;
}

export function getVKFilterOptions(allData: VKDataRow[], filters: VKFilterState): VKFilterOptions {
  let currentData = allData;

  // Apply filters progressively
  if (filters.tab) {
    currentData = currentData.filter(row => row.tab === filters.tab);
  }
  if (filters.district) {
    currentData = currentData.filter(row => row.district === filters.district);
  }
  if (filters.assemblyMandal) {
    currentData = currentData.filter(row => 
      row.assemblyMandals.includes(filters.assemblyMandal)
    );
  }
  if (filters.orgMandal) {
    currentData = currentData.filter(row => 
      row.orgMandals.includes(filters.orgMandal)
    );
  }
  if (filters.panchayat) {
    currentData = currentData.filter(row => 
      row.panchayats.includes(filters.panchayat)
    );
  }

  return {
    tabs: [...new Set(allData.map(row => row.tab))].sort(),
    districts: [...new Set(currentData.map(row => row.district))].filter(Boolean).sort(),
    assemblyMandals: [...new Set(currentData.flatMap(row => row.assemblyMandals))].sort(),
    orgMandals: [...new Set(currentData.flatMap(row => row.orgMandals))].sort(),
    panchayats: [...new Set(currentData.flatMap(row => row.panchayats))].sort(),
  };
}

export function getVKFilterCounts(allData: VKDataRow[], filters: VKFilterState): VKFilterCounts {
  const getFilteredCount = (filterKey: keyof VKFilterState) => {
    if (!filters[filterKey]) return 0;
    
    let data = allData;
    
    // Apply filters up to the current level
    if (filterKey !== 'tab' && filters.tab) {
      data = data.filter(row => row.tab === filters.tab);
    }
    if (filterKey !== 'district' && filterKey !== 'tab' && filters.district) {
      data = data.filter(row => row.district === filters.district);
    }
    if (filterKey !== 'assemblyMandal' && filterKey !== 'district' && filterKey !== 'tab' && filters.assemblyMandal) {
      data = data.filter(row => row.assemblyMandals.includes(filters.assemblyMandal));
    }
    if (filterKey !== 'orgMandal' && filterKey !== 'assemblyMandal' && filterKey !== 'district' && filterKey !== 'tab' && filters.orgMandal) {
      data = data.filter(row => row.orgMandals.includes(filters.orgMandal));
    }
    if (filterKey !== 'panchayat' && filterKey !== 'orgMandal' && filterKey !== 'assemblyMandal' && filterKey !== 'district' && filterKey !== 'tab' && filters.panchayat) {
      data = data.filter(row => row.panchayats.includes(filters.panchayat));
    }
    
    // Apply the current filter
    switch (filterKey) {
      case 'tab':
        return data.filter(row => row.tab === filters.tab).length;
      case 'district':
        return data.filter(row => row.district === filters.district).length;
      case 'assemblyMandal':
        return data.filter(row => row.assemblyMandals.includes(filters.assemblyMandal)).length;
      case 'orgMandal':
        return data.filter(row => row.orgMandals.includes(filters.orgMandal)).length;
      case 'panchayat':
        return data.filter(row => row.panchayats.includes(filters.panchayat)).length;
      default:
        return 0;
    }
  };

  return {
    tab: getFilteredCount('tab'),
    district: getFilteredCount('district'),
    assemblyMandal: getFilteredCount('assemblyMandal'),
    orgMandal: getFilteredCount('orgMandal'),
    panchayat: getFilteredCount('panchayat'),
  };
}

export function getVKFilteredDataCount(allData: VKDataRow[], filters: VKFilterState): number {
  let filteredData = allData;

  if (filters.tab) {
    filteredData = filteredData.filter(row => row.tab === filters.tab);
  }
  if (filters.district) {
    filteredData = filteredData.filter(row => row.district === filters.district);
  }
  if (filters.assemblyMandal) {
    filteredData = filteredData.filter(row => 
      row.assemblyMandals.includes(filters.assemblyMandal)
    );
  }
  if (filters.orgMandal) {
    filteredData = filteredData.filter(row => 
      row.orgMandals.includes(filters.orgMandal)
    );
  }
  if (filters.panchayat) {
    filteredData = filteredData.filter(row => 
      row.panchayats.includes(filters.panchayat)
    );
  }

  return filteredData.length;
}