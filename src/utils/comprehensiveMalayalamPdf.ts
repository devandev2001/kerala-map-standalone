
// Comprehensive Malayalam PDF generator with 2-level drill-down
import { getVKFilterOptions, getVKFilterCounts, getVKFilteredDataCount } from './vkDataProcessor';

interface VKFilterState {
  tab: string;
  district: string;
  assemblyMandal: string;
  orgMandal: string;
  panchayat: string;
}

interface VKReportData {
  allData: any[];
  filters: VKFilterState;
  level: string;
  selectedValue: string;
}

// VK Wards data for organizational districts
const VK_WARDS_DATA: Record<string, number> = {
  'തിരുവനന്തപുരം നോർത്ത്': 707,
  'തിരുവനന്തപുരം സിറ്റി': 97,
  'തിരുവനന്തപുരം സൗത്ത്': 691,
  'കൊല്ലം ഈസ്റ്റ്': 674,
  'കൊല്ലം വെസ്റ്റ്': 641,
  'പത്തനംതിട്ട': 840,
  'ആലപ്പുഴ നോർത്ത്': 733,
  'ആലപ്പുഴ സൗത്ത്': 623,
  'കോട്ടയം ഈസ്റ്റ്': 556,
  'കോട്ടയം വെസ്റ്റ്': 672,
  'ഇടുക്കി നോർത്ത്': 313,
  'ഇടുക്കി സൗത്ത്': 353,
  'എറണാകുളം ഈസ്റ്റ്': 645,
  'എറണാകുളം നോർത്ത്': 630,
  'എറണാകുളം സിറ്റി': 387,
  'തൃശൂർ നോർത്ത്': 635,
  'തൃശൂർ സിറ്റി': 629,
  'തൃശൂർ സൗത്ത്': 576,
  'പാലക്കാട് ഈസ്റ്റ്': 880,
  'പാലക്കാട് വെസ്റ്റ്': 901,
  'മലപ്പുറം വെസ്റ്റ്': 475,
  'മലപ്പുറം സെൻട്രൽ': 333,
  'മലപ്പുറം ഈസ്റ്റ്': 407,
  'വയനാട്': 417,
  'കോഴിക്കോട് നോർത്ത്': 531,
  'കോഴിക്കോട് സിറ്റി': 228,
  'കോഴിക്കോട് റൂറൽ': 496,
  'കണ്ണൂർ നോർത്ത്': 474,
  'കണ്ണൂർ സൗത്ത്': 444,
  'കാസർഗോഡ്': 535
};

// Helper function to get VK Wards count for a district
const getVKWardsCount = (districtName: string): number => {
  return VK_WARDS_DATA[districtName] || 0;
};

interface DrillDownData {
  level1: { name: string; items: { option: string; count: number }[] }[];
  level2: { parentName: string; parentLevel: string; items: { option: string; count: number }[] }[];
}

// Function to generate comprehensive Malayalam PDF as blob for ZIP
export const generateComprehensiveMalayalamPDFAsBlob = async (reportData: VKReportData): Promise<Blob | null> => {
  try {
    console.log('🔄 Starting Comprehensive Malayalam PDF generation as blob...', reportData);

    const { allData, filters, level, selectedValue } = reportData;

    // Get comprehensive drill-down data (2 levels deep)
    const drillDownData = getComprehensiveDrillDownData(reportData);
    const totalCount = getVKFilteredDataCount(allData, filters);

    // Create enhanced HTML content without download UI (for PDF generation)
    const htmlContent = createEnhancedHTMLForPDF(reportData, drillDownData, totalCount);

    // Use html2pdf to convert HTML to PDF blob
    const html2pdf = (await import('html2pdf.js')).default;
    
    const options = {
      margin: 0.5,
      filename: 'temp.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        allowTaint: true
      },
      jsPDF: { 
        unit: 'in', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    };

    // Create a temporary div to hold the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    document.body.appendChild(tempDiv);

    try {
      // Generate PDF blob
      const pdfBlob = await html2pdf().set(options).from(tempDiv).outputPdf('blob');
      
      // Clean up
      document.body.removeChild(tempDiv);
      
      console.log('✅ Comprehensive Malayalam PDF blob generated successfully');
      return pdfBlob;
      
    } catch (error) {
      // Clean up on error
      if (document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv);
      }
      throw error;
    }

  } catch (error) {
    console.error('❌ Error generating Comprehensive Malayalam PDF blob:', error);
    return null;
  }
};

export const generateComprehensiveMalayalamPDF = async (reportData: VKReportData): Promise<boolean> => {
  try {
    console.log('🔄 Starting Comprehensive Malayalam PDF generation...', reportData);

    const { allData, filters, level, selectedValue } = reportData;

    // Get comprehensive drill-down data (2 levels deep)
    const drillDownData = getComprehensiveDrillDownData(reportData);
    const totalCount = getVKFilteredDataCount(allData, filters);

    // Create enhanced HTML content with download UI
    const htmlContent = createEnhancedHTML(reportData, drillDownData, totalCount);

    // Open in new window with download UI
    const downloadWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    if (!downloadWindow) {
      throw new Error('Could not open download window');
    }

    downloadWindow.document.write(htmlContent);
    downloadWindow.document.close();

    // Wait for fonts to load
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('✅ Comprehensive Malayalam PDF window opened successfully');
    return true;

  } catch (error) {
    console.error('❌ Error generating Comprehensive Malayalam PDF:', error);
    return false;
  }
};

const getComprehensiveDrillDownData = (reportData: VKReportData): DrillDownData => {
  const { allData, filters, level } = reportData;

  const level1Data: { name: string; items: { option: string; count: number }[] }[] = [];
  const level2Data: { parentName: string; parentLevel: string; items: { option: string; count: number }[] }[] = [];

  // Get the next 2 levels from current position
  const nextLevel1 = getNextFilterLevel(level);
  const nextLevel2 = nextLevel1 ? getNextFilterLevel(getLevelString(nextLevel1)) : null;

  if (!nextLevel1) {
    return { level1: [], level2: [] };
  }

  console.log('🔍 Drill-down logic:', {
    currentLevel: level,
    nextLevel1: nextLevel1,
    nextLevel2: nextLevel2
  });

  // Get Level 1 data (immediate next level)
  const level1Options = getVKFilterOptions(allData, filters);
  const level1OptionsList = getOptionsForLevel(level1Options, nextLevel1);

  level1OptionsList.forEach(option => {
    const tempFilters = { ...filters, [nextLevel1]: option };
    const count = getVKFilterCounts(allData, tempFilters)[nextLevel1];

    // Add to level1 data
    const existingGroup = level1Data.find(group => group.name === 'main');
    if (existingGroup) {
      existingGroup.items.push({ option, count });
    } else {
      level1Data.push({
        name: 'main',
        items: [{ option, count }]
      });
    }

    // Get Level 2 data (one more level deep) if it exists
    if (nextLevel2) {
      const level2Options = getVKFilterOptions(allData, tempFilters);
      const level2OptionsList = getOptionsForLevel(level2Options, nextLevel2);

      if (level2OptionsList.length > 0) {
        const level2Items: { option: string; count: number }[] = [];

        level2OptionsList.forEach(level2Option => {
          const level2TempFilters = { ...tempFilters, [nextLevel2]: level2Option };
          const level2Count = getVKFilterCounts(allData, level2TempFilters)[nextLevel2];
          level2Items.push({ option: level2Option, count: level2Count });
        });

        level2Data.push({
          parentName: option,
          parentLevel: getLevelTitle(nextLevel1),
          items: level2Items
        });
      }
    }
  });

  return { level1: level1Data, level2: level2Data };
};

// Create HTML for PDF generation (without download UI)
const createEnhancedHTMLForPDF = (
  reportData: VKReportData,
  drillDownData: DrillDownData,
  totalCount: number
): string => {
  const { filters, level, selectedValue } = reportData;
  const nextLevel1 = getNextFilterLevel(level);
  const nextLevel2 = nextLevel1 ? getNextFilterLevel(getLevelString(nextLevel1)) : null;

  return `
    <!DOCTYPE html>
    <html lang="ml">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${filters.district ? filters.district.replace(/\s+/g, '_').replace(/[<>:"/\\|?*]/g, '_') : 'VK_Comprehensive_Report'}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
        
        body {
          font-family: 'Inter', 'Noto Sans Malayalam', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
          line-height: 1.6;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.15);
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
          color: white;
          padding: 40px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          opacity: 0.3;
          animation: float 20s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          position: relative;
          z-index: 2;
        }
        
        .header .subtitle {
          font-size: 1.2rem;
          opacity: 0.95;
          font-weight: 500;
          position: relative;
          z-index: 2;
        }
        
        .malayalam {
          font-family: 'Noto Sans Malayalam', sans-serif;
          font-weight: 600;
        }
        
        .content {
          padding: 40px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }
        
        .info-card {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 15px;
          padding: 25px;
          border-left: 5px solid #ff6b35;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          transition: transform 0.3s ease;
        }
        
        .info-card:hover {
          transform: translateY(-5px);
        }
        
        .info-card h3 {
          color: #2d3748;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .info-card .value {
          font-size: 1.8rem;
          font-weight: 700;
          color: #ff6b35;
          margin-bottom: 5px;
        }
        
        .info-card .label {
          color: #64748b;
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .section {
          margin-bottom: 40px;
        }
        
        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 3px solid #ff6b35;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .table-container {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
          margin-bottom: 30px;
        }
        
        .table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .table th {
          background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
          color: white;
          padding: 18px 15px;
          text-align: left;
          font-weight: 600;
          font-size: 0.95rem;
          border-bottom: 2px solid #ff6b35;
        }
        
        .table td {
          padding: 15px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.9rem;
          color: #2d3748;
        }
        
        .table tbody tr:hover {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }
        
        .table tbody tr:nth-child(even) {
          background: #f8fafc;
        }
        
        .number {
          font-weight: 600;
          color: #ff6b35;
        }
        
        .percentage {
          font-weight: 600;
          color: #059669;
        }
        
        .selection-path {
          background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%);
          border-radius: 15px;
          padding: 25px;
          margin-top: 30px;
          border-left: 5px solid #3182ce;
        }
        
        .selection-path h3 {
          color: #2d3748;
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .path-item {
          background: white;
          padding: 12px 18px;
          border-radius: 10px;
          margin: 8px 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border-left: 3px solid #3182ce;
          font-weight: 500;
          color: #2d3748;
        }
        
        .footer {
          background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
          color: white;
          padding: 25px 40px;
          text-align: center;
          font-size: 0.9rem;
        }
        
        .footer .timestamp {
          opacity: 0.8;
          margin-bottom: 10px;
        }
        
        .footer .branding {
          font-weight: 600;
          color: #ff6b35;
        }
        
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
          }
          
          .container {
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          
          .info-card:hover {
            transform: none !important;
          }
          
          .table tbody tr:hover {
            background: transparent !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>BJP Kerala - Mission 2025-2026</h1>
          <div class="subtitle malayalam">വികസിത കേരളം വാർഡ് ടീം റിപ്പോർട്ത്</div>
        </div>
        
        <div class="content">
          ${generateInfoCards(reportData, totalCount)}
          ${generateLevel1TablesHTML(drillDownData.level1Data, nextLevel1)}
          ${generateLevel2TablesHTML(drillDownData.level2Data, nextLevel2)}
          ${generateSelectionPath(filters)}
        </div>
        
        <div class="footer">
          <div class="timestamp">
            റിപ്പോർട്ത് തയ്യാറാക്കിയത്: ${new Date().toLocaleDateString('ml-IN')} ${new Date().toLocaleTimeString('ml-IN')}
          </div>
          <div class="branding">BJP Kerala Dashboard | Confidential Document</div>
        </div>
      </div>
    </body>
    </html>
  `;
};

const createEnhancedHTML = (
  reportData: VKReportData,
  drillDownData: DrillDownData,
  totalCount: number
): string => {
  const { filters, level, selectedValue } = reportData;
  const nextLevel1 = getNextFilterLevel(level);
  const nextLevel2 = nextLevel1 ? getNextFilterLevel(getLevelString(nextLevel1)) : null;

  return `
    <!DOCTYPE html>
    <html lang="ml">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${filters.district ? filters.district.replace(/\s+/g, '_').replace(/[<>:"/\\|?*]/g, '_') : 'VK_Comprehensive_Report'}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
        
        body {
          font-family: 'Inter', 'Noto Sans Malayalam', 'Manjari', 'Meera', 'Arial Unicode MS', Arial, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #1f2937;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          min-height: 100vh;
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
        
        .download-ui {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%);
          color: white;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          border-bottom: 3px solid #f59e0b;
        }
        
        .download-header {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .download-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .download-title h1 {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }
        
        .download-title .icon {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        
        .download-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        
        .download-btn {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }
        
        .download-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
        }
        
        .download-btn:active {
          transform: translateY(0);
        }
        
        .close-btn {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }
        
        .content-wrapper {
          margin-top: 100px;
          padding: 30px;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }
        
        @media print {
          .download-ui {
            display: none !important;
          }
          
          .content-wrapper {
            margin-top: 0;
            padding: 15px;
            max-width: none;
            margin: 0;
          }
          
          body {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
            font-size: 11px;
            color: #1f2937 !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Preserve all colors and gradients in PDF */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          .header {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
            border: 1px solid #e2e8f0 !important;
          }
          
          .header::before {
            background: linear-gradient(90deg, #f59e0b 0%, #ef4444 50%, #3b82f6 100%) !important;
          }
          
          .header h1 {
            color: #1e40af !important;
            text-shadow: 0 2px 4px rgba(30, 64, 175, 0.1) !important;
          }
          
          .report-info {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
            border-left: 5px solid #f59e0b !important;
            box-shadow: 0 4px 16px rgba(245, 158, 11, 0.1) !important;
          }
          
          .report-info h3 {
            color: #92400e !important;
          }
          
          .report-info p {
            color: #78350f !important;
          }
          
          .report-info strong {
            color: #92400e !important;
          }
          
          .section-header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%) !important;
            color: white !important;
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3) !important;
            page-break-after: avoid;
          }
          
          .section-header::before {
            background: linear-gradient(90deg, #f59e0b 0%, #ef4444 100%) !important;
          }
          
          .subsection-header {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
            color: #92400e !important;
            border-left: 5px solid #f59e0b !important;
            box-shadow: 0 3px 12px rgba(245, 158, 11, 0.2) !important;
          }
          
          .data-table {
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
            background: white !important;
            page-break-inside: avoid;
          }
          
          .data-table th {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%) !important;
            color: white !important;
            text-align: center !important;
          }
          
          .data-table tbody tr:nth-child(even) {
            background: #f8fafc !important;
          }
          
          .data-table tbody tr:hover {
            background: #e0f2fe !important;
          }
          
          .number-cell {
            color: #1e40af !important;
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important;
          }
          
          .total-summary {
            color: #059669 !important;
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%) !important;
            border-left: 5px solid #059669 !important;
            box-shadow: 0 4px 16px rgba(5, 150, 105, 0.1) !important;
          }
          
          .selection-path {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
            border-left: 5px solid #f59e0b !important;
            box-shadow: 0 4px 16px rgba(245, 158, 11, 0.1) !important;
          }
          
          .selection-path h3 {
            color: #92400e !important;
          }
          
          .selection-path li {
            color: #78350f !important;
            background: rgba(255, 255, 255, 0.5) !important;
            border-left: 3px solid #f59e0b !important;
          }
          
          .selection-path li:before {
            color: #f59e0b !important;
          }
          
          .footer {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
            border-top: 3px solid #3b82f6 !important;
          }
          
          .footer p {
            color: #64748b !important;
          }
          
          .footer .malayalam {
            color: #1e40af !important;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          /* Ensure tables don't break awkwardly */
          .data-table, .section-header, .subsection-header {
            page-break-inside: avoid;
          }
          
          /* Better spacing for print */
          .section-header {
            margin-top: 25px;
            margin-bottom: 20px;
          }
          
          .subsection-header {
            margin-top: 20px;
            margin-bottom: 15px;
          }
          
          .data-table {
            margin-bottom: 20px;
          }
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          padding: 30px;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #f59e0b 0%, #ef4444 50%, #3b82f6 100%);
        }
        
        .header h1 {
          color: #1e40af;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 12px;
          text-shadow: 0 2px 4px rgba(30, 64, 175, 0.1);
        }
        
        .header h2 {
          color: #374151;
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 8px;
          font-family: 'Noto Sans Malayalam', 'Manjari', 'Meera', sans-serif;
        }
        
        .header .subtitle {
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
        }
        
        .malayalam {
          font-family: 'Noto Sans Malayalam', 'Manjari', 'Meera', 'Arial Unicode MS', sans-serif;
          font-weight: 500;
        }
        
        .report-info {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 35px;
          border-left: 5px solid #f59e0b;
          box-shadow: 0 4px 16px rgba(245, 158, 11, 0.1);
        }
        
        .report-info h3 {
          color: #92400e;
          font-size: 18px;
          margin-bottom: 18px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .report-info h3::before {
          content: '📊';
          font-size: 20px;
        }
        
        .report-info p {
          margin-bottom: 10px;
          font-size: 14px;
          color: #78350f;
          font-weight: 500;
        }
        
        .report-info strong {
          color: #92400e;
          font-weight: 600;
        }
        
        .section-header {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%);
          color: white;
          padding: 20px 25px;
          border-radius: 12px;
          margin: 40px 0 25px 0;
          font-size: 18px;
          font-weight: 700;
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        .section-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #f59e0b 0%, #ef4444 100%);
        }
        
        .subsection-header {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #92400e;
          padding: 15px 20px;
          border-radius: 10px;
          margin: 25px 0 20px 0;
          font-size: 16px;
          font-weight: 600;
          border-left: 5px solid #f59e0b;
          box-shadow: 0 3px 12px rgba(245, 158, 11, 0.2);
          position: relative;
        }
        
        .subsection-header::before {
          content: '📋';
          margin-right: 8px;
          font-size: 16px;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          overflow: hidden;
          background: white;
        }
        
        .data-table th {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          color: white;
          padding: 16px 14px;
          text-align: center;
          font-weight: 600;
          font-size: 14px;
          border: none;
          position: relative;
        }
        
        .data-table th:first-child {
          border-top-left-radius: 12px;
        }
        
        .data-table th:last-child {
          border-top-right-radius: 12px;
        }
        
        .data-table td {
          padding: 14px;
          border: none;
          border-bottom: 1px solid #e5e7eb;
          font-size: 13px;
          vertical-align: middle;
          text-align: center;
          transition: background-color 0.2s ease;
        }
        
        .data-table tbody tr:nth-child(even) {
          background: #f8fafc;
        }
        
        .data-table tbody tr:hover {
          background: #e0f2fe;
        }
        
        .data-table tbody tr:last-child td {
          border-bottom: none;
        }
        
        .number-cell {
          text-align: right;
          font-weight: 600;
          color: #1e40af;
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border-radius: 6px;
          font-family: 'Inter', monospace;
        }
        
        .total-summary {
          margin-top: 20px;
          text-align: right;
          font-weight: 700;
          color: #059669;
          font-size: 15px;
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          padding: 15px 20px;
          border-radius: 10px;
          border-left: 5px solid #059669;
          box-shadow: 0 4px 16px rgba(5, 150, 105, 0.1);
          position: relative;
        }
        
        .total-summary::before {
          content: '📊';
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
        }
        
        .selection-path {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          padding: 20px;
          border-radius: 12px;
          margin-top: 35px;
          border-left: 5px solid #f59e0b;
          box-shadow: 0 4px 16px rgba(245, 158, 11, 0.1);
        }
        
        .selection-path h3 {
          color: #92400e;
          font-size: 16px;
          margin-bottom: 15px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .selection-path h3::before {
          content: '🗂️';
          font-size: 18px;
        }
        
        .selection-path ul {
          list-style: none;
          padding-left: 0;
        }
        
        .selection-path li {
          margin-bottom: 8px;
          font-size: 14px;
          color: #78350f;
          font-weight: 500;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 6px;
          border-left: 3px solid #f59e0b;
        }
        
        .selection-path li:before {
          content: "→ ";
          color: #f59e0b;
          font-weight: bold;
          margin-right: 8px;
        }
        
        .footer {
          margin-top: 50px;
          padding: 25px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 12px;
          text-align: center;
          border-top: 3px solid #3b82f6;
        }
        
        .footer p {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        .footer .malayalam {
          color: #1e40af;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <!-- Enhanced Download UI -->
      <div class="download-ui">
        <div class="download-header">
          <div class="download-title">
            <div class="icon">📄</div>
            <div>
              <h1 class="malayalam">വികസിത കേരളം റിപ്പോർട്ത്</h1>
              <div style="font-size: 14px; opacity: 0.9;">${filters.district ? `${filters.district} - റിപ്പോർട്ത് തയ്യാർ` : 'VK Comprehensive Report Ready'}</div>
            </div>
          </div>
          <div class="download-actions">
            <button class="download-btn" onclick="window.print()">
              📥 Download PDF
            </button>
            <button class="download-btn" onclick="window.print()" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);">
              🖨️ Print Report
            </button>
            <button class="close-btn" onclick="window.close()">
              ✕ Close
            </button>
          </div>
        </div>
      </div>
      
      <!-- Report Content -->
      <div class="content-wrapper">
        <div class="header">
          <h1>BJP Kerala - Mission 2025-2026</h1>
          <h2 class="malayalam">വികസിത കേരളം വാർഡ് ടീം റിപ്പോർട്ത്</h2>
          <div class="subtitle">Vikasita Keralam Ward Team Report - Comprehensive Analysis</div>
        </div>
      
      <div class="report-info">
        <h3>Report Information</h3>
        <p><strong>Report Type:</strong> ${getLevelTitle(level)} - Comprehensive Analysis</p>
        ${selectedValue ? `<p><strong>Selected:</strong> ${selectedValue}</p>` : ''}
        <p><strong>Report Generated:</strong> ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}</p>
        <p><strong>Total Count:</strong> ${totalCount.toLocaleString('en-IN')}</p>
        <p><strong>Analysis Depth:</strong> 2 Level Drill-Down</p>
      </div>
      
      ${generateLevel1TablesHTML(drillDownData.level1, nextLevel1)}
      
      ${generateLevel2TablesHTML(drillDownData.level2, nextLevel2)}
      
      ${generateSelectionPathHTML(filters)}
      
        <div class="footer">
          <p>Generated by BJP Kerala VK Dashboard | Confidential Document</p>
          <p class="malayalam">ബിജെപി കേരളം - മിഷൻ 2025-2026</p>
          <p style="margin-top: 10px; font-size: 11px; color: #94a3b8;">
            Report generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}
          </p>
        </div>
      </div>
      
      <script>
        // Enhanced functionality
        document.addEventListener('DOMContentLoaded', function() {
          // Ensure color preservation for PDF
          const style = document.createElement('style');
          style.textContent = \`
            @media print {
              * { 
                -webkit-print-color-adjust: exact !important; 
                color-adjust: exact !important; 
                print-color-adjust: exact !important;
              }
            }
          \`;
          document.head.appendChild(style);
          
          // Add keyboard shortcuts
          document.addEventListener('keydown', function(e) {
            if (e.ctrlKey || e.metaKey) {
              switch(e.key) {
                case 'p':
                  e.preventDefault();
                  enhancedPrint();
                  break;
                case 'w':
                  e.preventDefault();
                  window.close();
                  break;
              }
            }
            if (e.key === 'Escape') {
              window.close();
            }
          });
          
          // Enhanced print function
          function enhancedPrint() {
            // Show loading state
            const downloadBtns = document.querySelectorAll('.download-btn');
            downloadBtns.forEach(btn => {
              const originalText = btn.innerHTML;
              btn.innerHTML = '⏳ Preparing PDF...';
              btn.style.opacity = '0.7';
              
              setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.opacity = '1';
              }, 3000);
            });
            
            // Add print-specific enhancements
            document.body.classList.add('printing');
            
            // Trigger print with delay to ensure styles are applied
            setTimeout(() => {
              window.print();
              document.body.classList.remove('printing');
            }, 500);
          }
          
          // Auto-focus for better UX
          document.body.focus();
          
          // Add enhanced click handlers
          const downloadBtns = document.querySelectorAll('.download-btn');
          downloadBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
              e.preventDefault();
              enhancedPrint();
            });
          });
          
          console.log('📄 VK Comprehensive Report loaded successfully');
          console.log('💡 Tip: Use Ctrl+P to download, Ctrl+W to close, or Esc to exit');
          console.log('🎨 Enhanced color preservation enabled for PDF output');
        });
      </script>
    </body>
    </html>
  `;
};

const generateLevel1TablesHTML = (level1Data: { name: string; items: { option: string; count: number }[] }[], nextLevel1: keyof VKFilterState | null): string => {
  if (!level1Data || level1Data.length === 0 || !nextLevel1) {
    return '';
  }

  const levelTitle = getLevelTitle(nextLevel1);
  const mainData = level1Data.find(group => group.name === 'main');

  if (!mainData || mainData.items.length === 0) {
    return '';
  }

  const totalCount = mainData.items.reduce((sum, item) => sum + item.count, 0);

  // Check if we're showing organizational districts (Districts level)
  const isOrgDistrictsTable = levelTitle === 'Districts';

  const tableRows = mainData.items.map((item, index) => {
    const vkWardsCount = isOrgDistrictsTable ? getVKWardsCount(item.option) : null;

    return `
      <tr>
        <td>${index + 1}</td>
        <td class="malayalam">${item.option}</td>
        <td class="number-cell">${item.count.toLocaleString('ml-IN')}</td>
        ${isOrgDistrictsTable ? `<td class="number-cell">${vkWardsCount?.toLocaleString('ml-IN') || 0}</td>` : ''}
      </tr>
    `;
  }).join('');

  return `
    <div class="section-header malayalam">
      ${levelTitle} List
    </div>
    
    <table class="data-table">
      <thead>
        <tr>
          <th class="malayalam">ക്രമ നമ്പർ<br><small>Serial No</small></th>
          <th class="malayalam">${levelTitle}</th>
          <th class="malayalam">എണ്ണം<br><small>Count</small></th>
          ${isOrgDistrictsTable ? `<th class="malayalam">Total VK Wards</th>` : ''}
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
    
    <div class="total-summary malayalam">
      Total ${levelTitle}: ${totalCount.toLocaleString('ml-IN')} (${totalCount.toLocaleString()})
      ${isOrgDistrictsTable ? `<br>Total VK Wards: ${mainData.items.reduce((sum, item) => sum + getVKWardsCount(item.option), 0).toLocaleString('ml-IN')}` : ''}
    </div>
  `;
};

const generateLevel2TablesHTML = (level2Data: { parentName: string; parentLevel: string; items: { option: string; count: number }[] }[], nextLevel2: keyof VKFilterState | null): string => {
  if (!level2Data || level2Data.length === 0 || !nextLevel2) {
    return '';
  }

  const level2Title = getLevelTitle(nextLevel2);

  return `
    <div class="section-header malayalam">
      ${level2Title} Details
    </div>
    
    ${level2Data.map(parentGroup => {
    const totalCount = parentGroup.items.reduce((sum, item) => sum + item.count, 0);

    const tableRows = parentGroup.items.map((item, index) => `
        <tr>
          <td style="text-align: center;">${index + 1}</td>
          <td class="malayalam">${item.option}</td>
          <td class="number-cell">${item.count.toLocaleString('ml-IN')}</td>
        </tr>
      `).join('');

    return `
        <div class="subsection-header malayalam">
          ${parentGroup.parentName} - ${level2Title}
        </div>
        
        <table class="data-table">
          <thead>
            <tr>
              <th style="text-align: center;" class="malayalam">ക്രമ നമ്പർ<br><small>Serial No</small></th>
              <th class="malayalam">${level2Title}</th>
              <th style="text-align: center;" class="malayalam">എണ്ണം<br><small>Count</small></th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        
        <div class="total-summary malayalam">
          ${parentGroup.parentName} മൊത്തം: ${totalCount.toLocaleString('ml-IN')}
        </div>
      `;
  }).join('')}
  `;
};

const generateSelectionPathHTML = (filters: VKFilterState): string => {
  const selectionPath = [];
  if (filters.tab) selectionPath.push(`സോൺ: ${filters.tab}`);
  if (filters.district) selectionPath.push(`ജില്ല: ${filters.district}`);
  if (filters.assemblyMandal) selectionPath.push(`നിയോജകമണ്ഡലം: ${filters.assemblyMandal}`);
  if (filters.orgMandal) selectionPath.push(`സംഘടനാ മണ്ഡലം: ${filters.orgMandal}`);
  if (filters.panchayat) selectionPath.push(`പഞ്ചായത്ത്: ${filters.panchayat}`);

  if (selectionPath.length === 0) return '';

  const pathItems = selectionPath.map(path => `<li class="malayalam">${path}</li>`).join('');

  return `
    <div class="selection-path">
      <h3 class="malayalam">നിലവിലെ തിരഞ്ഞെടുപ്പ് പാത (Current Selection Path)</h3>
      <ul>
        ${pathItems}
      </ul>
    </div>
  `;
};

// Helper functions
const getNextFilterLevel = (currentLevel: string): keyof VKFilterState | null => {
  switch (currentLevel) {
    case 'zone': return 'district';
    case 'district': return 'orgMandal';
    case 'assembly': return 'orgMandal';
    case 'orgMandal': return 'panchayat';
    case 'panchayat': return null;
    default: return 'tab';
  }
};

const getLevelString = (level: keyof VKFilterState): string => {
  switch (level) {
    case 'tab': return 'zone';
    case 'district': return 'district';
    case 'assemblyMandal': return 'assembly';
    case 'orgMandal': return 'orgMandal';
    case 'panchayat': return 'panchayat';
    default: return 'zone';
  }
};

const getOptionsForLevel = (options: any, level: keyof VKFilterState): string[] => {
  switch (level) {
    case 'tab': return options.tabs || [];
    case 'district': return options.districts || [];
    case 'assemblyMandal': return options.assemblyMandals || [];
    case 'orgMandal': return options.orgMandals || [];
    case 'panchayat': return options.panchayats || [];
    default: return [];
  }
};

const getLevelTitle = (level: keyof VKFilterState | string | null): string => {
  switch (level) {
    case 'zone': return 'Zone Report';
    case 'district': return 'Districts';
    case 'assembly': return 'Org Mandal Report';
    case 'orgMandal': return 'Org Mandals';
    case 'panchayat': return 'Local Body';
    case 'tab': return 'Zones';
    case 'assemblyMandal': return 'Org Mandals';
    default: return 'Items';
  }
};