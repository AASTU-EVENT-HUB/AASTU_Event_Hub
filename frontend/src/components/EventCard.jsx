import { Link } from 'react-router-dom';
import { getEventStatus } from '../data/mockData';
import StatusBadge from './StatusBadge';
import { CountdownInline } from './CountdownTimer';

export default function EventCard({ event, showReason, reason, glowBorder = false, compact = false }) {
  const status = getEventStatus(event);
  const fillPct = Math.round((event.registered / event.capacity) * 100);

  const fillColor = fillPct >= 90 ? '#EF4444' : fillPct >= 60 ? '#F5A623' : '#3B6FFF';

  const cardStyle = {
    background: '#111827',
    border: `1px solid ${glowBorder ? 'rgba(59,111,255,0.5)' : '#1E2A45'}`,
    borderRadius: 16,
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
    position: 'relative',
    boxShadow: glowBorder ? '0 0 20px rgba(59,111,255,0.2)' : 'none',
  };

  if (status === 'ended') {
    cardStyle.opacity = 0.7;
  }

  return (
    <Link to={`/events/${event.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className="event-card"
        style={cardStyle}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = glowBorder
            ? '0 8px 32px rgba(59,111,255,0.35)'
            : '0 8px 32px rgba(0,0,0,0.4)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = glowBorder ? '0 0 20px rgba(59,111,255,0.2)' : 'none';
        }}
      >
        {/* Banner */}
        <div style={{ position: 'relative', height: compact ? 140 : 180, overflow: 'hidden' }}>
          <img
            src={event.banner || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80`}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)'
          }} />

          {/* Status badge top-left */}
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <StatusBadge event={event} />
          </div>

          {/* Date badge top-right */}
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            borderRadius: 6, padding: '3px 8px',
            fontSize: 11, fontWeight: 600, color: '#fff',
          }}>
            {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>

          {/* Ended overlay */}
          {status === 'ended' && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="badge badge-gray" style={{ fontSize: 13, padding: '6px 14px' }}>ENDED</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: compact ? '14px 16px' : '18px 20px' }}>
          {/* Category */}
          <div style={{ fontSize: 11, color: '#3B6FFF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
            {event.category}
          </div>

          {/* Title */}
          <h3 style={{ fontSize: compact ? 14 : 16, fontWeight: 700, color: '#fff', marginBottom: 8, lineHeight: 1.3 }}>
            {event.title}
          </h3>

          {/* Date & Location */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8' }}>
              <span>📅</span>
              <span>
                {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })},{' '}
                {new Date(event.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8' }}>
              <span>📍</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.location}</span>
            </div>
          </div>

          {/* Countdown for soon/upcoming */}
          {(status === 'soon' || status === 'upcoming') && (
            <div style={{
              fontSize: 12, color: status === 'soon' ? '#F59E0B' : '#3B6FFF',
              fontWeight: 600, marginBottom: 10,
              animation: status === 'soon' ? 'pulse-amber 1.5s ease-in-out infinite' : 'none',
            }}>
              <CountdownInline targetDate={event.startDate} />
            </div>
          )}

          {/* Registration progress */}
          {status !== 'ended' && (
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

          {/* CTA */}
          <div
            className="btn btn-outline btn-full btn-sm"
            style={{ borderColor: '#1E2A45', color: '#fff' }}
          >
            View Details
          </div>

          {/* AI reason chip */}
          {showReason && reason && (
            <div style={{
              marginTop: 10,
              background: 'rgba(59,111,255,0.1)',
              border: '1px solid rgba(59,111,255,0.2)',
              borderRadius: 20,
              padding: '5px 10px',
              fontSize: 11,
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}>
              <span style={{ color: '#3B6FFF' }}>✦</span>
              {reason}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
