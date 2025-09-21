import html2pdf from 'html2pdf.js';
import { addMalayalamFontSupport, containsMalayalam } from './malayalamFontSupport';

interface MapContext {
  level: 'zones' | 'orgs' | 'acs' | 'mandals' | 'panchayats' | 'wards';
  zone: string;
  org: string;
  ac: string;
  mandal: string;
}

interface VoteShareData {
  name: string;
  lsg2020: { vs: string; votes: string };
  ge2024: { vs: string; votes: string };
  target2025: { vs: string; votes: string };
}

interface TargetData {
  panchayat?: { total: number; targetWin: number; targetOpposition: number };
  municipality?: { total: number; targetWin: number; targetOpposition: number };
  corporation?: { total: number; targetWin: number; targetOpposition: number };
}

interface ContactData {
  name: string;
  designation: string;
  phone: string;
  email?: string;
}

interface MapPdfData {
  context: MapContext;
  voteShareData?: VoteShareData[];
  targetData?: TargetData;
  contactData?: ContactData[];
  title: string;
}

export const generateMapPDF = async (data: MapPdfData): Promise<boolean> => {
  try {
    console.log('🔄 Starting Map PDF generation...', data);
    
    const htmlContent = createMapHTML(data);
    
    // Configure html2pdf options for better Malayalam rendering
    const options = {
      margin: [10, 10, 10, 10],
      filename: generateFilename(data),
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
        orientation: 'portrait' 
      }
    };
    
    // Generate PDF using html2pdf
    await html2pdf().set(options).from(htmlContent).save();
    
    console.log('✅ Map PDF generated successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error generating Map PDF:', error);
    return false;
  }
};

const createMapHTML = (data: MapPdfData): string => {
  const { context, voteShareData, targetData, contactData, title } = data;
  
  return `
    <!DOCTYPE html>
    <html lang="ml">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Noto Sans Malayalam', 'Manjari', 'Meera', 'Arial Unicode MS', Arial, sans-serif;
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
        
        .header .subtitle {
          color: #666;
          font-size: 14px;
          margin-bottom: 5px;
        }
        
        .context-info {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 25px;
          border-left: 4px solid #f97316;
        }
        
        .context-info h3 {
          color: #f97316;
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .context-item {
          margin-bottom: 5px;
          font-size: 12px;
        }
        
        .context-label {
          font-weight: 600;
          color: #555;
        }
        
        .section {
          margin-bottom: 30px;
        }
        
        .section h2 {
          color: #333;
          font-size: 18px;
          margin-bottom: 15px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 11px;
        }
        
        .table th,
        .table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        
        .table th {
          background-color: #f97316;
          color: white;
          font-weight: 600;
          text-align: center;
        }
        
        .table tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        
        .table tr:hover {
          background-color: #e9ecef;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .stat-card {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #f97316;
        }
        
        .stat-card h4 {
          color: #f97316;
          font-size: 14px;
          margin-bottom: 8px;
        }
        
        .stat-value {
          font-size: 18px;
          font-weight: 700;
          color: #333;
        }
        
        .contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }
        
        .contact-card {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }
        
        .contact-name {
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
        }
        
        .contact-designation {
          color: #f97316;
          font-size: 11px;
          margin-bottom: 8px;
        }
        
        .contact-info {
          font-size: 11px;
          color: #666;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 10px;
          color: #666;
        }
        
        @media print {
          body {
            font-size: 10px;
          }
          .header h1 {
            font-size: 20px;
          }
          .section h2 {
            font-size: 16px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>കേരള മാപ്പ് റിപ്പോർട്ട്</h1>
        <div class="subtitle">Kerala Map Report</div>
        <div class="subtitle">${title}</div>
        <div class="subtitle">Generated on: ${new Date().toLocaleDateString('en-IN')}</div>
      </div>
      
      ${createContextSection(context)}
      ${voteShareData ? createVoteShareSection(voteShareData) : ''}
      ${targetData ? createTargetSection(targetData) : ''}
      ${contactData ? createContactSection(contactData) : ''}
      
      <div class="footer">
        <p>Generated by Kerala Map Standalone Application</p>
        <p>© ${new Date().getFullYear()} - All rights reserved</p>
      </div>
    </body>
    </html>
  `;
};

const createContextSection = (context: MapContext): string => {
  const contextItems = [];
  
  if (context.zone) contextItems.push(`<div class="context-item"><span class="context-label">Zone:</span> ${context.zone}</div>`);
  if (context.org) contextItems.push(`<div class="context-item"><span class="context-label">Org District:</span> ${context.org}</div>`);
  if (context.ac) contextItems.push(`<div class="context-item"><span class="context-label">Assembly Constituency:</span> ${context.ac}</div>`);
  if (context.mandal) contextItems.push(`<div class="context-item"><span class="context-label">Mandal:</span> ${context.mandal}</div>`);
  
  return `
    <div class="context-info">
      <h3>Map Context / മാപ്പ് സന്ദർഭം</h3>
      <div class="context-item"><span class="context-label">Current Level:</span> ${context.level}</div>
      ${contextItems.join('')}
    </div>
  `;
};

const createVoteShareSection = (voteShareData: VoteShareData[]): string => {
  if (!voteShareData || voteShareData.length === 0) return '';
  
  const tableRows = voteShareData.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.lsg2020.vs}</td>
      <td>${item.lsg2020.votes}</td>
      <td>${item.ge2024.vs}</td>
      <td>${item.ge2024.votes}</td>
      <td>${item.target2025.vs}</td>
      <td>${item.target2025.votes}</td>
    </tr>
  `).join('');
  
  return `
    <div class="section">
      <h2>Vote Share Data / വോട്ട് ഷെയർ ഡാറ്റ</h2>
      <table class="table">
        <thead>
          <tr>
            <th>Name / പേര്</th>
            <th>LSG 2020 VS%</th>
            <th>LSG 2020 Votes</th>
            <th>GE 2024 VS%</th>
            <th>GE 2024 Votes</th>
            <th>Target 2025 VS%</th>
            <th>Target 2025 Votes</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;
};

const createTargetSection = (targetData: TargetData): string => {
  const stats = [];
  
  if (targetData.panchayat) {
    stats.push(`
      <div class="stat-card">
        <h4>Panchayats / പഞ്ചായത്തുകൾ</h4>
        <div class="stat-value">Total: ${targetData.panchayat.total}</div>
        <div>Target Win: ${targetData.panchayat.targetWin}</div>
        <div>Target Opposition: ${targetData.panchayat.targetOpposition}</div>
      </div>
    `);
  }
  
  if (targetData.municipality) {
    stats.push(`
      <div class="stat-card">
        <h4>Municipalities / മുനിസിപ്പാലിറ്റികൾ</h4>
        <div class="stat-value">Total: ${targetData.municipality.total}</div>
        <div>Target Win: ${targetData.municipality.targetWin}</div>
        <div>Target Opposition: ${targetData.municipality.targetOpposition}</div>
      </div>
    `);
  }
  
  if (targetData.corporation) {
    stats.push(`
      <div class="stat-card">
        <h4>Corporations / കോർപ്പറേഷനുകൾ</h4>
        <div class="stat-value">Total: ${targetData.corporation.total}</div>
        <div>Target Win: ${targetData.corporation.targetWin}</div>
        <div>Target Opposition: ${targetData.corporation.targetOpposition}</div>
      </div>
    `);
  }
  
  if (stats.length === 0) return '';
  
  return `
    <div class="section">
      <h2>Target Data / ടാർഗെറ്റ് ഡാറ്റ</h2>
      <div class="stats-grid">
        ${stats.join('')}
      </div>
    </div>
  `;
};

const createContactSection = (contactData: ContactData[]): string => {
  if (!contactData || contactData.length === 0) return '';
  
  const contactCards = contactData.map(contact => `
    <div class="contact-card">
      <div class="contact-name">${contact.name}</div>
      <div class="contact-designation">${contact.designation}</div>
      <div class="contact-info">Phone: ${contact.phone}</div>
      ${contact.email ? `<div class="contact-info">Email: ${contact.email}</div>` : ''}
    </div>
  `).join('');
  
  return `
    <div class="section">
      <h2>Contact Information / ബന്ധപ്പെടാനുള്ള വിവരങ്ങൾ</h2>
      <div class="contact-grid">
        ${contactCards}
      </div>
    </div>
  `;
};

const generateFilename = (data: MapPdfData): string => {
  const { context } = data;
  let filename = 'Kerala_Map_Report';
  
  if (context.zone) filename += `_${context.zone.replace(/\s+/g, '_')}`;
  if (context.org) filename += `_${context.org.replace(/\s+/g, '_')}`;
  if (context.ac) filename += `_${context.ac.replace(/\s+/g, '_')}`;
  if (context.mandal) filename += `_${context.mandal.replace(/\s+/g, '_')}`;
  
  filename += `_${context.level}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Clean filename for safety
  return filename.replace(/[<>:"/\\|?*]/g, '_');
};

// Export function for mobile devices with fallback
export const generateMapPDFMobile = async (data: MapPdfData): Promise<boolean> => {
  try {
    // For mobile devices, use a simpler approach
    const htmlContent = createMapHTML(data);
    
    // Create a new window and trigger print
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
    
    console.log('✅ Mobile Map PDF generation initiated');
    return true;
    
  } catch (error) {
    console.error('❌ Error generating Mobile Map PDF:', error);
    return false;
  }
};