import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface VolunteerCase {
  id: number;
  volunteerId: string;
  volunteerName: string;
  caseType: string;
  district: string;
  assemblyConstituency: string;
  mandal: string;
  panchayat: string;
  status: 'Closed' | 'Pending' | 'Discarded' | 'No Action';
  priority: 'High' | 'Medium' | 'Low';
  dateCreated: string;
  dateResolved?: string;
  description: string;
  resolutionTime: number;
}

interface FilteredData {
  cases: VolunteerCase[];
  filters: {
    district: string;
    constituency: string;
    mandal: string;
    panchayat: string;
    caseType: string;
    volunteer: string;
    status: string;
  };
  kpis: {
    totalCases: number;
    closedCases: number;
    pendingCases: number;
    discardedCases: number;
    noActionCases: number;
    avgResolutionTime: number;
  };
}

export const generateHelpDeskReportPDF = (data: FilteredData) => {
  try {
    console.log('Starting PDF generation with data:', data);
    
    const doc = new jsPDF('landscape');
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(249, 115, 22);
    doc.text('BJP Kerala - Mission 2025', 20, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Volunteer Performance KPI Report', 20, 35);
    
    // Applied Filters Section
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    
    const appliedFilters = [];
    if (data.filters.district !== 'All') appliedFilters.push(`District: ${data.filters.district}`);
    if (data.filters.constituency !== 'All') appliedFilters.push(`Constituency: ${data.filters.constituency}`);
    if (data.filters.mandal !== 'All') appliedFilters.push(`Mandal: ${data.filters.mandal}`);
    if (data.filters.panchayat !== 'All') appliedFilters.push(`Panchayat: ${data.filters.panchayat}`);
    if (data.filters.caseType !== 'All') appliedFilters.push(`Case Type: ${data.filters.caseType}`);
    if (data.filters.volunteer !== 'All') appliedFilters.push(`Volunteer: ${data.filters.volunteer}`);
    if (data.filters.status !== 'All') appliedFilters.push(`Status: ${data.filters.status}`);
    
    let yPosition = 50;
    
    if (appliedFilters.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(249, 115, 22);
      doc.text('Applied Filters:', 20, yPosition);
      
      yPosition += 10;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      
      appliedFilters.forEach(filter => {
        doc.text(`• ${filter}`, 25, yPosition);
        yPosition += 6;
      });
    } else {
      doc.text('Filters: All Data (No filters applied)', 20, yPosition);
      yPosition += 10;
    }
    
    yPosition += 5;
    doc.text(`Report Generated: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`, 20, yPosition);
    
    // KPI Summary Section
    yPosition += 15;
    doc.setFontSize(14);
    doc.setTextColor(249, 115, 22);
    doc.text('Key Performance Indicators', 20, yPosition);
    
    yPosition += 10;
    
    const kpiData = [
      ['Total Cases', data.kpis.totalCases.toString()],
      ['Cases Closed', data.kpis.closedCases.toString()],
      ['Cases Pending', data.kpis.pendingCases.toString()],
      ['Cases Discarded', data.kpis.discardedCases.toString()],
      ['No Action Cases', data.kpis.noActionCases.toString()],
      ['Avg Resolution Time', `${data.kpis.avgResolutionTime.toFixed(1)} hours`]
    ];
    
    // Create KPI table
    doc.autoTable({
      startY: yPosition,
      head: [['KPI', 'Value']],
      body: kpiData,
      theme: 'grid',
      headStyles: {
        fillColor: [249, 115, 22],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [60, 60, 60]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 40 }
      },
      margin: { left: 20, right: 20 }
    });
    
    // Performance Analysis
    const finalY = (doc as any).lastAutoTable?.finalY || yPosition + 60;
    yPosition = finalY + 20;
    
    doc.setFontSize(14);
    doc.setTextColor(249, 115, 22);
    doc.text('Performance Analysis', 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    const analysisPoints = [
      `Total cases handled: ${data.kpis.totalCases} cases`,
      `Cases successfully closed: ${data.kpis.closedCases} cases`,
      `Pending cases requiring attention: ${data.kpis.pendingCases} cases`,
      `Cases discarded: ${data.kpis.discardedCases} cases`,
      `No action taken: ${data.kpis.noActionCases} cases`,
      `Average time to resolve: ${data.kpis.avgResolutionTime.toFixed(1)} hours`
    ];
    
    analysisPoints.forEach(point => {
      doc.text(`• ${point}`, 25, yPosition);
      yPosition += 6;
    });
    
    // Cases Details Table (if there are cases to show)
    if (data.cases.length > 0) {
      yPosition += 15;
      doc.setFontSize(14);
      doc.setTextColor(249, 115, 22);
      doc.text('Detailed Cases List', 20, yPosition);
      
      // Prepare table data - limit to first 30 cases for PDF readability
      const casesToShow = data.cases.slice(0, 30);
      const tableData = casesToShow.map((caseItem, index) => [
        (index + 1).toString(),
        caseItem.volunteerName || 'N/A',
        caseItem.caseType || 'N/A',
        caseItem.panchayat || 'N/A',
        caseItem.mandal || 'N/A',
        caseItem.district || 'N/A',
        caseItem.status || 'N/A',
        caseItem.priority || 'N/A',
        caseItem.dateCreated || 'N/A',
        caseItem.dateResolved || 'N/A'
      ]);
      
      // Create cases table
      doc.autoTable({
        startY: yPosition + 10,
        head: [['#', 'Volunteer', 'Case Type', 'Panchayat', 'Mandal', 'District', 'Status', 'Priority', 'Created', 'Resolved']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [249, 115, 22],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [60, 60, 60]
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 15 },  // #
          1: { cellWidth: 25 },  // Volunteer
          2: { cellWidth: 30 },  // Case Type
          3: { cellWidth: 25 },  // Panchayat
          4: { cellWidth: 25 },  // Mandal
          5: { cellWidth: 25 },  // District
          6: { cellWidth: 20 },  // Status
          7: { cellWidth: 20 },  // Priority
          8: { cellWidth: 25 },  // Created
          9: { cellWidth: 25 }   // Resolved
        },
        margin: { left: 10, right: 10 }
      });
      
      if (data.cases.length > 30) {
        const tableEndY = (doc as any).lastAutoTable?.finalY || yPosition + 100;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Note: Showing first 30 of ${data.cases.length} total cases. Full data available in CSV format.`, 20, tableEndY + 10);
      }
    } else {
      yPosition += 15;
      doc.setFontSize(12);
      doc.setTextColor(220, 38, 38);
      doc.text('No cases found matching the applied filters.', 20, yPosition);
    }
    
    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount} | Generated by BJP Kerala Help Desk Dashboard | Confidential Document`,
        20,
        doc.internal.pageSize.height - 10
      );
      
      // Add BJP logo text in footer
      doc.setTextColor(249, 115, 22);
      doc.text('BJP Kerala - Mission 2025', doc.internal.pageSize.width - 60, doc.internal.pageSize.height - 10);
    }
    
    // Generate filename based on filters
    let filename = 'Help_Desk_Report';
    if (data.filters.district !== 'All') {
      filename += `_${data.filters.district.replace(/\s+/g, '_')}`;
    }
    if (data.filters.caseType !== 'All') {
      filename += `_${data.filters.caseType.replace(/\s+/g, '_')}`;
    }
    filename += `_${new Date().toISOString().split('T')[0]}.pdf`;
    
    console.log('Saving PDF with filename:', filename);
    doc.save(filename);
    
    console.log('✅ PDF generated successfully:', filename);
    alert(`✅ PDF report generated successfully!\nFile: ${filename}`);
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    alert(`❌ Error generating PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Function to generate CSV export
export const generateHelpDeskCSV = (data: FilteredData) => {
  try {
    console.log('Starting CSV generation with data:', data);
    
    const headers = [
      'Volunteer ID',
      'Volunteer Name',
      'Case Type',
      'District',
      'Assembly Constituency',
      'Mandal',
      'Panchayat',
      'Status',
      'Priority',
      'Date Created',
      'Date Resolved',
      'Resolution Time (Hours)',
      'Description'
    ];
    
    const csvRows = data.cases.map(caseItem => [
      caseItem.volunteerId || '',
      `"${(caseItem.volunteerName || '').replace(/"/g, '""')}"`,
      `"${(caseItem.caseType || '').replace(/"/g, '""')}"`,
      `"${(caseItem.district || '').replace(/"/g, '""')}"`,
      `"${(caseItem.assemblyConstituency || '').replace(/"/g, '""')}"`,
      `"${(caseItem.mandal || '').replace(/"/g, '""')}"`,
      `"${(caseItem.panchayat || '').replace(/"/g, '""')}"`,
      caseItem.status || '',
      caseItem.priority || '',
      caseItem.dateCreated || '',
      caseItem.dateResolved || 'N/A',
      caseItem.resolutionTime?.toString() || '0',
      `"${(caseItem.description || '').replace(/"/g, '""')}"`
    ].join(','));
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    let filename = 'Help_Desk_Data';
    if (data.filters.district !== 'All') {
      filename += `_${data.filters.district.replace(/\s+/g, '_')}`;
    }
    if (data.filters.caseType !== 'All') {
      filename += `_${data.filters.caseType.replace(/\s+/g, '_')}`;
    }
    filename += `_${new Date().toISOString().split('T')[0]}.csv`;
    
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    console.log('✅ CSV generated successfully:', filename);
    alert(`✅ CSV file generated successfully!\nFile: ${filename}`);
    
  } catch (error) {
    console.error('❌ Error generating CSV:', error);
    alert(`❌ Error generating CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};