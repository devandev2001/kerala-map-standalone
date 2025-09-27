import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';

// Debug component to test if React is working
const DebugApp = () => {
  console.log('🚀 Debug app is rendering...');
  
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
        🗺️ Kerala Map - Debug Mode
      </h1>
      <p>React is working correctly!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      <p>User Agent: {navigator.userAgent}</p>
      <p>Screen size: {window.innerWidth}x{window.innerHeight}</p>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => {
            console.log('Button clicked!');
            alert('Debug button works!');
          }}
          style={{
            background: '#F97316',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            margin: '10px'
          }}
        >
          Test Button
        </button>
        
        <button 
          onClick={() => {
            // Test if we can load the original app
            window.location.href = '/?debug=original';
          }}
          style={{
            background: '#3B82F6',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            margin: '10px'
          }}
        >
          Try Original App
        </button>
      </div>
    </div>
  );
};

// Initialize with error handling
try {
  console.log('🔧 Initializing debug app...');
  
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <DebugApp />
    </StrictMode>
  );

  console.log('✅ Debug app initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize debug app:', error);
  
  // Show error message to user
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif; background: #1F2937; color: white; min-height: 100vh;">
        <h1 style="color: #dc2626;">Debug App Error</h1>
        <p>Failed to initialize the debug app.</p>
        <p style="color: #666; font-size: 14px;">Error: ${error.message}</p>
        <button onclick="window.location.reload()" style="
          background: #dc2626; 
          color: white; 
          border: none; 
          padding: 10px 20px; 
          border-radius: 5px; 
          cursor: pointer;
          margin-top: 10px;
        ">
          Retry
        </button>
      </div>
    `;
  }
}
