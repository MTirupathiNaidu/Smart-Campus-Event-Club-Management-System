import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import PendingApproval from './pages/PendingApproval';
import LandingPage from './pages/LandingPage';

const RootRedirect = () => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    const routes = { admin: '/admin', coordinator: '/coordinator', student: '/student', pending: '/pending' };
    return <Navigate to={routes[user.role] || '/login'} replace />;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: '#1e293b',
                            color: '#f1f5f9',
                            border: '1px solid rgba(148,163,184,0.1)',
                            borderRadius: '12px',
                        },
                        success: { iconTheme: { primary: '#10b981', secondary: '#f1f5f9' } },
                        error: { iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' } },
                    }}
                />
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<LandingPage />} />

                    {/* Dashboard entry point */}
                    <Route path="/dashboard" element={<RootRedirect />} />

                    {/* Admin routes */}
                    <Route path="/admin/*" element={
                        <ProtectedRoute roles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Coordinator routes */}
                    <Route path="/coordinator/*" element={
                        <ProtectedRoute roles={['coordinator']}>
                            <CoordinatorDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Student routes */}
                    <Route path="/student/*" element={
                        <ProtectedRoute roles={['student']}>
                            <StudentDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Pending approval */}
                    <Route path="/pending" element={
                        <ProtectedRoute roles={['pending']}>
                            <PendingApproval />
                        </ProtectedRoute>
                    } />

                    {/* 404 fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
