// Test script to verify multiple ward fixes
import { normalizeLocalBodyName, normalizeWardName } from './nameNormalization';
import { loadVoterData, getVoterDataForWard } from './loadVoterData';

export async function testMultipleWardFixes() {
  console.log('🧪 Testing Multiple Ward Fixes...');
  
  // Test the normalization functions
  console.log('\n🔧 Testing Local Body name normalization:');
  console.log('Piravanthur →', normalizeLocalBodyName('Piravanthur'));
  console.log('Pattazhi_Vadakkekara →', normalizeLocalBodyName('Pattazhi_Vadakkekara'));
  console.log('Perayam →', normalizeLocalBodyName('Perayam'));
  
  console.log('\n🔧 Testing Ward name normalization:');
  console.log('KADASSERY →', normalizeWardName('KADASSERY'));
  console.log('erathuvadakku →', normalizeWardName('erathuvadakku'));
  console.log('THENGAMANMADOM →', normalizeWardName('THENGAMANMADOM'));
  
  try {
    const voterData = await loadVoterData();
    
    // Test cases
    const testCases = [
      {
        name: 'Ward 1: KADASSERY in Piravanthur',
        orgDistrict: 'Thiruvananthapuram',
        acName: 'Pathanapuram',
        mandalName: 'Pathanapuram',
        localBody: 'Piravanthur',
        wardName: 'KADASSERY',
        expectedWard: 'KADASSERI',
        expectedLocalBody: 'Piravanthur Gramapanchayat'
      },
      {
        name: 'Ward 12: erathuvadakku in Pattazhi_Vadakkekara',
        orgDistrict: 'Thiruvananthapuram',
        acName: 'Pathanapuram',
        mandalName: 'Pathanapuram',
        localBody: 'Pattazhi_Vadakkekara',
        wardName: 'erathuvadakku',
        expectedWard: 'ERATHUVADAKKU',
        expectedLocalBody: 'Pattazhi Vadakkekara Gramapanchayath'
      },
      {
        name: 'Ward 13: THENGAMANMADOM in Pattazhi_Vadakkekara',
        orgDistrict: 'Thiruvananthapuram',
        acName: 'Pathanapuram',
        mandalName: 'Pathanapuram',
        localBody: 'Pattazhi_Vadakkekara',
        wardName: 'THENGAMANMADOM',
        expectedWard: 'THENGAMANMADAM',
        expectedLocalBody: 'Pattazhi Vadakkekara Gramapanchayath'
      },
      {
        name: 'Ward 4: KUMBALAM VHSS WARD in Perayam',
        orgDistrict: 'Thiruvananthapuram',
        acName: 'Kundara',
        mandalName: 'Kundara',
        localBody: 'Perayam',
        wardName: 'KUMBALAM VHSS WARD',
        expectedWard: 'KUMBALAM VHSS WARD',
        expectedLocalBody: 'Perayam Gramapanchayath'
      }
    ];
    
    console.log('\n🧪 Testing voter data lookups...');
    
    for (const testCase of testCases) {
      console.log(`\n--- Testing: ${testCase.name} ---`);
      
      const result = getVoterDataForWard(
        voterData,
        testCase.orgDistrict,
        testCase.acName,
        testCase.mandalName,
        testCase.localBody,
        testCase.wardName
      );
      
      if (result) {
        console.log('✅ SUCCESS! Found voter data:');
        console.log(`  - Houses: ${result.houses}`);
        console.log(`  - Total Voters: ${result.totalVoters}`);
        console.log(`  - Female: ${result.femaleVoters}`);
        console.log(`  - Male: ${result.maleVoters}`);
        console.log(`  - Transgender: ${result.transgender}`);
        console.log(`  - Ward Number: ${result.wardNo}`);
      } else {
        console.log('❌ FAILED! No voter data found');
        console.log(`  Expected ward: ${testCase.expectedWard}`);
        console.log(`  Expected local body: ${testCase.expectedLocalBody}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Auto-run test when imported
if (typeof window !== 'undefined') {
  testMultipleWardFixes();
}
