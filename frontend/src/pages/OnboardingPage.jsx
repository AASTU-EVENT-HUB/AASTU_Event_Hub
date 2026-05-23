import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const INTERESTS = [
  { label: 'Artificial Intelligence', icon: '', desc: 'Machine learning, Neural networks, and LLMs' },
  { label: 'Robotics', icon: '', desc: 'Mechatronics, Automation, and Hardware design' },
  { label: 'Software Dev', icon: '', desc: 'Fullstack architecture, DevOps, and Cloud' },
  { label: 'Digital Arts', icon: '', desc: 'UI/UX design, Creative coding, and VR Art' },
  { label: 'Startups', icon: '', desc: 'Venture capital, Pitching, and Product management' },
  { label: 'Cybersecurity', icon: '', desc: 'Ethical hacking, Cryptography, and Security' },
  { label: 'Biotech', icon: '', desc: 'Genomics, Bio-engineering, and more' },
  { label: 'Aerospace', icon: '', desc: 'Orbital mechanics, Propulsion, and more' },
  { label: 'FinTech', icon: '', desc: 'Blockchain, Algorithmic trading, and more' },
  { label: 'Hackathons', icon: '', desc: 'Competitive coding and innovation' },
  { label: 'Workshops', icon: '', desc: 'Hands-on learning sessions' },
  { label: 'Cultural', icon: '', desc: 'Arts, music, and cultural events' },
];

export default function OnboardingPage() {
  const { completeOnboarding, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const filtered = INTERESTS.filter(i =>
    i.label.toLowerCase().includes(search.toLowerCase()) ||
    i.desc.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (label) =>
    setSelected(s => s.includes(label) ? s.filter(x => x !== label) : [...s, label]);

  const finish = async (interests) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    completeOnboarding(interests);
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F2C', display: 'flex' }}>
      {/* Left panel */}
      <div style={{
        width: 260, background: '#0D1224', borderRight: '1px solid #1E2A45',
        padding: '40px 24px', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#3B6FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎓</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>AASTU Events Hub</span>
        </div>

        {/* Progress */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ position: 'relative', width: 90, height: 90, margin: '0 auto 12px' }}>
            <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="45" cy="45" r="38" fill="none" stroke="#1E2A45" strokeWidth="7" />
              <circle cx="45" cy="45" r="38" fill="none" stroke="#3B6FFF" strokeWidth="7"
                strokeDasharray={`${2 * Math.PI * 38}`}
                strokeDashoffset={`${2 * Math.PI * 38 * (1 - selected.length / INTERESTS.length)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.4s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff' }}>
              {selected.length}
            </div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 4 }}>INTERESTS SELECTED</div>
          <div style={{ fontSize: 12, color: '#64748B' }}>Pick at least 1 to personalize your feed</div>
        </div>

        {selected.length > 0 && (
          <div>
            <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Your picks</div>
            {selected.slice(0, 6).map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: 12, color: '#94A3B8' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B6FFF', flexShrink: 0 }} />
                {item}
              </div>
            ))}
            {selected.length > 6 && <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>+{selected.length - 6} more</div>}
          </div>
        )}
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#64748B' }}>Welcome, {user?.name?.split(' ')[0]} 👋</span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Tailor your experience</h1>
        <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 28 }}>
          Pick the topics you care about. We'll use these to recommend events you'll actually want to attend.
        </p>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 24, maxWidth: 440 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}>🔍</span>
          <input type="text" placeholder="Search interests..." value={search}
            onChange={e => setSearch(e.target.value)} className="form-input"
            style={{ paddingLeft: 40, borderRadius: 12 }} />
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 40 }}>
          {filtered.map(interest => {
            const active = selected.includes(interest.label);
            return (
              <button key={interest.label} onClick={() => toggle(interest.label)} style={{
                background: active ? 'rgba(59,111,255,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${active ? '#3B6FFF' : '#1E2A45'}`,
                borderRadius: 12, padding: '14px 16px', textAlign: 'left',
                cursor: 'pointer', transition: 'all 0.15s', position: 'relative',
              }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = '#3B6FFF'; e.currentTarget.style.background = 'rgba(59,111,255,0.08)'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = '#1E2A45'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; } }}
              >
                {active && (
                  <div style={{ position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: '50%', background: '#3B6FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700 }}>✓</div>
                )}
                <div style={{ fontSize: 20, marginBottom: 6 }}>{interest.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{interest.label}</div>
                <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5 }}>{interest.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 560 }}>
          <button style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 13, cursor: 'pointer' }}
            onClick={() => finish([])}>
            Skip for now
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {selected.length > 0 && <span style={{ fontSize: 12, color: '#3B6FFF' }}>{selected.length} selected</span>}
            <button className="btn btn-primary" onClick={() => finish(selected)} disabled={loading} style={{ borderRadius: 10, minWidth: 140 }}>
              {loading ? 'Saving...' : selected.length > 0 ? 'Save & Continue →' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
