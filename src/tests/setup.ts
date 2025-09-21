/**
 * Test setup file for Kerala Map Standalone
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock requestFullscreen and exitFullscreen
Object.defineProperty(document, 'fullscreenElement', {
  writable: true,
  value: null,
});

Object.defineProperty(document, 'exitFullscreen', {
  writable: true,
  value: vi.fn().mockResolvedValue(undefined),
});

Object.defineProperty(Element.prototype, 'requestFullscreen', {
  writable: true,
  value: vi.fn().mockResolvedValue(undefined),
});

// Mock navigator properties
Object.defineProperty(navigator, 'userAgent', {
  writable: true,
  value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
});

Object.defineProperty(navigator, 'vendor', {
  writable: true,
  value: 'Google Inc.',
});

Object.defineProperty(navigator, 'maxTouchPoints', {
  writable: true,
  value: 0,
});

// Mock window dimensions
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

// Mock touch events
Object.defineProperty(window, 'ontouchstart', {
  writable: true,
  value: undefined,
});

// Mock CSS.supports
Object.defineProperty(CSS, 'supports', {
  writable: true,
  value: vi.fn().mockReturnValue(false),
});

// Mock all data loading modules to prevent fetch errors in tests
vi.mock('../utils/loadACData', () => ({
  loadACData: vi.fn().mockResolvedValue({})
}));

vi.mock('../utils/loadMandalData', () => ({
  loadMandalData: vi.fn().mockResolvedValue({})
}));

vi.mock('../utils/loadACVoteShareData', () => ({
  loadACVoteShareData: vi.fn().mockResolvedValue(),
  getACVoteShareData: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/loadMandalVoteShareData', () => ({
  loadMandalVoteShareData: vi.fn().mockResolvedValue(),
  getMandalVoteShareData: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/loadLocalBodyVoteShareData', () => ({
  loadLocalBodyVoteShareData: vi.fn().mockResolvedValue(),
  getLocalBodyVoteShareData: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/loadOrgDistrictTargetData', () => ({
  loadOrgDistrictTargetData: vi.fn().mockResolvedValue(),
  getOrgDistrictTargetData: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/loadACTargetData', () => ({
  loadACTargetData: vi.fn().mockResolvedValue(),
  getACTargetData: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/loadMandalTargetData', () => ({
  loadMandalTargetData: vi.fn().mockResolvedValue(),
  getMandalTargetData: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/loadOrgDistrictContacts', () => ({
  loadOrgDistrictContacts: vi.fn().mockResolvedValue([])
}));

vi.mock('../utils/loadMandalContactData', () => ({
  loadMandalContactData: vi.fn().mockResolvedValue(),
  getMandalContactData: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/loadLocalBodyContactData', () => ({
  loadLocalBodyContactData: vi.fn().mockResolvedValue(),
  getLocalBodyContactData: vi.fn().mockReturnValue([])
}));

vi.mock('../utils/loadZoneTargetData', () => ({
  loadZoneTargetData: vi.fn().mockResolvedValue(),
  getZoneTargetData: vi.fn().mockReturnValue([])
}));

// Suppress console warnings and errors in tests
const originalWarn = console.warn;
const originalError = console.error;
beforeAll(() => {
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});