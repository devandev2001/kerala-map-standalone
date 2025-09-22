import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Initialize the application
const initializeApp = async () => {
  try {
    // Render the React application
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
        <div class="error-container">
          <h1 class="error-title">Application Error</h1>
          <p class="error-message">Failed to initialize the Kerala Map application.</p>
          <button class="error-retry-btn" onclick="window.location.reload()">
            Retry
          </button>
        </div>
      `;
    }
  }
};

// Start the application
initializeApp();
