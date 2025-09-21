// Utility to load AC-level target data from CSV
export interface ACRowData {
  Zone: string;
  Org_District: string;
  AC_Name: string;
  Panchayat_Total: number;
  Panchayat_Target_Win: number;
  Panchayat_Target_Opposition: number;
  Municipality_Total: number;
  Municipality_Target_Win: number;
  Municipality_Target_Opposition: number;
  Corporation_Total: number;
  Corporation_Target_Win: number;
  Corporation_Target_Opposition: number;
}

export interface ACData {
  [orgDistrict: string]: {
    [acName: string]: {
      panchayat: { total: number; targetWin: number; targetOpposition: number };
      municipality: { total: number; targetWin: number; targetOpposition: number };
      corporation: { total: number; targetWin: number; targetOpposition: number };
    };
  };
}

export async function loadACData(): Promise<ACData> {
  try {
    const response = await fetch('/csv/all_ac_targets.csv');
    const csvText = await response.text();
    
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    const data: ACData = {};
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',');
      const row: ACRowData = {
        Zone: values[0],
        Org_District: values[1],
        AC_Name: values[2],
        Panchayat_Total: parseInt(values[3]) || 0,
        Panchayat_Target_Win: parseInt(values[4]) || 0,
        Panchayat_Target_Opposition: parseInt(values[5]) || 0,
        Municipality_Total: parseInt(values[6]) || 0,
        Municipality_Target_Win: parseInt(values[7]) || 0,
        Municipality_Target_Opposition: parseInt(values[8]) || 0,
        Corporation_Total: parseInt(values[9]) || 0,
        Corporation_Target_Win: parseInt(values[10]) || 0,
        Corporation_Target_Opposition: parseInt(values[11]) || 0,
      };
      
      if (!data[row.Org_District]) {
        data[row.Org_District] = {};
      }
      
      data[row.Org_District][row.AC_Name] = {
        panchayat: {
          total: row.Panchayat_Total,
          targetWin: row.Panchayat_Target_Win,
          targetOpposition: row.Panchayat_Target_Opposition,
        },
        municipality: {
          total: row.Municipality_Total,
          targetWin: row.Municipality_Target_Win,
          targetOpposition: row.Municipality_Target_Opposition,
        },
        corporation: {
          total: row.Corporation_Total,
          targetWin: row.Corporation_Target_Win,
          targetOpposition: row.Corporation_Target_Opposition,
        },
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error loading AC data:', error);
    return {};
  }
}
