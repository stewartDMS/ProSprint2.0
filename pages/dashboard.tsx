import Head from 'next/head';
import Navigation from '../components/Navigation';
import TaskManager from '../components/TaskManager';
import AutomationTriggers from '../components/AutomationTriggers';
import PromptBox from '../components/PromptBox';

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Dashboard - ProSprint 2.0</title>
        <meta name="description" content="ProSprint 2.0 automation dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={styles.page}>
        <Navigation />
        <main style={styles.main}>
          <div style={styles.container}>
            <header style={styles.header}>
              <h1 style={styles.title}>Dashboard</h1>
              <p style={styles.subtitle}>
                Manage your tasks, automation rules, and AI assistant
              </p>
            </header>

            <div style={styles.grid}>
              <div style={styles.section}>
                <TaskManager />
              </div>
              
              <div style={styles.section}>
                <AutomationTriggers />
              </div>
              
              <div style={styles.section}>
                <PromptBox />
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
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#cbd5e1',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '2rem',
  },
  section: {
    minWidth: 0,
  },
};
