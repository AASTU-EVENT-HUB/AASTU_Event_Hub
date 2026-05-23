import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { CountdownInline } from './CountdownTimer';

// Normalize DB events (snake_case) and mock events (camelCase) to one shape
export function normalizeEvent(e) {
  if (!e) return e;
  return {
    ...e,
    // dates
    startDate: e.startDate || e.start_date || '',
    endDate: e.endDate || e.end_date || '',
    // registration count
    registered: e.registered ?? e.registration_count ?? 0,
    // banner
    banner: e.banner || e.banner_image || '',
    // team event
    isTeamEvent: e.isTeamEvent ?? Boolean(e.is_team_event),
  };
}

// Works with both DB and mock event shapes
export function getEventStatus(rawEvent) {
  const event = normalizeEvent(rawEvent);
  if (!event?.startDate) return 'upcoming';
  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate || event.startDate);
  const diffMs = start - now;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (now > end) return 'ended';
  if (now >= start && now <= end) return 'live';
  if (diffHours <= 24 && diffHours > 0) return 'soon';
  return 'upcoming';
}

export default function EventCard({ event: rawEvent, showReason, reason, glowBorder = false, compact = false }) {
  const event = normalizeEvent(rawEvent);
  const status = getEventStatus(event);
  const fillPct = event.capacity > 0 ? Math.min(100, Math.round((event.registered / event.capacity) * 100)) : 0;
  const fillColor = fillPct >= 90 ? '#EF4444' : fillPct >= 60 ? '#F5A623' : '#3B6FFF';

  const startDate = event.startDate ? new Date(event.startDate) : null;

  return (
    <Link to={`/events/${event.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          background: '#111827',
          border: `1px solid ${glowBorder ? 'rgba(59,111,255,0.5)' : '#1E2A45'}`,
          borderRadius: 16, overflow: 'hidden',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          cursor: 'pointer', position: 'relative',
          boxShadow: glowBorder ? '0 0 20px rgba(59,111,255,0.2)' : 'none',
          opacity: status === 'ended' ? 0.75 : 1,
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = glowBorder ? '0 0 20px rgba(59,111,255,0.2)' : 'none'; }}
      >
        {/* Banner */}
        <div style={{ position: 'relative', height: compact ? 140 : 180, overflow: 'hidden', background: '#1E2A45' }}>
          <img
            src={event.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80'}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80'; }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)' }} />

          {/* Status badge */}
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <StatusBadge event={event} />
          </div>

          {/* Date badge */}
          {startDate && (
            <div style={{
              position: 'absolute', top: 10, right: 10,
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
              borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600, color: '#fff',
            }}>
              {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}

          {status === 'ended' && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="badge badge-gray" style={{ fontSize: 13, padding: '6px 14px' }}>ENDED</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: compact ? '14px 16px' : '18px 20px' }}>
          <div style={{ fontSize: 11, color: '#3B6FFF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
            {event.category}
          </div>

          <h3 style={{ fontSize: compact ? 14 : 16, fontWeight: 700, color: '#fff', marginBottom: 8, lineHeight: 1.3 }}>
            {event.title}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
            {startDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8' }}>
                <span>📅</span>
                <span>{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
            {event.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8' }}>
                <span>📍</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.location}</span>
              </div>
            )}
          </div>

          {(status === 'soon' || status === 'upcoming') && event.startDate && (
            <div style={{ fontSize: 12, color: status === 'soon' ? '#F59E0B' : '#3B6FFF', fontWeight: 600, marginBottom: 10 }}>
              <CountdownInline targetDate={event.startDate} />
            </div>
          )}

          {status !== 'ended' && event.capacity > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B', marginBottom: 4 }}>
                <span>Registration: {fillPct}% Full</span>
                <span>{event.registered}/{event.capacity}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${fillPct}%`, background: fillColor }} />
              </div>
            </div>
          )}

          <div className="btn btn-outline btn-full btn-sm" style={{ borderColor: '#1E2A45', color: '#fff' }}>
            View Details
          </div>

          {showReason && reason && (
            <div style={{ marginTop: 10, background: 'rgba(59,111,255,0.1)', border: '1px solid rgba(59,111,255,0.2)', borderRadius: 20, padding: '5px 10px', fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ color: '#3B6FFF' }}>✦</span> {reason}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
