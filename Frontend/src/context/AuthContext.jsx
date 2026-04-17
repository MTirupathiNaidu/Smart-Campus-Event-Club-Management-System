import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('campus_token');
        const storedUser = localStorage.getItem('campus_user');
        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('campus_token');
                localStorage.removeItem('campus_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await authAPI.login({ email, password });
        const { token, user: userData } = res.data;
        localStorage.setItem('campus_token', token);
        localStorage.setItem('campus_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const register = async (userDataPayload) => {
        const res = await authAPI.register(userDataPayload);
        const { token, user: userData } = res.data;
        localStorage.setItem('campus_token', token);
        localStorage.setItem('campus_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('campus_token');
        localStorage.removeItem('campus_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
