import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import Footer from '../components/layout/Footer';
import EventCard from '../components/EventCard';
import StatusBadge from '../components/StatusBadge';
import { CATEGORIES, DEPARTMENTS, getEventStatus, MOCK_EVENTS } from '../data/mockData';
import { eventsAPI } from '../services/api';

const SORT_OPTIONS = ['Newest First', 'Oldest First', 'Most Popular', 'Alphabetical'];
const PER_PAGE = 6;

export default function EventsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    categories: searchParams.getAll('cat') || [],
    department: searchParams.get('dept') || '',
    dateFrom: searchParams.get('from') || '',
    dateTo: searchParams.get('to') || '',
    q: searchParams.get('q') || '',
  });
  const [sort, setSort] = useState('Newest First');
  const [page, setPage] = useState(1);

  // Fetch events from backend API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await eventsAPI.getAll();
        setEvents(res.data.events || res.data || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setEvents(MOCK_EVENTS); // Fallback to mock data
        setError('Using mock data');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.department) params.set('dept', filters.department);
    if (filters.dateFrom) params.set('from', filters.dateFrom);
    if (filters.dateTo) params.set('to', filters.dateTo);
    filters.categories.forEach(c => params.append('cat', c));
    setSearchParams(params, { replace: true });
    setPage(1);
  }, [filters, setSearchParams]);

  const filtered = events.filter(e => {
    if (filters.q && !e.title.toLowerCase().includes(filters.q.toLowerCase()) &&
        !e.category.toLowerCase().includes(filters.q.toLowerCase())) return false;
    if (filters.categories.length && !filters.categories.includes(e.category)) return false;
    if (filters.department && e.department !== filters.department) return false;
    if (filters.dateFrom && new Date(e.startDate) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(e.startDate) > new Date(filters.dateTo)) return false;
    return true;
  }).sort((a, b) => {
    if (sort === 'Newest First') return new Date(b.startDate) - new Date(a.startDate);
    if (sort === 'Oldest First') return new Date(a.startDate) - new Date(b.startDate);
    if (sort === 'Most Popular') return b.registered - a.registered;
    return a.title.localeCompare(b.title);
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const featured = events.find(e => e.isFeatured && getEventStatus(e) !== 'ended');

  const toggleCategory = (cat) => {
    setFilters(f => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter(c => c !== cat)
        : [...f.categories, cat],
    }));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />

      <div style={{ flex: 1, display: 'flex' }}>
        {/* ===== SIDEBAR FILTERS ===== */}
        <aside style={{
          width: 220,
          minWidth: 220,
          background: '#0D1224',
          borderRight: '1px solid #1E2A45',
          padding: '24px 16px',
          position: 'sticky',
          top: 64,
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Filters</h3>

          {/* Categories */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#F5A623', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Categories
            </div>
            {CATEGORIES.map(cat => (
              <label key={cat} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 0', cursor: 'pointer', fontSize: 13, color: '#94A3B8',
              }}>
                <input
                  type="checkbox"
                  checked={filters.categories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  style={{ accentColor: '#3B6FFF', width: 14, height: 14 }}
                />
                {cat}
              </label>
            ))}
          </div>

          {/* Department */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#F5A623', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Department
            </div>
            <select
              value={filters.department}
              onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}
              className="form-select"
              style={{ fontSize: 12 }}
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Date Range */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#F5A623', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Date Range
            </div>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
              className="form-input"
              style={{ marginBottom: 8, fontSize: 12 }}
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
              className="form-input"
              style={{ fontSize: 12 }}
            />
          </div>

          <button
            className="btn btn-primary btn-full btn-sm"
            onClick={() => setFilters({ categories: [], department: '', dateFrom: '', dateTo: '', q: '' })}
            style={{ borderRadius: 10 }}
          >
            Clear Filters
          </button>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main style={{ flex: 1, padding: '24px', minWidth: 0 }}>
          {/* Breadcrumb + Sort */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: '#64748B' }}>
              <Link to="/" style={{ color: '#64748B', textDecoration: 'none' }}>Home</Link>
              <span style={{ margin: '0 6px' }}>›</span>
              <span style={{ color: '#fff' }}>Events</span>
              {filtered.length !== MOCK_EVENTS.length && (
                <span style={{ color: '#3B6FFF', marginLeft: 8 }}>({filtered.length} results)</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#64748B' }}>Sort by:</span>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="form-select"
                style={{ width: 'auto', fontSize: 12, padding: '6px 28px 6px 10px' }}
              >
                {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}>🔍</span>
            <input
              type="text"
              placeholder="Search events, workshops, or competitions..."
              value={filters.q}
              onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
              className="form-input"
              style={{ paddingLeft: 40, borderRadius: 24 }}
            />
          </div>

          {/* Featured banner */}
          {featured && !filters.q && filters.categories.length === 0 && (
            <div style={{
              position: 'relative',
              borderRadius: 16,
              overflow: 'hidden',
              marginBottom: 24,
              height: 220,
            }}>
              <img
                src={featured.banner}
                alt={featured.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to right, rgba(10,15,44,0.95) 40%, rgba(10,15,44,0.3) 100%)',
              }} />
              <div style={{ position: 'absolute', inset: 0, padding: '28px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(245,166,35,0.2)', border: '1px solid rgba(245,166,35,0.4)',
                  borderRadius: 20, padding: '3px 10px', fontSize: 11, color: '#F5A623', fontWeight: 600,
                  marginBottom: 10, width: 'fit-content',
                }}>
                  ★ FEATURED EVENT
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 8, maxWidth: 500 }}>
                  {featured.title}
                </h2>
                <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16, maxWidth: 480, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {featured.description}
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(`/events/${featured.id}/register`)}>
                    Get Your Ticket
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => navigate(`/events/${featured.id}`)}>
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Events grid */}
          {paginated.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
              marginBottom: 32,
            }}>
              {paginated.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              {/* Geometric empty state */}
              <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 24px' }}>
                <div style={{ position: 'absolute', inset: 0, border: '2px solid #1E2A45', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', inset: 20, border: '2px solid #2A3A55', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', inset: 40, background: '#1E2A45', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🔍</div>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>No events found</h3>
              <p style={{ fontSize: 14, color: '#64748B', marginBottom: 20 }}>Try adjusting your filters or search terms</p>
              <button className="btn btn-primary btn-sm" onClick={() => setFilters({ categories: [], department: '', dateFrom: '', dateTo: '', q: '' })}>
                Clear All Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ padding: '8px 12px', minWidth: 36 }}
              >‹</button>

              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                const p = i + 1;
                if (totalPages > 10 && p > 3 && p < totalPages - 1 && Math.abs(p - page) > 1) {
                  if (p === 4) return <span key={p} style={{ color: '#64748B', padding: '0 4px' }}>...</span>;
                  return null;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: page === p ? '#3B6FFF' : 'transparent',
                      border: `1px solid ${page === p ? '#3B6FFF' : '#1E2A45'}`,
                      color: page === p ? '#fff' : '#94A3B8',
                      fontSize: 13, fontWeight: page === p ? 700 : 400,
                      cursor: 'pointer',
                    }}
                  >{p}</button>
                );
              })}

              <button
                className="btn btn-outline btn-sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{ padding: '8px 12px', minWidth: 36 }}
              >›</button>
            </div>
          )}
        </main>
      </div>

      {/* Floating create event button */}
      <button
        className="btn btn-primary"
        onClick={() => navigate('/admin/events/create')}
        style={{
          position: 'fixed', bottom: 24, right: 24,
          borderRadius: 24, boxShadow: '0 4px 20px rgba(59,111,255,0.4)',
          zIndex: 50,
        }}
      >
        + Create Event
      </button>

      <Footer />
    </div>
  );
}
