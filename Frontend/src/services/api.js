import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Normalize MongoDB _id → id recursively so existing components continue using .id
const normalizeIds = (data) => {
    if (data === null || data === undefined) return data;
    if (Array.isArray(data)) return data.map(normalizeIds);
    if (typeof data === 'object') {
        const result = { ...data };
        if (result._id !== undefined && result.id === undefined) {
            result.id = result._id;
        }
        // Normalize nested objects
        for (const key of Object.keys(result)) {
            if (result[key] && typeof result[key] === 'object') {
                result[key] = normalizeIds(result[key]);
            }
        }
        return result;
    }
    return data;
};

// Attach JWT token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('campus_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors + normalize _id → id in all responses
API.interceptors.response.use(
    (response) => {
        if (response.data) {
            response.data = normalizeIds(response.data);
        }
        return response;
    },
    (error) => {
        console.error('API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.response?.data?.message || error.message
        });
        if (error.response?.status === 401) {
            localStorage.removeItem('campus_token');
            localStorage.removeItem('campus_user');
            // Avoid infinite loops if already on login page
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth
export const authAPI = {
    register: (data) => API.post('/auth/register', data),
    login: (data) => API.post('/auth/login', data),
    me: () => API.get('/auth/me'),
};

// Users
export const userAPI = {
    getAll: () => API.get('/users'),
    getStats: () => API.get('/users/stats'),
    getPendingCoordinators: () => API.get('/users/coordinators/pending'),
    approve: (id) => API.put(`/users/${id}/approve`),
    reject: (id) => API.put(`/users/${id}/reject`),
    delete: (id) => API.delete(`/users/${id}`),
};

// Clubs
export const clubAPI = {
    getAll: () => API.get('/clubs'),
    getById: (id) => API.get(`/clubs/${id}`),
    create: (data) => API.post('/clubs', data),
    update: (id, data) => API.put(`/clubs/${id}`, data),
    delete: (id) => API.delete(`/clubs/${id}`),
};

// Events
export const eventAPI = {
    getAll: () => API.get('/events'),
    getPublic: () => API.get('/events/public'),
    getUpcoming: () => API.get('/events/upcoming'),
    getMy: () => API.get('/events/my'),
    getAnalytics: () => API.get('/events/analytics'),
    getById: (id) => API.get(`/events/${id}`),
    getParticipants: (id) => API.get(`/events/${id}/participants`),
    create: (data) => API.post('/events', data),
    update: (id, data) => API.put(`/events/${id}`, data),
    delete: (id) => API.delete(`/events/${id}`),
    becomeOrganizer: (id) => API.post(`/events/${id}/organizers`),
};

// Registrations
export const registrationAPI = {
    register: (event_id) => API.post('/registrations/register', { event_id }),
    cancel: (event_id) => API.post('/registrations/cancel', { event_id }),
    getMy: () => API.get('/registrations/my'),
    getAll: () => API.get('/registrations/all'),
};

// Attendance
export const attendanceAPI = {
    scan: (qr_token) => API.post('/attendance/scan', { qr_token }),
    getEventAttendance: (id) => API.get(`/attendance/event/${id}`),
    getMy: () => API.get('/attendance/my'),
};

// Announcements
export const announcementAPI = {
    getAll: () => API.get('/announcements'),
    create: (data) => API.post('/announcements', data),
    delete: (id) => API.delete(`/announcements/${id}`),
};

export default API;
