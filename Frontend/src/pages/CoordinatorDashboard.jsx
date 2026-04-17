import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import { eventAPI, clubAPI, attendanceAPI } from '../services/api';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon, loading, colorClass = 'text-white' }) => (
    <div className="card-premium bg-[#0f172a]/40 border-white/5 p-6 flex flex-col justify-between h-32 glow-blue transition-all duration-500 hover:border-emerald-500/20">
        <div className="flex justify-between items-start">
            <span className="text-2xl">{icon}</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Analytics</span>
        </div>
        <div>
            {loading ? (
                <div className="w-12 h-8 skeleton rounded-lg mb-1" />
            ) : (
                <p className={`text-3xl font-black tracking-tighter ${colorClass}`}>{value}</p>
            )}
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
        </div>
    </div>
);

const CoordinatorDashboard = () => {
    const [events, setEvents] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [activeTab, setActiveTab] = useState('events');
    const [loading, setLoading] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    const [eventModal, setEventModal] = useState(false);
    const [qrModal, setQrModal] = useState(false);
    const [participantsModal, setParticipantsModal] = useState(false);
    const [editEvent, setEditEvent] = useState(null);
    const [eventForm, setEventForm] = useState({ 
        title: '', description: '', date: '', venue: '', max_participants: 100, club_id: '',
        startTime: '', endTime: '', prizeTime: ''
    });

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
            safeFetch(eventAPI.getMy, setEvents, 'Failed to load events'),
            safeFetch(clubAPI.getAll, setClubs, 'Failed to load clubs'),
        ]);
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const handleSaveEvent = async () => {
        try {
            if (editEvent) {
                await eventAPI.update(editEvent.id || editEvent._id, eventForm);
                toast.success('Event updated!');
            } else {
                await eventAPI.create(eventForm);
                toast.success('Event created! QR code generated.');
            }
            setEventModal(false); setEditEvent(null);
            setEventForm({ 
                title: '', description: '', date: '', venue: '', max_participants: 100, club_id: '',
                startTime: '', endTime: '', prizeTime: ''
            });
            loadData();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to save.'); }
    };

    const handleDeleteEvent = async (id) => {
        if (!confirm('Delete this event?')) return;
        try { await eventAPI.delete(id); toast.success('Event deleted.'); loadData(); }
        catch { toast.error('Failed to delete.'); }
    };

    const viewParticipants = async (event) => {
        setSelectedEvent(event);
        setParticipantsModal(true);
        setLoading(true);
        try {
            const [p, a] = await Promise.all([
                eventAPI.getParticipants(event.id),
                attendanceAPI.getEventAttendance(event.id)
            ]);
            setParticipants(p.data);
            setAttendance(a.data);
        } catch { toast.error('Failed to load participants.'); }
        setLoading(false);
    };

    const openEdit = (ev) => {
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

    const upcoming = events.filter(e => new Date(e.date) >= new Date());
    const past = events.filter(e => new Date(e.date) < new Date());
    const totalRegistrations = events.reduce((a, e) => a + (e.registration_count || 0), 0);

    return (
        <div className="flex h-screen bg-[#020617] text-slate-200">
            <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
            
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none -mr-48 -mt-48" />

                <header className="flex items-center justify-between px-8 py-6 z-10">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Coordinator <span className="text-emerald-500">Dashboard</span></h1>
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Event Management</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setEventModal(true)} className="btn-primary py-2.5 px-6">+ New Event</button>
                        <div className="lg:hidden">
                            <button onClick={() => setMobileOpen(true)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">☰</button>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-8 pb-12 z-10">
                    <div className="max-w-7xl mx-auto">
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                            <StatCard label="My Events" value={events.length} icon="📦" loading={loading} />
                            <StatCard label="Upcoming" value={upcoming.length} icon="⚡️" loading={loading} colorClass="text-emerald-400" />
                            <StatCard label="Total Registrations" value={totalRegistrations} icon="👥" loading={loading} colorClass="text-blue-400" />
                        </div>

                        <div className="flex flex-wrap gap-4 mb-10 bg-white/5 p-2 rounded-[2rem] border border-white/5 inline-flex">
                            {[
                                { id: 'events', label: 'Upcoming Events', icon: '📅' },
                                { id: 'past', label: 'Past Events', icon: '📂' },
                            ].map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3 ${activeTab === tab.id 
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 ring-1 ring-white/20' 
                                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                                    }`}>
                                    <span>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="animate-fade-in">
                            {loading && events.length === 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {[1, 2, 3].map(i => <div key={i} className="h-64 skeleton rounded-[2.5rem]" />)}
                                </div>
                            ) : (activeTab === 'events' ? upcoming : past).length === 0 ? (
                                <div className="card-premium border-dashed text-center py-24 border-white/5">
                                    <p className="text-4xl mb-4 opacity-20">{activeTab === 'events' ? '📅' : '📂'}</p>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">No events found</p>
                                    {activeTab === 'events' && (
                                        <button onClick={() => setEventModal(true)} className="btn-primary px-8">Create Event</button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {(activeTab === 'events' ? upcoming : past).map(ev => (
                                        <div key={ev.id || ev._id} className="card-premium group hover:-translate-y-2 transition-all duration-500 flex flex-col">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex flex-col gap-2">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl w-fit ${activeTab === 'events' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'}`}>
                                                        {activeTab === 'events' ? 'Upcoming' : 'Past'}
                                                    </span>
                                                    {ev.club?.name && <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{ev.club.name}</span>}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => openEdit(ev)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] hover:bg-blue-500 transition-colors">✏️</button>
                                                    <button onClick={() => handleDeleteEvent(ev.id || ev._id)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] hover:bg-red-500 transition-colors">🗑</button>
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight line-clamp-1">{ev.title}</h3>
                                            <p className="text-slate-400 text-sm font-medium mb-8 line-clamp-2 h-10">{ev.description || 'No description available.'}</p>
                                            
                                            <div className="space-y-3 mb-8">
                                                <div className="flex items-center gap-3 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                                                    <span>📅</span>
                                                    <span>{new Date(ev.date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-emerald-500 font-bold text-[10px] uppercase tracking-widest">
                                                    <span>👥</span>
                                                    <span>{ev.registration_count || 0} Registered • {ev.attendance_count || 0} Attended</span>
                                                </div>
                                            </div>

                                            <div className="mt-auto grid grid-cols-2 gap-3">
                                                <button onClick={() => { setSelectedEvent(ev); setQrModal(true); }} className="btn-secondary py-3 text-[10px] font-black tracking-widest uppercase">View QR</button>
                                                <button onClick={() => viewParticipants(ev)} className="btn-primary py-3 text-[10px] font-black tracking-widest uppercase">Participants</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={eventModal} onClose={() => { setEventModal(false); setEditEvent(null); }} title={editEvent ? 'Edit Event' : 'New Event'}>
                <div className="space-y-6 pt-4 text-left">
                    <div className="space-y-2">
                        <label className="label">Experience Designation *</label>
                        <input className="input-field px-4" placeholder="Event name" value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <label className="label">Intelligence / Description</label>
                        <textarea className="input-field px-4 resize-none h-24" placeholder="Brief metadata..." value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-6 text-left">
                        <div className="space-y-2">
                            <label className="label">Main Sequence Time *</label>
                            <input type="datetime-local" className="input-field px-4" value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="label">Max Capacity</label>
                            <input type="number" className="input-field px-4" value={eventForm.max_participants} onChange={e => setEventForm({ ...eventForm, max_participants: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-left">
                        <div className="space-y-2">
                            <label className="label text-[8px]">Start Phase</label>
                            <input type="datetime-local" className="input-field px-2" value={eventForm.startTime} onChange={e => setEventForm({ ...eventForm, startTime: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="label text-[8px]">End Phase</label>
                            <input type="datetime-local" className="input-field px-2" value={eventForm.endTime} onChange={e => setEventForm({ ...eventForm, endTime: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="label text-[8px]">Redeem Phase</label>
                            <input type="datetime-local" className="input-field px-2" value={eventForm.prizeTime} onChange={e => setEventForm({ ...eventForm, prizeTime: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 text-left">
                        <div className="space-y-2">
                            <label className="label">Physical Vector / Venue</label>
                            <input className="input-field px-4" placeholder="Location" value={eventForm.venue} onChange={e => setEventForm({ ...eventForm, venue: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="label">Hub Association</label>
                            <select className="input-field px-4" value={eventForm.club_id} onChange={e => setEventForm({ ...eventForm, club_id: e.target.value })}>
                                <option value="">Select Hub</option>
                                 {clubs.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button onClick={handleSaveEvent} className="btn-primary flex-1 py-4 uppercase tracking-widest font-black text-[10px]">{editEvent ? 'Save Changes' : 'Create Event'}</button>
                        <button onClick={() => { setEventModal(false); setEditEvent(null); }} className="btn-secondary flex-1 py-4 uppercase tracking-widest font-black text-[10px]">Cancel</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={qrModal} onClose={() => setQrModal(false)} title="QR Code">
                {selectedEvent && (
                    <div className="flex flex-col items-center gap-8 py-8">
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl glow-white">
                            <QRCodeSVG
                                id="qr-svg"
                                value={JSON.stringify({ token: selectedEvent.qr_token, event_id: selectedEvent.id, title: selectedEvent.title })}
                                size={220}
                                bgColor="#ffffff"
                                fgColor="#0f172a"
                                level="H"
                                includeMargin
                            />
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-black text-white uppercase tracking-tight">{selectedEvent.title}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-3">Scan to mark attendance</p>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={participantsModal} onClose={() => setParticipantsModal(false)} title={`Participants — ${selectedEvent?.title}`} size="lg">
                <div className="space-y-8 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="card-premium bg-white/5 border-white/5 p-4 text-center">
                            <p className="text-2xl font-black text-white">{participants.length}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Registered</p>
                        </div>
                        <div className="card-premium bg-emerald-500/5 border-emerald-500/10 p-4 text-center">
                            <p className="text-2xl font-black text-emerald-400">{attendance.length}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Attended</p>
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto card-premium p-0 border-white/5">
                        <table className="w-full text-left">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">Email</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    [1, 2, 3].map(i => <tr key={i}><td colSpan="3" className="px-6 py-4"><div className="h-6 skeleton rounded-lg" /></td></tr>)
                                ) : participants.length === 0 ? (
                                    <tr><td colSpan="3" className="px-6 py-12 text-center text-[10px] font-black text-slate-600 uppercase">No participants yet</td></tr>
                                ) : participants.map(p => {
                                    const isAttended = attendance.some(a => a.user?.id === p.id || a.user?._id === p.id);
                                    return (
                                        <tr key={p.id} className="hover:bg-white/[0.02]">
                                            <td className="px-6 py-4 text-xs font-black text-white uppercase">{p.name}</td>
                                            <td className="px-6 py-4 text-[10px] font-bold text-slate-500">{p.email}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${isAttended ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {isAttended ? 'Attended' : 'Registered'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CoordinatorDashboard;
