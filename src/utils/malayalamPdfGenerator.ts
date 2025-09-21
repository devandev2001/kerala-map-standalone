import html2pdf from 'html2pdf.js';

interface VKReportData {
  allData: any[];
  filters: any;
  level: string;
  selectedValue: string;
}

// Generate HTML content with proper Malayalam font support
const generateVKReportHTML = (reportData: VKReportData): string => {
  const { allData, filters, level, selectedValue } = reportData;
  
  // Get current level data (you'll need to implement this based on your data structure)
  const tableData = getCurrentLevelData(reportData);
  
  return `
    <!DOCTYPE html>
    <html lang="ml">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>VK Report</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Noto Sans Malayalam', 'Arial Unicode MS', Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
          background: white;
          padding: 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #f97316;
          padding-bottom: 20px;
        }
        
        .header h1 {
          color: #f97316;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        
        .header h2 {
          color: #333;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 5px;
        }
        
        .header .subtitle {
          color: #666;
          font-size: 14px;
        }
        
        .report-info {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 25px;
          border-left: 4px solid #f97316;
        }
        
        .report-info h3 {
          color: #f97316;
          font-size: 16px;
          margin-bottom: 10px;
          font-weight: 600;
        }
        
        .report-info p {
          margin-bottom: 5px;
          font-size: 13px;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .data-table th {
          background: #f97316;
          color: white;
          padding: 12px 8px;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          border: 1px solid #e5e7eb;
        }
        
        .data-table td {
          padding: 10px 8px;
          border: 1px solid #e5e7eb;
          font-size: 12px;
          vertical-align: top;
        }
        
        .data-table tbody tr:nth-child(even) {
          background: #f8fafc;
        }
        
        .data-table tbody tr:hover {
          background: #f1f5f9;
        }
        
        .malayalam-text {
          font-family: 'Noto Sans Malayalam', 'Arial Unicode MS', Arial, sans-serif;
          font-size: 13px;
          line-height: 1.5;
        }
        
        .number-cell {
          text-align: right;
          font-weight: 600;
        }
        
        .percentage-cell {
          text-align: center;
          font-weight: 600;
          color: #059669;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 10px;
          color: #666;
          text-align: center;
        }
        
        .selection-path {
          background: #fef3c7;
          padding: 15px;
          border-radius: 8px;
          margin-top: 25px;
          border-left: 4px solid #f59e0b;
        }
        
        .selection-path h3 {
          color: #92400e;
          font-size: 14px;
          margin-bottom: 10px;
          font-weight: 600;
        }
        
        .selection-path ul {
          list-style: none;
          padding-left: 0;
        }
        
        .selection-path li {
          margin-bottom: 5px;
          font-size: 12px;
          color: #78350f;
        }
        
        .selection-path li:before {
          content: "→ ";
          color: #f59e0b;
          font-weight: bold;
        }
        
        @media print {
          body {
            padding: 10px;
          }
          
          .header h1 {
            font-size: 20px;
          }
          
          .header h2 {
            font-size: 16px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>BJP Kerala - Mission 2025-2026</h1>
        <h2>വികസിത കേരളം വാർഡ് ടീം റിപ്പോർട്ട്</h2>
        <div class="subtitle">Vikasita Keralam Ward Team Report</div>
      </div>
      
      <div class="report-info">
        <h3>റിപ്പോർട്ട് വിവരങ്ങൾ (Report Information)</h3>
        <p><strong>റിപ്പോർട്ട് തരം:</strong> ${getLevelTitle(level)}</p>
        ${selectedValue ? `<p><strong>തിരഞ്ഞെടുത്തത്:</strong> <span class="malayalam-text">${selectedValue}</span></p>` : ''}
        <p><strong>റിപ്പോർട്ട് തയ്യാറാക്കിയത്:</strong> ${new Date().toLocaleDateString('ml-IN')} ${new Date().toLocaleTimeString('ml-IN')}</p>
      </div>
      
      ${generateTableHTML(tableData, level)}
      
      ${generateSelectionPathHTML(filters)}
      
      <div class="footer">
        <p>Generated by BJP Kerala VK Dashboard | Confidential Document</p>
        <p>BJP Kerala - Mission 2025-2026</p>
      </div>
    </body>
    </html>
  `;
};

// Helper function to generate table HTML
const generateTableHTML = (tableData: any[], level: string): string => {
  if (!tableData || tableData.length === 0) {
    return `
      <div style="text-align: center; padding: 40px; color: #dc2626;">
        <h3>ഈ ലെവലിൽ വിശദമായ ഡാറ്റ ലഭ്യമല്ല</h3>
        <p>No detailed data available for this level.</p>
      </div>
    `;
  }
  
  const nextLevelTitle = getLevelTitle(getNextFilterLevel(level));
  const totalCount = tableData.reduce((sum, item) => sum + item.count, 0);
  
  const tableRows = tableData.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td class="malayalam-text">${item.option}</td>
      <td class="number-cell">${item.count.toLocaleString('ml-IN')}</td>
      <td class="percentage-cell">${((item.count / totalCount) * 100).toFixed(1)}%</td>
    </tr>
  `).join('');
  
  return `
    <div>
      <h3 style="color: #f97316; font-size: 16px; margin-bottom: 15px;">
        ${nextLevelTitle} പട്ടിക (${nextLevelTitle} List)
      </h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>ക്രമ നമ്പർ<br><small>Serial No</small></th>
            <th>${nextLevelTitle}</th>
            <th>എണ്ണം<br><small>Count</small></th>
            <th>ശതമാനം<br><small>Percentage</small></th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <div style="margin-top: 15px; text-align: right; font-weight: 600; color: #059669;">
        മൊത്തം: ${totalCount.toLocaleString('ml-IN')} (Total: ${totalCount.toLocaleString()})
      </div>
    </div>
  `;
};

// Helper function to generate selection path HTML
const generateSelectionPathHTML = (filters: any): string => {
  const selectionPath = [];
  if (filters.tab) selectionPath.push(`സോൺ: ${filters.tab}`);
  if (filters.district) selectionPath.push(`ജില്ല: ${filters.district}`);
  if (filters.assemblyMandal) selectionPath.push(`നിയോജകമണ്ഡലം: ${filters.assemblyMandal}`);
  if (filters.orgMandal) selectionPath.push(`സംഘടനാ മണ്ഡലം: ${filters.orgMandal}`);
  if (filters.panchayat) selectionPath.push(`പഞ്ചായത്ത്: ${filters.panchayat}`);
  
  if (selectionPath.length === 0) return '';
  
  const pathItems = selectionPath.map(path => `<li class="malayalam-text">${path}</li>`).join('');
  
  return `
    <div class="selection-path">
      <h3>നിലവിലെ തിരഞ്ഞെടുപ്പ് പാത (Current Selection Path)</h3>
      <ul>
        ${pathItems}
      </ul>
    </div>
  `;
};

// Export the main PDF generation function
export const generateMalayalamVKReportPDF = async (reportData: VKReportData): Promise<boolean> => {
  try {
    console.log('🔄 Starting Malayalam VK PDF generation...', reportData);
    
    // Generate HTML content
    const htmlContent = generateVKReportHTML(reportData);
    
    // Create a temporary div to hold the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    document.body.appendChild(tempDiv);
    
    // Configure html2pdf options
    const options = {
      margin: [10, 10, 10, 10],
      filename: generateFilename(reportData),
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        allowTaint: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    };
    
    // Generate and download PDF
    await html2pdf().set(options).from(tempDiv).save();
    
    // Clean up
    document.body.removeChild(tempDiv);
    
    console.log('✅ Malayalam VK PDF generated successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error generating Malayalam VK PDF:', error);
    return false;
  }
};

// Import the required functions from the existing VK data processor
import { getVKFilterOptions, getVKFilterCounts, getVKFilteredDataCount } from './vkDataProcessor';

interface VKFilterState {
  tab?: string;
  district?: string;
  assemblyMandal?: string;
  orgMandal?: string;
  panchayat?: string;
}

// Helper functions
const getCurrentLevelData = (reportData: VKReportData): any[] => {
  const { allData, filters, level } = reportData;
  const nextLevel = getNextFilterLevel(level);
  if (!nextLevel) return [];
  
  const nextOptions = getVKFilterOptions(allData, filters);
  const nextLevelOptions = getOptionsForLevel(nextOptions, nextLevel);
  
  return nextLevelOptions.map(option => {
    const tempFilters = { ...filters, [nextLevel]: option };
    const count = getVKFilterCounts(allData, tempFilters)[nextLevel];
    return { option, count };
  });
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

const getNextFilterLevel = (currentLevel: string): keyof VKFilterState | null => {
  switch (currentLevel) {
    case 'zone': return 'district';
    case 'district': return 'assemblyMandal';
    case 'assembly': return 'orgMandal';
    case 'orgMandal': return 'panchayat';
    case 'panchayat': return null;
    default: return 'tab';
  }
};

const getLevelTitle = (level: string | null): string => {
  switch (level) {
    case 'tab': return 'സോണുകൾ (Zones)';
    case 'district': return 'ജില്ലകൾ (Districts)';
    case 'assemblyMandal': return 'നിയോജകമണ്ഡലങ്ങൾ (Assembly Mandals)';
    case 'orgMandal': return 'സംഘടനാ മണ്ഡലങ്ങൾ (Org Mandals)';
    case 'panchayat': return 'പഞ്ചായത്തുകൾ (Panchayats)';
    default: return 'ഇനങ്ങൾ (Items)';
  }
};

const generateFilename = (reportData: VKReportData): string => {
  let filename = 'VK_Malayalam_Report';
  if (reportData.filters.district) {
    filename += `_${reportData.filters.district.replace(/\s+/g, '_').replace(/[<>:"/\\|?*]/g, '_')}`;
  }
  filename += `_${reportData.level}_${new Date().toISOString().split('T')[0]}.pdf`;
  return filename;
};