// Force download PDF on mobile with web-only methods
export const forceMobilePdfDownload = async (
  pdfBlob: Blob,
  filename: string
): Promise<boolean> => {
  try {
    console.log('📱 Force mobile PDF download for:', filename);
    
    // Method 1: Force download with user interaction
    try {
      console.log('📱 Trying force download method...');
      
      // Create a visible download button
      const downloadButton = document.createElement('button');
      downloadButton.textContent = '📄 Click to Download PDF';
      downloadButton.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10000;
        background: #007bff;
        color: white;
        padding: 15px 30px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      
      // Add click handler
      downloadButton.onclick = () => {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        setTimeout(() => {
          URL.revokeObjectURL(url);
          document.body.removeChild(downloadButton);
        }, 2000);
        
        alert('✅ Download initiated! Check your downloads folder.');
      };
      
      // Add to page
      document.body.appendChild(downloadButton);
      
      // Auto-remove after 10 seconds
      setTimeout(() => {
        if (document.body.contains(downloadButton)) {
          document.body.removeChild(downloadButton);
        }
      }, 10000);
      
      return true;
      
    } catch (forceError) {
      console.warn('⚠️ Force download failed:', forceError);
    }
    
    // Method 2: Data URL with explicit download
    try {
      console.log('📱 Trying data URL method...');
      
      const dataUrl = await blobToDataUrl(pdfBlob);
      
      // Create download link with data URL
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      link.style.display = 'none';
      link.setAttribute('download', filename);
      
      // Force download attribute
      link.setAttribute('target', '_blank');
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('✅ PDF download started via data URL!');
      return true;
      
    } catch (dataUrlError) {
      console.warn('⚠️ Data URL method failed:', dataUrlError);
    }
    
    // Method 3: Open in new tab with download instructions
    try {
      console.log('📱 Opening in new tab...');
      
      const url = URL.createObjectURL(pdfBlob);
      const newWindow = window.open(url, '_blank');
      
      if (newWindow) {
        alert('📄 PDF opened in new tab. Please:\n1. Long press on the PDF\n2. Select "Save" or "Download"\n3. Choose your downloads folder');
        
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 5000);
        
        return true;
      }
    } catch (tabError) {
      console.warn('⚠️ New tab method failed:', tabError);
    }
    
    // Method 4: Last resort - show blob data
    try {
      console.log('📱 Showing blob data...');
      
      const url = URL.createObjectURL(pdfBlob);
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        border: none;
      `;
      
      document.body.appendChild(iframe);
      
      alert('📄 PDF displayed in full screen. Please use your browser\'s save option.');
      
      // Remove after 30 seconds
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        URL.revokeObjectURL(url);
      }, 30000);
      
      return true;
      
    } catch (iframeError) {
      console.error('❌ All methods failed:', iframeError);
    }
    
    alert('❌ All download methods failed. Please try again or contact support.');
    return false;
    
  } catch (error) {
    console.error('❌ Force download error:', error);
    alert('❌ Download failed. Please try again.');
    return false;
  }
};

// Helper function to convert blob to data URL
const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};