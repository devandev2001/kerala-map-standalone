import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { loadVoterData, getVoterDataForWard } from './utils/loadVoterData';
import './styles/index.css';

// Test component to verify voter data
const TestApp = () => {
  const [voterData, setVoterData] = React.useState(null);
  const [testResult, setTestResult] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const testVoterData = async () => {
      try {
        console.log('🧪 Testing voter data loading...');
        const data = await loadVoterData();
        setVoterData(data);
        
        // Test the specific ward that was failing
        const testWard = getVoterDataForWard(
          data,
          'Thiruvananthapuram', // Zone
          'Kollam East', // AC
          'Anchal', // Mandal
          'Kulathupuzha Gramapanchayath', // Local Body
          'AMBALAM' // Ward Name
        );
        
        setTestResult(testWard);
        setLoading(false);
      } catch (error) {
        console.error('❌ Test failed:', error);
        setLoading(false);
      }
    };
    
    testVoterData();
  }, []);

  if (loading) {
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
          🧪 Testing Voter Data
        </h1>
        <p>Loading voter data...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#1F2937',
      color: 'white',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#F97316', marginBottom: '20px', textAlign: 'center' }}>
        🧪 Voter Data Test Results
      </h1>
      
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ 
          backgroundColor: 'rgba(55, 65, 81, 0.8)', 
          padding: '20px', 
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#3B82F6', marginBottom: '15px' }}>
            Test Case: Ward 7 AMBALAM in Kulathupuzha
          </h2>
          
          {testResult ? (
            <div>
              <p style={{ color: '#10B981', fontSize: '18px', marginBottom: '15px' }}>
                ✅ Voter data found successfully!
              </p>
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '15px', borderRadius: '8px' }}>
                <p><strong>Ward Name:</strong> AMBALAM</p>
                <p><strong>Ward Number:</strong> {testResult.wardNo}</p>
                <p><strong>Houses:</strong> {testResult.houses.toLocaleString()}</p>
                <p><strong>Total Voters:</strong> {testResult.totalVoters.toLocaleString()}</p>
                <p><strong>Female Voters:</strong> {testResult.femaleVoters.toLocaleString()}</p>
                <p><strong>Male Voters:</strong> {testResult.maleVoters.toLocaleString()}</p>
                <p><strong>Transgender:</strong> {testResult.transgender}</p>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ color: '#EF4444', fontSize: '18px', marginBottom: '15px' }}>
                ❌ Voter data not found
              </p>
              <p>This means there's still an issue with the data loading or ward name matching.</p>
            </div>
          )}
        </div>
        
        <div style={{ 
          backgroundColor: 'rgba(55, 65, 81, 0.8)', 
          padding: '20px', 
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#3B82F6', marginBottom: '15px' }}>
            Data Loading Status
          </h2>
          <p><strong>Voter data loaded:</strong> {voterData ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Total districts:</strong> {voterData ? Object.keys(voterData).length : 0}</p>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={() => window.location.href = '/?app=original'}
            style={{
              background: '#F97316',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              margin: '10px'
            }}
          >
            Try Original App
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#3B82F6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              margin: '10px'
            }}
          >
            Run Test Again
          </button>
        </div>
      </div>
    </div>
  );
};

// Initialize
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <TestApp />
    </StrictMode>
  );
  console.log('✅ Voter data test app initialized');
} else {
  console.error('❌ Root element not found');
}