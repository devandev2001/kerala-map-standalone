// Simple Malayalam PDF generator using browser's built-in rendering
import { getVKFilterOptions, getVKFilterCounts, getVKFilteredDataCount } from './vkDataProcessor';

interface VKFilterState {
  tab?: string;
  district?: string;
  assemblyMandal?: string;
  orgMandal?: string;
  panchayat?: string;
}

interface VKReportData {
  allData: any[];
  filters: VKFilterState;
  level: string;
  selectedValue: string;
}

export const generateSimpleMalayalamPDF = async (reportData: VKReportData): Promise<boolean> => {
  try {
    console.log('🔄 Starting Simple Malayalam PDF generation...');
    
    const { allData, filters, level, selectedValue } = reportData;
    
    // Get the data for the current level
    const tableData = getCurrentLevelData(reportData);
    const totalCount = getVKFilteredDataCount(allData, filters);
    const nextLevel = getNextFilterLevel(level);
    const nextLevelTitle = getLevelTitle(nextLevel);
    
    // Create a simple HTML page that the browser can render properly
    const htmlContent = createMalayalamHTML(reportData, tableData, nextLevelTitle, totalCount);
    
    // Open in new window and trigger print
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window');
    }
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for fonts to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Trigger print dialog
    printWindow.print();
    
    // Close the window after a delay
    setTimeout(() => {
      printWindow.close();
    }, 2000);
    
    console.log('✅ Simple Malayalam PDF generation initiated');
    return true;
    
  } catch (error) {
    console.error('❌ Error generating Simple Malayalam PDF:', error);
    return false;
  }
};

const createMalayalamHTML = (
  reportData: VKReportData, 
  tableData: any[], 
  nextLevelTitle: string, 
  totalCount: number
): string => {
  const { filters, level, selectedValue } = reportData;
  
  return `
    <!DOCTYPE html>
    <html lang="ml">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${filters.district ? filters.district.replace(/\s+/g, '_').replace(/[<>:"/\\|?*]/g, '_') : 'VK_Malayalam_Report'}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Noto Sans Malayalam', 'Manjari', 'Meera', 'Arial Unicode MS', Arial, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #333;
          background: white;
          padding: 20px;
        }
        
        @media print {
          body {
            font-size: 12px;
            padding: 10px;
          }
          
          .no-print {
            display: none;
          }
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #f97316;
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
          margin-bottom: 8px;
          font-family: 'Noto Sans Malayalam', 'Manjari', 'Meera', sans-serif;
        }
        
        .malayalam {
          font-family: 'Noto Sans Malayalam', 'Manjari', 'Meera', 'Arial Unicode MS', sans-serif;
          font-weight: 500;
        }
        
        .report-info {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          border-left: 4px solid #f97316;
        }
        
        .report-info h3 {
          color: #f97316;
          font-size: 16px;
          margin-bottom: 15px;
          font-weight: 600;
        }
        
        .report-info p {
          margin-bottom: 8px;
          font-size: 14px;
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
          padding: 12px 10px;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          border: 1px solid #e5e7eb;
        }
        
        .data-table td {
          padding: 10px;
          border: 1px solid #e5e7eb;
          font-size: 12px;
          vertical-align: top;
        }
        
        .data-table tbody tr:nth-child(even) {
          background: #f8fafc;
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
        
        .total-summary {
          margin-top: 15px;
          text-align: right;
          font-weight: 600;
          color: #059669;
          font-size: 14px;
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
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 10px;
          color: #666;
          text-align: center;
        }
        
        .print-instructions {
          background: #e0f2fe;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          border-left: 4px solid #0284c7;
        }
        
        .print-instructions h3 {
          color: #0284c7;
          font-size: 14px;
          margin-bottom: 10px;
        }
        
        .print-instructions p {
          font-size: 12px;
          margin-bottom: 5px;
        }
      </style>
    </head>
    <body>
      <div class="print-instructions no-print">
        <h3>Print Instructions / പ്രിന്റ് നിർദ്ദേശങ്ങൾ</h3>
        <p>• Use Ctrl+P (Windows) or Cmd+P (Mac) to save as PDF</p>
        <p>• Choose "Save as PDF" in the destination</p>
        <p>• പിഡിഎഫ് ആയി സേവ് ചെയ്യാൻ "Save as PDF" തിരഞ്ഞെടുക്കുക</p>
      </div>
      
      <div class="header">
        <h1>BJP Kerala - Mission 2025-2026</h1>
        <h2 class="malayalam">വികസിത കേരളം വാർഡ് ടീം റിപ്പോർട്ത്</h2>
        <div>Vikasita Keralam Ward Team Report</div>
      </div>
      
      <div class="report-info">
        <h3 class="malayalam">റിപ്പോർട്ട് വിവരങ്ങൾ (Report Information)</h3>
        <p><strong>റിപ്പോർട്ത് തരം:</strong> <span class="malayalam">${getLevelTitle(level)}</span></p>
        ${selectedValue ? `<p><strong>തിരഞ്ഞെടുത്തത്:</strong> <span class="malayalam">${selectedValue}</span></p>` : ''}
        <p><strong>റിപ്പോർട്ത് തയ്യാറാക്കിയത്:</strong> ${new Date().toLocaleDateString('ml-IN')} ${new Date().toLocaleTimeString('ml-IN')}</p>
        <p><strong>മൊത്തം എണ്ണം:</strong> ${totalCount.toLocaleString('ml-IN')}</p>
      </div>
      
      ${generateTableHTML(tableData, nextLevelTitle, totalCount)}
      
      ${generateSelectionPathHTML(filters)}
      
      <div class="footer">
        <p>Generated by BJP Kerala VK Dashboard | Confidential Document</p>
        <p class="malayalam">ബിജെപി കേരളം - മിഷൻ 2025-2026</p>
      </div>
    </body>
    </html>
  `;
};

// Helper functions (same as before but simplified)
const generateTableHTML = (tableData: any[], nextLevelTitle: string, totalCount: number): string => {
  if (!tableData || tableData.length === 0) {
    return `
      <div style="text-align: center; padding: 40px; color: #dc2626;">
        <h3 class="malayalam">ഈ ലെവലിൽ വിശദമായ ഡാറ്റ ലഭ്യമല്ല</h3>
        <p>No detailed data available for this level.</p>
      </div>
    `;
  }
  
  const tableRows = tableData.map((item, index) => `
    <tr>
      <td style="text-align: center;">${index + 1}</td>
      <td class="malayalam">${item.option}</td>
      <td class="number-cell">${item.count.toLocaleString('ml-IN')}</td>
      <td class="percentage-cell">${((item.count / totalCount) * 100).toFixed(1)}%</td>
    </tr>
  `).join('');
  
  return `
    <div>
      <h3 style="color: #f97316; font-size: 16px; margin-bottom: 15px;" class="malayalam">
        ${nextLevelTitle} പട്ടിക (${nextLevelTitle} List)
      </h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="text-align: center;" class="malayalam">ക്രമ നമ്പർ<br><small>Serial No</small></th>
            <th class="malayalam">${nextLevelTitle}</th>
            <th style="text-align: center;" class="malayalam">എണ്ണം<br><small>Count</small></th>
            <th style="text-align: center;" class="malayalam">ശതമാനം<br><small>Percentage</small></th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <div class="total-summary malayalam">
        മൊത്തം: ${totalCount.toLocaleString('ml-IN')} (Total: ${totalCount.toLocaleString()})
      </div>
    </div>
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

const getLevelTitle = (level: string | null): string => {
  switch (level) {
    case 'zone': return 'സോൺ റിപ്പോർട്ത് (Zone Report)';
    case 'district': return 'ജില്ലാ റിപ്പോർട്ത് (District Report)';
    case 'assembly': return 'സംഘടനാ മണ്ഡല റിപ്പോർട്ത് (Org Mandal Report)';
    case 'orgMandal': return 'സംഘടനാ മണ്ഡല റിപ്പോർട്ത് (Org Mandal Report)';
    case 'panchayat': return 'പഞ്ചായത്ത് റിപ്പോർട്ത് (Panchayat Report)';
    case 'tab': return 'സോണുകൾ (Zones)';
    case 'assemblyMandal': return 'സംഘടനാ മണ്ഡലങ്ങൾ (Org Mandals)';
    default: return 'ഇനങ്ങൾ (Items)';
  }
};