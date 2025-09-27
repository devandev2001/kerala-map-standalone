// Test script to verify AC name mapping
import { normalizeACName } from './nameNormalization';
import { loadVoterData, getVoterDataForWard } from './loadVoterData';

export async function testACMapping() {
  console.log('🧪 Testing AC name mapping...');
  
  // Test the normalization function
  console.log('Testing AC name normalization:');
  console.log('Punalur →', normalizeACName('Punalur'));
  console.log('punalur →', normalizeACName('punalur'));
  console.log('Punaloor →', normalizeACName('Punaloor'));
  
  try {
    const voterData = await loadVoterData();
    
    // Test the specific case that was failing
    console.log('\n🧪 Testing voter data lookup with AC mapping...');
    
    // Test with the original AC name (should be mapped to Punaloor)
    const testWard = getVoterDataForWard(
      voterData,
      'Thiruvananthapuram', // Zone
      'Punalur', // AC (should be mapped to Punaloor)
      'Punalur', // Mandal
      'Karavaloor Gramapanchayath', // Local Body
      'VAZHAVILA' // Ward Name
    );
    
    if (testWard) {
      console.log('✅ AC mapping test successful!');
      console.log('Found ward data:', testWard);
    } else {
      console.log('❌ AC mapping test failed');
    }
    
    // Test with the correct AC name directly
    const testWard2 = getVoterDataForWard(
      voterData,
      'Thiruvananthapuram', // Zone
      'Punaloor', // AC (correct name)
      'Punalur', // Mandal
      'Karavaloor Gramapanchayath', // Local Body
      'VAZHAVILA' // Ward Name
    );
    
    if (testWard2) {
      console.log('✅ Direct AC name test successful!');
      console.log('Found ward data:', testWard2);
    } else {
      console.log('❌ Direct AC name test failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Auto-run test when imported
if (typeof window !== 'undefined') {
  testACMapping();
}
