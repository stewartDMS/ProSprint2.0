import { useState } from 'react';
import Head from 'next/head';
import Navigation from '../components/Navigation';

export default function Settings() {
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    company: 'My Company',
  });
  const [preferences, setPreferences] = useState({
    notifications: true,
    emailUpdates: true,
    darkMode: true,
    language: 'en',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    setTimeout(() => {
      setMessage({
        type: 'success',
        text: 'Profile updated successfully!',
      });
      setLoading(false);
    }, 1000);
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    setTimeout(() => {
      setMessage({
        type: 'success',
        text: 'Preferences saved successfully!',
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <Head>
        <title>Settings - ProSprint 2.0</title>
        <meta name="description" content="Manage your ProSprint 2.0 settings" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={styles.page}>
        <Navigation />
        <main style={styles.main}>
          <div style={styles.container}>
            <header style={styles.header}>
              <h1 style={styles.title}>Settings</h1>
              <p style={styles.subtitle}>Manage your profile and preferences</p>
            </header>

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

            <div style={styles.grid}>
              <section style={styles.card} aria-labelledby="profile-section">
                <h2 id="profile-section" style={styles.cardTitle}>Profile Information</h2>
                <form onSubmit={handleProfileSubmit} style={styles.form} aria-label="Profile form">
                  <div style={styles.formGroup}>
                    <label htmlFor="profile-name" style={styles.label}>
                      Full Name *
                    </label>
                    <input
                      id="profile-name"
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      style={styles.input}
                      required
                      aria-required="true"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="profile-email" style={styles.label}>
                      Email Address *
                    </label>
                    <input
                      id="profile-email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      style={styles.input}
                      required
                      aria-required="true"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="profile-company" style={styles.label}>
                      Company
                    </label>
                    <input
                      id="profile-company"
                      type="text"
                      value={profileData.company}
                      onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                      style={styles.input}
                    />
                  </div>

                  <button
                    type="submit"
                    style={styles.button}
                    disabled={loading}
                    aria-busy={loading}
                  >
                    {loading ? 'Saving...' : 'Save Profile'}
                  </button>
                </form>
              </section>

              <section style={styles.card} aria-labelledby="preferences-section">
                <h2 id="preferences-section" style={styles.cardTitle}>Preferences</h2>
                <form onSubmit={handlePreferencesSubmit} style={styles.form} aria-label="Preferences form">
                  <div style={styles.formGroup}>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={preferences.notifications}
                        onChange={(e) =>
                          setPreferences({ ...preferences, notifications: e.target.checked })
                        }
                        style={styles.checkbox}
                      />
                      <span style={styles.checkboxText}>Enable notifications</span>
                    </label>
                    <small style={styles.hint}>Receive in-app notifications</small>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={preferences.emailUpdates}
                        onChange={(e) =>
                          setPreferences({ ...preferences, emailUpdates: e.target.checked })
                        }
                        style={styles.checkbox}
                      />
                      <span style={styles.checkboxText}>Email updates</span>
                    </label>
                    <small style={styles.hint}>Get updates via email</small>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={preferences.darkMode}
                        onChange={(e) =>
                          setPreferences({ ...preferences, darkMode: e.target.checked })
                        }
                        style={styles.checkbox}
                      />
                      <span style={styles.checkboxText}>Dark mode</span>
                    </label>
                    <small style={styles.hint}>Use dark theme</small>
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="language" style={styles.label}>
                      Language
                    </label>
                    <select
                      id="language"
                      value={preferences.language}
                      onChange={(e) =>
                        setPreferences({ ...preferences, language: e.target.value })
                      }
                      style={styles.select}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    style={styles.button}
                    disabled={loading}
                    aria-busy={loading}
                  >
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </button>
                </form>
              </section>

              <section style={styles.card} aria-labelledby="security-section">
                <h2 id="security-section" style={styles.cardTitle}>Security</h2>
                <div style={styles.securityContent}>
                  <div style={styles.securityItem}>
                    <div>
                      <h3 style={styles.securityItemTitle}>Change Password</h3>
                      <p style={styles.securityItemText}>
                        Update your password to keep your account secure
                      </p>
                    </div>
                    <button style={styles.buttonSecondary}>Change</button>
                  </div>

                  <div style={styles.securityItem}>
                    <div>
                      <h3 style={styles.securityItemTitle}>Two-Factor Authentication</h3>
                      <p style={styles.securityItemText}>
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <button style={styles.buttonSecondary}>Enable</button>
                  </div>

                  <div style={styles.securityItem}>
                    <div>
                      <h3 style={styles.securityItemTitle}>Active Sessions</h3>
                      <p style={styles.securityItemText}>
                        Manage your active sessions across devices
                      </p>
                    </div>
                    <button style={styles.buttonSecondary}>View</button>
                  </div>
                </div>
              </section>
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
    maxWidth: '1200px',
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
  message: {
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '2rem',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '2rem',
  },
  card: {
    background: 'rgba(30, 41, 59, 0.8)',
    borderRadius: '12px',
    padding: '2rem',
    border: '1px solid rgba(148, 163, 184, 0.2)',
  },
  cardTitle: {
    fontSize: '1.5rem',
    marginBottom: '1.5rem',
    color: '#e2e8f0',
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
  select: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #475569',
    background: 'rgba(15, 23, 42, 0.8)',
    color: '#e2e8f0',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  checkbox: {
    cursor: 'pointer',
    width: '1.25rem',
    height: '1.25rem',
  },
  checkboxText: {
    color: '#cbd5e1',
    fontSize: '0.95rem',
  },
  hint: {
    color: '#94a3b8',
    fontSize: '0.85rem',
    marginTop: '0.25rem',
    marginLeft: '1.75rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
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
  buttonSecondary: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: '1px solid #475569',
    background: 'rgba(51, 65, 85, 0.8)',
    color: '#e2e8f0',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  securityContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  securityItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: 'rgba(15, 23, 42, 0.5)',
    borderRadius: '8px',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    gap: '1rem',
  },
  securityItemTitle: {
    fontSize: '1rem',
    marginBottom: '0.25rem',
    color: '#e2e8f0',
  },
  securityItemText: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    margin: 0,
  },
};
