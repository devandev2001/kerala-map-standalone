/**
 * Robust CSV Parser Utility
 * Handles quoted fields, commas within data, and various CSV formats
 */

export interface CSVParseOptions {
  skipEmptyLines?: boolean;
  skipHeaderLines?: number;
  delimiter?: string;
  quoteChar?: string;
  trimFields?: boolean;
}

export interface CSVParseResult {
  headers: string[];
  rows: string[][];
  errors: string[];
}

/**
 * Parse CSV text with proper handling of quoted fields and commas
 */
export function parseCSV(
  csvText: string, 
  options: CSVParseOptions = {}
): CSVParseResult {
  const {
    skipEmptyLines = true,
    skipHeaderLines = 0,
    delimiter = ',',
    quoteChar = '"',
    trimFields = true
  } = options;

  const errors: string[] = [];
  const lines = csvText.split('\n');
  
  // Skip header lines
  const dataLines = lines.slice(skipHeaderLines);
  
  if (dataLines.length === 0) {
    errors.push('No data lines found in CSV');
    return { headers: [], rows: [], errors };
  }

  // Extract headers from first data line
  const firstLine = dataLines[0];
  const headers = parseCSVLine(firstLine, delimiter, quoteChar, trimFields);
  
  // Parse remaining rows
  const rows: string[][] = [];
  
  for (let i = 1; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    
    if (skipEmptyLines && !line) {
      continue;
    }
    
    try {
      const row = parseCSVLine(line, delimiter, quoteChar, trimFields);
      
      // Validate column count
      if (row.length !== headers.length) {
        errors.push(`Row ${i + skipHeaderLines + 1}: Expected ${headers.length} columns, got ${row.length}`);
        // Pad with empty strings or truncate to match header count
        while (row.length < headers.length) {
          row.push('');
        }
        if (row.length > headers.length) {
          row.splice(headers.length);
        }
      }
      
      rows.push(row);
    } catch (error) {
      errors.push(`Row ${i + skipHeaderLines + 1}: ${error.message}`);
    }
  }
  
  return { headers, rows, errors };
}

/**
 * Parse a single CSV line handling quoted fields
 */
function parseCSVLine(
  line: string, 
  delimiter: string, 
  quoteChar: string, 
  trimFields: boolean
): string[] {
  const fields: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === quoteChar) {
      if (inQuotes && nextChar === quoteChar) {
        // Escaped quote
        currentField += quoteChar;
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === delimiter && !inQuotes) {
      // Field separator
      fields.push(trimFields ? currentField.trim() : currentField);
      currentField = '';
      i++;
    } else {
      currentField += char;
      i++;
    }
  }
  
  // Add the last field
  fields.push(trimFields ? currentField.trim() : currentField);
  
  return fields;
}

/**
 * Clean and validate data field
 */
export function cleanDataField(value: string | undefined): string {
  if (!value) return '';
  
  return value
    .toString()
    .trim()
    .replace(/^["']|["']$/g, '') // Remove surrounding quotes
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s\-\.\(\)]/g, '') // Remove special characters except common ones
    .trim();
}

/**
 * Validate required fields
 */
export function validateRequiredFields(
  data: Record<string, string>, 
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    const value = data[field];
    if (!value || value.trim() === '' || value.toLowerCase() === 'n/a') {
      missingFields.push(field);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

/**
 * Parse numeric value with fallback
 */
export function parseNumeric(value: string | undefined, fallback: number = 0): number {
  if (!value) return fallback;
  
  const cleaned = value.toString().replace(/[^\d\.\-]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Parse percentage value
 */
export function parsePercentage(value: string | undefined): string {
  if (!value) return '0%';
  
  const cleaned = value.toString().replace(/[^\d\.]/g, '');
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed)) return '0%';
  
  return `${parsed.toFixed(2)}%`;
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string | undefined): string {
  if (!phone) return '';
  
  const cleaned = phone.replace(/[^\d]/g, '');
  
  if (cleaned.length === 10) {
    return `+91 ${cleaned}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }
  
  return phone;
}

/**
 * Normalize name for comparison
 */
export function normalizeName(name: string | undefined): string {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim();
}
