import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { organizerAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

function Stars({ rating, size = 14 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: size, color: i <= rating ? '#F5A623' : '#1E2A45' }}>★</span>
      ))}
    </div>
  );
}

export default function OrganizerFeedbackPage() {
  const toast = useToast();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    organizerAPI.getFeedback()
      .then(r => {
        const data = r.data.feedback || [];
        setFeedback(data);
        if (data.length > 0) setSelected(data[0].eventId);
      })
      .catch(() => toast.error('Error', 'Could not load feedback'))
      .finally(() => setLoading(false));
  }, []);

  const selectedEvent = feedback.find(f => f.eventId === selected);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar placeholder="Search feedback..." />
        <div style={{ padding: 28, flex: 1 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Feedback & Reviews</h1>
            <p style={{ fontSize: 13, color: '#64748B' }}>See what attendees think about your events</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>Loading...</div>
          ) : feedback.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>No feedback yet</h3>
              <p style={{ fontSize: 13, color: '#64748B' }}>Feedback appears after students attend and review your events</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
              {/* Event list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {feedback.map(f => (
                  <button key={f.eventId} onClick={() => setSelected(f.eventId)} style={{
                    padding: '14px 16px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                    background: selected === f.eventId ? 'rgba(59,111,255,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selected === f.eventId ? '#3B6FFF' : '#1E2A45'}`,
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 6 }}>{f.eventTitle}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Stars rating={Math.round(parseFloat(f.avgRating))} size={12} />
                      <span style={{ fontSize: 12, color: '#F5A623', fontWeight: 700 }}>{f.avgRating}</span>
                      <span style={{ fontSize: 11, color: '#64748B' }}>({f.reviews.length} reviews)</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Reviews */}
              <div>
                {selectedEvent && (
                  <>
                    <div className="card" style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 48, fontWeight: 900, color: '#F5A623', lineHeight: 1 }}>{selectedEvent.avgRating}</div>
                          <Stars rating={Math.round(parseFloat(selectedEvent.avgRating))} size={18} />
                          <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{selectedEvent.reviews.length} reviews</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          {[5,4,3,2,1].map(star => {
                            const count = selectedEvent.reviews.filter(r => r.rating === star).length;
                            const pct = selectedEvent.reviews.length > 0 ? (count / selectedEvent.reviews.length) * 100 : 0;
                            return (
                              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 11, color: '#64748B', width: 8 }}>{star}</span>
                                <span style={{ fontSize: 11, color: '#F5A623' }}>★</span>
                                <div className="progress-bar" style={{ flex: 1 }}>
                                  <div style={{ height: '100%', width: `${pct}%`, background: '#F5A623', borderRadius: 3, transition: 'width 0.5s' }} />
                                </div>
                                <span style={{ fontSize: 11, color: '#64748B', width: 20 }}>{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {selectedEvent.reviews.map(r => (
                        <div key={r.id} className="card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#3B6FFF,#6B46C1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
                                {r.reviewerName?.charAt(0)}
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{r.reviewerName}</div>
                                <Stars rating={r.rating} size={12} />
                              </div>
                            </div>
                            <span style={{ fontSize: 11, color: '#64748B' }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</span>
                          </div>
                          {r.review && <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>{r.review}</p>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
