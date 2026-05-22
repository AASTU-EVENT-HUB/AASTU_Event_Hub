// Skeleton loading states for cards, tables, and lists

export function SkeletonCard() {
  return (
    <div style={{
      background: '#111827', border: '1px solid #1E2A45',
      borderRadius: 16, overflow: 'hidden',
    }}>
      <div className="skeleton" style={{ height: 180 }} />
      <div style={{ padding: '18px 20px' }}>
        <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 10, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 8, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 16, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 6, width: '100%', marginBottom: 12, borderRadius: 3 }} />
        <div className="skeleton" style={{ height: 36, width: '100%', borderRadius: 10 }} />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '14px 16px', borderBottom: '1px solid #1E2A45', alignItems: 'center' }}>
      <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 13, width: '50%', marginBottom: 6, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 11, width: '30%', borderRadius: 6 }} />
      </div>
      <div className="skeleton" style={{ height: 24, width: 60, borderRadius: 12 }} />
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="card">
      <div className="skeleton" style={{ height: 11, width: '60%', marginBottom: 12, borderRadius: 6 }} />
      <div className="skeleton" style={{ height: 32, width: '40%', marginBottom: 6, borderRadius: 6 }} />
      <div className="skeleton" style={{ height: 11, width: '50%', borderRadius: 6 }} />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #1E2A45' }}>
        <div className="skeleton" style={{ height: 14, width: 200, borderRadius: 6 }} />
      </div>
      {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} />)}
    </div>
  );
}

// Page-level loading spinner
export function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0A0F2C', flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, border: '3px solid #1E2A45',
        borderTopColor: '#3B6FFF', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <div style={{ fontSize: 14, color: '#64748B' }}>Loading...</div>
    </div>
  );
}
