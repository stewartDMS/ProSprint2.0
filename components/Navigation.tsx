import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navigation() {
  const router = useRouter();
  const currentPath = router.pathname;

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Business Data', href: '/business-data' },
    { label: 'Integrations', href: '/integrations' },
    { label: 'Settings', href: '/settings' },
    { label: 'Login', href: '/login' },
  ];

  return (
    <nav style={styles.nav} role="navigation" aria-label="Main navigation">
      <div style={styles.container}>
        <div style={styles.brand}>
          <Link href="/" style={styles.brandLink}>
            ProSprint 2.0
          </Link>
        </div>
        <ul style={styles.navList}>
          {navItems.map((item) => (
            <li key={item.href} style={styles.navItem}>
              <Link
                href={item.href}
                style={{
                  ...styles.navLink,
                  ...(currentPath === item.href ? styles.navLinkActive : {}),
                }}
                aria-current={currentPath === item.href ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  nav: {
    background: 'rgba(30, 41, 59, 0.95)',
    borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
    padding: '1rem 0',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    backdropFilter: 'blur(8px)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  brand: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  brandLink: {
    textDecoration: 'none',
    background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  navList: {
    display: 'flex',
    listStyle: 'none',
    gap: '0.5rem',
    margin: 0,
    padding: 0,
    flexWrap: 'wrap',
  },
  navItem: {
    margin: 0,
  },
  navLink: {
    textDecoration: 'none',
    color: '#cbd5e1',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    transition: 'all 0.2s',
    display: 'block',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  navLinkActive: {
    background: 'rgba(96, 165, 250, 0.15)',
    color: '#60a5fa',
  },
};
