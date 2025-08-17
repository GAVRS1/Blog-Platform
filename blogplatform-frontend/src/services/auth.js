import api from '@/api/axios';

export const authService = {
    async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    return data.user;
    },

    async register(body) {
    const { data } = await api.post('/auth/register', body);
    localStorage.setItem('token', data.token);
    return data.user;
    },

    logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
    },

    async refresh() {
    const { data } = await api.get('/auth/me');
    return data;
    },
};