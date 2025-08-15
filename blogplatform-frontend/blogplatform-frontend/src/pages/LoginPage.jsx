import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
    try {
        const { token } = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        navigate('/');
    } catch (err) {
        alert('Ошибка авторизации');
    }
    };

    return (
    <div className="login-page">
        <h2>Вход</h2>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Войти</button>
    </div>
    );
}