import html2pdf from 'html2pdf.js';
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

export const generateWorkingMalayalamPDF = async (reportData: VKReportData): Promise<boolean> => {
  try {
    console.log('🔄 Starting Working Malayalam PDF generation...', reportData);
    
    const { allData, filters, level, selectedValue } = reportData;
    
    // Debug: Check if we have Malayalam text in the data
    console.log('🔍 Debugging Malayalam content...');
    console.log('Selected value:', selectedValue);
    console.log('Filters:', filters);
    
    // Test Malayalam text
    const testMalayalam = 'വികസിത കേരളം വാർഡ് ടീം റിപ്പോർട്ത്';
    console.log('Test Malayalam text:', testMalayalam);
    console.log('Test text char codes:', testMalayalam.split('').map(c => c.charCodeAt(0)));
    
    // Get the data for the current level
    const tableData = getCurrentLevelData(reportData);
    const totalCount = getVKFilteredDataCount(allData, filters);
    const nextLevel = getNextFilterLevel(level);
    const nextLevelTitle = getLevelTitle(nextLevel);
    
    // Create HTML content with proper Malayalam support
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ml">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${filters.district ? filters.district.replace(/\s+/g, '_').replace(/[<>:"/\\|?*]/g, '_') : 'VK_Malayalam_Report'}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
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
            border-bottom: 3px solid #f97316;
            padding-bottom: 20px;
          }
          
          .header h1 {
            color: #f97316;
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          
          .header h2 {
            color: #333;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 5px;
          }
          
          .header .subtitle {
            color: #666;
            font-size: 12px;
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
            font-size: 14px;
            margin-bottom: 10px;
            font-weight: 600;
          }
          
          .report-info p {
            margin-bottom: 5px;
            font-size: 11px;
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
            padding: 10px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 11px;
            border: 1px solid #e5e7eb;
          }
          
          .data-table td {
            padding: 8px;
            border: 1px solid #e5e7eb;
            font-size: 10px;
            vertical-align: top;
          }
          
          .data-table tbody tr:nth-child(even) {
            background: #f8fafc;
          }
          
          .malayalam-text {
            font-family: 'Noto Sans Malayalam', 'Arial Unicode MS', Arial, sans-serif;
            font-size: 11px;
            line-height: 1.5;
            font-weight: 500;
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
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            font-size: 9px;
            color: #666;
            text-align: center;
          }
          
          .selection-path {
            background: #fef3c7;
            padding: 12px;
            border-radius: 6px;
            margin-top: 20px;
            border-left: 4px solid #f59e0b;
          }
          
          .selection-path h3 {
            color: #92400e;
            font-size: 12px;
            margin-bottom: 8px;
            font-weight: 600;
          }
          
          .selection-path ul {
            list-style: none;
            padding-left: 0;
          }
          
          .selection-path li {
            margin-bottom: 4px;
            font-size: 10px;
            color: #78350f;
          }
          
          .selection-path li:before {
            content: "→ ";
            color: #f59e0b;
            font-weight: bold;
          }
          
          .total-summary {
            margin-top: 15px;
            text-align: right;
            font-weight: 600;
            color: #059669;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BJP Kerala - Mission 2025-2026</h1>
          <h2 class="malayalam-text">വികസിത കേരളം വാർഡ് ടീം റിപ്പോർട്ട്</h2>
          <div class="subtitle">Vikasita Keralam Ward Team Report</div>
        </div>
        
        <div class="report-info">
          <h3 class="malayalam-text">റിപ്പോർട്ട് വിവരങ്ങൾ (Report Information)</h3>
          <p><strong>റിപ്പോർട്ട് തരം:</strong> ${getLevelTitle(level)}</p>
          ${selectedValue ? `<p><strong>തിരഞ്ഞെടുത്തത്:</strong> <span class="malayalam-text">${selectedValue}</span></p>` : ''}
          <p><strong>റിപ്പോർട്ട് തയ്യാറാക്കിയത്:</strong> ${new Date().toLocaleDateString('ml-IN')} ${new Date().toLocaleTimeString('ml-IN')}</p>
          <p><strong>മൊത്തം എണ്ണം:</strong> ${totalCount.toLocaleString('ml-IN')}</p>
        </div>
        
        ${generateTableHTML(tableData, nextLevelTitle, totalCount)}
        
        ${generateSelectionPathHTML(filters)}
        
        <div class="footer">
          <p>Generated by BJP Kerala VK Dashboard | Confidential Document</p>
          <p class="malayalam-text">ബിജെപി കേരളം - മിഷൻ 2025-2026</p>
        </div>
      </body>
      </html>
    `;
    
    // Configure html2pdf options for better Malayalam rendering
    const options = {
      margin: [10, 10, 10, 10],
      filename: generateFilename(reportData),
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        width: 800,
        height: 1200
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    // Generate PDF using html2pdf
    await html2pdf().set(options).from(htmlContent).save();
    
    console.log('✅ Working Malayalam PDF generated successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error generating Working Malayalam PDF:', error);
    return false;
  }
};

// Helper function to generate table HTML
const generateTableHTML = (tableData: any[], nextLevelTitle: string, totalCount: number): string => {
  if (!tableData || tableData.length === 0) {
    return `
      <div style="text-align: center; padding: 40px; color: #dc2626;">
        <h3 class="malayalam-text">ഈ ലെവലിൽ വിശദമായ ഡാറ്റ ലഭ്യമല്ല</h3>
        <p>No detailed data available for this level.</p>
      </div>
    `;
  }
  
  const tableRows = tableData.map((item, index) => `
    <tr>
      <td style="text-align: center;">${index + 1}</td>
      <td class="malayalam-text">${item.option}</td>
      <td class="number-cell">${item.count.toLocaleString('ml-IN')}</td>
      <td class="percentage-cell">${((item.count / totalCount) * 100).toFixed(1)}%</td>
    </tr>
  `).join('');
  
  return `
    <div>
      <h3 style="color: #f97316; font-size: 14px; margin-bottom: 15px;" class="malayalam-text">
        ${nextLevelTitle} പട്ടിക (${nextLevelTitle} List)
      </h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="text-align: center;">ക്രമ നമ്പർ<br><small>Serial No</small></th>
            <th class="malayalam-text">${nextLevelTitle}</th>
            <th style="text-align: center;">എണ്ണം<br><small>Count</small></th>
            <th style="text-align: center;">ശതമാനം<br><small>Percentage</small></th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <div class="total-summary malayalam-text">
        മൊത്തം: ${totalCount.toLocaleString('ml-IN')} (Total: ${totalCount.toLocaleString()})
      </div>
    </div>
  `;
};

// Helper function to generate selection path HTML
const generateSelectionPathHTML = (filters: VKFilterState): string => {
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
      <h3 class="malayalam-text">നിലവിലെ തിരഞ്ഞെടുപ്പ് പാത (Current Selection Path)</h3>
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
    case 'district': return 'assemblyMandal';
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
    case 'zone': return 'സോൺ റിപ്പോർട്ട് (Zone Report)';
    case 'district': return 'ജില്ലാ റിപ്പോർട്ട് (District Report)';
    case 'assembly': return 'നിയോജകമണ്ഡല റിപ്പോർട്ത് (Assembly Report)';
    case 'orgMandal': return 'സംഘടനാ മണ്ഡല റിപ്പോർട്ത് (Org Mandal Report)';
    case 'panchayat': return 'പഞ്ചായത്ത് റിപ്പോർട്ത് (Panchayat Report)';
    case 'tab': return 'സോണുകൾ (Zones)';
    case 'assemblyMandal': return 'സംഘടനാ മണ്ഡലങ്ങൾ (Org Mandals)';
    default: return 'ഇനങ്ങൾ (Items)';
  }
};

const generateFilename = (reportData: VKReportData): string => {
  let filename = 'VK_Malayalam_Report';
  if (reportData.selectedValue) {
    const cleanedValue = reportData.selectedValue.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
    filename += `_${cleanedValue}`;
  }
  filename += `_${reportData.level}_${new Date().toISOString().split('T')[0]}.pdf`;
  return filename;
};