import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { forceMobilePdfDownload } from './forceMobilePdfDownload';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface Entity {
  id: number;
  name: string;
  type: 'Grama Panchayat' | 'Municipality' | 'Corporation' | 'Block Panchayat' | 'District Panchayat';
  district: string;
  mandal?: string;
  assemblyConstituency?: string;
  totalWards: number;
  targetedWards: number;
  completionPercentage: number;
  status: 'Targeted' | 'Opposition' | 'Ruling';
  president: string;
  phone: string;
  email: string;
  lastUpdated: string;
}

export const generateEntityListPDF = async (
  entities: Entity[],
  entityType: string,
  title: string
) => {
  const doc = new jsPDF('landscape', 'mm', 'a4'); // Use landscape A4 for better table fit
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(249, 115, 22); // Orange color
  doc.text('BJP Kerala - Mission 2025', 20, 20);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 20, 35);
  
  // Summary Information
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  
  const summaryInfo = [
    `Total Entities: ${entities.length}`,
    `Entity Type: ${entityType}`,
    `Report Generated: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`
  ];
  
  let yPosition = 50;
  summaryInfo.forEach(info => {
    doc.text(info, 20, yPosition);
    yPosition += 7;
  });
  
  // Organisational District summary if a district filter is applied
  yPosition += 10;
  if (entities.length > 0) {
    // Find all org districts and their counts
    const orgDistrictCounts: Record<string, number> = {};
    entities.forEach(entity => {
      const orgDist = (entity as any)['organisationalDistrict'] || '-';
      if (orgDist && orgDist !== '-') {
        orgDistrictCounts[orgDist] = (orgDistrictCounts[orgDist] || 0) + 1;
      }
    });
    const uniqueOrgDistricts = Object.keys(orgDistrictCounts).filter(d => d !== '-');
    // If filtering by district (only one district present), show org district summary as a table
    const uniqueDistricts = [...new Set(entities.map(entity => entity.district))].filter(d => d !== '-');
    if (uniqueDistricts.length === 1 && uniqueOrgDistricts.length > 0) {
      // No heading, just the table
      const orgDistTableHead = [['Org District', 'Total Target']];
      const orgDistTableBody = Object.entries(orgDistrictCounts).map(([orgDist, count]) => [orgDist, count]);
      doc.autoTable({
        startY: yPosition,
        head: orgDistTableHead,
        body: orgDistTableBody,
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
          0: { cellWidth: 60 },
          1: { cellWidth: 30 }
        },
        margin: { left: 20, right: 20 },
        tableWidth: 'auto'
      });
      yPosition = (doc as any).lastAutoTable?.finalY || (yPosition + 30);
    } else if (uniqueOrgDistricts.length > 1) {
      // Show org district summary if more than one org district is present
      doc.setFontSize(14);
      doc.setTextColor(249, 115, 22);
      doc.text('Organisational Districts in Table', 20, yPosition);
      yPosition += 10;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      Object.entries(orgDistrictCounts).forEach(([orgDist, count]) => {
        doc.text(`${orgDist}: ${count}`, 20, yPosition);
        yPosition += 6;
      });
    }
    // If filtering by org district (only one org district present), show org mandal summary only
    if (uniqueOrgDistricts.length === 1) {
      const orgMandalCounts: Record<string, number> = {};
      entities.forEach(entity => {
        const mandal = (entity as any)['mandal'] || '-';
        if (mandal && mandal !== '-') {
          orgMandalCounts[mandal] = (orgMandalCounts[mandal] || 0) + 1;
        }
      });
      if (Object.keys(orgMandalCounts).length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(249, 115, 22);
        doc.text('Organisational Mandals in Table', 20, yPosition);
        yPosition += 10;
        // Draw table with columns: Org Mandal, Total Target
        const mandalTableHead = [['Org Mandal', 'Total Target']];
        const mandalTableBody = Object.entries(orgMandalCounts).map(([mandal, count]) => [mandal, count]);
        doc.autoTable({
          startY: yPosition,
          head: mandalTableHead,
          body: mandalTableBody,
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
            0: { cellWidth: 60 },
            1: { cellWidth: 30 }
          },
          margin: { left: 20, right: 20 },
          tableWidth: 'auto'
        });
        yPosition = (doc as any).lastAutoTable?.finalY || (yPosition + 30);
      }
    }
  }
  
  // Entities Table
  yPosition += 15;
  
  if (entities.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(249, 115, 22);
    doc.text(`${entityType} Details`, 20, yPosition);

    // Dynamically determine columns based on entityType
    let tableHead: string[] = [];
    let tableBody: any[][] = [];
    let columnStyles: any = {};
    
    if (entityType === 'Grama Panchayat') {
      tableHead = ['#', 'Grama Panchayat', 'District', 'Org District', 'AC', 'Mandal', 'District President'];
      tableBody = entities.map((entity, index) => [
        index + 1,
        entity.name,
        entity.district,
        (entity as any)['organisationalDistrict'] || '-',
        entity.assemblyConstituency,
        entity.mandal,
        entity.president
      ]);
      columnStyles = {
        0: { cellWidth: 10 },  // #
        1: { cellWidth: 45 },  // Grama Panchayat
        2: { cellWidth: 35 },  // District
        3: { cellWidth: 40 },  // Org District
        4: { cellWidth: 35 },  // AC
        5: { cellWidth: 35 },  // Mandal
        6: { cellWidth: 50 }   // District President
      };
    } else if (entityType === 'Municipality' || entityType === 'Corporation') {
      if (entityType === 'Municipality') {
        tableHead = ['#', 'Municipality', 'District', 'Org District', 'AC', 'Mandal', 'District President'];
      } else {
        tableHead = ['#', 'Corporation', 'AC', 'Org District', 'District', 'District President'];
      }
      
      tableBody = entities.map((entity, index) => [
        index + 1,
        entity.name,
        ...(entityType === 'Municipality' ? [
          entity.district,
          (entity as any)['organisationalDistrict'] || '-',
          entity.assemblyConstituency,
          entity.mandal,
          entity.president
        ] : [
          entity.assemblyConstituency,
          (entity as any)['organisationalDistrict'] || '-',
          entity.district,
          entity.president
        ])
      ]);
      
      if (entityType === 'Municipality') {
        columnStyles = {
          0: { cellWidth: 10 },  // #
          1: { cellWidth: 45 },  // Municipality
          2: { cellWidth: 35 },  // District
          3: { cellWidth: 40 },  // Org District
          4: { cellWidth: 35 },  // AC
          5: { cellWidth: 35 },  // Mandal
          6: { cellWidth: 50 }   // District President
        };
      } else {
        columnStyles = {
          0: { cellWidth: 10 },  // #
          1: { cellWidth: 50 },  // Corporation
          2: { cellWidth: 40 },  // AC
          3: { cellWidth: 45 },  // Org District
          4: { cellWidth: 35 },  // District
          5: { cellWidth: 50 }   // District President
        };
      }
    } else if (entityType === 'Block Panchayat') {
      tableHead = ['#', 'Block Panchayat', 'Org District', 'District', 'District President'];
      tableBody = entities.map((entity, index) => [
        index + 1,
        entity.name,
        (entity as any)['organisationalDistrict'] || '-',
        entity.district,
        entity.president
      ]);
      columnStyles = {
        0: { cellWidth: 10 },  // #
        1: { cellWidth: 60 },  // Block Panchayat
        2: { cellWidth: 50 },  // Org District
        3: { cellWidth: 40 },  // District
        4: { cellWidth: 60 }   // District President
      };
    } else if (entityType === 'District Panchayat') {
      tableHead = ['#', 'District', 'Division Name'];
      tableBody = entities.map((entity, index) => [
        index + 1,
        entity.district,
        entity.name
      ]);
      columnStyles = {
        0: { cellWidth: 15 },  // #
        1: { cellWidth: 60 },  // District
        2: { cellWidth: 80 }   // Division Name
      };
    } else {
      // fallback: show all columns except Status and Progress
      tableHead = ['#', 'Name', 'District', 'Org District', 'AC', 'Mandal', 'District President'];
      tableBody = entities.map((entity, index) => [
        index + 1,
        entity.name,
        entity.district,
        (entity as any)['organisationalDistrict'] || '-',
        entity.assemblyConstituency,
        entity.mandal,
        entity.president
      ]);
      columnStyles = {
        0: { cellWidth: 10 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 },
        3: { cellWidth: 35 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 },
        6: { cellWidth: 45 }
      };
    }

    // Create table
    doc.autoTable({
      startY: yPosition + 10,
      head: [tableHead],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [249, 115, 22],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [60, 60, 60]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: columnStyles,
      margin: { left: 10, right: 10 },
      tableWidth: 'wrap',
      styles: {
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      }
    });
  } else {
    doc.setFontSize(12);
    doc.setTextColor(220, 38, 38);
    doc.text('No entities found for this category.', 20, yPosition + 10);
  }
  
  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} | Generated by BJP Kerala Election Dashboard | Confidential Document`,
      20,
      doc.internal.pageSize.height - 10
    );
    
    // Add BJP logo text in footer
    doc.setTextColor(249, 115, 22);
    doc.text('BJP Kerala - Mission 2025', doc.internal.pageSize.width - 60, doc.internal.pageSize.height - 10);
  }
  
  // Save the PDF using mobile-optimized method
  const safeTitle = title.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const fileName = `${safeTitle}.pdf`;
  
  // Use force mobile download
  const pdfBlob = doc.output('blob');
  const success = await forceMobilePdfDownload(pdfBlob, fileName);
  
  if (!success) {
    // Fallback to traditional save method
    doc.save(fileName);
  }
};

// Function to generate district-wise summary PDF
export const generateDistrictSummaryPDF = async (
  title: string,
  entityType: string,
  entities: Entity[]
) => {
  const doc = new jsPDF();
  
  // Group entities by district
  const districtGroups = entities.reduce((acc, entity) => {
    if (!acc[entity.district]) {
      acc[entity.district] = [];
    }
    acc[entity.district].push(entity);
    return acc;
  }, {} as Record<string, Entity[]>);
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(249, 115, 22);
  doc.text('BJP Kerala - Mission 2025', 20, 20);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`${title} - District Summary`, 20, 35);
  
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(`Report Generated: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`, 20, 50);
  
  // District-wise summary table
  const districtSummaryData = Object.entries(districtGroups).map(([district, districtEntities]) => {
    const totalWards = districtEntities.reduce((sum, entity) => sum + entity.totalWards, 0);
    const targetedWards = districtEntities.reduce((sum, entity) => sum + entity.targetedWards, 0);
    const avgProgress = districtEntities.reduce((sum, entity) => sum + entity.completionPercentage, 0) / districtEntities.length;
    
    return [
      district,
      districtEntities.length,
      totalWards,
      targetedWards,
      `${avgProgress.toFixed(1)}%`,
      districtEntities.filter(e => e.completionPercentage > 75).length
    ];
  });
  
  doc.autoTable({
    startY: 70,
    head: [['District', 'Count', 'Total Wards', 'Targeted Wards', 'Avg Progress', 'High Progress']],
    body: districtSummaryData,
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
    }
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} | BJP Kerala Election Dashboard | Confidential Document`,
      20,
      doc.internal.pageSize.height - 10
    );
    
    doc.setTextColor(249, 115, 22);
    doc.text('BJP Kerala - Mission 2025', doc.internal.pageSize.width - 60, doc.internal.pageSize.height - 10);
  }
  
  const fileName = `${entityType.replace(/\s+/g, '_')}_District_Summary_${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Use force mobile download
  const pdfBlob = doc.output('blob');
  const success = await forceMobilePdfDownload(pdfBlob, fileName);
  
  if (!success) {
    // Fallback to traditional save method
    doc.save(fileName);
  }
};