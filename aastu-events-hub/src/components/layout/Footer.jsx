import { Link } from 'react-router-dom';
import Logo from '../Logo';

export default function Footer() {
  return (
    <footer style={{
      background: '#0A0F2C',
      borderTop: '2px solid #3B6FFF',
      padding: '48px 0 24px',
      marginTop: 'auto',
    }}>
      <div className="container">
        {/* Top row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 32, marginBottom: 40 }}>
          {/* Brand */}
          <div>
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 12 }}>
              <Logo size={36} showText />
            </Link>
            <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.7, marginBottom: 16 }}>
              Empowering the next generation of Ethiopian technical leaders.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['📘', '🐦', '📸', '💼'].map((icon, i) => (
                <a key={i} href="#" style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid #1E2A45',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, textDecoration: 'none', transition: 'border-color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#3B6FFF'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#1E2A45'}
                >{icon}</a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Platform</div>
            {[
              { label: 'Browse Events', to: '/events' },
              { label: 'Student Dashboard', to: '/dashboard' },
              { label: 'Admin Portal', to: '/admin' },
              { label: 'Create Account', to: '/signup' },
              { label: 'Sign In', to: '/login' },
            ].map(item => (
              <Link key={item.label} to={item.to} style={{
                display: 'block', fontSize: 13, color: '#64748B',
                textDecoration: 'none', marginBottom: 8, transition: 'color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
              >{item.label}</Link>
            ))}
          </div>

          {/* Resources */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Resources</div>
            {[
              { label: 'Help Center', to: '/help' },
              { label: 'Privacy Policy', to: '/privacy' },
              { label: 'Terms of Service', to: '/terms' },
              { label: 'Contact Support', href: 'mailto:support@aastu.edu.et' },
            ].map(item => (
              item.href ? (
                <a key={item.label} href={item.href} style={{
                  display: 'block', fontSize: 13, color: '#64748B',
                  textDecoration: 'none', marginBottom: 8, transition: 'color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
                >{item.label}</a>
              ) : (
                <Link key={item.label} to={item.to} style={{
                  display: 'block', fontSize: 13, color: '#64748B',
                  textDecoration: 'none', marginBottom: 8, transition: 'color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
                >{item.label}</Link>
              )
            ))}
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Contact</div>
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 8 }}>
              📧 <a href="mailto:support@aastu.edu.et" style={{ color: '#3B6FFF', textDecoration: 'none' }}>support@aastu.edu.et</a>
            </div>
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 8 }}>📍 Addis Ababa, Ethiopia</div>
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>🏛 AASTU Campus</div>
            <div style={{
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 8, padding: '8px 12px', fontSize: 12,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
              <span style={{ color: '#22C55E', fontWeight: 600 }}>All systems operational</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#1E2A45', marginBottom: 20 }} />

        {/* Bottom row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: '#64748B' }}>
            © 2024 Addis Ababa Science and Technology University. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link to="/privacy" style={{ fontSize: 12, color: '#64748B', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
            >Privacy Policy</Link>
            <Link to="/terms" style={{ fontSize: 12, color: '#64748B', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
            >Terms of Service</Link>
            <a href="mailto:support@aastu.edu.et" style={{ fontSize: 12, color: '#64748B', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
            >Contact Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
