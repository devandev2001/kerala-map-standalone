// Mobile-specific PDF download handler with web-only methods
export const downloadPDFOnMobile = async (
  pdfBlob: Blob,
  filename: string,
  contentType: string = 'application/pdf'
): Promise<boolean> => {
  try {
    console.log('📱 Mobile PDF download initiated:', filename);
    
    // Try multiple download methods in order of preference
    const methods = [
      () => downloadPDFWebEnhanced(pdfBlob, filename),
      () => downloadPDFLegacy(pdfBlob, filename)
    ];
    
    for (const method of methods) {
      try {
        const success = await method();
        if (success) {
          console.log('✅ PDF download successful');
          return true;
        }
      } catch (error) {
        console.warn('⚠️ Download method failed, trying next:', error);
        continue;
      }
    }
    
    console.error('❌ All download methods failed');
    return false;
    
  } catch (error) {
    console.error('❌ Mobile PDF download error:', error);
    return false;
  }
};

// Enhanced web download with better mobile support
const downloadPDFWebEnhanced = async (
  pdfBlob: Blob,
  filename: string
): Promise<boolean> => {
  try {
    console.log('📱 Trying enhanced web download...');
    
    // Create object URL
    const url = URL.createObjectURL(pdfBlob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Add to DOM and trigger click
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    console.log('✅ Enhanced web download completed');
    return true;
    
  } catch (error) {
    console.error('❌ Enhanced web download error:', error);
    return false;
  }
};

// Legacy download method for older browsers
const downloadPDFLegacy = async (
  pdfBlob: Blob,
  filename: string
): Promise<boolean> => {
  try {
    console.log('📱 Trying legacy download...');
    
    // Convert blob to data URL
    const reader = new FileReader();
    
    return new Promise((resolve) => {
      reader.onload = () => {
        try {
          const dataUrl = reader.result as string;
          
          // Create download link with data URL
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = filename;
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          console.log('✅ Legacy download completed');
          resolve(true);
        } catch (error) {
          console.error('❌ Legacy download error:', error);
          resolve(false);
        }
      };
      
      reader.onerror = () => {
        console.error('❌ FileReader error');
        resolve(false);
      };
      
      reader.readAsDataURL(pdfBlob);
    });
    
  } catch (error) {
    console.error('❌ Legacy download error:', error);
    return false;
  }
};

// Utility function to check if device is mobile
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Utility function to get appropriate download method
export const getDownloadMethod = () => {
  if (isMobileDevice()) {
    return downloadPDFOnMobile;
  }
  return downloadPDFWebEnhanced;
};