import { useState } from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden">
            <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile header */}
                <header className="lg:hidden bg-slate-900 border-b border-slate-700/50 px-4 py-3 flex items-center gap-3 flex-shrink-0">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center text-white"
                    >
                        ☰
                    </button>
                    <span className="font-bold text-white">🎓 Smart Campus</span>
                </header>

                {/* Main content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
