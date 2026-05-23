import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { organizerAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function OrganizerSuggestionsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [suggestions, setSuggestions] = useState([]);
  const [threshold, setThreshold] = useState(10);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);

  useEffect(() => {
    organizerAPI.getThresholdSuggestions()
      .then(r => { setSuggestions(r.data.suggestions || []); setThreshold(r.data.threshold || 10); })
      .catch(() => toast.error('Error', 'Could not load suggestions'))
      .finally(() => setLoading(false));
  }, []);

  const handleClaim = async (id) => {
    setClaiming(id);
    try {
      const r = await organizerAPI.claimSuggestion(id);
      toast.success('Claimed!', 'A draft event has been created. Fill in the details.');
      setSuggestions(prev => prev.filter(s => s.id !== id));
      if (r.data.draftEventId) navigate('/organizer/events');
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Could not claim suggestion');
    }
    setClaiming(null);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar placeholder="Search suggestions..." />
        <div style={{ padding: 28, flex: 1 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Suggestions Board</h1>
            <p style={{ fontSize: 13, color: '#64748B' }}>
              Ideas that reached {threshold}+ upvotes from students. Claim one to turn it into an event!
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>Loading...</div>
          ) : suggestions.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💡</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>No trending suggestions yet</h3>
              <p style={{ fontSize: 13, color: '#64748B' }}>Suggestions appear here once they reach {threshold} upvotes from students</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
              {suggestions.map(s => (
                <div key={s.id} className="card" style={{ position: 'relative', border: '1px solid rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.05)' }}>
                  <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    <span className="badge badge-gold" style={{ fontSize: 10 }}>🔥 TRENDING</span>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4, paddingRight: 80 }}>{s.title}</div>
                    {s.category && <span className="badge badge-blue" style={{ fontSize: 10 }}>{s.category}</span>}
                  </div>
                  {s.description && <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6, marginBottom: 12 }}>{s.description}</p>}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 12, color: '#64748B' }}>
                    <span>👤 {s.suggester_name}</span>
                    {s.preferred_date && <span>📅 {new Date(s.preferred_date).toLocaleDateString()}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 18, color: '#A855F7' }}>▲</span>
                      <span style={{ fontSize: 20, fontWeight: 800, color: '#A855F7' }}>{s.upvote_count}</span>
                      <span style={{ fontSize: 12, color: '#64748B' }}>upvotes</span>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => handleClaim(s.id)} disabled={claiming === s.id}
                      style={{ background: 'linear-gradient(135deg,#A855F7,#6B46C1)', border: 'none' }}>
                      {claiming === s.id ? 'Claiming...' : '🎯 Claim This Idea'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
