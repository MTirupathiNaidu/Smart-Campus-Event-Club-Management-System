const EventCard = ({ event, onRegister, onCancel, isRegistered, showQR, onViewQR, showManage, onEdit, onDelete, showParticipants, onViewParticipants }) => {
    const eventDate = new Date(event.date);
    const isPast = eventDate < new Date();
    const isUpcoming = !isPast;
    const formattedDate = eventDate.toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
    const formattedTime = eventDate.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="card-premium group relative flex flex-col hover:-translate-y-2 transition-all duration-500 overflow-hidden">
            {/* Status indicator */}
            <div className="absolute top-4 right-4 z-10">
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${isPast ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                    {isPast ? 'Past' : 'Upcoming'}
                </span>
            </div>

            {/* Club tag */}
            {event.club_name && (
                <div className="mb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                        {event.club_name}
                    </span>
                </div>
            )}

            {/* Title */}
            <h3 className="text-xl font-black text-white mb-4 pr-16 group-hover:text-blue-400 transition-colors duration-300 leading-tight uppercase tracking-tight">
                {event.title}
            </h3>

            {/* Description */}
            {event.description && (
                <p className="text-slate-400 text-xs font-medium mb-8 line-clamp-2 leading-relaxed">
                    {event.description}
                </p>
            )}

            {/* Meta info */}
            <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 text-slate-300 font-bold text-xs uppercase tracking-tight">
                    <span className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-xl border border-white/5">📅</span>
                    <div className="flex flex-col">
                        <span>{formattedDate}</span>
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{formattedTime}</span>
                    </div>
                </div>
                {event.venue && (
                    <div className="flex items-center gap-4 text-slate-300 font-bold text-xs uppercase tracking-tight">
                        <span className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-xl border border-white/5">📍</span>
                        <span className="truncate">{event.venue}</span>
                    </div>
                )}
                <div className="flex items-center gap-4 text-slate-300 font-bold text-xs uppercase tracking-tight">
                    <span className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-xl border border-white/5">👥</span>
                    <span>{event.registration_count || 0} / {event.max_participants} <span className="text-[10px] text-slate-500 ml-1 font-black uppercase">Quota</span></span>
                </div>
            </div>

            {/* Progress bar for capacity */}
            <div className="w-full bg-white/5 rounded-full h-1.5 mb-8 overflow-hidden border border-white/5">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${(event.registration_count / event.max_participants) > 0.8 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' :
                            (event.registration_count / event.max_participants) > 0.5 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]'
                        }`}
                    style={{ width: `${Math.min(100, ((event.registration_count || 0) / event.max_participants) * 100)}%` }}
                />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-auto">
                {/* Student actions */}
                {onRegister && isUpcoming && !isRegistered && (
                    <button onClick={() => onRegister(event.event_id || event.id)} className="btn-primary flex-1 py-3 text-[10px] font-black tracking-widest uppercase">
                        Register
                    </button>
                )}
                {onCancel && isRegistered && (
                    <button onClick={() => onCancel(event.event_id || event.id)} className="w-full py-3 text-[10px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest border border-red-500/10 hover:border-red-500/30 rounded-2xl transition-all">
                        Cancel Registration
                    </button>
                )}
                {isRegistered && !onCancel && (
                    <div className="flex-1 py-3 text-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">✓ Registered</span>
                    </div>
                )}

                {/* Coordinator/Admin actions */}
                {showQR && event.qr_token && onViewQR && (
                    <button onClick={() => onViewQR(event)} className="btn-secondary py-3 text-[10px] font-black tracking-widest uppercase">
                        📷 View QR
                    </button>
                )}
                {showParticipants && onViewParticipants && (
                    <button onClick={() => onViewParticipants(event)} className="btn-secondary py-3 text-[10px] font-black tracking-widest uppercase">
                        👥 View Participants
                    </button>
                )}
                {showManage && (
                    <div className="flex w-full gap-2 mt-4">
                        <button onClick={() => onEdit(event)} className="flex-1 py-2 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest bg-white/5 border border-white/5 rounded-xl transition-all">
                            Edit
                        </button>
                        <button onClick={() => onDelete(event.id)} className="flex-1 py-2 text-[10px] font-black text-slate-500 hover:text-red-400 uppercase tracking-widest bg-white/5 border border-white/5 rounded-xl transition-all">
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventCard;
