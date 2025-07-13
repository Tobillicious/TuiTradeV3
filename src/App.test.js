import { render, screen } from '@testing-library/react';
import App from './App';

// Mock matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

test('renders TuiTrade homepage', () => {
  render(<App />);
  // Look for the header TuiTrade branding specifically  
  const brandElements = screen.getAllByText(/TuiTrade/i);
  expect(brandElements.length).toBeGreaterThan(0);
  
  // Check that the main header is rendered
  const headerElement = screen.getByRole('banner');
  expect(headerElement).toBeInTheDocument();
});
