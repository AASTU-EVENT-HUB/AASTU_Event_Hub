import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import TeamMemberSlot from '../components/TeamMemberSlot';
import { MOCK_EVENTS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function TeamRegistrationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const event = MOCK_EVENTS.find(e => e.id === id) || MOCK_EVENTS[0];
  const [screen, setScreen] = useState('formation'); // 'formation' | 'dashboard'
  const [mode, setMode] = useState(null); // 'create' | 'join'
  const [teamName, setTeamName] = useState('');
  const [teamSize, setTeamSize] = useState(4);
  const [joinCode, setJoinCode] = useState('');
  const [team, setTeam] = useState(null);

  const handleCreate = () => {
    if (!teamName.trim()) { toast.warning('Team name required', ''); return; }
    const code = 'TEAM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setTeam({
      name: teamName,
      code,
      maxSize: teamSize,
      members: [
        { id: user?.id, name: user?.name || 'You', department: user?.department || 'CS', status: 'confirmed', isLead: true },
      ],
    });
    setScreen('dashboard');
    toast.success('Team created!', `Share code: ${code}`);
  };

  const handleJoin = () => {
    if (!joinCode.trim()) { toast.warning('Enter a team code', ''); return; }
    setTeam({
      name: 'Innovation Squad',
      code: joinCode.toUpperCase(),
      maxSize: 4,
      members: [
        { id: 'lead', name: 'Tigist Alemu', department: 'Software Engineering', status: 'confirmed', isLead: true },
        { id: user?.id, name: user?.name || 'You', department: user?.department || 'CS', status: 'confirmed' },
      ],
    });
    setScreen('dashboard');
    toast.success('Joined team!', 'You are now a member');
  };

  const handleSubmit = () => {
    if (team.members.length < 2) {
      toast.warning('Need at least 2 members', 'Invite more teammates first');
      return;
    }
    toast.success('Team submitted!', 'Your team registration is confirmed');
    navigate(`/events/${id}/register`);
  };

  if (screen === 'dashboard' && team) {
    const emptySlots = Array(team.maxSize - team.members.length).fill(null);
    const fillPct = Math.round((team.members.length / team.maxSize) * 100);
    const canSubmit = team.members.length >= 2;

    return (
      <div style={{ minHeight: '100vh', background: '#0A0F2C' }}>
        <PublicNavbar />
        <div className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 640 }}>
          {/* Team header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', flex: 1 }}>{team.name}</h1>
            <button style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 16 }}>✏</button>
          </div>

          {/* Team code */}
          <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Team Code</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'monospace', letterSpacing: 2 }}>
                {team.code}
              </div>
            </div>
            <button
              className="btn btn-outline btn-sm"
              style={{ marginLeft: 'auto' }}
              onClick={() => { navigator.clipboard.writeText(team.code); toast.success('Copied!', ''); }}
            >
              Copy Code
            </button>
          </div>

          {/* Members */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Team Members</h3>
              <div style={{ fontSize: 13, color: '#94A3B8' }}>
                {team.members.length}/{team.maxSize} Members
              </div>
            </div>

            {/* Progress */}
            <div style={{ marginBottom: 16 }}>
              <div className="progress-bar">
                <div className="progress-fill progress-fill-blue" style={{ width: `${fillPct}%` }} />
              </div>
              <div style={{ fontSize: 12, color: canSubmit ? '#22C55E' : '#64748B', marginTop: 4 }}>
                {canSubmit ? '✓ Ready to Submit' : `Need ${2 - team.members.length} more member(s)`}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {team.members.map(member => (
                <TeamMemberSlot key={member.id} member={member} isLead={member.isLead} />
              ))}
              {emptySlots.map((_, i) => (
                <TeamMemberSlot key={`empty-${i}`} member={null} />
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            className="btn btn-gold btn-full btn-lg"
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{ borderRadius: 12 }}
          >
            Submit Team →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F2C' }}>
      <PublicNavbar />
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span className="badge badge-blue" style={{ marginBottom: 12 }}>{event.category}</span>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 8 }}>
            Team Registration
          </h1>
          <p style={{ fontSize: 14, color: '#64748B' }}>{event.title}</p>
        </div>

        {/* Formation cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 700, margin: '0 auto 40px' }}>
          {/* Create */}
          <div className="card" style={{
            border: mode === 'create' ? '1px solid #3B6FFF' : '1px solid #1E2A45',
            background: mode === 'create' ? 'rgba(59,111,255,0.08)' : '#111827',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🚀</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Create a Team</h3>
              <p style={{ fontSize: 13, color: '#64748B' }}>Start a new team and invite members</p>
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Team Name</label>
              <input
                className="form-input"
                placeholder="e.g. Innovation Squad"
                value={teamName}
                onChange={e => { setTeamName(e.target.value); setMode('create'); }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Team Size (2–6)</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[2, 3, 4, 5, 6].map(n => (
                  <button
                    key={n}
                    onClick={() => { setTeamSize(n); setMode('create'); }}
                    style={{
                      flex: 1, padding: '8px 0',
                      background: teamSize === n ? '#3B6FFF' : 'transparent',
                      border: `1px solid ${teamSize === n ? '#3B6FFF' : '#1E2A45'}`,
                      borderRadius: 8, color: teamSize === n ? '#fff' : '#94A3B8',
                      fontSize: 13, cursor: 'pointer',
                    }}
                  >{n}</button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary btn-full" onClick={handleCreate}>
              Create Team
            </button>
          </div>

          {/* Join */}
          <div className="card" style={{
            border: mode === 'join' ? '1px solid #3B6FFF' : '1px solid #1E2A45',
            background: mode === 'join' ? 'rgba(59,111,255,0.08)' : '#111827',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🤝</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Join a Team</h3>
              <p style={{ fontSize: 13, color: '#64748B' }}>Enter a team code to join</p>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Team Code</label>
              <input
                className="form-input"
                placeholder="e.g. TEAM-ABC123"
                value={joinCode}
                onChange={e => { setJoinCode(e.target.value); setMode('join'); }}
                style={{ fontFamily: 'monospace', letterSpacing: 1, textTransform: 'uppercase' }}
              />
            </div>

            <button className="btn btn-outline btn-full" onClick={handleJoin}>
              Join Team
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="card" style={{ maxWidth: 700, margin: '0 auto' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 14 }}>
            💡 What makes a great team?
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { icon: '', title: 'Diverse Skills', desc: 'Mix of frontend, backend, and design expertise' },
              { icon: '', title: 'Clear Roles', desc: 'Define responsibilities before the event starts' },
              { icon: '', title: 'Good Communication', desc: 'Stay in sync with regular check-ins' },
            ].map(tip => (
              <div key={tip.title} style={{ textAlign: 'center', padding: '12px 8px' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{tip.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{tip.title}</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>{tip.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
