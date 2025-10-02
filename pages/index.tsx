import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '../components/Navigation';

interface ApiResponse {
  message: string;
  status: string;
  timestamp: string;
  features?: string[];
  received_data?: Record<string, unknown>;
}

export default function Home() {
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from Python API on component mount
  useEffect(() => {
    fetchAutomationStatus();
  }, []);

  const fetchAutomationStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/automate');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      setApiData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAutomationTask = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/automate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task: 'sample_automation',
          priority: 'high',
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      setApiData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>ProSprint 2.0 - Business Automation Platform</title>
        <meta name="description" content="Intelligent app that automates your business activities" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={styles.page}>
        <Navigation />
        <main style={styles.main}>
          <div style={styles.container}>
            <h1 style={styles.title}>ProSprint 2.0</h1>
            <p style={styles.subtitle}>
              The Intelligent app that automates your business activities and makes running a business seamless
            </p>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Automation Dashboard</h2>
            
            {loading && <p style={styles.loading}>Loading...</p>}
            
            {error && (
              <div style={styles.error}>
                <strong>Error:</strong> {error}
              </div>
            )}
            
            {apiData && !loading && (
              <div style={styles.apiData}>
                <div style={styles.dataRow}>
                  <strong>Status:</strong> 
                  <span style={styles.badge}>{apiData.status}</span>
                </div>
                <div style={styles.dataRow}>
                  <strong>Message:</strong> {apiData.message}
                </div>
                <div style={styles.dataRow}>
                  <strong>Timestamp:</strong> {new Date(apiData.timestamp).toLocaleString()}
                </div>
                
                {apiData.features && (
                  <div style={styles.features}>
                    <strong>Available Features:</strong>
                    <ul style={styles.featureList}>
                      {apiData.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {apiData.received_data && (
                  <div style={styles.receivedData}>
                    <strong>Received Data:</strong>
                    <pre style={styles.code}>
                      {JSON.stringify(apiData.received_data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
            
            <div style={styles.buttonGroup}>
              <button 
                onClick={fetchAutomationStatus} 
                disabled={loading}
                style={styles.button}
              >
                Refresh Status
              </button>
              <button 
                onClick={handleAutomationTask} 
                disabled={loading}
                style={styles.buttonPrimary}
              >
                Run Automation Task
              </button>
            </div>
          </div>

          <div style={styles.info}>
            <p>
              This is a hybrid Next.js + Python application deployed on Vercel.
              The frontend is built with React and TypeScript, while the API routes use Python.
            </p>
            <div style={styles.quickLinks}>
              <Link href="/dashboard" style={styles.quickLink}>
                Go to Dashboard →
              </Link>
              <Link href="/business-data" style={styles.quickLink}>
                Enter Business Data →
              </Link>
            </div>
          </div>
          </div>
        </main>
      </div>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #0f172a, #1e293b)',
    color: '#f1f5f9',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  main: {
    padding: '2rem',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '1rem',
    background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.25rem',
    textAlign: 'center',
    marginBottom: '3rem',
    color: '#cbd5e1',
  },
  card: {
    background: 'rgba(30, 41, 59, 0.8)',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    marginBottom: '2rem',
  },
  cardTitle: {
    fontSize: '1.5rem',
    marginBottom: '1.5rem',
    color: '#e2e8f0',
  },
  loading: {
    textAlign: 'center',
    color: '#94a3b8',
    padding: '2rem',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    color: '#fca5a5',
  },
  apiData: {
    marginBottom: '1.5rem',
  },
  dataRow: {
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  badge: {
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#86efac',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  features: {
    marginTop: '1rem',
  },
  featureList: {
    marginTop: '0.5rem',
    marginLeft: '1.5rem',
    color: '#cbd5e1',
  },
  receivedData: {
    marginTop: '1rem',
  },
  code: {
    background: 'rgba(15, 23, 42, 0.8)',
    padding: '1rem',
    borderRadius: '8px',
    overflow: 'auto',
    fontSize: '0.875rem',
    marginTop: '0.5rem',
    border: '1px solid rgba(148, 163, 184, 0.2)',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  button: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: '1px solid #475569',
    background: 'rgba(51, 65, 85, 0.8)',
    color: '#e2e8f0',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  buttonPrimary: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  info: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '0.875rem',
    lineHeight: '1.5',
  },
  quickLinks: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '1.5rem',
    flexWrap: 'wrap',
  },
  quickLink: {
    textDecoration: 'none',
    color: '#60a5fa',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: '1px solid rgba(96, 165, 250, 0.3)',
    background: 'rgba(96, 165, 250, 0.1)',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.2s',
    display: 'inline-block',
  },
};
