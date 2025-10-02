import { useState } from 'react';
import Head from 'next/head';
import Navigation from '../components/Navigation';

export default function BusinessData() {
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    size: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    description: '',
    yearFounded: '',
    revenue: '',
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
        text: 'Business data saved successfully!',
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <Head>
        <title>Business Data - ProSprint 2.0</title>
        <meta name="description" content="Enter your business information" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={styles.page}>
        <Navigation />
        <main style={styles.main}>
          <div style={styles.container}>
            <header style={styles.header}>
              <h1 style={styles.title}>Business Information</h1>
              <p style={styles.subtitle}>
                Tell us about your business to help us personalize your automation experience
              </p>
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

            <form onSubmit={handleSubmit} style={styles.form} aria-label="Business data form">
              <section style={styles.section} aria-labelledby="basic-info">
                <h2 id="basic-info" style={styles.sectionTitle}>Basic Information</h2>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label htmlFor="businessName" style={styles.label}>
                      Business Name *
                    </label>
                    <input
                      id="businessName"
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      style={styles.input}
                      placeholder="Your Company LLC"
                      required
                      aria-required="true"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="industry" style={styles.label}>
                      Industry *
                    </label>
                    <select
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      style={styles.select}
                      required
                      aria-required="true"
                    >
                      <option value="">Select an industry</option>
                      <option value="technology">Technology</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="finance">Finance</option>
                      <option value="retail">Retail</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="education">Education</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="size" style={styles.label}>
                      Company Size
                    </label>
                    <select
                      id="size"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      style={styles.select}
                    >
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501+">501+ employees</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="website" style={styles.label}>
                      Website
                    </label>
                    <input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      style={styles.input}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="yearFounded" style={styles.label}>
                      Year Founded
                    </label>
                    <input
                      id="yearFounded"
                      type="number"
                      value={formData.yearFounded}
                      onChange={(e) => setFormData({ ...formData, yearFounded: e.target.value })}
                      style={styles.input}
                      placeholder="2020"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="revenue" style={styles.label}>
                      Annual Revenue (USD)
                    </label>
                    <select
                      id="revenue"
                      value={formData.revenue}
                      onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                      style={styles.select}
                    >
                      <option value="">Select range</option>
                      <option value="0-100k">$0 - $100k</option>
                      <option value="100k-500k">$100k - $500k</option>
                      <option value="500k-1m">$500k - $1M</option>
                      <option value="1m-5m">$1M - $5M</option>
                      <option value="5m+">$5M+</option>
                    </select>
                  </div>
                </div>
              </section>

              <section style={styles.section} aria-labelledby="location-info">
                <h2 id="location-info" style={styles.sectionTitle}>Location</h2>
                <div style={styles.formGrid}>
                  <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                    <label htmlFor="address" style={styles.label}>
                      Street Address
                    </label>
                    <input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      style={styles.input}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="city" style={styles.label}>
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      style={styles.input}
                      placeholder="San Francisco"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="state" style={styles.label}>
                      State/Province
                    </label>
                    <input
                      id="state"
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      style={styles.input}
                      placeholder="CA"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="zipCode" style={styles.label}>
                      ZIP/Postal Code
                    </label>
                    <input
                      id="zipCode"
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      style={styles.input}
                      placeholder="94102"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="country" style={styles.label}>
                      Country
                    </label>
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      style={styles.select}
                    >
                      <option value="">Select country</option>
                      <option value="us">United States</option>
                      <option value="ca">Canada</option>
                      <option value="uk">United Kingdom</option>
                      <option value="au">Australia</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </section>

              <section style={styles.section} aria-labelledby="description-info">
                <h2 id="description-info" style={styles.sectionTitle}>Description</h2>
                <div style={styles.formGroup}>
                  <label htmlFor="description" style={styles.label}>
                    Business Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={styles.textarea}
                    placeholder="Tell us about your business, products, and services..."
                    rows={5}
                  />
                  <small style={styles.hint}>
                    This helps us understand your business and provide better automation recommendations
                  </small>
                </div>
              </section>

              <div style={styles.actions}>
                <button
                  type="submit"
                  style={styles.button}
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? 'Saving...' : 'Save Business Data'}
                </button>
              </div>
            </form>
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
    maxWidth: '1000px',
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  section: {
    background: 'rgba(30, 41, 59, 0.8)',
    borderRadius: '12px',
    padding: '2rem',
    border: '1px solid rgba(148, 163, 184, 0.2)',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    marginBottom: '1.5rem',
    color: '#e2e8f0',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
  textarea: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #475569',
    background: 'rgba(15, 23, 42, 0.8)',
    color: '#e2e8f0',
    fontSize: '1rem',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  hint: {
    color: '#94a3b8',
    fontSize: '0.85rem',
    marginTop: '0.5rem',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '1rem',
  },
  button: {
    padding: '0.875rem 2rem',
    borderRadius: '6px',
    border: 'none',
    background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
