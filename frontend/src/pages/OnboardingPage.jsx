import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InterestTag from '../components/InterestTag';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const INTERESTS = [
  { label: 'Artificial Intelligence', icon: '🤖', desc: 'Machine learning, Neural networks, and LLMs' },
  { label: 'Robotics', icon: '🦾', desc: 'Mechatronics, Automation, and Hardware design' },
  { label: 'Software Dev', icon: '💻', desc: 'Fullstack architecture, DevOps, and Cloud' },
  { label: 'Digital Arts', icon: '🎨', desc: 'UI/UX design, Creative coding, and VR Art' },
  { label: 'Startups', icon: '🚀', desc: 'Venture capital, Pitching, and Product management' },
  { label: 'Cybersecurity', icon: '🔐', desc: 'Ethical hacking, Cryptography, and Security' },
  { label: 'Biotech', icon: '🧬', desc: 'Genomics, Bio-engineering, and...' },
  { label: 'Aerospace', icon: '🛸', desc: 'Orbital mechanics, Propulsion, and...' },
  { label: 'FinTech', icon: '💰', desc: 'Blockchain, Algorithmic trades...' },
  { label: 'Hackathons', icon: '⚡', desc: 'Competitive coding and innovation' },
  { label: 'Workshops', icon: '🔧', desc: 'Hands-on learning sessions' },
  { label: 'Cultural', icon: '🎭', desc: 'Arts, music, and cultural events' },
];

const STEPS = ['Profile', 'Interests', 'Events', 'Review'];

export default function OnboardingPage() {
  const { completeOnboarding, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentlyAdded] = useState(['Quantum Computing', 'Green Engineering']);

  const progress = Math.round((selected.length / INTERESTS.length) * 100);

  const filtered = INTERESTS.filter(i =>
    i.label.toLowerCase().includes(search.toLowerCase()) ||
    i.desc.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (label) => {
    setSelected(s => s.includes(label) ? s.filter(x => x !== label) : [...s, label]);
  };

  const handleContinue = async () => {
    if (selected.length === 0) {
      toast.warning('Select at least one interest', 'This helps us recommend events for you');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    completeOnboarding(selected);
    setLoading(false);
    toast.success('Interests saved!', 'Your feed is being personalized');
    navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0F2C',
      display: 'flex',
    }}>
      {/* Left panel — progress */}
      <div style={{
        width: 280,
        background: '#0D1224',
        borderRight: '1px solid #1E2A45',
        padding: '40px 28px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: '#3B6FFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>🎓</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>TECH INSTITUTE</span>
        </div>

        {/* Progress circle */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 12px' }}>
            <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="42" fill="none" stroke="#1E2A45" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="#3B6FFF" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 800, color: '#fff',
            }}>
              {progress}%
            </div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>ONBOARDING PROGRESS</div>
          <div style={{ fontSize: 12, color: '#64748B' }}>
            Great start! Complete your interests to find relevant academic events.
          </div>
        </div>

        {/* Recently added */}
        <div>
          <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
            Recently Added
          </div>
          {[...recentlyAdded, ...selected.slice(0, 3)].slice(0, 5).map(item => (
            <div key={item} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 0', fontSize: 13, color: '#94A3B8',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B6FFF', flexShrink: 0 }} />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — content */}
      <div style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40 }}>
          {STEPS.map((step, i) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: i === 1 ? '#3B6FFF' : i < 1 ? '#22C55E' : '#1E2A45',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff',
                }}>
                  {i < 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 12, color: i === 1 ? '#fff' : '#64748B', fontWeight: i === 1 ? 600 : 400 }}>
                  {step}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 40, height: 1, background: '#1E2A45', margin: '0 8px' }} />
              )}
            </div>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: 12, color: '#64748B' }}>Step 2 of 4</div>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 8 }}>
          Tailor your experience
        </h1>
        <p style={{ fontSize: 15, color: '#94A3B8', marginBottom: 28 }}>
          Select the topics and disciplines you're interested in. This helps us curate workshops and conferences specifically for you.
        </p>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 24, maxWidth: 480 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}>🔍</span>
          <input
            type="text"
            placeholder="Search for technologies, departments, or clubs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 40, borderRadius: 12 }}
          />
        </div>

        {/* Interest grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 12,
          marginBottom: 40,
        }}>
          {filtered.map(interest => (
            <button
              key={interest.label}
              onClick={() => toggle(interest.label)}
              style={{
                background: selected.includes(interest.label) ? 'rgba(59,111,255,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selected.includes(interest.label) ? '#3B6FFF' : '#1E2A45'}`,
                borderRadius: 12,
                padding: '16px 18px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!selected.includes(interest.label)) {
                  e.currentTarget.style.borderColor = '#3B6FFF';
                  e.currentTarget.style.background = 'rgba(59,111,255,0.08)';
                }
              }}
              onMouseLeave={e => {
                if (!selected.includes(interest.label)) {
                  e.currentTarget.style.borderColor = '#1E2A45';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }
              }}
            >
              {selected.includes(interest.label) && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#3B6FFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: '#fff', fontWeight: 700,
                }}>✓</div>
              )}
              <div style={{ fontSize: 22, marginBottom: 8 }}>{interest.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{interest.label}</div>
              <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>{interest.desc}</div>
            </button>
          ))}
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 600 }}>
          <button
            style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 13, cursor: 'pointer' }}
            onClick={() => { completeOnboarding([]); navigate('/dashboard'); }}
          >
            ← Back
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {selected.length > 0 && (
              <span style={{ fontSize: 12, color: '#3B6FFF' }}>{selected.length} selected</span>
            )}
            <button
              className="btn btn-primary"
              onClick={handleContinue}
              disabled={loading}
              style={{ borderRadius: 10, minWidth: 120 }}
            >
              {loading ? 'Saving...' : 'Continue →'}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <button
            style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 12, cursor: 'pointer' }}
            onClick={() => { completeOnboarding([]); navigate('/dashboard'); }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
