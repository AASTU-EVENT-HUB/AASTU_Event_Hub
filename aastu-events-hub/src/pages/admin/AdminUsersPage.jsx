import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { useToast } from '../../context/ToastContext';

const MOCK_USERS = [
  { id: 'u1', name: 'Selam Balcha', email: 'selam@aastu.edu.et', studentId: 'AAU-2021-CS-042', department: 'Computer Science', role: 'student', status: 'active', joinedAt: 'Sep 1, 2021', eventsAttended: 24, avatar: 'https://i.pravatar.cc/40?img=1' },
  { id: 'u2', name: 'Henok Tadesse', email: 'henok@aastu.edu.et', studentId: 'AAU-2020-SE-018', department: 'Software Engineering', role: 'student', status: 'active', joinedAt: 'Sep 1, 2020', eventsAttended: 18, avatar: 'https://i.pravatar.cc/40?img=3' },
  { id: 'u3', name: 'Dr. Abebe Bekele', email: 'abebe@aastu.edu.et', studentId: 'FAC-001', department: 'Mechatronics', role: 'organizer', status: 'active', joinedAt: 'Jan 15, 2019', eventsAttended: 0, avatar: 'https://i.pravatar.cc/40?img=5' },
  { id: 'u4', name: 'Tigist Alemu', email: 'tigist@aastu.edu.et', studentId: 'AAU-2022-EE-031', department: 'Electrical Engineering', role: 'student', status: 'active', joinedAt: 'Sep 1, 2022', eventsAttended: 12, avatar: 'https://i.pravatar.cc/40?img=7' },
  { id: 'u5', name: 'Dawit Bekele', email: 'dawit@aastu.edu.et', studentId: 'AAU-2021-ME-055', department: 'Mechanical Engineering', role: 'student', status: 'suspended', joinedAt: 'Sep 1, 2021', eventsAttended: 5, avatar: 'https://i.pravatar.cc/40?img=9' },
  { id: 'u6', name: 'Sara Haile', email: 'sara@aastu.edu.et', studentId: 'AAU-2023-CS-012', department: 'Computer Science', role: 'student', status: 'active', joinedAt: 'Sep 1, 2023', eventsAttended: 3, avatar: 'https://i.pravatar.cc/40?img=11' },
  { id: 'u7', name: 'Mekdes A.', email: 'admin@aastu.edu.et', studentId: 'ADM-001', department: 'Administration', role: 'admin', status: 'active', joinedAt: 'Jan 1, 2020', eventsAttended: 0, avatar: 'https://i.pravatar.cc/40?img=13' },
];

const ROLE_CONFIG = {
  student: { color: '#3B6FFF', bg: 'rgba(59,111,255,0.15)', label: 'Student' },
  organizer: { color: '#F5A623', bg: 'rgba(245,166,35,0.15)', label: 'Organizer' },
  admin: { color: '#EF4444', bg: 'rgba(239,68,68,0.15)', label: 'Admin' },
};

export default function AdminUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.studentId.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const handleRoleChange = (userId, newRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    toast.success('Role updated', `User role changed to ${newRole}`);
    setSelectedUser(prev => prev ? { ...prev, role: newRole } : null);
  };

  const handleToggleStatus = (userId) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u));
    const user = users.find(u => u.id === userId);
    toast.success(user?.status === 'active' ? 'Account suspended' : 'Account reactivated', user?.name);
    setConfirmAction(null);
    setSelectedUser(prev => prev ? { ...prev, status: prev.status === 'active' ? 'suspended' : 'active' } : null);
  };

  return (
    <div className="app-layout">
      <Sidebar isAdmin />
      <div className="main-content">
        <Topbar placeholder="Search users..." />

        <div style={{ padding: '28px', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>User Management</h1>
              <p style={{ fontSize: 13, color: '#64748B' }}>{users.length} total users · {users.filter(u => u.status === 'active').length} active</p>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: 13 }}>🔍</span>
              <input
                className="form-input"
                placeholder="Search by name, email, or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 36 }}
              />
            </div>
            <select className="form-select" value={filterRole} onChange={e => setFilterRole(e.target.value)} style={{ width: 'auto' }}>
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="organizer">Organizers</option>
              <option value="admin">Admins</option>
            </select>
            <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 'auto' }}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1fr 340px' : '1fr', gap: 20 }}>
            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Student ID</th>
                      <th>Department</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Events</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => {
                      const rc = ROLE_CONFIG[u.role];
                      return (
                        <tr
                          key={u.id}
                          style={{ cursor: 'pointer', background: selectedUser?.id === u.id ? 'rgba(59,111,255,0.05)' : 'transparent' }}
                          onClick={() => setSelectedUser(u.id === selectedUser?.id ? null : u)}
                        >
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <img src={u.avatar} alt={u.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{u.name}</div>
                                <div style={{ fontSize: 11, color: '#64748B' }}>{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: 12, fontFamily: 'monospace', color: '#94A3B8' }}>{u.studentId}</td>
                          <td style={{ fontSize: 12, color: '#94A3B8' }}>{u.department}</td>
                          <td>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: rc.bg, color: rc.color }}>
                              {rc.label}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 10 }}>
                              {u.status === 'active' ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{u.eventsAttended}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                className="btn btn-sm"
                                style={{ background: 'rgba(59,111,255,0.15)', border: '1px solid rgba(59,111,255,0.3)', color: '#3B6FFF', padding: '4px 8px', fontSize: 11 }}
                                onClick={e => { e.stopPropagation(); setSelectedUser(u); }}
                              >View</button>
                              <button
                                className="btn btn-sm"
                                style={{
                                  background: u.status === 'active' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                                  border: `1px solid ${u.status === 'active' ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                                  color: u.status === 'active' ? '#EF4444' : '#22C55E',
                                  padding: '4px 8px', fontSize: 11,
                                }}
                                onClick={e => { e.stopPropagation(); setConfirmAction(u); }}
                              >
                                {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748B', fontSize: 14 }}>
                  No users match your search
                </div>
              )}
            </div>

            {/* User detail panel */}
            {selectedUser && (
              <div style={{ position: 'sticky', top: 80 }}>
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>User Details</h3>
                    <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 18 }}>×</button>
                  </div>

                  {/* Avatar */}
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <img src={selectedUser.avatar} alt={selectedUser.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid #1E2A45', marginBottom: 8 }} />
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{selectedUser.name}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>{selectedUser.email}</div>
                  </div>

                  {/* Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    {[
                      { label: 'Student ID', value: selectedUser.studentId },
                      { label: 'Department', value: selectedUser.department },
                      { label: 'Joined', value: selectedUser.joinedAt },
                      { label: 'Events Attended', value: selectedUser.eventsAttended },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: '#64748B' }}>{row.label}</span>
                        <span style={{ color: '#fff', fontWeight: 500 }}>{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Role change */}
                  <div style={{ marginBottom: 14 }}>
                    <label className="form-label">Change Role</label>
                    <select
                      className="form-select"
                      value={selectedUser.role}
                      onChange={e => handleRoleChange(selectedUser.id, e.target.value)}
                    >
                      <option value="student">Student</option>
                      <option value="organizer">Organizer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {/* Status toggle */}
                  <button
                    className={`btn btn-full btn-sm ${selectedUser.status === 'active' ? 'btn-danger' : 'btn-primary'}`}
                    onClick={() => setConfirmAction(selectedUser)}
                    style={{ background: selectedUser.status === 'active' ? '#EF4444' : '#22C55E', borderColor: selectedUser.status === 'active' ? '#EF4444' : '#22C55E' }}
                  >
                    {selectedUser.status === 'active' ? '🚫 Suspend Account' : '✓ Reactivate Account'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm action modal */}
      {confirmAction && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>
                {confirmAction.status === 'active' ? '🚫' : '✓'}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                {confirmAction.status === 'active' ? 'Suspend Account?' : 'Reactivate Account?'}
              </h3>
              <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 24 }}>
                {confirmAction.status === 'active'
                  ? `${confirmAction.name} will lose access to the platform until reactivated.`
                  : `${confirmAction.name} will regain full access to the platform.`}
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setConfirmAction(null)}>Cancel</button>
                <button
                  className="btn btn-sm"
                  style={{ background: confirmAction.status === 'active' ? '#EF4444' : '#22C55E', color: '#fff', border: 'none' }}
                  onClick={() => handleToggleStatus(confirmAction.id)}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
