export default function InterestTag({ label, selected, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 18px',
        borderRadius: 12,
        border: selected ? '1px solid #3B6FFF' : '1px solid #1E2A45',
        background: selected ? 'rgba(59,111,255,0.2)' : 'rgba(255,255,255,0.03)',
        color: selected ? '#fff' : '#94A3B8',
        fontSize: 14,
        fontWeight: selected ? 600 : 400,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => {
        if (!selected) {
          e.currentTarget.style.borderColor = '#3B6FFF';
          e.currentTarget.style.color = '#fff';
        }
      }}
      onMouseLeave={e => {
        if (!selected) {
          e.currentTarget.style.borderColor = '#1E2A45';
          e.currentTarget.style.color = '#94A3B8';
        }
      }}
    >
      {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
      <span>{label}</span>
      {selected && (
        <span style={{
          width: 16, height: 16, borderRadius: '50%',
          background: '#3B6FFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, color: '#fff', fontWeight: 700,
        }}>✓</span>
      )}
    </button>
  );
}
