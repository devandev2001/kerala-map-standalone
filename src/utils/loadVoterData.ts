// Utility to load voter data from CSV
import { normalizeACName, normalizeOrgDistrictName, normalizeZoneName, normalizeLocalBodyName, normalizeWardName } from './nameNormalization';

export interface VoterRowData {
  Zone: string;
  Org_District: string;
  AC_Name: string;
  Mandal_Name: string;
  LocalBody: string;
  Ward_Name: string;
  Ward_No: number;
  Houses: number;
  Total_Voters: number;
  Female_Voters: number;
  Male_Voters: number;
  Transgender: number;
}

export interface VoterData {
  [orgDistrict: string]: {
    [acName: string]: {
      [mandalName: string]: {
        [localBody: string]: {
          [wardName: string]: {
            wardNo: number;
            houses: number;
            totalVoters: number;
            femaleVoters: number;
            maleVoters: number;
            transgender: number;
          };
        };
      };
    };
  };
}

export async function loadVoterData(): Promise<VoterData> {
  try {
    const response = await fetch('/data/Voter/total_voter_data.csv');
    const csvText = await response.text();
    
    const lines = csvText.split('\n');
    const data: VoterData = {};
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',');
      if (values.length < 12) continue; // Skip incomplete rows
      
      // Clean up any #REF! or other Excel artifacts
      const cleanValues = values.map(val => val.replace(/#REF!.*$/, '').trim());
      
      const row: VoterRowData = {
        Zone: normalizeZoneName(cleanValues[0]),
        Org_District: normalizeOrgDistrictName(cleanValues[1]),
        AC_Name: normalizeACName(cleanValues[2]),
        Mandal_Name: cleanValues[3],
        LocalBody: normalizeLocalBodyName(cleanValues[4]),
        Ward_Name: normalizeWardName(cleanValues[5]),
        Ward_No: parseInt(cleanValues[6]) || 0,
        Houses: parseInt(cleanValues[7]) || 0,
        Total_Voters: parseInt(cleanValues[8]) || 0,
        Female_Voters: parseInt(cleanValues[9]) || 0,
        Male_Voters: parseInt(cleanValues[10]) || 0,
        Transgender: parseInt(cleanValues[11]) || 0,
      };
      
      // Initialize nested structure if needed
      if (!data[row.Org_District]) {
        data[row.Org_District] = {};
      }
      
      if (!data[row.Org_District][row.AC_Name]) {
        data[row.Org_District][row.AC_Name] = {};
      }
      
      if (!data[row.Org_District][row.AC_Name][row.Mandal_Name]) {
        data[row.Org_District][row.AC_Name][row.Mandal_Name] = {};
      }
      
      if (!data[row.Org_District][row.AC_Name][row.Mandal_Name][row.LocalBody]) {
        data[row.Org_District][row.AC_Name][row.Mandal_Name][row.LocalBody] = {};
      }
      
      // Store ward data
      data[row.Org_District][row.AC_Name][row.Mandal_Name][row.LocalBody][row.Ward_Name] = {
        wardNo: row.Ward_No,
        houses: row.Houses,
        totalVoters: row.Total_Voters,
        femaleVoters: row.Female_Voters,
        maleVoters: row.Male_Voters,
        transgender: row.Transgender,
      };
    }
    
    console.log('✅ Voter data loaded successfully:', Object.keys(data).length, 'districts');
    return data;
  } catch (error) {
    console.error('❌ Error loading voter data:', error);
    return {};
  }
}

// Function to get voter data for a specific ward
export function getVoterDataForWard(
  voterData: VoterData,
  orgDistrict: string,
  acName: string,
  mandalName: string,
  localBody: string,
  wardName: string
) {
  try {
    // Normalize the input names to match the stored data
    const normalizedOrgDistrict = normalizeOrgDistrictName(orgDistrict);
    const normalizedACName = normalizeACName(acName);
    const normalizedLocalBody = normalizeLocalBodyName(localBody);
    const normalizedWardName = normalizeWardName(wardName);
    
    console.log('🔍 Looking for voter data:', {
      orgDistrict: normalizedOrgDistrict,
      acName: normalizedACName,
      mandalName,
      localBody: normalizedLocalBody,
      wardName: normalizedWardName
    });
    
    const result = voterData[normalizedOrgDistrict]?.[normalizedACName]?.[mandalName]?.[normalizedLocalBody]?.[normalizedWardName] || null;
    
    if (result) {
      console.log('✅ Found voter data:', result);
    } else {
      console.log('❌ No voter data found for ward:', wardName);
      // Try to find similar ward names
      const district = voterData[normalizedOrgDistrict];
      if (district) {
        const ac = district[normalizedACName];
        if (ac) {
          const mandal = ac[mandalName];
          if (mandal) {
            const lb = mandal[normalizedLocalBody];
            if (lb) {
              const availableWards = Object.keys(lb);
              console.log('Available wards in', normalizedLocalBody, ':', availableWards);
              console.log('Looking for ward:', normalizedWardName, 'in available wards:', availableWards);
            } else {
              // Show available local bodies in this mandal
              const availableLBs = Object.keys(mandal);
              console.log('Available local bodies in', mandalName, ':', availableLBs);
            }
          }
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error getting voter data for ward:', error);
    return null;
  }
}
