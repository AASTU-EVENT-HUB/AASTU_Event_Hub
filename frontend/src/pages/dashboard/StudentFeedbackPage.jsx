import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { feedbackAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

function Stars({ rating, interactive = false, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i}
          onClick={() => interactive && onSelect?.(i)}
          style={{ fontSize: interactive ? 28 : 16, color: i <= rating ? '#F5A623' : '#1E2A45', cursor: interactive ? 'pointer' : 'default', transition: 'color 0.1s' }}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function StudentFeedbackPage() {
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackForm, setFeedbackForm] = useState(null); // { eventId, title }
  const [form, setForm] = useState({ rating: 0, review: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    feedbackAPI.getMine()
      .then(r => setEvents(r.data.events || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!form.rating) { toast.error('Rating required', 'Please select a star rating'); return; }
    setSubmitting(true);
    try {
      await feedbackAPI.submit({ eventId: feedbackForm.eventId, rating: form.rating, review: form.review });
      toast.success('Feedback submitted!', 'Thank you for your review');
      setFeedbackForm(null);
      setForm({ rating: 0, review: '' });
      load();
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Could not submit feedback');
    }
    setSubmitting(false);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar placeholder="My feedback..." />
        <div style={{ padding: 28, flex: 1 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>My Feedback</h1>
            <p style={{ fontSize: 13, color: '#64748B' }}>Rate events you've attended</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>Loading...</div>
          ) : events.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>No events to review yet</h3>
              <p style={{ fontSize: 13, color: '#64748B' }}>Attend events and get checked in to leave feedback</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {events.map(e => (
                <div key={e.eventId} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {e.banner_image && (
                    <img src={e.banner_image} alt={e.title} style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{e.title}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>
                      {e.end_date ? new Date(e.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {e.feedbackId ? (
                      <div style={{ textAlign: 'right' }}>
                        <Stars rating={e.rating} />
                        <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Reviewed ✓</div>
                      </div>
                    ) : (
                      <button className="btn btn-primary btn-sm"
                        onClick={() => { setFeedbackForm({ eventId: e.eventId, title: e.title }); setForm({ rating: 0, review: '' }); }}>
                        Leave Feedback
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feedback modal */}
      {feedbackForm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 className="modal-title">Rate: {feedbackForm.title}</h3>
              <button className="modal-close" onClick={() => setFeedbackForm(null)}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 10 }}>How would you rate this event?</div>
                <Stars rating={form.rating} interactive onSelect={r => setForm(p => ({ ...p, rating: r }))} />
                {form.rating > 0 && (
                  <div style={{ fontSize: 12, color: '#F5A623', marginTop: 6 }}>
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][form.rating]}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Written Review (optional)</label>
                <textarea className="form-input" rows={4} value={form.review}
                  onChange={e => setForm(p => ({ ...p, review: e.target.value }))}
                  placeholder="Share your experience..." style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setFeedbackForm(null)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={submitting || !form.rating}>
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
