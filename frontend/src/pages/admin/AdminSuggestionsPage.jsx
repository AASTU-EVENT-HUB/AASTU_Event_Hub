import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { suggestionsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminSuggestionsPage() {
  const toast = useToast();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    suggestionsAPI.getAll()
      .then(r => setSuggestions(r.data.suggestions || []))
      .catch(() => toast.error('Error', 'Could not load suggestions'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this suggestion?')) return;
    try {
      await suggestionsAPI.delete(id);
      setSuggestions(prev => prev.filter(s => s.id !== id));
      toast.success('Deleted', 'Suggestion removed');
    } catch { toast.error('Error', 'Could not delete'); }
  };

  const STATUS_BADGE = { open: 'badge-blue', claimed: 'badge-amber', converted: 'badge-green' };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar placeholder="Search suggestions..." />
        <div style={{ padding: 28, flex: 1 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Suggestions</h1>
            <p style={{ fontSize: 13, color: '#64748B' }}>All student event suggestions across the platform</p>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Title</th><th>Category</th><th>Suggested By</th><th>Upvotes</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748B', padding: 40 }}>Loading...</td></tr>
                  ) : suggestions.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748B', padding: 40 }}>No suggestions yet</td></tr>
                  ) : suggestions.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{s.title}</div>
                        {s.description && <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{s.description?.slice(0, 60)}...</div>}
                      </td>
                      <td>{s.category ? <span className="badge badge-blue" style={{ fontSize: 10 }}>{s.category}</span> : '—'}</td>
                      <td style={{ fontSize: 13, color: '#94A3B8' }}>{s.suggester_name}</td>
                      <td>
                        <span style={{ fontSize: 14, fontWeight: 700, color: s.upvote_count >= 10 ? '#A855F7' : '#94A3B8' }}>
                          ▲ {s.upvote_count}
                        </span>
                      </td>
                      <td><span className={`badge ${STATUS_BADGE[s.status] || 'badge-gray'}`} style={{ fontSize: 10 }}>{s.status?.toUpperCase()}</span></td>
                      <td>
                        <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', padding: '4px 10px', fontSize: 11 }}
                          onClick={() => handleDelete(s.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
