import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import EventCard from '../components/EventCard';
import Modal from '../components/Modal';
import { eventAPI, registrationAPI, attendanceAPI, announcementAPI } from '../services/api';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon, loading, colorClass = 'text-white' }) => (
    <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '110px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '22px' }}>{icon}</span>
        </div>
        <div>
            {loading ? (
                <div className="skeleton" style={{ width: '48px', height: '32px', borderRadius: '8px', marginBottom: '4px' }} />
            ) : (
                <p style={{ fontSize: '28px', fontWeight: 900, color: colorClass === 'text-white' ? '#fff' : colorClass === 'text-blue-400' ? '#60a5fa' : '#34d399', marginBottom: '2px' }}>{value}</p>
            )}
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' }}>{label}</p>
        </div>
    </div>
);

const StudentDashboard = () => {
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [myRegistrations, setMyRegistrations] = useState([]);
    const [myAttendance, setMyAttendance] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [activeTab, setActiveTab] = useState('browse');
    const [loading, setLoading] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const safeFetch = async (apiCall, setter, errorMsg) => {
            try {
                const res = await apiCall();
                setter(res.data);
            } catch (err) {
                console.error(errorMsg, err);
            }
        };

        await Promise.allSettled([
            safeFetch(eventAPI.getUpcoming, setUpcomingEvents, 'Failed to load upcoming events'),
            safeFetch(registrationAPI.getMy, setMyRegistrations, 'Failed to load registrations'),
            safeFetch(attendanceAPI.getMy, setMyAttendance, 'Failed to load attendance'),
            safeFetch(announcementAPI.getAll, setAnnouncements, 'Failed to load announcements'),
        ]);
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);


    const handleRegister = async (eventId) => {
        try {
            await registrationAPI.register(eventId);
            toast.success('Successfully registered! 🎉');
            loadData();
        } catch (err) { toast.error(err.response?.data?.message || 'Registration failed.'); }
    };

    const handleCancel = async (eventId) => {
        if (!confirm('Cancel your registration?')) return;
        try {
            await registrationAPI.cancel(eventId);
            toast.success('Registration cancelled.');
            loadData();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel.'); }
    };

    // With Mongoose populate, registration.event is the nested event object
    const registeredEventIds = myRegistrations.map(r => r.event?.id || r.event?._id);
    const attendedCount = myAttendance.filter(a => a.status === 'present').length;

    const tabs = [
        { id: 'browse', label: '🔍 Browse Events' },
        { id: 'my-events', label: `📋 My Events (${myRegistrations.length})` },
        { id: 'history', label: '📊 History' },
        { id: 'announcements', label: '📢 Announcements' },
    ];

    return (
        <div className="flex h-screen bg-slate-950">
            <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="lg:hidden bg-slate-900 border-b border-slate-700/50 px-4 py-3 flex items-center gap-3">
                    <button onClick={() => setMobileOpen(true)} className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center">☰</button>
                    <span className="font-bold text-white">🎓 Student Dashboard</span>
                </header>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-white">Student Dashboard</h1>
                            <p className="text-slate-400 text-sm">Discover events and manage your participation</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                            <StatCard label="Available Events" value={upcomingEvents.length} icon="🔍" loading={loading} />
                            <StatCard label="My Registrations" value={myRegistrations.length} icon="🎟" loading={loading} colorClass="text-blue-400" />
                            <StatCard label="Attended" value={attendedCount} icon="✅" loading={loading} colorClass="text-emerald-400" />
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                            <StatCard label="Available Events" value={upcomingEvents.length} icon="🔍" loading={loading} />
                            <StatCard label="My Registrations" value={myRegistrations.length} icon="🎟" loading={loading} colorClass="text-blue-400" />
                            <StatCard label="Attended" value={attendedCount} icon="✅" loading={loading} colorClass="text-emerald-400" />
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
                            {tabs.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    style={{ padding: '9px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 0.2s', background: activeTab === tab.id ? 'linear-gradient(135deg, #ea580c, #f97316)' : '#1f2937', color: activeTab === tab.id ? '#fff' : '#9ca3af', boxShadow: activeTab === tab.id ? '0 4px 14px rgba(234,88,12,0.3)' : 'none' }}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Browse Events */}
                        {activeTab === 'browse' && (
                            <div className="animate-fade-in">
                                {loading ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '240px', borderRadius: '12px' }} />)}
                                    </div>
                                ) : upcomingEvents.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '80px 24px', background: '#111827', borderRadius: '12px', border: '1px dashed #374151' }}>
                                        <p style={{ fontSize: '36px', marginBottom: '10px', opacity: 0.3 }}>📅</p>
                                        <p style={{ color: '#6b7280', fontWeight: 600, fontSize: '13px' }}>No upcoming events found</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                        {upcomingEvents.map(ev => {
                                            const isReg = registeredEventIds.includes(ev.id);
                                            const evDate = ev.startTime || ev.date;
                                            const formattedDate = new Date(evDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
                                            const formattedTime = new Date(evDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                            const filled = Math.min(((ev.registration_count || 0) / ev.max_participants) * 100, 100);
                                            return (
                                                <div key={ev.id} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column' }}
                                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#374151'}
                                                    onMouseLeave={e => e.currentTarget.style.borderColor = '#1f2937'}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#f9fafb', flex: 1, marginRight: '10px', lineHeight: 1.3 }}>{ev.title}</h3>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#052e16', color: '#34d399', border: '1px solid #065f46', borderRadius: '20px', fontSize: '11px', fontWeight: 700, padding: '3px 10px', whiteSpace: 'nowrap' }}>
                                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                                                            Upcoming
                                                        </span>
                                                    </div>
                                                    {ev.description && <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{ev.description}</p>}
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#9ca3af' }}>
                                                            <span>📅</span><span>{formattedDate}</span>
                                                            <span>🕐</span><span>{formattedTime}</span>
                                                        </div>
                                                        {ev.venue && <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#9ca3af' }}><span>📍</span><span>{ev.venue}</span></div>}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#9ca3af' }}><span>👥</span><span>{ev.registration_count || 0} / {ev.max_participants} registered</span></div>
                                                    </div>
                                                    <div style={{ height: '4px', background: '#1f2937', borderRadius: '4px', marginBottom: '12px', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: `${filled}%`, background: filled >= 80 ? '#ef4444' : '#3b82f6', borderRadius: '4px' }} />
                                                    </div>
                                                    {isReg ? (
                                                        <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', color: '#22c55e', fontSize: '12px', fontWeight: 700 }}>✓ Registered</div>
                                                    ) : (
                                                        <button onClick={() => handleRegister(ev.id)} style={{ padding: '9px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Register</button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* My Events */}
                        {activeTab === 'my-events' && (
                            <div className="animate-fade-in">
                                {loading ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                        {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: '240px', borderRadius: '12px' }} />)}
                                    </div>
                                ) : myRegistrations.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '80px 24px', background: '#111827', borderRadius: '12px', border: '1px dashed #374151', maxWidth: '500px', margin: '0 auto' }}>
                                        <p style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.3 }}>📋</p>
                                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>No Registrations Yet</h3>
                                        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '20px' }}>You haven't registered for any events yet. Browse events to get started.</p>
                                        <button onClick={() => setActiveTab('browse')} style={{ padding: '10px 24px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Browse Events</button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                        {myRegistrations.map(reg => {
                                            const ev = reg.event || {};
                                            const evId = ev.id || ev._id;
                                            const evDate = ev.startTime || ev.date;
                                            const isPast = evDate && new Date(evDate) < new Date();
                                            const formattedDate = evDate ? new Date(evDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—';
                                            const formattedTime = evDate ? new Date(evDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                                            const filled = Math.min(((ev.registration_count || 0) / (ev.max_participants || 1)) * 100, 100);
                                            return (
                                                <div key={reg.id || evId} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column' }}
                                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#374151'}
                                                    onMouseLeave={e => e.currentTarget.style.borderColor = '#1f2937'}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#f9fafb', flex: 1, marginRight: '10px', lineHeight: 1.3 }}>{ev.title}</h3>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: isPast ? '#1f2937' : '#052e16', color: isPast ? '#6b7280' : '#34d399', border: `1px solid ${isPast ? '#374151' : '#065f46'}`, borderRadius: '20px', fontSize: '11px', fontWeight: 700, padding: '3px 10px', whiteSpace: 'nowrap' }}>
                                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isPast ? '#6b7280' : '#22c55e', display: 'inline-block' }} />
                                                            {isPast ? 'Past' : 'Upcoming'}
                                                        </span>
                                                    </div>
                                                    {ev.description && <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{ev.description}</p>}
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#9ca3af' }}>
                                                            <span>📅</span><span>{formattedDate}</span>
                                                            {formattedTime && <><span>🕐</span><span>{formattedTime}</span></>}
                                                        </div>
                                                        {ev.venue && <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#9ca3af' }}><span>📍</span><span>{ev.venue}</span></div>}
                                                        {ev.max_participants && <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#9ca3af' }}><span>👥</span><span>{ev.registration_count || 0} / {ev.max_participants} registered</span></div>}
                                                    </div>
                                                    <div style={{ height: '4px', background: '#1f2937', borderRadius: '4px', marginBottom: '12px', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: `${filled}%`, background: '#3b82f6', borderRadius: '4px' }} />
                                                    </div>
                                                    {!isPast ? (
                                                        <button onClick={() => handleCancel(evId)} style={{ padding: '8px', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>Cancel Registration</button>
                                                    ) : (
                                                        <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', color: '#22c55e', fontSize: '12px', fontWeight: 700 }}>✓ Registered</div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}


                        {/* Attendance History */}
                        {activeTab === 'history' && (
                            <div className="animate-fade-in space-y-8">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Attendance <span className="text-slate-600">History</span></h2>
                                {loading ? (
                                    <div className="h-64 skeleton rounded-[2.5rem]" />
                                ) : myAttendance.length === 0 ? (
                                    <div className="card-premium border-dashed text-center py-24">
                                        <p className="text-4xl mb-4 opacity-20">📊</p>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">No activity history found</p>
                                    </div>
                                ) : (
                                    <div className="card-premium p-0 overflow-hidden border-white/5">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-[#0f172a]/40">
                                                    <tr>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Event</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Club</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Recorded At</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {myAttendance.map(a => {
                                                        const ev = a.event || {};
                                                        return (
                                                            <tr key={a.id || a._id} className="hover:bg-white/[0.02] transition-colors">
                                                                <td className="px-8 py-6">
                                                                    <p className="text-sm font-black text-white uppercase tracking-tight">{ev.title || 'Unknown Event'}</p>
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2.5 py-1 bg-white/5 rounded-lg">{ev.club?.name || 'GENERIC'}</span>
                                                                </td>
                                                                <td className="px-8 py-6 text-xs font-bold text-slate-600">
                                                                    {ev.date ? new Date(ev.date).toLocaleDateString() : '—'}
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${a.status === 'present' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                                        {a.status === 'present' ? 'Present' : 'Absent'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-8 py-6 text-right text-[10px] font-bold text-slate-700 uppercase">
                                                                    {new Date(a.updatedAt || a.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Announcements */}
                        {activeTab === 'announcements' && (
                            <div className="animate-fade-in space-y-8">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Announcements</h2>
                                {loading ? (
                                    <div className="space-y-6">
                                        {[1, 2].map(i => <div key={i} className="h-40 skeleton rounded-3xl" />)}
                                    </div>
                                ) : announcements.length === 0 ? (
                                    <div className="card-premium border-dashed text-center py-24">
                                        <p className="text-4xl mb-4 opacity-20">📢</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No announcements yet</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-6">
                                        {announcements.map(a => (
                                            <div key={a.id} className="card-premium relative group overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-xl">📢</div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-white uppercase tracking-tight">{a.title}</h3>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Received {new Date(a.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <p className="text-slate-400 font-medium leading-relaxed">{a.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
