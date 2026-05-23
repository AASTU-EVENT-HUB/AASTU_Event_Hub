import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import Footer from '../components/layout/Footer';
import EventCard from '../components/EventCard';
import { MOCK_EVENTS, getEventStatus } from '../data/mockData';
import { eventsAPI } from '../services/api';

export default function HomePage() {
  const navigate = useNavigate();

  const [liveEvents, setLiveEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch events from backend API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await eventsAPI.getAll();
        const allEvents = res.data.events || res.data || [];
        
        setLiveEvents(allEvents.filter(e => getEventStatus(e) === 'live'));
        setFeaturedEvents(allEvents.filter(e => e.isFeatured));
        setUpcomingEvents(allEvents.filter(e => ['upcoming', 'soon'].includes(getEventStatus(e))).slice(0, 6));
      } catch (err) {
        console.error('Failed to fetch events:', err);
        // Fallback to mock data
        setLiveEvents(MOCK_EVENTS.filter(e => getEventStatus(e) === 'live'));
        setFeaturedEvents(MOCK_EVENTS.filter(e => e.isFeatured));
        setUpcomingEvents(MOCK_EVENTS.filter(e => ['upcoming', 'soon'].includes(getEventStatus(e))).slice(0, 6));
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />

      {/* ===== HERO ===== */}
      <section style={{
        position: 'relative',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}>
        {/* Background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80)',
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(10,15,44,0.95) 0%, rgba(10,15,44,0.7) 50%, rgba(10,15,44,0.4) 100%)',
        }} />

        {/* Geometric decorations */}
        <div style={{
          position: 'absolute', top: '20%', right: '10%',
          width: 300, height: 300, borderRadius: '50%',
          border: '1px solid rgba(59,111,255,0.15)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '30%', right: '15%',
          width: 180, height: 180, borderRadius: '50%',
          border: '1px solid rgba(59,111,255,0.1)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: 80, paddingBottom: 80 }}>
          <div style={{ maxWidth: 680 }}>
            {/* Tag */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(59,111,255,0.15)', border: '1px solid rgba(59,111,255,0.3)',
              borderRadius: 20, padding: '5px 14px', marginBottom: 24,
              fontSize: 12, color: '#3B6FFF', fontWeight: 600,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B6FFF', display: 'inline-block' }} />
              AASTU's Official Events Platform
            </div>

            <h1 style={{
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.1,
              marginBottom: 20,
            }}>
              Discover Events That<br />
              <span style={{ color: '#3B6FFF' }}>Shape Your Future</span>
            </h1>

            <p style={{
              fontSize: 18, color: '#94A3B8', lineHeight: 1.7,
              maxWidth: 520, marginBottom: 36,
            }}>
              Hackathons, workshops, seminars, and cultural events — all in one place.
              Built for AASTU students, by AASTU students.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/events')}
                style={{ borderRadius: 12 }}
              >
                Explore Events →
              </button>
              <button
                className="btn btn-outline btn-lg"
                onClick={() => navigate('/signup')}
                style={{ borderRadius: 12 }}
              >
                Create Account
              </button>
            </div>

            {/* Demo quick access */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(59,111,255,0.08)', border: '1px solid rgba(59,111,255,0.12)', padding: '10px 12px', borderRadius: 10 }}>
                  <div style={{ fontSize: 12, color: '#3B6FFF', fontWeight: 700 }}>Demo accounts</div>
                  <div style={{ fontSize: 13, color: '#94A3B8' }}>Student: student@aastu.edu.et / 12345678</div>
                  <div style={{ fontSize: 13, color: '#94A3B8' }}>Admin: admin@aastu.edu.et / 12345678</div>
                </div>
                <button className="btn btn-outline" onClick={() => navigate('/login', { state: { demo: { email: 'student@aastu.edu.et', password: '12345678' } } })}>Try Student</button>
                <button className="btn btn-outline" onClick={() => navigate('/login', { state: { demo: { email: 'admin@aastu.edu.et', password: '12345678' } } })}>Try Admin</button>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 32, marginTop: 48, flexWrap: 'wrap' }}>
              {[
                { value: '4,829+', label: 'Registered Students' },
                { value: '120+', label: 'Events This Semester' },
                { value: '24', label: 'Active Clubs' },
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== HAPPENING RIGHT NOW ===== */}
      {liveEvents.length > 0 && (
        <section style={{ padding: '48px 0', background: 'rgba(239,68,68,0.04)', borderTop: '1px solid rgba(239,68,68,0.1)' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{
                width: 10, height: 10, borderRadius: '50%', background: '#EF4444',
                display: 'inline-block', animation: 'pulse-dot 1.2s ease-in-out infinite',
              }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>🔴 Happening Right Now</h2>
            </div>
            <div style={{
              display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 8,
              scrollbarWidth: 'thin',
            }}>
              {liveEvents.map(event => (
                <div key={event.id} style={{ minWidth: 280, maxWidth: 280 }}>
                  <EventCard event={event} compact />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== FEATURED EVENTS ===== */}
      <section style={{ padding: '120px 0 60px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
            <div>
              <div style={{ fontSize: 12, color: '#3B6FFF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                ✦ Curated for You
              </div>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff' }}>Featured Events</h2>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/events')}
            >
              View All →
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}>
            {featuredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== UPCOMING EVENTS ===== */}
      <section style={{ padding: '60px 0 120px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
            <div>
              <div style={{ fontSize: 12, color: '#F5A623', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                📅 Don't Miss Out
              </div>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff' }}>Upcoming Events</h2>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/events')}
            >
              View Full Calendar →
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}>
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, rgba(59,111,255,0.1) 0%, rgba(107,70,193,0.1) 100%)',
        borderTop: '1px solid rgba(59,111,255,0.2)',
        borderBottom: '1px solid rgba(59,111,255,0.2)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 12 }}>
            Ready to get involved?
          </h2>
          <p style={{ fontSize: 16, color: '#94A3B8', marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
            Join thousands of AASTU students already using the platform to discover and attend events.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-gold btn-lg" onClick={() => navigate('/signup')} style={{ borderRadius: 12 }}>
              Get Started Free
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/events')} style={{ borderRadius: 12 }}>
              Browse Events
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
