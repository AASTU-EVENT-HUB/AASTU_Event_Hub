import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { feedbackAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

function Stars({ rating }) {
  return <span style={{ color: '#F5A623', fontSize: 13 }}>{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>;
}

export default function AdminFeedbackPage() {
  const toast = useToast();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    feedbackAPI.getAdmin()
      .then(r => setFeedback(r.data.feedback || []))
      .catch(() => toast.error('Error', 'Could not load feedback'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleHide = async (id) => {
    try {
      await feedbackAPI.hide(id);
      setFeedback(prev => prev.map(f => f.id === id ? { ...f, is_visible: 0 } : f));
      toast.success('Hidden', 'Feedback hidden from public view');
    } catch { toast.error('Error', 'Could not hide feedback'); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar placeholder="Search feedback..." />
        <div style={{ padding: 28, flex: 1 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Feedback Moderation</h1>
            <p style={{ fontSize: 13, color: '#64748B' }}>All event feedback across the platform</p>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Reviewer</th><th>Event</th><th>Rating</th><th>Review</th><th>Visible</th><th>Actions</th></tr></thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748B', padding: 40 }}>Loading...</td></tr>
                  ) : feedback.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748B', padding: 40 }}>No feedback yet</td></tr>
                  ) : feedback.map(f => (
                    <tr key={f.id} style={{ opacity: f.is_visible ? 1 : 0.5 }}>
                      <td style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{f.reviewer_name}</td>
                      <td style={{ fontSize: 12, color: '#94A3B8' }}>{f.event_title}</td>
                      <td><Stars rating={f.rating} /></td>
                      <td style={{ fontSize: 12, color: '#94A3B8', maxWidth: 240 }}>
                        {f.review ? `"${f.review.slice(0, 80)}${f.review.length > 80 ? '...' : ''}"` : <span style={{ color: '#64748B' }}>No written review</span>}
                      </td>
                      <td>
                        <span className={`badge ${f.is_visible ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 10 }}>
                          {f.is_visible ? 'VISIBLE' : 'HIDDEN'}
                        </span>
                      </td>
                      <td>
                        {f.is_visible ? (
                          <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', padding: '4px 10px', fontSize: 11 }}
                            onClick={() => handleHide(f.id)}>Hide</button>
                        ) : (
                          <span style={{ fontSize: 11, color: '#64748B' }}>Hidden</span>
                        )}
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
