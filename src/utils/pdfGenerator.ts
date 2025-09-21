import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { forceMobilePdfDownload } from './forceMobilePdfDownload';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface VoterData {
  slNo: number;
  voterName: string;
  fatherName: string;
  houseNumber: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  religion: 'Hindu' | 'Muslim' | 'Christian' | 'Other';
  phoneNumber: string;
  category: 'New Addition' | 'Existing' | 'Targeted';
  boothNumber: string;
  remarks: string;
}

interface DetailedVoter {
  id: number;
  name: string;
  fatherName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  religion: 'Hindu' | 'Muslim' | 'Christian' | 'Other';
  phoneNumber: string;
  houseNumber: string;
  boothNumber: string;
  category: 'New Addition' | 'Existing' | 'Targeted';
  dateAdded: string;
  status: 'Verified' | 'Pending' | 'Contacted';
  remarks: string;
}

interface WardDetails {
  wardName: string;
  panchayatName: string;
  mandalName: string;
  assemblyConstituency: string;
  district: string;
  totalVoters: number;
  targetedVoters: number;
  incumbentVoters: number;
  completionPercentage: number;
  isTargeted: boolean;
}

interface WardDetailsSimple {
  wardName: string;
  panchayatName: string;
  totalVoters: number;
  targetedVoters: number;
  completionPercentage: number;
  votersAdded: number;
}

// S3 PDF URLs mapping for specific wards
const S3_WARD_PDFS: Record<string, { url: string; filename: string; panchayat?: string }> = {
  'aanappaara': {
    url: 'https://kldashboard.s3.ap-south-1.amazonaws.com/Ward+detils+pdf/Aanappaara_Voters_Report_2025-07-03.pdf',
    filename: 'Aanappaara_Voters_Report_2025-07-03.pdf',
    panchayat: 'vithura'
  },
  'bonacaud': {
    url: 'https://kldashboard.s3.ap-south-1.amazonaws.com/Ward+detils+pdf/Bonacaud_Voters_Report_2025-07-03.pdf',
    filename: 'Bonacaud_Voters_Report_2025-07-03.pdf',
    panchayat: 'vithura'
  },
  'chennappa': {
    url: 'https://kldashboard.s3.ap-south-1.amazonaws.com/Ward+detils+pdf/Chennappa_Voters_Report_2025-07-03.pdf',
    filename: 'Chennappa_Voters_Report_2025-07-03.pdf',
    panchayat: 'vithura'
  },
  'chettachal': {
    url: 'https://kldashboard.s3.ap-south-1.amazonaws.com/Ward+detils+pdf/Chettachal_Voters_Report_2025-07-03.pdf',
    filename: 'Chettachal_Voters_Report_2025-07-03.pdf',
    panchayat: 'vithura'
  },
  'ganapathiyaamkodu': {
    url: 'https://kldashboard.s3.ap-south-1.amazonaws.com/Ward+detils+pdf/Ganapathiyaamkodu_Voters_Report_2025-07-01.pdf',
    filename: 'Ganapathiyaamkodu_Voters_Report_2025-07-01.pdf',
    panchayat: 'vithura'
  },
  'kallaar': {
    url: 'https://kldashboard.s3.ap-south-1.amazonaws.com/Ward+detils+pdf/Kallaar_Voters_Report_2025-07-03+(1).pdf',
    filename: 'Kallaar_Voters_Report_2025-07-03+(1).pdf',
    panchayat: 'vithura'
  },
  'kolla': {
    url: 'https://kldashboard.s3.ap-south-1.amazonaws.com/Ward+detils+pdf/Kolla_Voters_Report_2025-07-03+(1).pdf',
    filename: 'Kolla_Voters_Report_2025-07-03+(1).pdf',
    panchayat: 'vithura'
  },
  'maankala': {
    url: 'https://kldashboard.s3.ap-south-1.amazonaws.com/Ward+detils+pdf/Maankala_Voters_Report_2025-07-03+(1).pdf',
    filename: 'Maankala_Voters_Report_2025-07-03+(1).pdf',
    panchayat: 'vithura'
  },
  'manali': {
    url: 'https://kldashboard.s3.ap-south-1.amazonaws.com/Ward+detils+pdf/Manali_Voters_Report_2025-07-03+(1).pdf',
    filename: 'Manali_Voters_Report_2025-07-03+(1).pdf',
    panchayat: 'vithura'
  },
  'manithookki': {
    url: 'https://kldashboard.s3.ap-south-1.amazonaws.com/Ward+detils+pdf/Manithookki_Voters_Report_2025-07-03+(1).pdf',
    filename: 'Manithookki_Voters_Report_2025-07-03+(1).pdf',
    panchayat: 'vithura'
  },
  'maruthamala': {
    url: 'https://kldashboard.s3.ap-south-1.amazonaws.com/Ward+detils+pdf/Maruthamala_Voters_Report_2025-07-03.pdf',
    filename: 'Maruthamala_Voters_Report_2025-07-03.pdf',
    panchayat: 'vithura'
  },
  'memala': {
    url: 'https://kldashboard.s3.ap-south-1.amazonaws.com/Ward+detils+pdf/Memala_Voters_Report_2025-07-03.pdf',
    filename: 'Memala_Voters_Report_2025-07-03.pdf',
    panchayat: 'vithura'
  },
  'mulaykkottukara': {
    url: 'https://kldashboard.s3.ap-south-1.amazonaws.com/Ward+detils+pdf/Mulaykkottukara_Voters_Report_2025-07-03.pdf',
    filename: 'Mulaykkottukara_Voters_Report_2025-07-03.pdf',
    panchayat: 'vithura'
  },
  'peppara': {
    url: 'https://kldashboard.s3.ap-south-1.amazonaws.com/Ward+detils+pdf/Peppara_Voters_Report_2025-07-03.pdf',
    filename: 'Peppara_Voters_Report_2025-07-03.pdf',
    panchayat: 'vithura'
  },
  'ponnaanchundu': {
    url: 'https://kldashboard.s3.ap-south-1.amazonaws.com/Ward+detils+pdf/Ponnaanchundu_Voters_Report_2025-07-03.pdf',
    filename: 'Ponnaanchundu_Voters_Report_2025-07-03.pdf',
    panchayat: 'vithura'
  },
  'thallachira': {
    url: 'https://kldashboard.s3.ap-south-1.amazonaws.com/Ward+detils+pdf/Thallachira_Voters_Report_2025-07-03.pdf',
    filename: 'Thallachira_Voters_Report_2025-07-03.pdf',
    panchayat: 'vithura'
  },
  'theviyodu': {
    url: 'https://kldashboard.s3.ap-south-1.amazonaws.com/Ward+detils+pdf/Theviyodu_Voters_Report_2025-07-03.pdf',
    filename: 'Theviyodu_Voters_Report_2025-07-03.pdf',
    panchayat: 'vithura'
  },
  'vithura': {
    url: 'https://kldashboard.s3.ap-south-1.amazonaws.com/Ward+detils+pdf/Vithura_Voters_Report_2025-07-03.pdf',
    filename: 'Vithura_Voters_Report_2025-07-03.pdf',
    panchayat: 'vithura'
  },
  'wayanad_colony': {
    url: 'https://kldashboard.s3.ap-south-1.amazonaws.com/Ward+detils+pdf/Wayanad_Colony_Voters_Report_2025-07-03.pdf',
    filename: 'Wayanad_Colony_Voters_Report_2025-07-03.pdf',
    panchayat: 'vithura'
  }
};

// Function to check if this ward has a pre-stored PDF in S3 and download it
const downloadSpecificWardPDFFromS3 = (wardName: string, panchayatName: string): boolean => {
  const wardKey = wardName.toLowerCase().trim();
  const panchayatKey = panchayatName.toLowerCase().trim();
  
  // Check each S3 PDF mapping
  for (const [key, config] of Object.entries(S3_WARD_PDFS)) {
    const isWardMatch = wardKey.includes(key) || 
                       key.includes(wardKey) ||
                       wardKey.replace(/\s+/g, '').includes(key.replace(/\s+/g, ''));
    
    const isPanchayatMatch = !config.panchayat || 
                            panchayatKey.includes(config.panchayat) ||
                            config.panchayat.includes(panchayatKey);
    
    if (isWardMatch && isPanchayatMatch) {
      console.log(`🎯 Detected ${key} ward - downloading from S3`);
      console.log(`📍 Ward: ${wardName}, Panchayat: ${panchayatName}`);
      console.log(`🔗 S3 URL: ${config.url}`);
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = config.url;
      link.download = config.filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`✅ S3 PDF download initiated for ${key} ward`);
      
      // No popup alert - silent download
      
      return true; // Indicate that S3 download was used
    }
  }
  
  return false; // Indicate that regular PDF generation should be used
};

// Generate mock voter data based on completion percentage
const generateVoterData = (wardDetails: WardDetails): VoterData[] => {
  const { completionPercentage, targetedVoters } = wardDetails;
  
  // Calculate number of new voters added based on completion percentage
  const newVotersAdded = Math.floor((targetedVoters * completionPercentage) / 100);
  
  const voters: VoterData[] = [];
  const maleNames = [
    'Rajesh Kumar', 'Suresh Nair', 'Anil Varma', 'Prakash Pillai', 'Vinod Kumar',
    'Ravi Chandran', 'Manoj Kumar', 'Sanjay Nair', 'Deepak Varma', 'Ashok Kumar',
    'Ramesh Pillai', 'Vijay Kumar', 'Ajith Nair', 'Pradeep Kumar', 'Mahesh Varma'
  ];
  
  const femaleNames = [
    'Priya Nair', 'Sunitha Kumar', 'Rekha Varma', 'Latha Pillai', 'Suma Devi',
    'Radha Nair', 'Geetha Kumar', 'Usha Varma', 'Shanti Pillai', 'Maya Devi',
    'Kavitha Nair', 'Sushma Kumar', 'Leela Varma', 'Kamala Pillai', 'Devi Nair'
  ];
  
  const fatherNames = [
    'Krishnan Nair', 'Raman Pillai', 'Gopalan Varma', 'Shankar Kumar', 'Mohan Nair',
    'Balan Pillai', 'Rajan Varma', 'Sudhir Kumar', 'Nandan Nair', 'Hari Pillai'
  ];
  
  const religions = ['Hindu', 'Muslim', 'Christian', 'Other'] as const;
  const genders = ['Male', 'Female'] as const;
  
  for (let i = 1; i <= newVotersAdded; i++) {
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const names = gender === 'Male' ? maleNames : femaleNames;
    const voterName = names[Math.floor(Math.random() * names.length)];
    const fatherName = fatherNames[Math.floor(Math.random() * fatherNames.length)];
    
    voters.push({
      slNo: i,
      voterName,
      fatherName,
      houseNumber: `H-${Math.floor(Math.random() * 999) + 1}`,
      age: Math.floor(Math.random() * 60) + 18, // Age between 18-78
      gender,
      religion: religions[Math.floor(Math.random() * religions.length)],
      phoneNumber: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      category: 'New Addition',
      boothNumber: `B-${Math.floor(Math.random() * 20) + 1}`,
      remarks: Math.random() > 0.7 ? 'Verified' : 'Pending Verification'
    });
  }
  
  return voters;
};

export const generateWardVotersPDF = async (wardDetails: WardDetails) => {
  // Check if this ward has a pre-stored PDF in S3 and download it instead
  if (downloadSpecificWardPDFFromS3(wardDetails.wardName, wardDetails.panchayatName)) {
    return; // S3 download was initiated, no need to generate PDF
  }
  
  // Continue with regular PDF generation for other wards
  const doc = new jsPDF();
  const voterData = generateVoterData(wardDetails);
  
  // Set up the document
  doc.setFontSize(20);
  doc.setTextColor(249, 115, 22); // Orange color
  doc.text('BJP Kerala - Mission 2025', 20, 20);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('New Voters Addition Report', 20, 35);
  
  // Ward Information Section
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  
  const wardInfo = [
    `Ward: ${wardDetails.wardName}`,
    `Panchayat/Municipality: ${wardDetails.panchayatName}`,
    `Mandal: ${wardDetails.mandalName}`,
    `Assembly Constituency: ${wardDetails.assemblyConstituency}`,
    `District: ${wardDetails.district}`,
    `Report Generated: ${new Date().toLocaleDateString('en-IN')}`,
    `Report Time: ${new Date().toLocaleTimeString('en-IN')}`
  ];
  
  let yPosition = 50;
  wardInfo.forEach(info => {
    doc.text(info, 20, yPosition);
    yPosition += 7;
  });
  
  // Statistics Section
  yPosition += 10;
  doc.setFontSize(14);
  doc.setTextColor(249, 115, 22);
  doc.text('Voter Statistics', 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  const stats = [
    `Total Voters in Ward: ${wardDetails.totalVoters.toLocaleString()}`,
    `Targeted Voters: ${wardDetails.targetedVoters.toLocaleString()}`,
    `Incumbent Voters: ${wardDetails.incumbentVoters.toLocaleString()}`,
    `Completion Percentage: ${wardDetails.completionPercentage}%`,
    `New Voters Added: ${voterData.length.toLocaleString()}`,
    `Ward Status: ${wardDetails.isTargeted ? 'Targeted' : 'Non-Targeted'}`
  ];
  
  stats.forEach(stat => {
    doc.text(stat, 20, yPosition);
    yPosition += 6;
  });
  
  // Table Section
  yPosition += 15;
  
  if (voterData.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(249, 115, 22);
    doc.text('New Voters Added to List', 20, yPosition);
    
    // Prepare table data
    const tableData = voterData.map(voter => [
      voter.slNo,
      voter.voterName,
      voter.fatherName,
      voter.houseNumber,
      voter.age,
      voter.gender,
      voter.religion,
      voter.phoneNumber,
      voter.boothNumber,
      voter.remarks
    ]);
    
    // Create table
    doc.autoTable({
      startY: yPosition + 10,
      head: [['Sl.No', 'Voter Name', 'Father Name', 'House No.', 'Age', 'Gender', 'Religion', 'Phone', 'Booth', 'Remarks']],
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
        0: { cellWidth: 15 }, // Sl.No
        1: { cellWidth: 25 }, // Voter Name
        2: { cellWidth: 25 }, // Father Name
        3: { cellWidth: 18 }, // House No.
        4: { cellWidth: 12 }, // Age
        5: { cellWidth: 15 }, // Gender
        6: { cellWidth: 18 }, // Religion
        7: { cellWidth: 25 }, // Phone
        8: { cellWidth: 15 }, // Booth
        9: { cellWidth: 22 }  // Remarks
      },
      margin: { left: 10, right: 10 },
      tableWidth: 'auto'
    });
  } else {
    doc.setFontSize(12);
    doc.setTextColor(220, 38, 38);
    doc.text('No new voters have been added yet.', 20, yPosition + 10);
    doc.setTextColor(100, 100, 100);
    doc.text('This ward is still in the initial stages of voter list preparation.', 20, yPosition + 25);
  }
  
  // Footer
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
  
  // Save the PDF
  const fileName = `${wardDetails.wardName.replace(/\s+/g, '_')}_Voters_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

// Function to generate summary PDF for multiple wards
export const generateSummaryPDF = async (wardsData: WardDetails[]) => {
  if (!wardsData || wardsData.length === 0) {
    console.error('No ward data provided for summary PDF generation');
    return;
  }

  try {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(249, 115, 22);
    doc.text('BJP Kerala - Mission 2025', 20, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Wards Summary Report', 20, 35);
    
    // Panchayat/Municipality name from first ward
    const panchayatName = wardsData[0]?.panchayatName || 'Unknown';
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text(`${panchayatName} - All Wards Summary`, 20, 50);
    
    doc.setFontSize(12);
    doc.text(`Report Generated: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`, 20, 65);
    
    // Summary statistics
    const totalVoters = wardsData.reduce((sum, ward) => sum + ward.totalVoters, 0);
    const totalTargeted = wardsData.reduce((sum, ward) => sum + ward.targetedVoters, 0);
    const totalNewVoters = wardsData.reduce((sum, ward) => sum + Math.floor((ward.targetedVoters * ward.completionPercentage) / 100), 0);
    const avgCompletion = wardsData.reduce((sum, ward) => sum + ward.completionPercentage, 0) / wardsData.length;
    const targetedWards = wardsData.filter(ward => ward.isTargeted).length;
    
    doc.setFontSize(14);
    doc.setTextColor(249, 115, 22);
    doc.text('Overall Statistics', 20, 85);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const overallStats = [
      `Total Wards: ${wardsData.length}`,
      `Targeted Wards: ${targetedWards}`,
      `Total Voters: ${totalVoters.toLocaleString()}`,
      `Total Targeted Voters: ${totalTargeted.toLocaleString()}`,
      `Total New Voters Added: ${totalNewVoters.toLocaleString()}`,
      `Average Completion: ${avgCompletion.toFixed(1)}%`
    ];
    
    let yPos = 100;
    overallStats.forEach(stat => {
      doc.text(stat, 20, yPos);
      yPos += 6;
    });
    
    // Wards table
    const tableData = wardsData.map(ward => [
      ward.wardName,
      ward.totalVoters.toLocaleString(),
      ward.targetedVoters.toLocaleString(),
      Math.floor((ward.targetedVoters * ward.completionPercentage) / 100).toLocaleString(),
      `${ward.completionPercentage}%`,
      ward.isTargeted ? 'Yes' : 'No'
    ]);
    
    doc.autoTable({
      startY: yPos + 15,
      head: [['Ward Name', 'Total Voters', 'Targeted', 'New Added', 'Completion', 'Targeted']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [249, 115, 22],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [60, 60, 60]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Ward Name
        1: { cellWidth: 25 }, // Total Voters
        2: { cellWidth: 25 }, // Targeted
        3: { cellWidth: 25 }, // New Added
        4: { cellWidth: 25 }, // Completion
        5: { cellWidth: 20 }  // Targeted
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
      
      // Add BJP logo text in footer
      doc.setTextColor(249, 115, 22);
      doc.text('BJP Kerala - Mission 2025', doc.internal.pageSize.width - 60, doc.internal.pageSize.height - 10);
    }
    
      const fileName = `${panchayatName.replace(/\s+/g, '_')}_Wards_Summary_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Use force mobile download
  const pdfBlob = doc.output('blob');
  const success = await forceMobilePdfDownload(pdfBlob, fileName);
  
  if (success) {
    console.log('✅ PDF downloaded successfully on mobile');
    // Show success message to user
    if (typeof window !== 'undefined') {
      alert('PDF download initiated! Check your device for the file.');
    }
  } else {
    // Fallback to traditional save method
    doc.save(fileName);
    console.log('📄 Using fallback PDF save method');
  }
    
    console.log('Summary PDF generated successfully:', fileName);
  } catch (error) {
    console.error('Error generating summary PDF:', error);
    throw error;
  }
};

// New function to generate detailed voters PDF from modal
export const generateVoterDetailsPDF = async (wardDetails: WardDetailsSimple, voters: DetailedVoter[]) => {
  // Check if this ward has a pre-stored PDF in S3 and download it instead
  if (downloadSpecificWardPDFFromS3(wardDetails.wardName, wardDetails.panchayatName)) {
    return; // S3 download was initiated, no need to generate PDF
  }
  
  // Continue with regular PDF generation for other wards
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(249, 115, 22);
  doc.text('BJP Kerala - Mission 2025', 20, 20);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Detailed Voters List', 20, 35);
  
  // Ward Information
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  
  const wardInfo = [
    `Ward: ${wardDetails.wardName}`,
    `Panchayat/Municipality: ${wardDetails.panchayatName}`,
    `Total Voters in Ward: ${wardDetails.totalVoters.toLocaleString()}`,
    `Targeted Voters: ${wardDetails.targetedVoters.toLocaleString()}`,
    `Completion: ${wardDetails.completionPercentage}%`,
    `Voters Added: ${wardDetails.votersAdded.toLocaleString()}`,
    `Report Generated: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`
  ];
  
  let yPosition = 50;
  wardInfo.forEach(info => {
    doc.text(info, 20, yPosition);
    yPosition += 7;
  });
  
  // Statistics by category
  yPosition += 10;
  doc.setFontSize(14);
  doc.setTextColor(249, 115, 22);
  doc.text('Voter Categories', 20, yPosition);
  
  const categoryStats = voters.reduce((acc, voter) => {
    acc[voter.category] = (acc[voter.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const statusStats = voters.reduce((acc, voter) => {
    acc[voter.status] = (acc[voter.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  yPosition += 10;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  Object.entries(categoryStats).forEach(([category, count]) => {
    doc.text(`${category}: ${count}`, 20, yPosition);
    yPosition += 6;
  });
  
  yPosition += 5;
  doc.setFontSize(14);
  doc.setTextColor(249, 115, 22);
  doc.text('Status Distribution', 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  Object.entries(statusStats).forEach(([status, count]) => {
    doc.text(`${status}: ${count}`, 20, yPosition);
    yPosition += 6;
  });
  
  // Voters table
  yPosition += 15;
  
  if (voters.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(249, 115, 22);
    doc.text('Voters Details', 20, yPosition);
    
    // Prepare table data
    const tableData = voters.map((voter, index) => [
      index + 1,
      voter.name,
      voter.fatherName,
      `${voter.gender}, ${voter.age}`,
      voter.religion,
      voter.phoneNumber,
      voter.houseNumber,
      voter.boothNumber,
      voter.category,
      voter.status,
      voter.dateAdded
    ]);
    
    // Create table
    doc.autoTable({
      startY: yPosition + 10,
      head: [['#', 'Name', 'Father Name', 'Age/Gender', 'Religion', 'Phone', 'House', 'Booth', 'Category', 'Status', 'Date Added']],
      body: tableData,
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
      columnStyles: {
        0: { cellWidth: 10 },  // #
        1: { cellWidth: 20 },  // Name
        2: { cellWidth: 20 },  // Father Name
        3: { cellWidth: 15 },  // Age/Gender
        4: { cellWidth: 15 },  // Religion
        5: { cellWidth: 22 },  // Phone
        6: { cellWidth: 12 },  // House
        7: { cellWidth: 12 },  // Booth
        8: { cellWidth: 18 },  // Category
        9: { cellWidth: 15 },  // Status
        10: { cellWidth: 15 }  // Date Added
      },
      margin: { left: 5, right: 5 }
    });
  } else {
    doc.setFontSize(12);
    doc.setTextColor(220, 38, 38);
    doc.text('No voters found matching the current filters.', 20, yPosition + 10);
  }
  
  // Footer
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
  
  // Save the PDF
  const fileName = `${wardDetails.wardName.replace(/\s+/g, '_')}_Detailed_Voters_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

// Helper function to add new S3 ward PDFs (for future use)
export const addS3WardPDF = (wardKey: string, url: string, filename: string, panchayat?: string) => {
  S3_WARD_PDFS[wardKey.toLowerCase()] = {
    url,
    filename,
    panchayat: panchayat?.toLowerCase()
  };
  console.log(`✅ Added S3 PDF mapping for ${wardKey} ward`);
};

// Helper function to list all available S3 ward PDFs
export const listS3WardPDFs = () => {
  console.log('📋 Available S3 Ward PDFs:');
  Object.entries(S3_WARD_PDFS).forEach(([key, config]) => {
    console.log(`  - ${key}: ${config.filename}${config.panchayat ? ` (${config.panchayat})` : ''}`);
  });
  return S3_WARD_PDFS;
};