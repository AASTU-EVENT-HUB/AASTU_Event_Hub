import { getEventStatus } from '../data/mockData';

export default function StatusBadge({ event, style = {} }) {
  const status = typeof event === 'string' ? event : getEventStatus(event);

  if (status === 'live') return (
    <span className="badge badge-red" style={style}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF4444', display: 'inline-block', animation: 'pulse-dot 1.2s ease-in-out infinite' }} />
      LIVE NOW
    </span>
  );
  if (status === 'soon') return <span className="badge badge-amber" style={{ animation: 'pulse-amber 1.5s ease-in-out infinite', ...style }}>⚡ STARTING SOON</span>;
  if (status === 'ended') return <span className="badge badge-gray" style={style}>ENDED</span>;
  return <span className="badge badge-blue" style={style}>UPCOMING</span>;
}
