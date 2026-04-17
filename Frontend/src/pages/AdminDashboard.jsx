import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import { userAPI, eventAPI, clubAPI, announcementAPI } from '../services/api';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatCard = ({ label, value, icon, loading }) => (
    <div className="stat-card bg-[#0f172a]/40 group border border-white/5 relative overflow-hidden p-6 rounded-[2rem] glow-blue h-32 flex flex-col justify-between transition-all duration-500 hover:border-blue-500/20">
        <div className="absolute -right-4 -top-4 w-24 h-24 text-6xl opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 pointer-events-none transform group-hover:rotate-12 group-hover:scale-125">{icon}</div>
        {loading ? (
            <div className="w-16 h-8 skeleton rounded-lg" />
        ) : (
            <p className="text-3xl font-black text-white tracking-tighter">{value ?? '0'}</p>
        )}
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-blue-400 transition-colors uppercase">{label}</p>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [pendingCoords, setPendingCoords] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [events, setEvents] = useState([]);
    const [analytics, setAnalytics] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Modals
    const [eventModal, setEventModal] = useState(false);
    const [clubModal, setClubModal] = useState(false);
    const [announceModal, setAnnounceModal] = useState(false);
    const [editEvent, setEditEvent] = useState(null);
    const [editClub, setEditClub] = useState(null);

    const [eventForm, setEventForm] = useState({ 
        title: '', description: '', date: '', venue: '', max_participants: 100, club_id: '',
        startTime: '', endTime: '', prizeTime: ''
    });
    const [clubForm, setClubForm] = useState({ name: '', description: '', coordinator_id: '' });
    const [announceForm, setAnnounceForm] = useState({ title: '', message: '', events: [] });

    const loadAll = async () => {
        setLoading(true);
        // Individual error handling for each category to ensure partial success
        const safeFetch = async (apiCall, setter, errorMsg) => {
            try {
                const res = await apiCall();
                setter(res.data);
            } catch (err) {
                console.error(errorMsg, err);
                // Gracefully handle individual failures
            }
        };

        await Promise.allSettled([
            safeFetch(userAPI.getStats, setStats, 'Failed to load stats'),
            safeFetch(userAPI.getAll, setUsers, 'Failed to load users'),
            safeFetch(userAPI.getPendingCoordinators, setPendingCoords, 'Failed to load pending coordinators'),
            safeFetch(clubAPI.getAll, setClubs, 'Failed to load clubs'),
            safeFetch(eventAPI.getAll, setEvents, 'Failed to load events'),
            safeFetch(eventAPI.getAnalytics, setAnalytics, 'Failed to load analytics'),
            safeFetch(announcementAPI.getAll, setAnnouncements, 'Failed to load announcements')
        ]);
        setLoading(false);
    };

    useEffect(() => { loadAll(); }, []);

    // Event CRUD
    const handleSaveEvent = async () => {
        try {
            if (editEvent) {
                await eventAPI.update(editEvent.id, eventForm);
                toast.success('Event updated!');
            } else {
                await eventAPI.create(eventForm);
                toast.success('Event created!');
            }
            setEventModal(false); setEditEvent(null);
            setEventForm({ 
                title: '', description: '', date: '', venue: '', max_participants: 100, club_id: '',
                startTime: '', endTime: '', prizeTime: ''
            });
            loadAll();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to save event.'); }
    };

    const handleDeleteEvent = async (id) => {
        if (!confirm('Delete this event?')) return;
        try { await eventAPI.delete(id); toast.success('Event deleted.'); loadAll(); }
        catch { toast.error('Failed to delete event.'); }
    };

    const openEditEvent = (ev) => {
        setEditEvent(ev);
        setEventForm({
            title: ev.title, description: ev.description || '', venue: ev.venue || '',
            date: new Date(ev.date).toISOString().slice(0, 16), 
            max_participants: ev.max_participants,
            club_id: ev.club?.id || ev.club?._id || '',
            startTime: ev.startTime ? new Date(ev.startTime).toISOString().slice(0, 16) : '',
            endTime: ev.endTime ? new Date(ev.endTime).toISOString().slice(0, 16) : '',
            prizeTime: ev.prizeTime ? new Date(ev.prizeTime).toISOString().slice(0, 16) : ''
        });
        setEventModal(true);
    };

    const handleSaveClub = async () => {
        try {
            const clubPayload = {
                name: clubForm.name,
                description: clubForm.description,
                coordinator_id: clubForm.coordinator_id
            };
            if (editClub) { await clubAPI.update(editClub.id, clubPayload); toast.success('Club updated!'); }
            else { await clubAPI.create(clubPayload); toast.success('Club created!'); }
            setClubModal(false); setEditClub(null);
            setClubForm({ name: '', description: '', coordinator_id: '' });
            loadAll();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to save club.'); }
    };

    const handleDeleteClub = async (id) => {
        if (!confirm('Delete this club?')) return;
        try { await clubAPI.delete(id); toast.success('Club deleted.'); loadAll(); }
        catch { toast.error('Failed to delete club.'); }
    };

    const handleApprove = async (id) => {
        try { await userAPI.approve(id); toast.success('Coordinator approved!'); loadAll(); }
        catch { toast.error('Failed to approve.'); }
    };

    const handleReject = async (id) => {
        try { await userAPI.reject(id); toast.success('Request rejected.'); loadAll(); }
        catch { toast.error('Failed to reject.'); }
    };

    const handleSendAnnouncement = async () => {
        try {
            await announcementAPI.create(announceForm);
            toast.success('Announcement sent!');
            setAnnounceModal(false);
            setAnnounceForm({ title: '', message: '', events: [] });
            loadAll();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to send announcement.'); }
    };

    const toggleAnnouncementEvent = (eventId) => {
        setAnnounceForm(prev => ({
            ...prev,
            events: prev.events.includes(eventId)
                ? prev.events.filter(id => id !== eventId)
                : [...prev.events, eventId]
        }));
    };

    const chartData = {
        labels: analytics.map(a => a.title?.substring(0, 20) + (a.title?.length > 20 ? '...' : '')),
        datasets: [
            {
                label: 'Registrations',
                data: analytics.map(a => a.registrations),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
                borderRadius: 6,
            },
            {
                label: 'Attendance',
                data: analytics.map(a => a.attendance),
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 1,
                borderRadius: 6,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top', labels: { color: '#94a3b8', font: { weight: 'bold', size: 10 } } },
            tooltip: { backgroundColor: '#0f172a', titleColor: '#fff', bodyColor: '#94a3b8', borderRadius: 12, padding: 12 }
        },
        scales: {
            x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { display: false } },
            y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } }
        }
    };

    const coordinators = users.filter(u => u.role === 'coordinator');

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'events', label: 'Events', icon: '📅' },
        { id: 'clubs', label: 'Clubs', icon: '🎯' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'coordinators', label: 'Coordinators', icon: '✅', count: pendingCoords.length },
        { id: 'announcements', label: 'Announcements', icon: '📢' },
    ];

    return (
        <div className="flex h-screen bg-[#020617] text-slate-200">
            <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
            
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Background light effect */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -mr-48 -mt-48" />

                <header className="flex items-center justify-between px-8 py-6 z-10">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Admin <span className="text-blue-500">Dashboard</span></h1>
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Smart Campus Management</p>
                    </div>
                    <div className="lg:hidden">
                        <button onClick={() => setMobileOpen(true)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">☰</button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-8 pb-12 z-10">
                    <div className="max-w-7xl mx-auto">
                        
                        {/* Tab Navigation */}
                        <div className="flex flex-wrap gap-4 mb-10 bg-white/5 p-2 rounded-[2rem] border border-white/5 inline-flex">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3 ${activeTab === tab.id 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-white/20' 
                                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <span>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                    {tab.count > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px]">{tab.count}</span>}
                                </button>
                            ))}
                        </div>

                        {/* Page Content */}
                        <div className="animate-fade-in">
                            {activeTab === 'dashboard' && (
                                <div className="space-y-10">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <StatCard label="Total Events" value={stats?.totalEvents} icon="📅" loading={loading} />
                                        <StatCard label="Total Students" value={stats?.totalStudents} icon="🎓" loading={loading} />
                                        <StatCard label="Total Registrations" value={stats?.totalRegistrations} icon="🎟" loading={loading} />
                                        <StatCard label="Total Clubs" value={stats?.totalClubs} icon="🎯" loading={loading} />
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Chart Section */}
                                        <div className="lg:col-span-2 card-premium">
                                            <div className="flex items-center justify-between mb-8">
                                                <h2 className="text-xl font-black text-white">Event Analytics</h2>
                                                <div className="flex gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                                    <span className="text-[10px] font-black uppercase text-slate-500">Live</span>
                                                </div>
                                            </div>
                                            {loading ? (
                                                <div className="h-64 skeleton rounded-3xl" />
                                            ) : analytics.length > 0 ? (
                                                <Bar data={chartData} options={chartOptions} />
                                            ) : (
                                                <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-4 border border-white/5 border-dashed rounded-3xl">
                                                    <p className="text-4xl opacity-20 whitespace-normal">📉</p>
                                                    <p className="text-xs font-bold uppercase tracking-widest">No analytics data yet</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Activity Log / Upcoming */}
                                        <div className="space-y-6">
                                            <div className="card-premium h-full">
                                                <h2 className="text-xl font-black text-white mb-6">Upcoming Events</h2>
                                                {loading ? (
                                                    <div className="space-y-4">
                                                        {[1, 2, 3].map(i => <div key={i} className="h-16 skeleton rounded-2xl" />)}
                                                    </div>
                                                ) : stats?.upcomingEvents?.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {stats.upcomingEvents.slice(0, 4).map(ev => (
                                                            <div key={ev.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-blue-500/20 transition-all">
                                                                <div className="truncate pr-4">
                                                                    <p className="text-xs font-black text-white truncate mb-1">{ev.title}</p>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                                                        {new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                                    </p>
                                                                </div>
                                                                <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">{ev.registrations} registered</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-12 text-slate-600 font-bold uppercase text-[10px]">No upcoming events</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'events' && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-black text-white">Events <span className="text-slate-600 ml-2">[{events.length}]</span></h2>
                                        <button onClick={() => setEventModal(true)} className="btn-primary py-2.5">+ New Event</button>
                                    </div>
                                    <div className="card-premium p-0 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-white/5">
                                                    <tr>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Title</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Club</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Registrations</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {loading ? (
                                                        [1, 2, 3].map(i => (
                                                            <tr key={i}><td colSpan="5" className="px-8 py-4"><div className="h-6 skeleton rounded-lg" /></td></tr>
                                                        ))
                                                    ) : events.map(ev => (
                                                        <tr key={ev.id} className="hover:bg-white/[0.02] transition-colors group">
                                                            <td className="px-8 py-6">
                                                                <p className="text-sm font-black text-white group-hover:text-blue-500 transition-colors uppercase">{ev.title}</p>
                                                                <p className="text-[10px] font-bold text-slate-500 mt-1">ID: {ev.id.substring(0, 8)}...</p>
                                                            </td>
                                                            <td className="px-8 py-6 text-xs font-bold text-slate-400">
                                                                {new Date(ev.date).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-black border border-purple-500/20 rounded-lg">{ev.club?.name || 'GENERIC'}</span>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <p className="text-xs font-black text-slate-300">{ev.registration_count || 0} registered</p>
                                                            </td>
                                                            <td className="px-8 py-6 text-right">
                                                                <div className="flex gap-4 justify-end">
                                                                    <button onClick={() => openEditEvent(ev)} className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all">✏️</button>
                                                                    <button onClick={() => handleDeleteEvent(ev.id)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">🗑</button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {!loading && events.length === 0 && <div className="text-center py-20 text-slate-600 font-bold uppercase text-[10px]">No events found</div>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'clubs' && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-black text-white">Clubs <span className="text-slate-600 ml-2">[{clubs.length}]</span></h2>
                                        <button onClick={() => setClubModal(true)} className="btn-primary py-2.5">+ New Club</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {loading ? (
                                            [1, 2, 3].map(i => <div key={i} className="h-64 skeleton rounded-[2.5rem]" />)
                                        ) : clubs.map(club => (
                                            <div key={club.id} className="card-premium group hover:-translate-y-2">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-xl shadow-blue-500/20 group-hover:rotate-6 transition-transform">🎯</div>
                                                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => { setEditClub(club); setClubForm({ name: club.name, description: club.description || '', coordinator_id: club.coordinator?.id || club.coordinator?._id || '' }); setClubModal(true); }} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] hover:bg-blue-500 transition-colors">✏️</button>
                                                        <button onClick={() => handleDeleteClub(club.id)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] hover:bg-red-500 transition-colors">🗑</button>
                                                    </div>
                                                </div>
                                                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{club.name}</h3>
                                                <p className="text-slate-400 text-sm font-medium mb-8 line-clamp-2 h-10">{club.description || 'No description available.'}</p>
                                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 mt-auto">
                                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px]">👤</div>
                                                    <div className="truncate">
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Coordinator</p>
                                                        <p className="text-xs font-bold text-white truncate">{club.coordinator?.name || 'Not assigned'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'users' && (
                                <div className="space-y-8">
                                    <h2 className="text-2xl font-black text-white">Users <span className="text-slate-600 ml-2">[{users.length}]</span></h2>
                                    <div className="card-premium p-0 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-white/5">
                                                    <tr>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Name</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Email</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Role</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Joined</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {loading ? (
                                                        [1, 2, 3].map(i => (
                                                            <tr key={i}><td colSpan="4" className="px-8 py-4"><div className="h-6 skeleton rounded-lg" /></td></tr>
                                                        ))
                                                    ) : users.map(u => (
                                                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                                                            <td className="px-8 py-6">
                                                                <p className="text-sm font-black text-white">{u.name}</p>
                                                            </td>
                                                            <td className="px-8 py-6 text-xs font-bold text-slate-500">
                                                                {u.email}
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border tracking-widest ${
                                                                    u.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                                    u.role === 'coordinator' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                                }`}>{u.role}</span>
                                                            </td>
                                                            <td className="px-8 py-6 text-right text-xs font-bold text-slate-600">
                                                                {new Date(u.created_at || u.createdAt).toLocaleDateString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'coordinators' && (
                                <div className="space-y-12">
                                    <section>
                                        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-4">
                                            Pending Approvals
                                            {pendingCoords.length > 0 && <span className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-lg animate-pulse">{pendingCoords.length} pending</span>}
                                        </h2>
                                        {loading ? (
                                            <div className="h-40 skeleton rounded-[2.5rem]" />
                                        ) : pendingCoords.length === 0 ? (
                                            <div className="card-premium border-dashed border-emerald-500/20 text-center py-20">
                                                <p className="text-4xl mb-4">🛡️</p>
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">No pending requests</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {pendingCoords.map(c => (
                                                    <div key={c.id} className="card-premium glow-purple border-amber-500/10">
                                                        <div className="flex items-start justify-between mb-6">
                                                            <div>
                                                                <p className="text-xl font-black text-white">{c.name}</p>
                                                                <p className="text-xs font-bold text-slate-500 mt-1">{c.email}</p>
                                                            </div>
                                                            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-xl">⏳</div>
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <button onClick={() => handleApprove(c.id)} className="btn-primary flex-1 py-3 text-[10px] tracking-widest uppercase">Approve</button>
                                                            <button onClick={() => handleReject(c.id)} className="btn-secondary flex-1 py-3 text-[10px] tracking-widest uppercase text-red-400">Reject</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </section>

                                    <section>
                                        <h2 className="text-2xl font-black text-white mb-8">Active Coordinators</h2>
                                        <div className="card-premium p-0 overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead className="bg-white/5">
                                                    <tr>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Name</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Email</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Joined</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {coordinators.map(c => (
                                                        <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                                                            <td className="px-8 py-6 text-sm font-black text-white uppercase">{c.name}</td>
                                                            <td className="px-8 py-6 text-xs font-bold text-slate-500">{c.email}</td>
                                                            <td className="px-8 py-6 text-right text-xs font-bold text-slate-600">{new Date(c.created_at || c.createdAt).toLocaleDateString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'announcements' && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-black text-white">Announcements</h2>
                                        <button onClick={() => setAnnounceModal(true)} className="btn-primary py-2.5">📢 New Announcement</button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        {loading ? (
                                            [1, 2].map(i => <div key={i} className="h-48 skeleton rounded-3xl" />)
                                        ) : announcements.map(a => (
                                            <div key={a.id} className="card-premium relative group">
                                                <div className="absolute top-8 right-8">
                                                     <button onClick={async () => { if(confirm('Delete this announcement?')){ await announcementAPI.delete(a.id); toast.success('Cleared'); loadAll(); } }} className="text-slate-600 hover:text-red-500 transition-colors">🗑</button>
                                                </div>
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-xl">📢</div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-white uppercase tracking-tight">{a.title}</h3>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Posted {new Date(a.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <p className="text-slate-400 font-medium leading-relaxed mb-6">{a.message}</p>
                                                {a.events?.length > 0 && (
                                                    <div className="flex flex-wrap gap-3">
                                                        {a.events.map(ev => (
                                                            <div key={ev.id} className="px-4 py-2 bg-blue-600/5 border border-blue-500/20 rounded-2xl flex items-center gap-3">
                                                                <span className="text-xs">📅</span>
                                                                <span className="text-[10px] font-black uppercase text-blue-400">{ev.title}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {!loading && announcements.length === 0 && <div className="card-premium border-dashed text-center py-24 text-slate-600 font-black uppercase text-[10px]">No announcements yet</div>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Modal */}
            <Modal isOpen={eventModal} onClose={() => { setEventModal(false); setEditEvent(null); }} title={editEvent ? 'Edit Event' : 'New Event'}>
                <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <label className="label">Experience Designation *</label>
                        <input className="input-field" placeholder="Event name" value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <label className="label">Description</label>
                        <textarea className="input-field resize-none h-24" placeholder="Brief metadata..." value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="label">Main Sequence Time *</label>
                            <input type="datetime-local" className="input-field" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="label">Max Capacity</label>
                            <input type="number" className="input-field" value={eventForm.max_participants} onChange={e => setEventForm({ ...eventForm, max_participants: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="label text-[8px]">Start Phase</label>
                            <input type="datetime-local" className="input-field px-3" value={eventForm.startTime} onChange={e => setEventForm({ ...eventForm, startTime: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="label text-[8px]">End Phase</label>
                            <input type="datetime-local" className="input-field px-3" value={eventForm.endTime} onChange={e => setEventForm({ ...eventForm, endTime: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="label text-[8px]">Redeem Phase</label>
                            <input type="datetime-local" className="input-field px-3" value={eventForm.prizeTime} onChange={e => setEventForm({ ...eventForm, prizeTime: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="label">Physical Vector / Venue</label>
                            <input className="input-field" placeholder="Location" value={eventForm.venue} onChange={e => setEventForm({ ...eventForm, venue: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="label">Hub Association</label>
                            <select className="input-field" value={eventForm.club_id} onChange={e => setEventForm({ ...eventForm, club_id: e.target.value })}>
                                <option value="">Select Hub</option>
                                 {clubs.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button onClick={handleSaveEvent} className="btn-primary flex-1">{editEvent ? 'Save Changes' : 'Create Event'}</button>
                        <button onClick={() => { setEventModal(false); setEditEvent(null); }} className="btn-secondary flex-1">Cancel</button>
                    </div>
                </div>
            </Modal>

            {/* Club Modal */}
            <Modal isOpen={clubModal} onClose={() => { setClubModal(false); setEditClub(null); }} title={editClub ? 'Edit Club' : 'New Club'}>
                <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <label className="label">Cluster Identity *</label>
                        <input className="input-field" placeholder="Club name" value={clubForm.name} onChange={e => setClubForm({ ...clubForm, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <label className="label">Description</label>
                        <textarea className="input-field h-24 resize-none" placeholder="Core mission..." value={clubForm.description} onChange={e => setClubForm({ ...clubForm, description: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <label className="label">Hub Custodian</label>
                        <select className="input-field" value={clubForm.coordinator_id} onChange={e => setClubForm({ ...clubForm, coordinator_id: e.target.value })}>
                            <option value="">Select User</option>
                             {coordinators.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button onClick={handleSaveClub} className="btn-primary flex-1">{editClub ? 'Update Club' : 'Create Club'}</button>
                        <button onClick={() => { setClubModal(false); setEditClub(null); }} className="btn-secondary flex-1">Cancel</button>
                    </div>
                </div>
            </Modal>

            {/* Announcement Modal */}
            <Modal isOpen={announceModal} onClose={() => { setAnnounceModal(false); setAnnounceForm({ title: '', message: '', events: [] }); }} title="New Announcement">
                <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <label className="label">Signal Title *</label>
                        <input className="input-field" placeholder="Emergency or Regular update" value={announceForm.title} onChange={e => setAnnounceForm({ ...announceForm, title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <label className="label">Encrypted Data / Message *</label>
                        <textarea className="input-field h-32 resize-none" placeholder="Write message..." value={announceForm.message} onChange={e => setAnnounceForm({ ...announceForm, message: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <label className="label font-bold text-blue-500">📍 Link Phase Records</label>
                        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-4 bg-black/20 rounded-2xl border border-white/5">
                            {events.map(ev => (
                                <label key={ev.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded-lg border-white/10 bg-white/5 accent-blue-500 transition-all"
                                            checked={announceForm.events.includes(ev.id)}
                                            onChange={() => toggleAnnouncementEvent(ev.id)}
                                        />
                                        <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-tight">{ev.title}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-600 uppercase">{new Date(ev.date).toLocaleDateString()}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button onClick={handleSendAnnouncement} className="btn-primary flex-1 py-4 text-xs tracking-widest uppercase">Send Announcement</button>
                        <button onClick={() => { setAnnounceModal(false); setAnnounceForm({ title: '', message: '', events: [] }); }} className="btn-secondary flex-1 py-4 text-xs tracking-widest uppercase">Cancel</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
