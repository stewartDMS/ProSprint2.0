import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '../components/Navigation';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match.',
      });
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setMessage({
        type: 'success',
        text: 'Registration functionality will be implemented with authentication backend.',
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <Head>
        <title>Register - ProSprint 2.0</title>
        <meta name="description" content="Create your ProSprint 2.0 account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={styles.page}>
        <Navigation />
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={styles.card}>
              <h1 style={styles.title}>Create Account</h1>
              <p style={styles.subtitle}>Get started with ProSprint 2.0</p>

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

              <form onSubmit={handleSubmit} style={styles.form} aria-label="Registration form">
                <div style={styles.formGroup}>
                  <label htmlFor="name" style={styles.label}>
                    Full Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={styles.input}
                    placeholder="John Doe"
                    required
                    aria-required="true"
                  />
                </div>

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
                    placeholder="Create a strong password"
                    required
                    aria-required="true"
                    minLength={8}
                  />
                  <small style={styles.hint}>Minimum 8 characters</small>
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="confirmPassword" style={styles.label}>
                    Confirm Password *
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    style={styles.input}
                    placeholder="Re-enter your password"
                    required
                    aria-required="true"
                  />
                </div>

                <div style={styles.terms}>
                  <label style={styles.checkboxLabel}>
                    <input type="checkbox" style={styles.checkbox} required aria-required="true" />
                    <span style={styles.checkboxText}>
                      I agree to the{' '}
                      <Link href="/terms" style={styles.link}>
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" style={styles.link}>
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  style={styles.button}
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              <div style={styles.divider}>
                <span style={styles.dividerText}>or</span>
              </div>

              <div style={styles.footer}>
                <p style={styles.footerText}>
                  Already have an account?{' '}
                  <Link href="/login" style={styles.link}>
                    Sign in
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
  hint: {
    color: '#94a3b8',
    fontSize: '0.85rem',
    marginTop: '0.25rem',
  },
  terms: {
    marginTop: '-0.5rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  checkbox: {
    cursor: 'pointer',
    width: '1rem',
    height: '1rem',
    marginTop: '0.25rem',
    flexShrink: 0,
  },
  checkboxText: {
    color: '#cbd5e1',
    fontSize: '0.9rem',
    lineHeight: '1.4',
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
