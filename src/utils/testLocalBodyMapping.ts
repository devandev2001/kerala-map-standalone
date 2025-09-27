// Test script to verify Local Body name mapping
import { normalizeLocalBodyName } from './nameNormalization';
import { loadVoterData, getVoterDataForWard } from './loadVoterData';

export async function testLocalBodyMapping() {
  console.log('🧪 Testing Local Body name mapping...');
  
  // Test the normalization function
  console.log('Testing Local Body name normalization:');
  console.log('Pathanapuram →', normalizeLocalBodyName('Pathanapuram'));
  console.log('pathanapuram →', normalizeLocalBodyName('pathanapuram'));
  console.log('Kulathupuzha →', normalizeLocalBodyName('Kulathupuzha'));
  
  try {
    const voterData = await loadVoterData();
    
    // Test the specific case that was failing
    console.log('\n🧪 Testing voter data lookup with Local Body mapping...');
    
    // Test with the original local body name (should be mapped to Pathanapuram Gramapanchayath)
    const testWard = getVoterDataForWard(
      voterData,
      'Thiruvananthapuram', // Zone
      'Pathanapuram', // AC
      'Pathanapuram', // Mandal
      'Pathanapuram', // Local Body (should be mapped to Pathanapuram Gramapanchayath)
      'NEDUMPARAMBU' // Ward Name
    );
    
    if (testWard) {
      console.log('✅ Local Body mapping test successful!');
      console.log('Found ward data:', testWard);
      console.log('Ward 7 NEDUMPARAMBU in Pathanapuram:');
      console.log('- Houses:', testWard.houses);
      console.log('- Total Voters:', testWard.totalVoters);
      console.log('- Female:', testWard.femaleVoters);
      console.log('- Male:', testWard.maleVoters);
      console.log('- Transgender:', testWard.transgender);
    } else {
      console.log('❌ Local Body mapping test failed');
    }
    
    // Test with the correct local body name directly
    const testWard2 = getVoterDataForWard(
      voterData,
      'Thiruvananthapuram', // Zone
      'Pathanapuram', // AC
      'Pathanapuram', // Mandal
      'Pathanapuram Gramapanchayath', // Local Body (correct name)
      'NEDUMPARAMBU' // Ward Name
    );
    
    if (testWard2) {
      console.log('✅ Direct Local Body name test successful!');
      console.log('Found ward data:', testWard2);
    } else {
      console.log('❌ Direct Local Body name test failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Auto-run test when imported
if (typeof window !== 'undefined') {
  testLocalBodyMapping();
}
