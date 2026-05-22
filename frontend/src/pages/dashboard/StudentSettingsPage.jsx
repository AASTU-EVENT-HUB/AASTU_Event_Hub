import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CATEGORIES, DEPARTMENTS } from '../../data/mockData';

const TABS = ['Profile', 'Security', 'Notifications', 'Interests', 'Attendance History', 'Account'];

export default function StudentSettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Profile');
  const [deleteModal, setDeleteModal] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar placeholder="Settings..." />

        <div style={{ padding: '28px', flex: 1 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Settings</h1>
            <p style={{ fontSize: 13, color: '#64748B' }}>Manage your profile, security, and preferences</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'start' }}>
            {/* Tab sidebar */}
            <div className="card" style={{ padding: '8px' }}>
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    background: activeTab === tab ? 'rgba(59,111,255,0.15)' : 'none',
                    border: activeTab === tab ? '1px solid rgba(59,111,255,0.3)' : '1px solid transparent',
                    color: activeTab === tab ? '#fff' : '#94A3B8',
                    fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
                    cursor: 'pointer', textAlign: 'left', marginBottom: 2,
                  }}
                >
                  {tab === 'Profile' && '👤'}
                  {tab === 'Security' && '🔒'}
                  {tab === 'Notifications' && '🔔'}
                  {tab === 'Interests' && '✨'}
                  {tab === 'Attendance History' && '📅'}
                  {tab === 'Account' && '⚙'}
                  <span style={{ marginLeft: 4 }}>{tab}</span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div>
              {activeTab === 'Profile' && <ProfileTab user={user} updateUser={updateUser} toast={toast} />}
              {activeTab === 'Security' && <SecurityTab toast={toast} />}
              {activeTab === 'Notifications' && <NotificationsTab />}
              {activeTab === 'Interests' && <InterestsTab user={user} updateUser={updateUser} toast={toast} />}
              {activeTab === 'Attendance History' && <AttendanceTab navigate={navigate} />}
              {activeTab === 'Account' && <AccountTab user={user} logout={logout} navigate={navigate} setDeleteModal={setDeleteModal} />}
            </div>
          </div>
        </div>
      </div>

      {/* Delete account confirmation modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Delete Account?</h3>
              <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8, lineHeight: 1.6 }}>
                This action is <strong style={{ color: '#EF4444' }}>permanent and irreversible</strong>. All your event history, earned badges, QR tickets, and profile data will be permanently deleted.
              </p>
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#EF4444' }}>
                ⚠ This is a mock action — no data will be deleted until backend is connected.
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setDeleteModal(false)}>Cancel</button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    setDeleteModal(false);
                    toast.info('Request submitted', 'Account deletion request has been logged (mock)');
                  }}
                >
                  Delete My Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab({ user, updateUser, toast }) {
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    name: user?.name || '',
    studentId: user?.studentId || '',
    department: user?.department || '',
    bio: user?.bio || '',
  });
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [saving, setSaving] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/gif', 'image/png'].includes(file.type)) {
      toast.error('Invalid file', 'Only JPG, GIF, and PNG are allowed');
      return;
    }
    if (file.size > 500 * 1024) {
      toast.error('File too large', 'Maximum size is 500KB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatar(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Required', 'Name cannot be empty'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    updateUser({ ...form, avatar });
    setSaving(false);
    toast.success('Profile updated', 'Your changes have been saved');
  };

  const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div>
      {/* Avatar */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
          {avatar ? (
            <img src={avatar} alt="Avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #1E2A45' }} />
          ) : (
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, #3B6FFF, #6B46C1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 700, color: '#fff', border: '3px solid #1E2A45',
            }}>{initials}</div>
          )}
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 26, height: 26, borderRadius: '50%',
            background: '#3B6FFF', border: '2px solid #111827',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: '#fff',
          }}>✏</div>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Profile Picture</div>
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>JPG, GIF or PNG. Max 500KB.</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline btn-sm" onClick={() => fileRef.current?.click()}>Upload Now</button>
            {avatar && <button className="btn btn-sm" style={{ background: 'none', border: '1px solid #EF4444', color: '#EF4444' }} onClick={() => setAvatar(null)}>Remove</button>}
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/gif,image/png" style={{ display: 'none' }} onChange={handleAvatarChange} />
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
          </div>
          <div className="form-group">
            <label className="form-label">Student ID</label>
            <input className="form-input" value={form.studentId} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            <span className="form-hint" style={{ color: '#F5A623' }}>Contact admin to change your ID</span>
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Department</label>
          <select className="form-select" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
            <option value="">Select department</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea
            className="form-input"
            rows={4}
            maxLength={300}
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            placeholder="Tell others about yourself..."
            style={{ resize: 'vertical' }}
          />
          <span className="form-hint">{form.bio.length}/300 characters</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn btn-outline btn-sm" onClick={() => setForm({ name: user?.name || '', studentId: user?.studentId || '', department: user?.department || '', bio: user?.bio || '' })}>
          Cancel
        </button>
        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
          {saving ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Saving...
            </span>
          ) : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// ── Security Tab ──────────────────────────────────────────────────────────────
function SecurityTab({ toast }) {
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.current) { toast.error('Required', 'Enter your current password'); return; }
    if (form.newPass.length < 8) { toast.error('Too short', 'New password must be at least 8 characters'); return; }
    if (form.newPass !== form.confirm) { toast.error('Mismatch', 'Passwords do not match'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setForm({ current: '', newPass: '', confirm: '' });
    toast.success('Password changed', 'Your password has been updated');
  };

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Change Password</h3>
      <form onSubmit={handleSave}>
        <div className="form-group" style={{ marginBottom: 14 }}>
          <label className="form-label">Current Password</label>
          <input type={show ? 'text' : 'password'} className="form-input" value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} placeholder="Your current password" />
        </div>
        <div className="form-group" style={{ marginBottom: 14 }}>
          <label className="form-label">New Password</label>
          <input type={show ? 'text' : 'password'} className="form-input" value={form.newPass} onChange={e => setForm(f => ({ ...f, newPass: e.target.value }))} placeholder="At least 8 characters" />
        </div>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Confirm New Password</label>
          <input
            type={show ? 'text' : 'password'}
            className={`form-input ${form.confirm && form.confirm !== form.newPass ? 'error' : ''}`}
            value={form.confirm}
            onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
            placeholder="Repeat new password"
          />
          {form.confirm && form.confirm !== form.newPass && <span className="form-error">Passwords do not match</span>}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94A3B8', cursor: 'pointer', marginBottom: 20 }}>
          <input type="checkbox" checked={show} onChange={e => setShow(e.target.checked)} style={{ accentColor: '#3B6FFF' }} />
          Show passwords
        </label>
        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
          {saving ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}

// ── Notifications Tab ─────────────────────────────────────────────────────────
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    eventReminders: true,
    waitlistUpdates: true,
    newEvents: false,
    weeklyDigest: true,
  });

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const items = [
    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive all notifications via email' },
    { key: 'eventReminders', label: 'Event Reminders', desc: '24-hour reminder before events you\'re registered for' },
    { key: 'waitlistUpdates', label: 'Waitlist Updates', desc: 'Notify me when a spot opens on my waitlisted events' },
    { key: 'newEvents', label: 'New Event Alerts', desc: 'Get notified when new events matching your interests are posted' },
    { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'A weekly summary of upcoming events and your activity' },
  ];

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Notification Preferences</h3>
      {items.map((item, i) => (
        <div key={item.key} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 0',
          borderBottom: i < items.length - 1 ? '1px solid #1E2A45' : 'none',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 12, color: '#64748B' }}>{item.desc}</div>
          </div>
          {/* Toggle switch */}
          <div
            onClick={() => toggle(item.key)}
            style={{
              width: 44, height: 24, borderRadius: 12,
              background: prefs[item.key] ? '#3B6FFF' : '#1E2A45',
              position: 'relative', cursor: 'pointer', flexShrink: 0,
              transition: 'background 0.2s',
            }}
          >
            <div style={{
              position: 'absolute', top: 3,
              left: prefs[item.key] ? 23 : 3,
              width: 18, height: 18, borderRadius: '50%',
              background: '#fff', transition: 'left 0.2s',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Interests Tab ─────────────────────────────────────────────────────────────
function InterestsTab({ user, updateUser, toast }) {
  const [selected, setSelected] = useState(user?.interests || []);

  const toggle = (cat) => {
    setSelected(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const handleSave = () => {
    updateUser({ interests: selected });
    toast.success('Interests updated', 'Your recommendations will be refreshed');
  };

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Your Interests</h3>
      <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>
        Select the categories you're interested in. We'll use these to recommend events.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => toggle(cat)}
            style={{
              padding: '8px 16px', borderRadius: 20,
              background: selected.includes(cat) ? 'rgba(59,111,255,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selected.includes(cat) ? '#3B6FFF' : '#2A3A55'}`,
              color: selected.includes(cat) ? '#fff' : '#94A3B8',
              fontSize: 13, cursor: 'pointer', fontWeight: selected.includes(cat) ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            {selected.includes(cat) ? '✓ ' : ''}{cat}
          </button>
        ))}
      </div>
      <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={selected.length === 0}>
        Save Interests ({selected.length} selected)
      </button>
    </div>
  );
}

// ── Attendance History Tab ────────────────────────────────────────────────────
function AttendanceTab({ navigate }) {
  const { MOCK_EVENTS, MOCK_REGISTRATIONS } = require('../../data/mockData');
  const attended = MOCK_REGISTRATIONS.filter(r => r.status === 'attended');

  return (
    <div className="card">
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Attendance History</h3>
      {attended.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {attended.map(r => {
            const event = MOCK_EVENTS.find(e => e.id === r.eventId);
            if (!event) return null;
            return (
              <div
                key={r.eventId}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: '#0D1224', borderRadius: 10, border: '1px solid #1E2A45', cursor: 'pointer' }}
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <img src={event.banner} alt={event.title} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{event.title}</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    📅 {new Date(event.startDate).toLocaleDateString()} · 📍 {event.location}
                  </div>
                </div>
                <span className="badge badge-green" style={{ fontSize: 10 }}>ATTENDED</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
          <p>No attended events yet</p>
        </div>
      )}
    </div>
  );
}

// ── Account Tab ───────────────────────────────────────────────────────────────
function AccountTab({ user, logout, navigate, setDeleteModal }) {
  return (
    <div style={{ maxWidth: 480 }}>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Account Information</h3>
        {[
          { label: 'Email', value: user?.email },
          { label: 'Role', value: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) },
          { label: 'Student ID', value: user?.studentId || '—' },
          { label: 'Department', value: user?.department || '—' },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1E2A45', fontSize: 13 }}>
            <span style={{ color: '#64748B' }}>{row.label}</span>
            <span style={{ color: '#fff', fontWeight: 500 }}>{row.value}</span>
          </div>
        ))}
        <button
          className="btn btn-outline btn-full btn-sm"
          style={{ marginTop: 16 }}
          onClick={() => { logout(); navigate('/login'); }}
        >
          ↪ Sign Out
        </button>
      </div>

      {/* Danger zone */}
      <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Danger Zone</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12, lineHeight: 1.6 }}>
              Deleting your account is permanent. All your event history, earned badges, and ticket records will be wiped.
            </div>
            <button
              className="btn btn-sm"
              style={{ background: 'none', border: '1px solid #EF4444', color: '#EF4444' }}
              onClick={() => setDeleteModal(true)}
            >
              Delete My Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
