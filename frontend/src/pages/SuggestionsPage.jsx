import { useState, useEffect } from 'react';
import PublicNavbar from '../components/layout/PublicNavbar';
import Footer from '../components/layout/Footer';
import { suggestionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CATEGORIES } from '../data/mockData';

function Stars({ count, size = 13 }) {
  return <span style={{ fontSize: size, color: '#F5A623' }}>{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>;
}

export default function SuggestionsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [voting, setVoting] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: '', preferredDate: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    suggestionsAPI.getAll()
      .then(r => setSuggestions(r.data.suggestions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUpvote = async (id) => {
    if (!user) { toast.error('Sign in required', 'Please sign in to upvote'); return; }
    setVoting(id);
    try {
      const r = await suggestionsAPI.upvote(id);
      setSuggestions(prev => prev.map(s => s.id === id ? {
        ...s,
        upvote_count: r.data.action === 'added' ? s.upvote_count + 1 : s.upvote_count - 1,
        user_has_upvoted: r.data.action === 'added' ? 1 : 0,
      } : s));
    } catch { toast.error('Error', 'Could not update vote'); }
    setVoting(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) { toast.error('Required', 'Title is required'); return; }
    setSubmitting(true);
    try {
      await suggestionsAPI.create(form);
      toast.success('Submitted!', 'Your suggestion has been posted');
      setForm({ title: '', description: '', category: '', preferredDate: '' });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Could not submit suggestion');
    }
    setSubmitting(false);
  };

  const THRESHOLD = 10;
  const trending = suggestions.filter(s => s.upvote_count >= THRESHOLD);
  const regular = suggestions.filter(s => s.upvote_count < THRESHOLD);

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F2C' }}>
      <PublicNavbar />
      <div className="container" style={{ padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 8 }}>💡 Event Suggestions</h1>
            <p style={{ fontSize: 14, color: '#64748B' }}>
              Suggest events you'd like to see. Upvote ideas you love — popular ones get turned into real events!
            </p>
          </div>
          {user && (
            <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
              {showForm ? '✕ Cancel' : '+ Suggest Event'}
            </button>
          )}
        </div>

        {/* Submit form */}
        {showForm && (
          <div className="card" style={{ marginBottom: 32, border: '1px solid rgba(59,111,255,0.3)', background: 'rgba(59,111,255,0.05)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>New Suggestion</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Event Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="What event would you like to see?" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Tell us more about this event idea..." style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Date</label>
                  <input type="date" className="form-input" value={form.preferredDate} onChange={e => setForm(p => ({ ...p, preferredDate: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Suggestion'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>Loading suggestions...</div>
        ) : suggestions.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💡</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>No suggestions yet</h3>
            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Be the first to suggest an event!</p>
            {user && <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Suggest Event</button>}
          </div>
        ) : (
          <>
            {/* Trending */}
            {trending.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  🔥 Trending <span style={{ fontSize: 12, color: '#64748B', fontWeight: 400 }}>({THRESHOLD}+ upvotes)</span>
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
                  {trending.map(s => <SuggestionCard key={s.id} s={s} onUpvote={handleUpvote} voting={voting} user={user} />)}
                </div>
              </div>
            )}

            {/* All suggestions */}
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
                All Suggestions <span style={{ fontSize: 13, color: '#64748B', fontWeight: 400 }}>({suggestions.length})</span>
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
                {regular.map(s => <SuggestionCard key={s.id} s={s} onUpvote={handleUpvote} voting={voting} user={user} />)}
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

function SuggestionCard({ s, onUpvote, voting, user }) {
  const THRESHOLD = 10;
  const isTrending = s.upvote_count >= THRESHOLD;
  const isConverted = s.status === 'converted' || s.status === 'claimed';

  return (
    <div className="card" style={{
      border: `1px solid ${isTrending ? 'rgba(168,85,247,0.3)' : '#1E2A45'}`,
      background: isTrending ? 'rgba(168,85,247,0.05)' : undefined,
      position: 'relative',
    }}>
      {isTrending && (
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <span className="badge badge-gold" style={{ fontSize: 10 }}>🔥 TRENDING</span>
        </div>
      )}
      {isConverted && (
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <span className="badge badge-green" style={{ fontSize: 10 }}>✅ CONVERTED</span>
        </div>
      )}

      <div style={{ marginBottom: 10, paddingRight: isTrending || isConverted ? 90 : 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{s.title}</div>
        {s.category && <span className="badge badge-blue" style={{ fontSize: 10 }}>{s.category}</span>}
      </div>

      {s.description && <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6, marginBottom: 12 }}>{s.description}</p>}

      <div style={{ display: 'flex', gap: 12, marginBottom: 14, fontSize: 12, color: '#64748B' }}>
        <span>👤 {s.suggester_name}</span>
        {s.preferred_date && <span>📅 {new Date(s.preferred_date).toLocaleDateString()}</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => onUpvote(s.id)}
          disabled={voting === s.id || isConverted}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 8,
            background: s.user_has_upvoted ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${s.user_has_upvoted ? '#A855F7' : '#1E2A45'}`,
            color: s.user_has_upvoted ? '#A855F7' : '#94A3B8',
            fontSize: 13, fontWeight: 600, cursor: isConverted ? 'default' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <span style={{ fontSize: 14 }}>▲</span>
          <span>{s.upvote_count}</span>
          <span style={{ fontSize: 11, fontWeight: 400 }}>{s.user_has_upvoted ? 'Upvoted' : 'Upvote'}</span>
        </button>

        {!user && <span style={{ fontSize: 11, color: '#64748B' }}>Sign in to vote</span>}
      </div>
    </div>
  );
}
