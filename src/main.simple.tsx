import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.simple';
import './styles/index.css';

// Simple initialization without service worker
const initializeApp = () => {
  try {
    console.log('🚀 Starting Kerala Map Standalone...');
    
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );

    console.log('✅ Kerala Map Standalone initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    
    // Show error message to user
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
          <h1 style="color: #dc2626;">Application Error</h1>
          <p>Failed to initialize the Kerala Map application.</p>
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
};

// Start the application
initializeApp();