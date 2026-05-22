import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { useToast } from '../../context/ToastContext';

const TEAM_MEMBERS = [
  { id: 1, name: 'Alex Thompson', role: 'Lead Coordinator', status: 'online', isLead: true, avatar: 'https://i.pravatar.cc/48?img=1' },
  { id: 2, name: 'Sarah Jenkins', role: 'Logistics Manager', status: 'online', isLead: false, avatar: 'https://i.pravatar.cc/48?img=5' },
  { id: 3, name: 'David Chen', role: 'Tech Support', status: 'offline', isLead: false, avatar: 'https://i.pravatar.cc/48?img=3' },
];

const PENDING_INVITATIONS = [
  { email: 'marcus.v@aastu.edu.et', expires: 'EXPIRES IN 1 DAY' },
  { email: 'sophia.t@aastu.edu.et', expires: 'EXPIRES IN 6:00:00' },
];

const TEAM_ACTIVITY = [
  { text: 'You sent an invitation to marcus.v@aastu.edu.et', time: 'TODAY, 2:45 PM', color: '#3B6FFF', icon: '▶' },
  { text: 'Sarah Jenkins joined the team via invitation link.', sub: 'Role assigned: Logistics Manager', time: 'YESTERDAY, 11:25 AM', color: '#F5A623', icon: '⚡' },
  { text: 'David Chen submitted the Tech Specs v2.4 for the Annual Gala event.', time: 'OCT 12, 4:30 PM', color: '#94A3B8', icon: '⚡' },
  { text: 'Team permissions were updated by System Admin.', time: 'OCT 10, 9:00 AM', color: '#64748B', icon: '⚙' },
];

export default function AdminTeamPage() {
  const toast = useToast();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [members, setMembers] = useState(TEAM_MEMBERS);

  const handleInvite = () => {
    if (!inviteEmail) return;
    toast.success('Invitation sent!', `Invite sent to ${inviteEmail}`);
    setInviteEmail('');
    setShowInvite(false);
  };

  return (
    <div className="app-layout">
      <Sidebar isAdmin />
      <div className="main-content">
        <Topbar placeholder="Search team or activity..." />

        <div style={{ padding: '28px', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 4 }}>Team Collaboration Hub</h1>
              <p style={{ fontSize: 13, color: '#64748B' }}>Manage your event organizers and track real-time contributions.</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowInvite(true)}>
              👥+ Invite Members
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
            {/* Left */}
            <div>
              {/* Your Team */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 16 }}>👥</span>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Your Team</h3>
                  <span style={{
                    background: 'rgba(59,111,255,0.2)', color: '#3B6FFF',
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                  }}>
                    {members.length} MEMBERS
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {members.map(member => (
                    <div key={member.id} style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid #1E2A45',
                      borderRadius: 12,
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                    }}>
                      <div style={{ position: 'relative' }}>
                        <img src={member.avatar} alt={member.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} />
                        <div style={{
                          position: 'absolute', bottom: 0, right: 0,
                          width: 10, height: 10, borderRadius: '50%',
                          background: member.status === 'online' ? '#22C55E' : '#64748B',
                          border: '2px solid #111827',
                        }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{member.name}</div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>{member.role}</div>
                      </div>
                      <span style={{
                        background: member.isLead ? 'rgba(59,111,255,0.2)' : 'rgba(255,255,255,0.08)',
                        border: `1px solid ${member.isLead ? 'rgba(59,111,255,0.4)' : '#1E2A45'}`,
                        color: member.isLead ? '#3B6FFF' : '#94A3B8',
                        fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                        textTransform: 'uppercase',
                      }}>
                        {member.isLead ? 'LEADER' : 'MEMBER'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Invitations */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span>⏳</span>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Pending Invitations</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {PENDING_INVITATIONS.map(inv => (
                    <div key={inv.email} style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid #1E2A45',
                      borderRadius: 10,
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: '#1E2A45',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16,
                      }}>✉</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: '#fff' }}>{inv.email}</div>
                        <div style={{ fontSize: 11, color: '#EF4444' }}>{inv.expires}</div>
                      </div>
                      <button style={{
                        background: 'none', border: '1px solid #1E2A45',
                        borderRadius: 6, padding: '4px 10px',
                        color: '#94A3B8', fontSize: 12, cursor: 'pointer',
                      }}>
                        Withdraw
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Team Activity */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <span>🔄</span>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Team Activity</h3>
              </div>

              <div style={{ position: 'relative', paddingLeft: 20 }}>
                <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: '#1E2A45' }} />
                {TEAM_ACTIVITY.map((item, i) => (
                  <div key={i} style={{ position: 'relative', marginBottom: 20 }}>
                    <div style={{
                      position: 'absolute', left: -20, top: 2,
                      width: 14, height: 14, borderRadius: '50%',
                      background: item.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 7, color: '#fff',
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5, marginBottom: 2 }}>
                      {item.text}
                    </div>
                    {item.sub && (
                      <div style={{
                        background: '#1E2A45', borderRadius: 6, padding: '4px 8px',
                        fontSize: 11, color: '#64748B', marginBottom: 4, display: 'inline-block',
                      }}>
                        {item.sub}
                      </div>
                    )}
                    <div style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>

              <button style={{ background: 'none', border: 'none', color: '#3B6FFF', fontSize: 13, cursor: 'pointer', marginTop: 8 }}>
                View Full Audit Log →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="modal-overlay" onClick={() => setShowInvite(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 className="modal-title">Invite Team Member</h3>
              <button className="modal-close" onClick={() => setShowInvite(false)}>×</button>
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">University Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="colleague@aastu.edu.et"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setShowInvite(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleInvite}>Send Invitation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
