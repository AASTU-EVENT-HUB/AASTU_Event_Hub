export default function TeamMemberSlot({ member, onRemove, isLead = false }) {
  if (!member) {
    return (
      <div style={{
        border: '2px dashed #1E2A45',
        borderRadius: 12,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        color: '#64748B',
        fontSize: 13,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '2px dashed #1E2A45',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, color: '#64748B',
        }}>+</div>
        <span>Invite a member</span>
      </div>
    );
  }

  return (
    <div style={{
      background: '#111827',
      border: '1px solid #1E2A45',
      borderRadius: 12,
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'linear-gradient(135deg, #3B6FFF, #6B46C1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0,
        overflow: 'hidden',
      }}>
        {member.avatar
          ? <img src={member.avatar} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : member.name?.charAt(0).toUpperCase()
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
          {member.name}
          {isLead && (
            <span style={{
              fontSize: 10, background: '#3B6FFF', color: '#fff',
              padding: '2px 6px', borderRadius: 4, fontWeight: 700,
            }}>LEAD</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: '#64748B' }}>{member.department}</div>
      </div>

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className={`badge ${member.status === 'confirmed' ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: 10 }}>
          {member.status === 'confirmed' ? 'Confirmed' : 'Pending'}
        </span>
        {onRemove && !isLead && (
          <button
            onClick={onRemove}
            style={{ background: 'none', color: '#64748B', fontSize: 16, padding: 2, cursor: 'pointer', border: 'none' }}
          >×</button>
        )}
      </div>
    </div>
  );
}
