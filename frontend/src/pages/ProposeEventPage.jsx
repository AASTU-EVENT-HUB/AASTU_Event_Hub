import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import { CATEGORIES, DEPARTMENTS } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';

const STEPS = ['Basic Info', 'Details', 'Logistics', 'Review'];

export default function ProposeEventPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { addNotification } = useNotifications();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    title: '', category: '', department: '', description: '',
    startDate: '', endDate: '', startTime: '', endTime: '',
    location: '', capacity: '', price: 'Free',
    safetyNotes: '', bannerUrl: '', tags: '',
    isHackathon: false,
  });
  const [errors, setErrors] = useState({});

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.title.trim()) e.title = 'Title is required';
      if (!form.category) e.category = 'Category is required';
      if (!form.department) e.department = 'Department is required';
    }
    if (step === 1) {
      if (!form.description.trim()) e.description = 'Description is required';
    }
    if (step === 2) {
      if (!form.startDate) e.startDate = 'Start date is required';
      if (!form.location.trim()) e.location = 'Location is required';
      if (!form.capacity) e.capacity = 'Capacity is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    toast.success('Proposal Submitted!', 'Your event is under admin review. You\'ll be notified within 1–3 business days.');
    addNotification({ type: 'approval', title: 'Event Submitted', message: `"${form.title}" is now under admin review`, icon: '📋' });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0F2C', display: 'flex', flexDirection: 'column' }}>
        <PublicNavbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <div style={{ textAlign: 'center', maxWidth: 480 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(59,111,255,0.15)', border: '2px solid rgba(59,111,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, margin: '0 auto 20px', animation: 'fadeIn 0.4s ease',
            }}>📋</div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Proposal Submitted!</h1>
            <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 12 }}>
              Your event <strong style={{ color: '#fff' }}>"{form.title}"</strong> is now under admin review.
            </p>
            <div style={{
              background: '#111827', border: '1px solid #1E2A45', borderRadius: 12,
              padding: '16px 20px', marginBottom: 24, textAlign: 'left',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10 }}>What happens next?</div>
              {[
                { step: '1', text: 'Admin reviews your proposal (1–3 business days)', done: false },
                { step: '2', text: 'You receive an approval, rejection, or change request', done: false },
                { step: '3', text: 'Approved events go live on the platform', done: false },
              ].map(item => (
                <div key={item.step} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 13, color: '#94A3B8' }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(59,111,255,0.2)', border: '1px solid rgba(59,111,255,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, color: '#3B6FFF',
                  }}>{item.step}</div>
                  {item.text}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
              <button className="btn btn-outline" onClick={() => navigate('/events')}>Browse Events</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F2C', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />
      <div style={{ flex: 1, padding: '40px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 6 }}>Propose an Event</h1>
            <p style={{ fontSize: 14, color: '#64748B' }}>
              Submit your event for admin review. Approved events are published to the platform.
            </p>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: i < step ? '#22C55E' : i === step ? '#3B6FFF' : '#1E2A45',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 13, color: i === step ? '#fff' : '#64748B', fontWeight: i === step ? 600 : 400, whiteSpace: 'nowrap' }}>
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 1, background: i < step ? '#22C55E' : '#1E2A45', margin: '0 12px' }} />
                )}
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="card">
            {/* STEP 0 — Basic Info */}
            {step === 0 && (
              <div className="fade-in">
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Basic Information</h3>
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Event Title *</label>
                  <input className={`form-input ${errors.title ? 'error' : ''}`} placeholder="e.g. AI & Machine Learning Bootcamp" value={form.title} onChange={e => update('title', e.target.value)} />
                  {errors.title && <span className="form-error">{errors.title}</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className={`form-select ${errors.category ? 'error' : ''}`} value={form.category} onChange={e => update('category', e.target.value)}>
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    {errors.category && <span className="form-error">{errors.category}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <select className={`form-select ${errors.department ? 'error' : ''}`} value={form.department} onChange={e => update('department', e.target.value)}>
                      <option value="">Select department</option>
                      {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                    {errors.department && <span className="form-error">{errors.department}</span>}
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Banner Image URL</label>
                  <input className="form-input" placeholder="https://..." value={form.bannerUrl} onChange={e => update('bannerUrl', e.target.value)} />
                  <span className="form-hint">Paste a direct image URL (Unsplash, etc.)</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Tags</label>
                  <input className="form-input" placeholder="e.g. AI, Workshop, Tech (comma separated)" value={form.tags} onChange={e => update('tags', e.target.value)} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, cursor: 'pointer', fontSize: 13, color: '#94A3B8' }}>
                  <input type="checkbox" checked={form.isHackathon} onChange={e => update('isHackathon', e.target.checked)} style={{ accentColor: '#3B6FFF' }} />
                  This is a hackathon (enables team registration)
                </label>
              </div>
            )}

            {/* STEP 1 — Details */}
            {step === 1 && (
              <div className="fade-in">
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Event Details</h3>
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Description *</label>
                  <textarea
                    className={`form-input ${errors.description ? 'error' : ''}`}
                    rows={5} placeholder="Describe your event in detail. What will attendees learn or experience?"
                    value={form.description} onChange={e => update('description', e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                  {errors.description && <span className="form-error">{errors.description}</span>}
                  <span className="form-hint">{form.description.length}/1000 characters</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Safety Notes</label>
                  <textarea
                    className="form-input" rows={3}
                    placeholder="Any safety requirements, crowd management plans, or special considerations..."
                    value={form.safetyNotes} onChange={e => update('safetyNotes', e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                  <span className="form-hint">Required for events with 200+ expected attendees</span>
                </div>
              </div>
            )}

            {/* STEP 2 — Logistics */}
            {step === 2 && (
              <div className="fade-in">
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Logistics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Start Date *</label>
                    <input type="date" className={`form-input ${errors.startDate ? 'error' : ''}`} value={form.startDate} onChange={e => update('startDate', e.target.value)} />
                    {errors.startDate && <span className="form-error">{errors.startDate}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input type="date" className="form-input" value={form.endDate} onChange={e => update('endDate', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input type="time" className="form-input" value={form.startTime} onChange={e => update('startTime', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <input type="time" className="form-input" value={form.endTime} onChange={e => update('endTime', e.target.value)} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Venue / Location *</label>
                  <input className={`form-input ${errors.location ? 'error' : ''}`} placeholder="e.g. AASTU Tech Hall, Room 302" value={form.location} onChange={e => update('location', e.target.value)} />
                  {errors.location && <span className="form-error">{errors.location}</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Capacity *</label>
                    <input type="number" className={`form-input ${errors.capacity ? 'error' : ''}`} placeholder="Max attendees" value={form.capacity} onChange={e => update('capacity', e.target.value)} min="1" />
                    {errors.capacity && <span className="form-error">{errors.capacity}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Entry Fee</label>
                    <input className="form-input" placeholder="Free or amount in ETB" value={form.price} onChange={e => update('price', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 — Review */}
            {step === 3 && (
              <div className="fade-in">
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Review & Submit</h3>
                <div style={{ background: '#0D1224', border: '1px solid #1E2A45', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
                  {[
                    { label: 'Title', value: form.title },
                    { label: 'Category', value: form.category },
                    { label: 'Department', value: form.department },
                    { label: 'Date', value: form.startDate ? `${form.startDate}${form.endDate ? ` → ${form.endDate}` : ''}` : '—' },
                    { label: 'Location', value: form.location || '—' },
                    { label: 'Capacity', value: form.capacity ? `${form.capacity} attendees` : '—' },
                    { label: 'Entry Fee', value: form.price || 'Free' },
                    { label: 'Hackathon', value: form.isHackathon ? 'Yes' : 'No' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', gap: 12, padding: '6px 0', borderBottom: '1px solid rgba(30,42,69,0.5)', fontSize: 13 }}>
                      <span style={{ color: '#64748B', width: 100, flexShrink: 0 }}>{row.label}</span>
                      <span style={{ color: '#fff' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{
                  background: 'rgba(59,111,255,0.08)', border: '1px solid rgba(59,111,255,0.2)',
                  borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#94A3B8',
                }}>
                  <span style={{ color: '#3B6FFF', fontWeight: 600 }}>ℹ Note: </span>
                  Your event will be reviewed by an admin before going live. This typically takes 1–3 business days.
                </div>
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => step === 0 ? navigate(-1) : setStep(s => s - 1)}
              >
                ← {step === 0 ? 'Cancel' : 'Back'}
              </button>
              {step < STEPS.length - 1 ? (
                <button className="btn btn-primary btn-sm" onClick={handleNext}>
                  Next →
                </button>
              ) : (
                <button className="btn btn-gold btn-sm" onClick={handleSubmit}>
                  Submit for Review →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
