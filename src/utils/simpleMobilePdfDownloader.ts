// Simple and reliable mobile PDF downloader
export const simpleMobilePdfDownload = async (
  pdfBlob: Blob,
  filename: string
): Promise<boolean> => {
  try {
    console.log('📱 Simple mobile PDF download for:', filename);
    
    // Method 1: Direct blob URL approach (most reliable)
    const url = URL.createObjectURL(pdfBlob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Add to DOM
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    
    // Delay cleanup to ensure download starts
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 2000);
    
    console.log('✅ Simple download triggered');
    
    // Show user feedback
    alert('PDF download started! Check your device downloads folder.');
    
    return true;
    
  } catch (error) {
    console.error('❌ Simple download failed:', error);
    
    // Fallback: Try to open in new window
    try {
      const url = URL.createObjectURL(pdfBlob);
      const newWindow = window.open(url, '_blank');
      
      if (newWindow) {
        alert('PDF opened in new tab. Please use your browser\'s download option.');
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 3000);
        return true;
      }
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
    }
    
    return false;
  }
};

// Alternative method using data URL (works on more devices)
export const dataUrlPdfDownload = async (
  pdfBlob: Blob,
  filename: string
): Promise<boolean> => {
  try {
    console.log('📱 Data URL PDF download for:', filename);
    
    // Convert blob to data URL
    const reader = new FileReader();
    
    return new Promise((resolve) => {
      reader.onload = function() {
        try {
          const dataUrl = reader.result as string;
          
          // Create link with data URL
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = filename;
          link.style.display = 'none';
          
          // Add to DOM and click
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          console.log('✅ Data URL download triggered');
          alert('PDF download started via data URL method!');
          resolve(true);
          
        } catch (error) {
          console.error('❌ Data URL download failed:', error);
          resolve(false);
        }
      };
      
      reader.onerror = function() {
        console.error('❌ FileReader failed');
        resolve(false);
      };
      
      reader.readAsDataURL(pdfBlob);
    });
    
  } catch (error) {
    console.error('❌ Data URL method failed:', error);
    return false;
  }
};

// Main download function that tries multiple methods
export const downloadPDFMobile = async (
  pdfBlob: Blob,
  filename: string
): Promise<boolean> => {
  console.log('📱 Starting mobile PDF download...');
  
  // Try simple method first
  const simpleResult = await simpleMobilePdfDownload(pdfBlob, filename);
  if (simpleResult) {
    return true;
  }
  
  // Try data URL method
  const dataUrlResult = await dataUrlPdfDownload(pdfBlob, filename);
  if (dataUrlResult) {
    return true;
  }
  
  // Final fallback: just show the blob
  try {
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
    alert('PDF opened in new tab. Please manually save it.');
    return true;
  } catch (error) {
    console.error('❌ All methods failed:', error);
    alert('PDF download failed. Please try again or contact support.');
    return false;
  }
}; 