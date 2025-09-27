import React from 'react';

const SimpleApp: React.FC = () => {
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
        🗺️ Kerala Map Standalone
      </h1>
      <p>Application is loading successfully!</p>
      <p style={{ color: '#D1D5DB', fontSize: '14px', marginTop: '20px' }}>
        If you can see this, React is working correctly.
      </p>
      <button 
        onClick={() => alert('Button clicked!')}
        style={{
          background: '#F97316',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Test Button
      </button>
    </div>
  );
};

export default SimpleApp;
