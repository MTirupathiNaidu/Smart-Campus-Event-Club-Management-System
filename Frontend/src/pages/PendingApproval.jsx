import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PendingApproval = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
        toast.success('Logged out.');
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Liquid Background */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[120px] pointer-events-none -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none -ml-24 -mb-24" />

            <div className="card-premium max-w-md w-full relative z-10 animate-scale-in text-center p-12 glow-amber overflow-hidden border-white/10 shadow-[0_0_50px_rgba(245,158,11,0.1)]">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="text-4xl font-black italic tracking-tighter">WAIT</span>
                </div>

                <div className="w-24 h-24 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-[2rem] border border-amber-500/30 flex items-center justify-center text-5xl mx-auto mb-10 shadow-2xl animate-pulse-slow">
                    ⏳
                </div>

                <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter leading-tight">Verification <span className="text-amber-500">Pending</span></h1>
                
                <div className="space-y-4 mb-10">
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                        Your Coordinator credentials are currently being validated by our campus administrators.
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 leading-relaxed max-w-[280px] mx-auto">
                        Access to the core management modules will be granted upon successful identity verification.
                    </p>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 mb-10 group hover:bg-amber-500/10 transition-colors duration-500">
                    <div className="flex items-center gap-4 text-left">
                        <span className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">📌</span>
                        <div>
                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Trace Latency</p>
                            <p className="text-xs font-bold text-slate-400">1–2 Business Days (Mean Time To Approval)</p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleLogout} 
                    className="w-full flex items-center justify-center gap-4 py-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-500 group"
                >
                    <span className="text-lg group-hover:rotate-12 transition-transform duration-500">🚪</span>
                    <span>Terminate Connection</span>
                </button>
            </div>
        </div>
    );
};

export default PendingApproval;
