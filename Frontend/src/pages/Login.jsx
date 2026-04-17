import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(form.email, form.password);
            toast.success(`Welcome back, ${user.name}!`);
            const redirects = { admin: '/admin', coordinator: '/coordinator', student: '/student', pending: '/pending' };
            navigate(redirects[user.role] || '/student');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-premium flex items-center justify-center p-6 relative">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="w-full max-w-[440px] relative animate-fade-in">
                <div className="card-premium glow-blue">
                    {/* Logo & Header */}
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl shadow-blue-500/40 border border-white/20 transform hover:rotate-6 transition-transform duration-500">
                            🎓
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
                            Welcome <span className="gradient-text">Back</span>
                        </h1>
                        <p className="text-slate-400 font-medium">Smart Campus Management</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="label">Email</label>
                            <input
                                type="email"
                                className="input-field"
                                placeholder="you@campus.edu"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="label">Password</label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full group overflow-hidden relative"
                        >
                            <span className={`flex items-center gap-2 transition-all duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                                Sign In
                            </span>
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-blue-600">
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                </div>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-white/5 text-center">
                        <p className="text-slate-400 text-sm font-medium">
                            New to the platform?{' '}
                            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-bold transition-all hover:underline decoration-2 underline-offset-4">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
