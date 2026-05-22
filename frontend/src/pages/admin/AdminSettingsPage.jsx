import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DEPARTMENTS } from '../../data/mockData';

const SETTINGS_TABS = ['Profile', 'Security', 'Notifications', 'Interests', 'Attendance History', 'Account'];

export default function AdminSettingsPage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('Profile');
  const [form, setForm] = useState({
    name: user?.name || '',
    studentId: user?.studentId || 'TI-8842-2023',
    department: user?.department || 'Computer Science & AI',
    bio: user?.bio || '',
  });

  const handleSave = () => {
    updateUser(form);
    toast.success('Settings saved', 'Your profile has been updated');
  };

  return (
    <div className="app-layout">
      <Sidebar isAdmin={user?.role === 'admin'} />
      <div className="main-content">
        <Topbar placeholder="Search events, settings..." />

        <div style={{ padding: '28px', flex: 1, display: 'flex', gap: 24 }}>
          {/* Settings sidebar */}
          <div style={{
            width: 200, minWidth: 200,
            background: '#0D1224',
            border: '1px solid #1E2A45',
            borderRadius: 16,
            padding: '16px 12px',
            height: 'fit-content',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 12, padding: '0 8px' }}>
              User Settings
            </div>
            {SETTINGS_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '9px 12px',
                  background: activeTab === tab ? 'rgba(59,111,255,0.2)' : 'none',
                  border: activeTab === tab ? '1px solid rgba(59,111,255,0.3)' : '1px solid transparent',
                  borderRadius: 8, color: activeTab === tab ? '#fff' : '#94A3B8',
                  fontSize: 13, cursor: 'pointer', textAlign: 'left',
                  marginBottom: 2,
                }}
              >
                <span style={{ fontSize: 14 }}>
                  {tab === 'Profile' ? '👤' : tab === 'Security' ? '🛡' : tab === 'Notifications' ? '🔔' : tab === 'Interests' ? '❤' : tab === 'Attendance History' ? '🕐' : '👥'}
                </span>
                {tab}
              </button>
            ))}
          </div>

          {/* Main content */}
          <div style={{ flex: 1 }}>
            {activeTab === 'Profile' && (
              <div style={{ maxWidth: 600 }}>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 4 }}>Profile Settings</h1>
                <p style={{ fontSize: 13, color: '#64748B', marginBottom: 28 }}>
                  Manage your public information and university credentials.
                </p>

                {/* Avatar */}
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3B6FFF, #6B46C1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 28, fontWeight: 700, color: '#fff',
                    }}>
                      {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 22, height: 22, borderRadius: '50%',
                      background: '#3B6FFF', border: '2px solid #111827',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: '#fff', cursor: 'pointer',
                    }}>✏</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Profile Picture</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>
                      JPG, GIF or PNG. Max size of 800K. This will be visible on your event tickets and attendee lists.
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline btn-sm">Upload New</button>
                      <button className="btn btn-sm" style={{ background: 'none', border: '1px solid #EF4444', color: '#EF4444' }}>Remove</button>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ marginBottom: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Student ID</label>
                      <input className="form-input" value={form.studentId} readOnly style={{ opacity: 0.6 }} />
                      <span className="form-hint" style={{ color: '#F5A623' }}>Contact Admin to change ID</span>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label">Department</label>
                    <select className="form-select" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                      {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea
                      className="form-input"
                      rows={4}
                      value={form.bio}
                      onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 24 }}>
                  <button className="btn btn-outline btn-sm">Cancel</button>
                  <button className="btn btn-primary btn-sm" onClick={handleSave}>Save Changes</button>
                </div>

                {/* Danger zone */}
                <div style={{
                  background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 12, padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <span style={{ fontSize: 20 }}>⚠</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>Danger Zone</div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>
                      Deleting your account is permanent. All your event history, earned badges, and ticket records will be wiped from the Tech Institute servers.
                    </div>
                  </div>
                  <button className="btn btn-sm" style={{ background: 'none', border: '1px solid #EF4444', color: '#EF4444', flexShrink: 0 }}>
                    Delete My Account
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'Security' && (
              <div style={{ maxWidth: 500 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 24 }}>Security Settings</h2>
                <div className="card" style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Change Password</h3>
                  {['Current Password', 'New Password', 'Confirm New Password'].map(label => (
                    <div key={label} className="form-group" style={{ marginBottom: 12 }}>
                      <label className="form-label">{label}</label>
                      <input type="password" className="form-input" placeholder="••••••••" />
                    </div>
                  ))}
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 4 }}>Update Password</button>
                </div>
                <div className="card">
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Two-Factor Authentication</h3>
                  <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 14 }}>Add an extra layer of security to your account.</p>
                  <button className="btn btn-outline btn-sm">Enable 2FA</button>
                </div>
              </div>
            )}

            {activeTab !== 'Profile' && activeTab !== 'Security' && (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🚧</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{activeTab}</h3>
                <p style={{ fontSize: 13, color: '#64748B' }}>This section is coming soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
