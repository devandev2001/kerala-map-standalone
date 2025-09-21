import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { VKDataRow, VKFilterState } from '../types/vkDashboard';
import { getVKFilterOptions, getVKFilterCounts, getVKFilteredDataCount } from './vkDataProcessor';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface VKReportData {
  allData: VKDataRow[];
  filters: VKFilterState;
  level: 'zone' | 'district' | 'assembly' | 'orgMandal' | 'panchayat';
  selectedValue: string;
}

// Enhanced PDF generator with better Malayalam support
export const generateEnhancedVKReportPDF = (reportData: VKReportData): boolean => {
  try {
    console.log('🔄 Starting Enhanced VK PDF generation with Malayalam support...', reportData);
    
    const doc = new jsPDF('landscape');
    const { allData, filters, level, selectedValue } = reportData;
    
    // Set up font for better Unicode support
    doc.setFont('helvetica', 'normal');
    
    // Header with Malayalam support
    doc.setFontSize(20);
    doc.setTextColor(249, 115, 22);
    doc.text('BJP Kerala - Mission 2025-2026', 20, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    // Use Unicode-friendly text rendering
    const malayalamTitle = 'വികസിത കേരളം വാർഡ് ടീം റിപ്പോർട്ട്';
    doc.text('Vikasita Keralam Ward Team Report', 20, 35);
    
    // Try to render Malayalam title
    try {
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text(malayalamTitle, 20, 50);
    } catch (error) {
      console.warn('Could not render Malayalam title:', error);
    }
    
    // Report Level Information
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    
    const levelTitles = {
      zone: 'Zone Report / സോൺ റിപ്പോർട്ട്',
      district: 'District Report / സംഘടന ജില്ല റിപ്പോർട്ത്',
      assembly: 'Assembly Report / നിയോജക മണ്ഡലം റിപ്പോർട്ത്',
      orgMandal: 'Org Mandal Report / സംഘടനാ മണ്ഡലം റിപ്പോർട്ത്',
      panchayat: 'Panchayat Report / പഞ്ചായത്ത് റിപ്പോർട്ത്'
    };
    
    let yPosition = 65;
    doc.text(`Report Type: ${levelTitles[level]}`, 20, yPosition);
    yPosition += 7;
    
    if (selectedValue) {
      // Enhanced text rendering for Malayalam content
      const selectedText = `Selected: ${selectedValue}`;
      doc.text(selectedText, 20, yPosition);
      yPosition += 7;
    }
    
    yPosition += 10;
    doc.text(`Report Generated: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`, 20, yPosition);
    
    // Main Data Table with enhanced Malayalam support
    yPosition += 15;
    
    const getCurrentLevelData = () => {
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
    
    const tableData = getCurrentLevelData();
    const totalCount = getVKFilteredDataCount(allData, filters);
    
    if (tableData.length > 0) {
      const nextLevel = getNextFilterLevel(level);
      const nextLevelTitle = getLevelTitle(nextLevel);
      
      doc.setFontSize(14);
      doc.setTextColor(249, 115, 22);
      doc.text(`${nextLevelTitle} List`, 20, yPosition);
      
      // Prepare table data with enhanced text handling
      const pdfTableData = tableData.map((item, index) => {
        // Clean and prepare text for PDF rendering
        const cleanedOption = cleanTextForPDF(item.option);
        return [
          index + 1,
          cleanedOption,
          item.count.toLocaleString(),
          `${((item.count / totalCount) * 100).toFixed(1)}%`
        ];
      });
      
      // Enhanced table options for better text rendering
      const tableOptions = {
        startY: yPosition + 10,
        head: [['#', nextLevelTitle, 'Count', 'Percentage']],
        body: pdfTableData,
        theme: 'grid',
        headStyles: {
          fillColor: [249, 115, 22],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [60, 60, 60],
          // Enhanced cell padding for better text display
          cellPadding: 4,
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 15 },  // #
          1: { cellWidth: 80 },  // Name - wider for Malayalam text
          2: { cellWidth: 30 },  // Count
          3: { cellWidth: 25 }   // Percentage
        },
        margin: { left: 20, right: 20 },
        // Enhanced text handling
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          halign: 'left',
          valign: 'middle'
        },
        // Custom cell rendering for better text display
        didParseCell: function(data: any) {
          if (data.cell.text && Array.isArray(data.cell.text)) {
            data.cell.text = data.cell.text.map((text: string) => {
              return cleanTextForPDF(text);
            });
          }
        }
      };
      
      doc.autoTable(tableOptions);
    } else {
      doc.setFontSize(12);
      doc.setTextColor(220, 38, 38);
      doc.text('No detailed data available for this level.', 20, yPosition + 10);
      doc.text('ഈ ലെവലിൽ വിശദമായ ഡാറ്റ ലഭ്യമല്ല', 20, yPosition + 25);
    }
    
    // Add current selection path with Malayalam support
    const selectionPath = [];
    if (filters.tab) selectionPath.push(`Zone / സോൺ: ${filters.tab}`);
    if (filters.district) selectionPath.push(`District / ജില്ല: ${filters.district}`);
    if (filters.assemblyMandal) selectionPath.push(`Assembly / നിയോജകമണ്ഡലം: ${filters.assemblyMandal}`);
    if (filters.orgMandal) selectionPath.push(`Org Mandal / സംഘടനാ മണ്ഡലം: ${filters.orgMandal}`);
    if (filters.panchayat) selectionPath.push(`Panchayat / പഞ്ചായത്ത്: ${filters.panchayat}`);
    
    if (selectionPath.length > 0) {
      const finalY = (doc as any).lastAutoTable?.finalY || yPosition + 50;
      
      doc.setFontSize(12);
      doc.setTextColor(249, 115, 22);
      doc.text('Current Selection Path / നിലവിലെ തിരഞ്ഞെടുപ്പ് പാത', 20, finalY + 20);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      let pathY = finalY + 30;
      selectionPath.forEach((path, index) => {
        const indent = index * 10;
        const cleanedPath = cleanTextForPDF(path);
        doc.text(`${' '.repeat(indent)}→ ${cleanedPath}`, 25 + indent, pathY);
        pathY += 6;
      });
    }
    
    // Enhanced footer with Malayalam support
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount} | Generated by BJP Kerala VK Dashboard | Confidential Document`,
        20,
        doc.internal.pageSize.height - 15
      );
      
      // Add Malayalam footer
      doc.text(
        'ബിജെപി കേരളം - മിഷൻ 2025-2026',
        20,
        doc.internal.pageSize.height - 10
      );
      
      // Add BJP logo text in footer
      doc.setTextColor(249, 115, 22);
      doc.text('BJP Kerala - Mission 2025-2026', doc.internal.pageSize.width - 80, doc.internal.pageSize.height - 10);
    }
    
    // Generate filename with Malayalam support
    let filename = 'VK_Enhanced_Report';
    if (filters.district) {
      const cleanedValue = filters.district.replace(/\s+/g, '_').replace(/[<>:"/\\|?*]/g, '_');
      filename += `_${cleanedValue}`;
    }
    filename += `_${level}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    console.log('💾 Saving Enhanced PDF with filename:', filename);
    doc.save(filename);
    
    console.log('✅ Enhanced VK PDF generated successfully:', filename);
    return true;
    
  } catch (error) {
    console.error('❌ Error generating Enhanced VK PDF:', error);
    return false;
  }
};

// Helper function to clean text for better PDF rendering
const cleanTextForPDF = (text: string): string => {
  if (!text) return '';
  
  // Remove or replace problematic characters
  return text
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .trim();
};

// Helper functions
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

const getLevelTitle = (level: keyof VKFilterState | null): string => {
  switch (level) {
    case 'tab': return 'Zones / സോണുകൾ';
    case 'district': return 'Districts / ജില്ലകൾ';
    case 'assemblyMandal': return 'Assembly Mandals / നിയോജകമണ്ഡലങ്ങൾ';
    case 'orgMandal': return 'Org Mandals / സംഘടനാ മണ്ഡലങ്ങൾ';
    case 'panchayat': return 'Panchayats / പഞ്ചായത്തുകൾ';
    default: return 'Items / ഇനങ്ങൾ';
  }
};