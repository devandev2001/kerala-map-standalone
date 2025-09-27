// Test script to verify voter data loading
import { loadVoterData, getVoterDataForWard } from './loadVoterData';

export async function testVoterData() {
  console.log('🧪 Testing voter data loading...');
  
  try {
    const voterData = await loadVoterData();
    
    // Test the specific ward that was failing
    const testWard = getVoterDataForWard(
      voterData,
      'Thiruvananthapuram', // Zone
      'Kollam East', // AC
      'Anchal', // Mandal
      'Kulathupuzha Gramapanchayath', // Local Body
      'AMBALAM' // Ward Name
    );
    
    if (testWard) {
      console.log('✅ Test ward data found:', testWard);
      console.log('Ward 7 AMBALAM in Kulathupuzha:');
      console.log('- Houses:', testWard.houses);
      console.log('- Total Voters:', testWard.totalVoters);
      console.log('- Female:', testWard.femaleVoters);
      console.log('- Male:', testWard.maleVoters);
      console.log('- Transgender:', testWard.transgender);
    } else {
      console.log('❌ Test ward data not found');
    }
    
    // Test a few more wards to ensure the data structure is correct
    const testWard2 = getVoterDataForWard(
      voterData,
      'Thiruvananthapuram',
      'Kollam East',
      'Anchal',
      'Kulathupuzha Gramapanchayath',
      'ESTATE'
    );
    
    if (testWard2) {
      console.log('✅ Test ward 2 (ESTATE) found:', testWard2);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Auto-run test when imported
if (typeof window !== 'undefined') {
  testVoterData();
}