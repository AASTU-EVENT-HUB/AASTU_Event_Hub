import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { useToast } from '../../context/ToastContext';
import { usersAPI } from '../../services/api';

const ROLE_CONFIG = {
  student: { color: '#3B6FFF', bg: 'rgba(59,111,255,0.15)', label: 'Student' },
  organizer: { color: '#F5A623', bg: 'rgba(245,166,35,0.15)', label: 'Organizer' },
  admin: { color: '#EF4444', bg: 'rgba(239,68,68,0.15)', label: 'Admin' },
};

export default function AdminUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', studentId: '', department: '', role: 'student', password: '' });

  const loadUsers = async () => {
    try {
      const res = await usersAPI.getAll({ search, role: filterRole });
      setUsers(res.data.users || []);
    } catch {
      toast.error('Load failed', 'Could not load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  // Re-filter client-side for instant search feedback
  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.studentId?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const handleRoleChange = async (userId, newRole) => {
    try {
      await usersAPI.updateRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setSelectedUser(prev => prev ? { ...prev, role: newRole } : null);
      toast.success('Role updated', `User role changed to ${newRole}`);
    } catch {
      toast.error('Update failed', 'Could not update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await usersAPI.delete(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setConfirmAction(null);
      setSelectedUser(null);
      toast.success('User deleted', 'User account removed');
    } catch {
      toast.error('Delete failed', 'Could not delete user');
    }
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
              <p style={{ fontSize: 13, color: '#64748B' }}>
                {loading ? 'Loading...' : `${users.length} total users`}
              </p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={loadUsers}>↻ Refresh</button>
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
              <option value="admin">Admins</option>
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
                      <th>Events</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => {
                      const rc = ROLE_CONFIG[u.role] || ROLE_CONFIG.student;
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
                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', padding: '4px 8px', fontSize: 11 }}
                                onClick={e => { e.stopPropagation(); setConfirmAction(u); }}
                              >Delete</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {!loading && filtered.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748B', fontSize: 14 }}>
                  {users.length === 0 ? 'No users registered yet' : 'No users match your search'}
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

                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <img src={selectedUser.avatar} alt={selectedUser.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid #1E2A45', marginBottom: 8 }} />
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{selectedUser.name}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>{selectedUser.email}</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    {[
                      { label: 'Student ID', value: selectedUser.studentId },
                      { label: 'Department', value: selectedUser.department },
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
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <button
                    className="btn btn-full btn-sm"
                    style={{ background: '#EF4444', borderColor: '#EF4444', color: '#fff' }}
                    onClick={() => setConfirmAction(selectedUser)}
                  >
                    🗑 Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm delete modal */}
      {confirmAction && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗑</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Delete Account?</h3>
              <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 24 }}>
                {confirmAction.name}'s account and all their registrations will be permanently deleted.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setConfirmAction(null)}>Cancel</button>
                <button
                  className="btn btn-sm"
                  style={{ background: '#EF4444', color: '#fff', border: 'none' }}
                  onClick={() => handleDeleteUser(confirmAction.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
