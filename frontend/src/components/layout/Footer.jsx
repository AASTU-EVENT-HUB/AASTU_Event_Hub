import { Link } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../Logo';
import HelpCenter from '../HelpCenter';

export default function Footer() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <footer style={{
        background: '#0A0F2C',
        borderTop: '2px solid #3B6FFF',
        padding: '36px 0 20px',
        marginTop: 40,
        position: 'relative',
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
              
            </div>

           

           
            

            {/* Contact */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Contact</div>
              <div style={{ fontSize: 13, color: '#64748B', marginBottom: 8 }}>
                📧 <a href="mailto:azyirga@gmail.com" style={{ color: '#3B6FFF', textDecoration: 'none' }}>azyirga@gmail.com</a>
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
            <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
              © {new Date().getFullYear()} Addis Ababa Science and Technology University. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
                <a key={item} href="#" style={{ fontSize: 12, color: '#64748B', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
                >{item}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {showHelp && <HelpCenter onClose={() => setShowHelp(false)} />}
    </>
  );
}
