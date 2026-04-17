import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ── Client-side roll number preview (mirrors backend logic) ──
const COLLEGE_CODE = '48';
const BRANCH_NAMES = {
    '1A05': 'CSE', '1A01': 'Civil Engineering', '1A02': 'EEE',
    '1A03': 'Mechanical Engineering', '1A04': 'ECE', '1A06': 'IT',
    '1A12': 'CSE (AI & ML)', '1A21': 'CSE (Data Science)',
};

const previewRoll = (roll) => {
    const r = roll.toUpperCase().trim();
    if (!/^[A-Z0-9]{10}$/.test(r)) return null;
    const admYear    = r.slice(0, 2);
    const college    = r.slice(2, 4);
    const branchCode = r.slice(4, 8);
    if (college !== COLLEGE_CODE) return { error: `College code must be "${COLLEGE_CODE}" – not a registered college.` };
    const now = new Date();
    const curYear = now.getFullYear() % 100;
    const acYear  = now.getMonth() + 1 >= 6 ? curYear : curYear - 1;
    const yr      = (acYear - parseInt(admYear, 10)) + 1;
    
    // Allow up to 5 to cover batch 21 finishing 4th year in April 2026
    if (yr < 1 || yr > 5) return { error: `Admission year "${admYear}" is not a valid active batch.` };
    
    const branchName = BRANCH_NAMES[branchCode] || branchCode;
    const yearLabels = ['1st Year', '2nd Year', '3rd Year', '4th Year', '4th (Graduating)'];
    const yearLabel  = yearLabels[yr - 1] || `${yr}th Year`;
    
    return { year: yr, yearLabel, branchCode, branchName };
};

const Register = () => {
    const [form, setForm] = useState({
        name: '', email: '', password: '', confirm: '', role: 'student',
        rollNumber: ''
    });
    const [rollPreview, setRollPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleRollChange = (e) => {
        const val = e.target.value.toUpperCase();
        setForm({ ...form, rollNumber: val });
        if (val.length === 10) {
            setRollPreview(previewRoll(val));
        } else {
            setRollPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirm) return toast.error('Passwords do not match.');
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');
        if (form.role === 'student' && (!rollPreview || rollPreview.error)) {
            return toast.error('Please enter a valid 10-digit college roll number.');
        }
        setLoading(true);
        try {
            const { confirm, ...payload } = form;
            const user = await register(payload);
            if (user.role === 'pending') {
                toast.success('Registration submitted! Waiting for admin approval.');
                navigate('/pending');
            } else {
                toast.success(`Welcome, ${user.name}! 🎉`);
                navigate({ admin: '/admin', coordinator: '/coordinator', student: '/student', pending: '/pending' }[user.role] || '/login');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-premium flex items-center justify-center p-6 relative overflow-y-auto">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '3s' }} />
            </div>

            <div className="w-full max-w-[500px] py-12 relative animate-fade-in">
                <div className="card-premium glow-purple">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl shadow-purple-500/40 border border-white/20 transform hover:-rotate-6 transition-transform duration-500">
                            🎓
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
                            Join <span className="gradient-text">Campus</span>
                        </h1>
                        <p className="text-slate-400 font-medium">Create your professional profile</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="label">Full Name</label>
                                <input type="text" className="input-field" placeholder="John Doe"
                                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            </div>

                            <div className="space-y-2">
                                <label className="label">Email Address</label>
                                <input type="email" className="input-field" placeholder="you@campus.edu"
                                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="label">I am a...</label>
                            <div className="grid grid-cols-2 gap-4">
                                {['student', 'coordinator'].map((role) => (
                                    <button key={role} type="button"
                                        onClick={() => { setForm({ ...form, role, rollNumber: '' }); setRollPreview(null); }}
                                        className={`py-4 rounded-2xl border-2 text-sm font-bold transition-all duration-300 flex flex-col items-center gap-2 ${form.role === role
                                            ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_20px_-5px_rgba(59,130,246,0.4)]'
                                            : 'border-white/5 bg-white/5 text-slate-500 hover:border-white/10 hover:bg-white/10'}`}>
                                        <span className="text-2xl">{role === 'student' ? '🎓' : '🏫'}</span>
                                        <span>{role === 'student' ? 'Student' : 'Coordinator'}</span>
                                    </button>
                                ))}
                            </div>
                            {form.role === 'coordinator' && (
                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                    <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider text-center">⚠️ Admin Verification Required</p>
                                </div>
                            )}
                        </div>

                        {form.role === 'student' && (
                            <div className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md animate-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400">Student Verification</h3>
                                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">REQ</span>
                                </div>

                                <div className="space-y-2">
                                    <label className="label">College Roll Number</label>
                                    <input
                                        type="text"
                                        className={`input-field uppercase tracking-[0.2em] font-mono text-center ${
                                            rollPreview
                                                ? rollPreview.error
                                                    ? 'border-red-500/50 focus:border-red-500 text-red-400'
                                                    : 'border-emerald-500/50 focus:border-emerald-500 text-emerald-400'
                                                : ''
                                        }`}
                                        placeholder="23481A05XX"
                                        maxLength={10}
                                        value={form.rollNumber}
                                        onChange={handleRollChange}
                                        required
                                    />
                                </div>

                                {rollPreview && (
                                    <div className={`p-4 rounded-2xl border animate-in zoom-in duration-300 ${
                                        rollPreview.error ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
                                    }`}>
                                        {rollPreview.error ? (
                                            <p className="text-red-400 text-xs font-bold flex items-center gap-2">
                                                <span>✕</span> {rollPreview.error}
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3 text-center">
                                                <div className="bg-black/20 rounded-xl p-2 border border-white/5">
                                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Class</p>
                                                    <p className="text-xs font-extrabold text-white">{rollPreview.yearLabel} Year</p>
                                                </div>
                                                <div className="bg-black/20 rounded-xl p-2 border border-white/5">
                                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Branch</p>
                                                    <p className="text-xs font-extrabold text-white">{rollPreview.branchName}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="label">Password</label>
                                <input type="password" className="input-field" placeholder="Min. 6 chars"
                                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                            </div>

                            <div className="space-y-2">
                                <label className="label">Confirm</label>
                                <input type="password" className="input-field" placeholder="Repeat it"
                                    value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full group overflow-hidden relative mt-4">
                            <span className={loading ? 'opacity-0' : 'opacity-100 transition-opacity'}>✨ Create Professional Account</span>
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-blue-600">
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                </div>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-white/5 text-center">
                        <p className="text-slate-400 text-sm font-medium">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-all hover:underline decoration-2 underline-offset-4">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
