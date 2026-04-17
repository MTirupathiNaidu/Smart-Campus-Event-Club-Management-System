import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = {
    admin: [
        { to: '/admin', label: 'Dashboard', icon: '🏠', end: true },
        { to: '/admin/events', label: 'Events', icon: '📅' },
        { to: '/admin/clubs', label: 'Clubs', icon: '🎯' },
        { to: '/admin/users', label: 'Users', icon: '👥' },
        { to: '/admin/coordinators', label: 'Coordinators', icon: '✅' },
        { to: '/admin/announcements', label: 'Announcements', icon: '📢' },
    ],
    coordinator: [
        { to: '/coordinator', label: 'Dashboard', icon: '🏠', end: true },
        { to: '/coordinator/events', label: 'My Events', icon: '📅' },
        { to: '/coordinator/attendance', label: 'Attendance', icon: '✅' },
    ],
    student: [
        { to: '/student', label: 'Dashboard', icon: '🏠', end: true },
        { to: '/student/events', label: 'Browse Events', icon: '🔍' },
        { to: '/student/my-events', label: 'My Events', icon: '📋' },
        { to: '/student/scan', label: 'Scan QR', icon: '📷' },
        { to: '/student/history', label: 'History', icon: '📊' },
    ],
};

const roleColors = {
    admin: 'from-blue-600 to-purple-600',
    coordinator: 'from-emerald-600 to-teal-600',
    student: 'from-orange-500 to-pink-600',
};

const Sidebar = ({ mobileOpen, onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const links = navLinks[user?.role] || [];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[#020617]/80 backdrop-blur-xl border-r border-white/5 relative z-20">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-32 bg-blue-600/5 blur-3xl pointer-events-none" />

            {/* Logo / Brand */}
            <div className="p-8">
                <div className="flex items-center gap-4 group">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${roleColors[user?.role]} flex items-center justify-center shadow-xl shadow-blue-500/10 group-hover:rotate-6 transition-transform duration-500`}>
                        <span className="text-xl">🎓</span>
                    </div>
                    <div>
                        <h1 className="font-black text-white text-base tracking-tighter leading-tight uppercase">Smart <span className="text-blue-500">Campus</span></h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Event Management</p>
                    </div>
                </div>
            </div>

            {/* User Profile Hook */}
            <div className="px-6 mb-10">
                <div className="p-4 rounded-[1.5rem] bg-white/5 border border-white/5 group hover:border-blue-500/20 transition-all duration-500">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColors[user?.role]} flex items-center justify-center text-sm font-black text-white shadow-lg`}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-white truncate uppercase tracking-tight">{user?.name}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
                <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">Navigation</p>
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.end}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-5 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-500 group ${
                                isActive 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 ring-1 ring-white/10' 
                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <span className="text-lg group-hover:scale-110 transition-transform duration-500">{link.icon}</span>
                        <span>{link.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-6 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-500 group"
                >
                    <span className="text-lg group-hover:rotate-12 transition-transform">🚪</span>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 flex-col h-screen sticky top-0 flex-shrink-0 z-40">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex animate-fade-in">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
                    <aside className="relative w-80 flex flex-col h-full z-10 animate-slide-in-left">
                        <SidebarContent />
                    </aside>
                </div>
            )}
        </>
    );
};

export default Sidebar;
