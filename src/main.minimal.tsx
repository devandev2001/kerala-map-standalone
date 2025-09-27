import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Minimal test component
const MinimalApp = () => {
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#1F2937',
      color: 'white',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#F97316', marginBottom: '20px' }}>
        🗺️ Kerala Map - Test
      </h1>
      <p>React is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
};

// Initialize
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <MinimalApp />
    </StrictMode>
  );
  console.log('✅ Minimal app loaded successfully');
} else {
  console.error('❌ Root element not found');
}
