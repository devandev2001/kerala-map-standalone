/**
 * Map Interactions Tests for Kerala Map Standalone
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import IntegratedKeralaMap from '../components/IntegratedKeralaMap';

// Mock all data loading utilities
vi.mock('../utils/loadACData', () => ({
  loadACData: vi.fn().mockResolvedValue({
    'Thiruvananthapuram': ['TVM North', 'TVM South', 'TVM Central']
  })
}));

vi.mock('../utils/loadMandalData', () => ({
  loadMandalData: vi.fn().mockResolvedValue({
    'TVM North': ['Mandal 1', 'Mandal 2']
  })
}));

vi.mock('../utils/loadACVoteShareData', () => ({
  loadACVoteShareData: vi.fn().mockResolvedValue(),
  getACVoteShareData: vi.fn().mockReturnValue([
    {
      name: 'TVM North',
      lsg2020: { vs: '25%', votes: '15000' },
      ge2024: { vs: '30%', votes: '18000' },
      target2025: { vs: '35%', votes: '21000' }
    }
  ])
}));

vi.mock('../utils/loadMandalVoteShareData', () => ({
  loadMandalVoteShareData: vi.fn().mockResolvedValue(),
  getMandalVoteShareData: vi.fn().mockReturnValue([
    {
      name: 'Mandal 1',
      lsg2020: { vs: '20%', votes: '5000' },
      ge2024: { vs: '25%', votes: '6000' },
      target2025: { vs: '30%', votes: '7500' }
    }
  ])
}));

vi.mock('../utils/loadLocalBodyVoteShareData', () => ({
  loadLocalBodyVoteShareData: vi.fn().mockResolvedValue(),
  getLocalBodyVoteShareData: vi.fn().mockReturnValue([
    {
      name: 'Panchayat 1',
      lsg2020: { vs: '18%', votes: '1200' },
      ge2024: { vs: '22%', votes: '1400' },
      target2025: { vs: '28%', votes: '1800' }
    }
  ])
}));

vi.mock('../utils/loadOrgDistrictTargetData', () => ({
  loadOrgDistrictTargetData: vi.fn().mockResolvedValue(),
  getOrgDistrictTargetData: vi.fn().mockReturnValue([
    {
      name: 'TVM City',
      panchayat: { total: 10, targetWin: 6, targetOpposition: 4 },
      municipality: { total: 5, targetWin: 3, targetOpposition: 2 },
      corporation: { total: 1, targetWin: 1, targetOpposition: 0 }
    }
  ])
}));

vi.mock('../utils/loadACTargetData', () => ({
  loadACTargetData: vi.fn().mockResolvedValue(),
  getACTargetData: vi.fn().mockReturnValue([
    {
      name: 'TVM North',
      panchayat: { total: 5, targetWin: 3, targetOpposition: 2 },
      municipality: { total: 2, targetWin: 1, targetOpposition: 1 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    }
  ])
}));

vi.mock('../utils/loadMandalTargetData', () => ({
  loadMandalTargetData: vi.fn().mockResolvedValue(),
  getMandalTargetData: vi.fn().mockReturnValue([
    {
      name: 'Mandal 1',
      panchayat: { total: 3, targetWin: 2, targetOpposition: 1 },
      municipality: { total: 1, targetWin: 1, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    }
  ])
}));

vi.mock('../utils/loadOrgDistrictContacts', () => ({
  loadOrgDistrictContacts: vi.fn().mockResolvedValue([
    {
      name: 'John Doe',
      designation: 'District President',
      phone: '9876543210',
      orgDistrict: 'TVM City'
    }
  ])
}));

vi.mock('../utils/loadMandalContactData', () => ({
  loadMandalContactData: vi.fn().mockResolvedValue(),
  getMandalContactData: vi.fn().mockReturnValue([
    {
      name: 'Jane Smith',
      designation: 'Mandal President',
      phone: '9876543211',
      mandal: 'Mandal 1'
    }
  ])
}));

vi.mock('../utils/loadLocalBodyContactData', () => ({
  loadLocalBodyContactData: vi.fn().mockResolvedValue(),
  getLocalBodyContactData: vi.fn().mockReturnValue([
    {
      name: 'Bob Johnson',
      designation: 'Panchayat President',
      phone: '9876543212',
      localBody: 'Panchayat 1'
    }
  ])
}));

vi.mock('../utils/loadZoneTargetData', () => ({
  loadZoneTargetData: vi.fn().mockResolvedValue(),
  getZoneTargetData: vi.fn().mockReturnValue([
    {
      name: 'Thiruvananthapuram',
      panchayat: { total: 50, targetWin: 30, targetOpposition: 20 },
      municipality: { total: 20, targetWin: 12, targetOpposition: 8 },
      corporation: { total: 5, targetWin: 3, targetOpposition: 2 }
    }
  ])
}));

// Mock mobile detection
vi.mock('../utils/mobileDetection', () => ({
  useMobileDetection: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    screenSize: 'desktop',
    orientation: 'landscape'
  }),
  detectMobile: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    screenSize: 'desktop',
    orientation: 'landscape'
  })
}));

describe('IntegratedKeralaMap Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders map component correctly', async () => {
    render(<IntegratedKeralaMap />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Kerala Interactive Map')).toBeInTheDocument();
    });
    
    expect(screen.getByTitle('Refresh Map')).toBeInTheDocument();
    expect(screen.getByTitle('Enter Fullscreen')).toBeInTheDocument();
    expect(screen.getByTitle('Leadership Contacts')).toBeInTheDocument();
    expect(screen.getByTitle('Vote Share Performance')).toBeInTheDocument();
    expect(screen.getByTitle('Local Body Targets')).toBeInTheDocument();
  });

  test('handles map refresh functionality', async () => {
    render(<IntegratedKeralaMap />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Refresh Map')).toBeInTheDocument();
    });
    
    const refreshButton = screen.getByTitle('Refresh Map');
    fireEvent.click(refreshButton);
    
    // Should reload the iframe
    const iframe = screen.getByTitle('Kerala Interactive Map');
    expect(iframe).toBeInTheDocument();
  });

  test('toggles fullscreen mode', async () => {
    const mockRequestFullscreen = vi.fn().mockResolvedValue(undefined);
    const mockExitFullscreen = vi.fn().mockResolvedValue(undefined);
    
    Object.defineProperty(document, 'fullscreenElement', {
      writable: true,
      value: null,
    });
    
    Object.defineProperty(document, 'exitFullscreen', {
      writable: true,
      value: mockExitFullscreen,
    });
    
    Object.defineProperty(Element.prototype, 'requestFullscreen', {
      writable: true,
      value: mockRequestFullscreen,
    });
    
    render(<IntegratedKeralaMap />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Enter Fullscreen')).toBeInTheDocument();
    });
    
    const fullscreenButton = screen.getByTitle('Enter Fullscreen');
    fireEvent.click(fullscreenButton);
    
    expect(mockRequestFullscreen).toHaveBeenCalled();
  });

  test('opens leadership contacts modal', async () => {
    render(<IntegratedKeralaMap />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Leadership Contacts')).toBeInTheDocument();
    });
    
    const contactsButton = screen.getByTitle('Leadership Contacts');
    fireEvent.click(contactsButton);
    
    await waitFor(() => {
      expect(screen.getByText('Leadership Contacts')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('District President')).toBeInTheDocument();
      expect(screen.getByText('9876543210')).toBeInTheDocument();
    });
  });

  test('opens vote share performance modal', async () => {
    render(<IntegratedKeralaMap />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Vote Share Performance')).toBeInTheDocument();
    });
    
    const performanceButton = screen.getByTitle('Vote Share Performance');
    fireEvent.click(performanceButton);
    
    await waitFor(() => {
      expect(screen.getByText('Vote Share Performance')).toBeInTheDocument();
      expect(screen.getByText('TVM North')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument(); // LSG 2020
      expect(screen.getByText('30%')).toBeInTheDocument(); // GE 2024
      expect(screen.getByText('35%')).toBeInTheDocument(); // Target 2025
    });
  });

  test('opens local body targets modal', async () => {
    render(<IntegratedKeralaMap />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Local Body Targets')).toBeInTheDocument();
    });
    
    const targetsButton = screen.getByTitle('Local Body Targets');
    fireEvent.click(targetsButton);
    
    await waitFor(() => {
      expect(screen.getByText('Local Body Targets')).toBeInTheDocument();
      expect(screen.getByText('TVM City')).toBeInTheDocument();
      expect(screen.getByText('Panchayat')).toBeInTheDocument();
      expect(screen.getByText('Municipality')).toBeInTheDocument();
      expect(screen.getByText('Corporation')).toBeInTheDocument();
    });
  });

  test('closes modals when close button is clicked', async () => {
    render(<IntegratedKeralaMap />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Leadership Contacts')).toBeInTheDocument();
    });
    
    // Open modal
    const contactsButton = screen.getByTitle('Leadership Contacts');
    fireEvent.click(contactsButton);
    
    await waitFor(() => {
      expect(screen.getByText('Leadership Contacts')).toBeInTheDocument();
    });
    
    // Close modal
    const closeButton = screen.getByTitle('Close Modal');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Leadership Contacts')).not.toBeInTheDocument();
    });
  });

  test('closes modals when clicking outside', async () => {
    render(<IntegratedKeralaMap />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Vote Share Performance')).toBeInTheDocument();
    });
    
    // Open modal
    const performanceButton = screen.getByTitle('Vote Share Performance');
    fireEvent.click(performanceButton);
    
    await waitFor(() => {
      expect(screen.getByText('Vote Share Performance')).toBeInTheDocument();
    });
    
    // Click outside modal
    const modalOverlay = document.querySelector('.fixed.inset-0');
    fireEvent.click(modalOverlay!);
    
    await waitFor(() => {
      expect(screen.queryByText('Vote Share Performance')).not.toBeInTheDocument();
    });
  });

  test('handles keyboard navigation for modals', async () => {
    render(<IntegratedKeralaMap />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Local Body Targets')).toBeInTheDocument();
    });
    
    // Open modal
    const targetsButton = screen.getByTitle('Local Body Targets');
    fireEvent.click(targetsButton);
    
    await waitFor(() => {
      expect(screen.getByText('Local Body Targets')).toBeInTheDocument();
    });
    
    // Press Escape to close
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    
    await waitFor(() => {
      expect(screen.queryByText('Local Body Targets')).not.toBeInTheDocument();
    });
  });

  test('handles iframe loading states', async () => {
    render(<IntegratedKeralaMap />);
    
    // Should show loading initially
    expect(screen.getByText('Loading Kerala Map')).toBeInTheDocument();
    
    // Wait for iframe to load
    await waitFor(() => {
      expect(screen.getByTitle('Kerala Interactive Map')).toBeInTheDocument();
    });
    
    // Loading text should be gone
    expect(screen.queryByText('Loading Kerala Map')).not.toBeInTheDocument();
  });

  test('handles iframe error states', async () => {
    // Mock iframe error
    const originalCreateElement = document.createElement;
    document.createElement = vi.fn().mockImplementation((tagName) => {
      if (tagName === 'iframe') {
        const iframe = originalCreateElement.call(document, tagName);
        setTimeout(() => {
          const errorEvent = new Event('error');
          iframe.dispatchEvent(errorEvent);
        }, 100);
        return iframe;
      }
      return originalCreateElement.call(document, tagName);
    });
    
    render(<IntegratedKeralaMap />);
    
    await waitFor(() => {
      expect(screen.getByText('Map Loading Error')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
    
    // Test retry functionality
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    
    // Should attempt to reload
    expect(screen.getByText('Loading Kerala Map')).toBeInTheDocument();
    
    // Restore original createElement
    document.createElement = originalCreateElement;
  });

  test('handles data loading errors gracefully', async () => {
    // Mock data loading failure
    vi.mocked(require('../utils/loadACData').loadACData).mockRejectedValue(
      new Error('Failed to load AC data')
    );
    
    render(<IntegratedKeralaMap />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Kerala Interactive Map')).toBeInTheDocument();
    });
    
    // Should still render the map even if some data fails to load
    expect(screen.getByTitle('Leadership Contacts')).toBeInTheDocument();
    expect(screen.getByTitle('Vote Share Performance')).toBeInTheDocument();
    expect(screen.getByTitle('Local Body Targets')).toBeInTheDocument();
  });

  test('updates map context based on iframe messages', async () => {
    render(<IntegratedKeralaMap />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Kerala Interactive Map')).toBeInTheDocument();
    });
    
    // Simulate iframe message for context change
    const messageEvent = new MessageEvent('message', {
      data: {
        type: 'mapContextChange',
        context: {
          level: 'acs',
          zone: 'Thiruvananthapuram',
          org: 'TVM City',
          ac: 'TVM North',
          mandal: ''
        }
      },
      origin: window.location.origin
    });
    
    window.dispatchEvent(messageEvent);
    
    // Should update the context and reload relevant data
    await waitFor(() => {
      // The component should have updated its internal state
      expect(screen.getByTitle('Kerala Interactive Map')).toBeInTheDocument();
    });
  });

  test('filters data based on current map context', async () => {
    render(<IntegratedKeralaMap />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Vote Share Performance')).toBeInTheDocument();
    });
    
    // Simulate context change to AC level
    const messageEvent = new MessageEvent('message', {
      data: {
        type: 'mapContextChange',
        context: {
          level: 'acs',
          zone: 'Thiruvananthapuram',
          org: 'TVM City',
          ac: 'TVM North',
          mandal: ''
        }
      },
      origin: window.location.origin
    });
    
    window.dispatchEvent(messageEvent);
    
    // Open performance modal
    const performanceButton = screen.getByTitle('Vote Share Performance');
    fireEvent.click(performanceButton);
    
    await waitFor(() => {
      // Should show AC-level data
      expect(screen.getByText('TVM North')).toBeInTheDocument();
    });
  });

  test('handles PDF export functionality', async () => {
    // Mock PDF generation
    vi.mock('../utils/mapPdfExporter', () => ({
      generateMapPDF: vi.fn().mockResolvedValue(true)
    }));
    
    render(<IntegratedKeralaMap />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Vote Share Performance')).toBeInTheDocument();
    });
    
    // Open performance modal
    const performanceButton = screen.getByTitle('Vote Share Performance');
    fireEvent.click(performanceButton);
    
    await waitFor(() => {
      expect(screen.getByText('Export PDF')).toBeInTheDocument();
    });
    
    // Click export PDF
    const exportButton = screen.getByText('Export PDF');
    fireEvent.click(exportButton);
    
    // Should call PDF generation
    const { generateMapPDF } = require('../utils/mapPdfExporter');
    await waitFor(() => {
      expect(generateMapPDF).toHaveBeenCalled();
    });
  });
});

describe('Map Navigation Flow', () => {
  test('navigates through hierarchical levels correctly', async () => {
    render(<IntegratedKeralaMap />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Kerala Interactive Map')).toBeInTheDocument();
    });
    
    // Start at zones level
    let messageEvent = new MessageEvent('message', {
      data: {
        type: 'mapContextChange',
        context: {
          level: 'zones',
          zone: '',
          org: '',
          ac: '',
          mandal: ''
        }
      },
      origin: window.location.origin
    });
    window.dispatchEvent(messageEvent);
    
    // Navigate to org districts
    messageEvent = new MessageEvent('message', {
      data: {
        type: 'mapContextChange',
        context: {
          level: 'orgs',
          zone: 'Thiruvananthapuram',
          org: '',
          ac: '',
          mandal: ''
        }
      },
      origin: window.location.origin
    });
    window.dispatchEvent(messageEvent);
    
    // Navigate to ACs
    messageEvent = new MessageEvent('message', {
      data: {
        type: 'mapContextChange',
        context: {
          level: 'acs',
          zone: 'Thiruvananthapuram',
          org: 'TVM City',
          ac: '',
          mandal: ''
        }
      },
      origin: window.location.origin
    });
    window.dispatchEvent(messageEvent);
    
    // Navigate to mandals
    messageEvent = new MessageEvent('message', {
      data: {
        type: 'mapContextChange',
        context: {
          level: 'mandals',
          zone: 'Thiruvananthapuram',
          org: 'TVM City',
          ac: 'TVM North',
          mandal: ''
        }
      },
      origin: window.location.origin
    });
    window.dispatchEvent(messageEvent);
    
    // Each level should load appropriate data
    await waitFor(() => {
      expect(screen.getByTitle('Kerala Interactive Map')).toBeInTheDocument();
    });
  });

  test('maintains data consistency across navigation', async () => {
    render(<IntegratedKeralaMap />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Vote Share Performance')).toBeInTheDocument();
    });
    
    // Navigate to mandal level
    const messageEvent = new MessageEvent('message', {
      data: {
        type: 'mapContextChange',
        context: {
          level: 'mandals',
          zone: 'Thiruvananthapuram',
          org: 'TVM City',
          ac: 'TVM North',
          mandal: 'Mandal 1'
        }
      },
      origin: window.location.origin
    });
    window.dispatchEvent(messageEvent);
    
    // Open performance modal
    const performanceButton = screen.getByTitle('Vote Share Performance');
    fireEvent.click(performanceButton);
    
    await waitFor(() => {
      // Should show mandal-level data
      expect(screen.getByText('Mandal 1')).toBeInTheDocument();
      expect(screen.getByText('20%')).toBeInTheDocument(); // LSG 2020 for Mandal 1
    });
  });
});