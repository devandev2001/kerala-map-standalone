export interface WhitelistEntry {
  phone: string;
  password: string;
  full_name?: string;
  role?: string;
}

export async function fetchWhitelistCsv(): Promise<WhitelistEntry[]> {
  try {
    const response = await fetch('/csv/whitelist.csv', { cache: 'no-store' });
    if (!response.ok) {
      return [];
    }
    const text = await response.text();
    return parseCsv(text);
  } catch {
    return [];
  }
}

function parseCsv(text: string): WhitelistEntry[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const colIndex = (name: string) => header.indexOf(name);
  const phoneIdx = colIndex('phone');
  const passwordIdx = colIndex('password');
  const nameIdx = colIndex('full_name');
  const roleIdx = colIndex('role');
  const entries: WhitelistEntry[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = safeSplitCsvLine(lines[i]);
    if (phoneIdx === -1 || passwordIdx === -1) continue;
    const phone = (cols[phoneIdx] || '').replace(/\D/g, '').slice(0, 10);
    const password = (cols[passwordIdx] || '').trim();
    if (!phone || !password) continue;
    entries.push({
      phone,
      password,
      full_name: nameIdx >= 0 ? (cols[nameIdx] || '').trim() : undefined,
      role: roleIdx >= 0 ? (cols[roleIdx] || '').trim() : undefined,
    });
  }
  return entries;
}

function safeSplitCsvLine(line: string): string[] {
  // Simple CSV parser for comma-separated values without embedded commas in quotes
  // Supports quoted cells
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result.map(c => c.trim());
}