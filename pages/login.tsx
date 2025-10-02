import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '../components/Navigation';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Simulate API call
    setTimeout(() => {
      setMessage({
        type: 'success',
        text: 'Login functionality will be implemented with authentication backend.',
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <Head>
        <title>Login - ProSprint 2.0</title>
        <meta name="description" content="Login to ProSprint 2.0" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={styles.page}>
        <Navigation />
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={styles.card}>
              <h1 style={styles.title}>Welcome Back</h1>
              <p style={styles.subtitle}>Sign in to your ProSprint account</p>

              {message && (
                <div
                  style={{
                    ...styles.message,
                    ...(message.type === 'error' ? styles.messageError : styles.messageSuccess),
                  }}
                  role="alert"
                  aria-live="polite"
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} style={styles.form} aria-label="Login form">
                <div style={styles.formGroup}>
                  <label htmlFor="email" style={styles.label}>
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={styles.input}
                    placeholder="your.email@example.com"
                    required
                    aria-required="true"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="password" style={styles.label}>
                    Password *
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={styles.input}
                    placeholder="Enter your password"
                    required
                    aria-required="true"
                  />
                </div>

                <div style={styles.formFooter}>
                  <label style={styles.checkboxLabel}>
                    <input type="checkbox" style={styles.checkbox} />
                    <span style={styles.checkboxText}>Remember me</span>
                  </label>
                  <Link href="/forgot-password" style={styles.link}>
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  style={styles.button}
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div style={styles.divider}>
                <span style={styles.dividerText}>or</span>
              </div>

              <div style={styles.footer}>
                <p style={styles.footerText}>
                  Don&apos;t have an account?{' '}
                  <Link href="/register" style={styles.link}>
                    Sign up
                  </Link>
                </p>
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 80px)',
  },
  container: {
    width: '100%',
    maxWidth: '450px',
  },
  card: {
    background: 'rgba(30, 41, 59, 0.8)',
    borderRadius: '12px',
    padding: '2.5rem',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '0.5rem',
    background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    textAlign: 'center',
    color: '#94a3b8',
    marginBottom: '2rem',
    fontSize: '0.95rem',
  },
  message: {
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
  },
  messageSuccess: {
    background: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    color: '#86efac',
  },
  messageError: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '0.5rem',
    color: '#cbd5e1',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #475569',
    background: 'rgba(15, 23, 42, 0.8)',
    color: '#e2e8f0',
    fontSize: '1rem',
    transition: 'border-color 0.2s',
  },
  formFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.9rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  checkbox: {
    cursor: 'pointer',
    width: '1rem',
    height: '1rem',
  },
  checkboxText: {
    color: '#cbd5e1',
  },
  link: {
    color: '#60a5fa',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  button: {
    padding: '0.875rem',
    borderRadius: '6px',
    border: 'none',
    background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '0.5rem',
  },
  divider: {
    position: 'relative',
    textAlign: 'center',
    margin: '2rem 0',
  },
  dividerText: {
    background: 'rgba(30, 41, 59, 0.8)',
    padding: '0 1rem',
    color: '#94a3b8',
    fontSize: '0.9rem',
    position: 'relative',
    zIndex: 1,
  },
  footer: {
    textAlign: 'center',
  },
  footerText: {
    color: '#94a3b8',
    fontSize: '0.95rem',
  },
};
