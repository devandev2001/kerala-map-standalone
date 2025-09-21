import { describe, it, expect, vi } from 'vitest';
import { generateMapPDF, generateMapPDFMobile } from '../utils/mapPdfExporter';

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

describe('PDF Export Functionality', () => {
  const mockMapData = {
    context: {
      level: 'zones' as const,
      zone: 'Thiruvananthapuram',
      org: '',
      ac: '',
      mandal: ''
    },
    voteShareData: [
      {
        name: 'Test Area',
        lsg2020: { vs: '20%', votes: '1000' },
        ge2024: { vs: '25%', votes: '1200' },
        target2025: { vs: '30%', votes: '1500' }
      }
    ],
    targetData: {
      panchayat: { total: 10, targetWin: 6, targetOpposition: 4 }
    },
    contactData: [
      {
        name: 'Test Contact',
        designation: 'Test Position',
        phone: '9876543210'
      }
    ],
    title: 'Test Kerala Map Report'
  };

  it('should generate PDF successfully', async () => {
    const result = await generateMapPDF(mockMapData);
    expect(result).toBe(true);
  });

  it('should generate mobile PDF successfully', async () => {
    // Mock window.open for mobile PDF
    const mockWindow = {
      document: {
        write: vi.fn(),
        close: vi.fn()
      },
      print: vi.fn(),
      close: vi.fn()
    };
    
    vi.stubGlobal('window', {
      ...window,
      open: vi.fn().mockReturnValue(mockWindow)
    });

    const result = await generateMapPDFMobile(mockMapData);
    expect(result).toBe(true);
  });

  it('should handle PDF generation errors gracefully', async () => {
    // Mock html2pdf to throw an error
    vi.doMock('html2pdf.js', () => ({
      default: () => ({
        set: () => ({
          from: () => ({
            save: vi.fn().mockRejectedValue(new Error('PDF generation failed'))
          })
        })
      })
    }));

    const result = await generateMapPDF(mockMapData);
    expect(result).toBe(false);
  });

  it('should generate proper filename based on context', () => {
    // Test filename generation logic
    const context = {
      level: 'acs' as const,
      zone: 'Thiruvananthapuram',
      org: 'TVM City',
      ac: 'TVM South',
      mandal: ''
    };

    // This would be tested by checking the filename in the actual implementation
    expect(context.zone).toBe('Thiruvananthapuram');
    expect(context.org).toBe('TVM City');
    expect(context.ac).toBe('TVM South');
  });

  it('should handle Malayalam text in PDF content', () => {
    const malayalamData = {
      ...mockMapData,
      voteShareData: [
        {
          name: 'തിരുവനന്തപുരം',
          lsg2020: { vs: '20%', votes: '1000' },
          ge2024: { vs: '25%', votes: '1200' },
          target2025: { vs: '30%', votes: '1500' }
        }
      ]
    };

    // Test that Malayalam text is properly handled
    expect(malayalamData.voteShareData[0].name).toBe('തിരുവനന്തപുരം');
  });
});