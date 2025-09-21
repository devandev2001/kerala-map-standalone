// Debug utility to check Malayalam text handling

export const debugMalayalamText = (text: string): void => {
  console.log('🔍 Debugging Malayalam text:', text);
  
  // Check if text contains Malayalam characters
  const malayalamRegex = /[\u0D00-\u0D7F]/;
  const hasMalayalam = malayalamRegex.test(text);
  
  console.log('📝 Text analysis:');
  console.log('  - Original text:', text);
  console.log('  - Text length:', text.length);
  console.log('  - Has Malayalam:', hasMalayalam);
  console.log('  - Character codes:', text.split('').map(char => char.charCodeAt(0)));
  
  if (hasMalayalam) {
    console.log('✅ Malayalam characters detected');
    // Extract Malayalam characters
    const malayalamChars = text.match(/[\u0D00-\u0D7F]/g);
    console.log('  - Malayalam characters:', malayalamChars);
  } else {
    console.log('❌ No Malayalam characters found');
  }
  
  // Check encoding
  try {
    const encoded = encodeURIComponent(text);
    console.log('  - URL encoded:', encoded);
    
    const decoded = decodeURIComponent(encoded);
    console.log('  - Decoded back:', decoded);
    console.log('  - Encoding preserved:', text === decoded);
  } catch (error) {
    console.log('  - Encoding error:', error);
  }
};

export const testMalayalamSamples = (): void => {
  console.log('🧪 Testing Malayalam text samples...');
  
  const samples = [
    'ആകെ എണ്ണം',
    'മൊത്തം ആകെ എണ്ണം',
    'വികസിത കേരളം',
    'സോൺ റിപ്പോർട്ത്',
    'ജില്ലകൾ',
    'പഞ്ചായത്തുകൾ'
  ];
  
  samples.forEach((sample, index) => {
    console.log(`\n--- Sample ${index + 1} ---`);
    debugMalayalamText(sample);
  });
};

export const checkFontSupport = (): boolean => {
  console.log('🔤 Checking font support...');
  
  // Create a test element to check font rendering
  const testElement = document.createElement('div');
  testElement.style.fontFamily = 'Noto Sans Malayalam, Arial Unicode MS, Arial, sans-serif';
  testElement.style.fontSize = '16px';
  testElement.textContent = 'വികസിത കേരളം';
  testElement.style.position = 'absolute';
  testElement.style.left = '-9999px';
  testElement.style.top = '-9999px';
  
  document.body.appendChild(testElement);
  
  // Check if the element renders properly
  const rect = testElement.getBoundingClientRect();
  const hasWidth = rect.width > 0;
  const hasHeight = rect.height > 0;
  
  document.body.removeChild(testElement);
  
  console.log('  - Element width:', rect.width);
  console.log('  - Element height:', rect.height);
  console.log('  - Font support detected:', hasWidth && hasHeight);
  
  return hasWidth && hasHeight;
};

export const validateMalayalamInData = (data: any[]): void => {
  console.log('📊 Validating Malayalam in data...');
  
  let malayalamCount = 0;
  let totalStrings = 0;
  
  const checkObject = (obj: any, path = '') => {
    if (typeof obj === 'string') {
      totalStrings++;
      const malayalamRegex = /[\u0D00-\u0D7F]/;
      if (malayalamRegex.test(obj)) {
        malayalamCount++;
        console.log(`  - Malayalam found at ${path}: "${obj}"`);
      }
    } else if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        checkObject(obj[key], path ? `${path}.${key}` : key);
      });
    }
  };
  
  data.slice(0, 10).forEach((item, index) => {
    checkObject(item, `data[${index}]`);
  });
  
  console.log(`📈 Summary: ${malayalamCount} Malayalam strings out of ${totalStrings} total strings`);
  console.log(`📊 Malayalam percentage: ${((malayalamCount / totalStrings) * 100).toFixed(1)}%`);
};