import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function OrganizerSettingsPage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user?.name || '', department: user?.department || '' });

  const handleSave = () => {
    updateUser(form);
    toast.success('Saved', 'Profile updated');
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div style={{ padding: 28, flex: 1, maxWidth: 600 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 24 }}>Organizer Settings</h1>

          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Profile</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Department / Club</label>
                <input className="form-input" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={user?.email || ''} readOnly style={{ opacity: 0.6 }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>Save Changes</button>
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(59,111,255,0.05)', border: '1px solid rgba(59,111,255,0.2)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#3B6FFF', marginBottom: 8 }}>🎯 Organizer Status</div>
            <div style={{ fontSize: 13, color: '#94A3B8' }}>
              Your account has organizer privileges. You can create events, manage registrations, and do check-ins for your events.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
