import { describe, it, expect, vi } from 'vitest';
import { generateMapPDF } from '../utils/mapPdfExporter';

// Mock html2pdf
vi.mock('html2pdf.js', () => ({
  default: () => ({
    set: () => ({
      from: () => ({
        save: vi.fn().mockResolvedValue(true)
      })
    })
  })
}));

describe('Map PDF Integration Tests', () => {
  it('should generate PDF for zone level', async () => {
    const zoneData = {
      context: {
        level: 'zones' as const,
        zone: 'Thiruvananthapuram',
        org: '',
        ac: '',
        mandal: ''
      },
      voteShareData: [
        {
          name: 'Thiruvananthapuram South',
          lsg2020: { vs: '20.79%', votes: '162,607' },
          ge2024: { vs: '30.05%', votes: '210,956' },
          target2025: { vs: '34.48%', votes: '326,544' }
        }
      ],
      title: 'Thiruvananthapuram Zone Report'
    };

    const result = await generateMapPDF(zoneData);
    expect(result).toBe(true);
  });

  it('should generate PDF for org district level', async () => {
    const orgData = {
      context: {
        level: 'orgs' as const,
        zone: 'Thiruvananthapuram',
        org: 'TVM City',
        ac: '',
        mandal: ''
      },
      targetData: {
        panchayat: { total: 15, targetWin: 10, targetOpposition: 5 },
        municipality: { total: 3, targetWin: 2, targetOpposition: 1 }
      },
      title: 'TVM City Org District Report'
    };

    const result = await generateMapPDF(orgData);
    expect(result).toBe(true);
  });

  it('should generate PDF for AC level', async () => {
    const acData = {
      context: {
        level: 'acs' as const,
        zone: 'Thiruvananthapuram',
        org: 'TVM City',
        ac: 'TVM South',
        mandal: ''
      },
      voteShareData: [
        {
          name: 'TVM South AC',
          lsg2020: { vs: '20.79%', votes: '162,607' },
          ge2024: { vs: '30.05%', votes: '210,956' },
          target2025: { vs: '34.48%', votes: '326,544' }
        }
      ],
      title: 'TVM South AC Report'
    };

    const result = await generateMapPDF(acData);
    expect(result).toBe(true);
  });

  it('should generate PDF for mandal level', async () => {
    const mandalData = {
      context: {
        level: 'mandals' as const,
        zone: 'Thiruvananthapuram',
        org: 'TVM City',
        ac: 'TVM South',
        mandal: 'Test Mandal'
      },
      contactData: [
        {
          name: 'John Doe',
          designation: 'Mandal President',
          phone: '9876543210',
          email: 'john@example.com'
        }
      ],
      title: 'Test Mandal Report'
    };

    const result = await generateMapPDF(mandalData);
    expect(result).toBe(true);
  });

  it('should handle Malayalam text in all sections', async () => {
    const malayalamData = {
      context: {
        level: 'zones' as const,
        zone: 'തിരുവനന്തപുരം',
        org: '',
        ac: '',
        mandal: ''
      },
      voteShareData: [
        {
          name: 'തിരുവനന്തപുരം സൗത്ത്',
          lsg2020: { vs: '20.79%', votes: '162,607' },
          ge2024: { vs: '30.05%', votes: '210,956' },
          target2025: { vs: '34.48%', votes: '326,544' }
        }
      ],
      contactData: [
        {
          name: 'രാജേഷ് കുമാർ',
          designation: 'സോൺ പ്രസിഡന്റ്',
          phone: '9876543210'
        }
      ],
      title: 'തിരുവനന്തപുരം സോൺ റിപ്പോർട്ട്'
    };

    const result = await generateMapPDF(malayalamData);
    expect(result).toBe(true);
  });

  it('should generate PDF with mixed data types', async () => {
    const mixedData = {
      context: {
        level: 'orgs' as const,
        zone: 'Ernakulam',
        org: 'Ernakulam City',
        ac: '',
        mandal: ''
      },
      voteShareData: [
        {
          name: 'Ernakulam East',
          lsg2020: { vs: '5.53%', votes: '34,951' },
          ge2024: { vs: '10.60%', votes: '52,944' },
          target2025: { vs: '12.17%', votes: '81,669' }
        }
      ],
      targetData: {
        panchayat: { total: 20, targetWin: 12, targetOpposition: 8 },
        municipality: { total: 5, targetWin: 3, targetOpposition: 2 },
        corporation: { total: 1, targetWin: 1, targetOpposition: 0 }
      },
      contactData: [
        {
          name: 'District President',
          designation: 'President',
          phone: '9876543210'
        }
      ],
      title: 'Ernakulam City Complete Report'
    };

    const result = await generateMapPDF(mixedData);
    expect(result).toBe(true);
  });
});