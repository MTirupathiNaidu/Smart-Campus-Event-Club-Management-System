import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventAPI, registrationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SkeletonCard = () => (
    <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px', minHeight: '220px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div className="skeleton" style={{ width: '80px', height: '22px', borderRadius: '6px' }} />
            <div className="skeleton" style={{ width: '70px', height: '22px', borderRadius: '6px' }} />
        </div>
        <div className="skeleton" style={{ width: '70%', height: '24px', borderRadius: '6px', marginBottom: '10px' }} />
        <div className="skeleton" style={{ width: '100%', height: '16px', borderRadius: '6px', marginBottom: '6px' }} />
        <div className="skeleton" style={{ width: '60%', height: '16px', borderRadius: '6px', marginBottom: '20px' }} />
        <div className="skeleton" style={{ width: '50%', height: '14px', borderRadius: '6px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '40%', height: '14px', borderRadius: '6px' }} />
    </div>
);

const getEventStatus = (event) => {
    const now = new Date();
    const startTime = event.startTime ? new Date(event.startTime) : new Date(event.date);
    const endTime = event.endTime ? new Date(event.endTime) : new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
    const prizeTime = event.prizeTime ? new Date(event.prizeTime) : null;

    if (prizeTime && now >= prizeTime) return { label: 'Prize Distributed', bg: '#451a03', color: '#f59e0b', border: '#92400e' };
    if (now < startTime) return { label: 'Upcoming', bg: '#1e3a5f', color: '#60a5fa', border: '#1d4ed8' };
    if (now >= startTime && now <= endTime) return { label: 'Ongoing', bg: '#052e16', color: '#34d399', border: '#065f46' };
    if (now > endTime) return { label: 'Completed', bg: '#1f2937', color: '#6b7280', border: '#374151' };
    return { label: 'Unknown', bg: '#1f2937', color: '#6b7280', border: '#374151' };
};

const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
        ' • ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

const LandingPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await eventAPI.getPublic();
                setEvents(res.data);
            } catch (err) {
                console.error('Failed to fetch public events:', err);
                toast.error('Failed to load events.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleRegister = async (eventId) => {
        if (!user) { navigate('/login'); return; }
        if (user.role !== 'student') { toast.error('Only students can register for events.'); return; }
        try {
            await registrationAPI.register(eventId);
            toast.success('Successfully registered! 🎉');
            setEvents(events.map(ev => ev.id === eventId ? { ...ev, registration_count: (ev.registration_count || 0) + 1 } : ev));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to register.');
        }
    };

    const handleBecomeOrganizer = async (eventId) => {
        if (!user) { navigate('/login'); return; }
        if (user.role !== 'student') { toast.error('Only students can become organizers.'); return; }
        try {
            await eventAPI.becomeOrganizer(eventId);
            toast.success('You are now an organizer! 🚀');
            setEvents(events.map(ev => ev.id === eventId ? { ...ev, organizer_details: [...(ev.organizer_details || []), user] } : ev));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to become organizer.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0f1e', color: '#e2e8f0', fontFamily: "'Inter', sans-serif" }}>

            {/* Navbar */}
            <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1f2937', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🎓</div>
                    <span style={{ fontWeight: 800, fontSize: '15px', color: '#fff' }}>Smart Campus <span style={{ color: '#818cf8' }}>Events</span></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {user ? (
                        <Link to="/dashboard" style={{ background: '#1d4ed8', color: '#fff', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>Dashboard</Link>
                    ) : (
                        <>
                            <Link to="/login" style={{ color: '#94a3b8', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}>Log In</Link>
                            <Link to="/register" style={{ background: '#1d4ed8', color: '#fff', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>Get Started</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero */}
            <div style={{ position: 'relative', textAlign: 'center', padding: '72px 24px 52px', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '800px', height: '400px', background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <h2 style={{ fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: '16px' }}>
                    Discover &amp; Join{' '}
                    <span style={{ background: 'linear-gradient(90deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>College Events</span>
                </h2>
                <p style={{ fontSize: '16px', color: '#94a3b8', maxWidth: '520px', margin: '0 auto 32px', lineHeight: 1.7 }}>
                    Stay updated with the latest workshops, hackathons, and cultural fests happening on campus. Register instantly and participate!
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/register" style={{ background: '#1d4ed8', color: '#fff', padding: '12px 28px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>Join Now</Link>
                    <a href="#events-grid" style={{ background: '#1f2937', color: '#e2e8f0', padding: '12px 28px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', textDecoration: 'none', border: '1px solid #374151' }}>Browse Events</a>
                </div>
            </div>

            {/* Events Grid */}
            <div id="events-grid" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
                    <div>
                        <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>Campus Events</h3>
                        <p style={{ fontSize: '13px', color: '#6b7280' }}>All upcoming and recent events</p>
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                    </div>
                ) : events.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 24px', background: '#111827', borderRadius: '12px', border: '1px dashed #374151' }}>
                        <p style={{ fontSize: '40px', marginBottom: '12px' }}>📅</p>
                        <p style={{ color: '#6b7280', fontWeight: 600 }}>No events found. Check back later!</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {events.map((event) => {
                            const status = getEventStatus(event);
                            const remaining = event.max_participants - (event.registration_count || 0);
                            const isOrganizer = user && event.organizer_details?.some(org => org.id === user.id || org._id === user.id);
                            const isEnded = status.label === 'Completed' || status.label === 'Prize Distributed';

                            return (
                                <div key={event.id} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s', cursor: 'default' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#374151'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = '#1f2937'}>

                                    {/* Top row: status + club */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <span style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}`, borderRadius: '6px', fontSize: '11px', fontWeight: 700, padding: '3px 10px' }}>
                                            {status.label}
                                        </span>
                                        {event.club && (
                                            <span style={{ background: '#1f2937', color: '#9ca3af', border: '1px solid #374151', borderRadius: '6px', fontSize: '11px', fontWeight: 600, padding: '3px 10px' }}>
                                                {event.club.name}
                                            </span>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#f9fafb', marginBottom: '8px', lineHeight: 1.3 }}>{event.title}</h3>

                                    {/* Description */}
                                    <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                        {event.description || 'No description provided.'}
                                    </p>

                                    {/* Meta */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#9ca3af' }}>
                                            <span>📅</span>
                                            <span>{formatDate(event.startTime || event.date)}</span>
                                        </div>
                                        {event.venue && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#9ca3af' }}>
                                                <span>📍</span>
                                                <span>{event.venue}</span>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#9ca3af' }}>
                                            <span>👥</span>
                                            <span>{event.registration_count || 0} / {event.max_participants} registered</span>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div style={{ height: '4px', background: '#1f2937', borderRadius: '4px', marginBottom: '16px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${Math.min(((event.registration_count || 0) / event.max_participants) * 100, 100)}%`, background: remaining <= 0 ? '#ef4444' : '#3b82f6', borderRadius: '4px', transition: 'width 0.8s' }} />
                                    </div>

                                    {/* Buttons */}
                                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                                        <button
                                            onClick={() => handleRegister(event.id)}
                                            disabled={remaining <= 0 || isEnded}
                                            style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: remaining <= 0 || isEnded ? 'not-allowed' : 'pointer', background: remaining <= 0 || isEnded ? '#1f2937' : '#1d4ed8', color: remaining <= 0 || isEnded ? '#4b5563' : '#fff', border: 'none', transition: 'opacity 0.2s' }}>
                                            {isEnded ? 'Ended' : remaining <= 0 ? 'Full' : 'Register Now'}
                                        </button>
                                        <button
                                            onClick={() => handleBecomeOrganizer(event.id)}
                                            disabled={isOrganizer}
                                            title={isOrganizer ? 'Already an organizer' : 'Become organizer'}
                                            style={{ width: '42px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: isOrganizer ? 'default' : 'pointer', background: isOrganizer ? '#1f2937' : '#1f2937', color: isOrganizer ? '#3b82f6' : '#9ca3af', border: '1px solid #374151' }}>
                                            {isOrganizer ? '✓' : '🤝'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LandingPage;
