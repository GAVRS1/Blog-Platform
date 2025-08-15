import { useEffect, useState } from 'react';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import FileUpload from '../components/FileUpload';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        bio: '',
        birthDate: '',
        profilePictureUrl: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            // Получаем текущего пользователя из токена
            const token = localStorage.getItem('token');
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userId = payload.nameid;

            const userResponse = await api.get(`/users/${userId}`);
            setUser(userResponse.data);
            setFormData({
                username: userResponse.data.username,
                fullName: userResponse.data.fullName,
                bio: userResponse.data.bio || '',
                birthDate: userResponse.data.birthDate ? 
                    new Date(userResponse.data.birthDate).toISOString().split('T')[0] : '',
                profilePictureUrl: userResponse.data.profilePictureUrl || ''
            });

            const postsResponse = await api.get(`/posts/user/${userId}`);
            setPosts(postsResponse.data);
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
        }
    };

    const handleSave = async () => {
        try {
            await api.put('/users/profile', formData);
            setUser({ ...user, ...formData });
            setIsEditing(false);
        } catch (error) {
            console.error('Ошибка сохранения:', error);
        }
    };

    if (!user) return <p>Загрузка...</p>;

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-avatar">
                    <img 
                        src={user.profilePictureUrl || '/avatar.png'} 
                        alt="Аватар" 
                        className="avatar-large"
                    />
                    {isEditing && (
                        <FileUpload 
                            onUpload={(url) => setFormData({...formData, profilePictureUrl: url})}
                        >
                            <div className="avatar-upload-overlay">📷</div>
                        </FileUpload>
                    )}
                </div>

                <div className="profile-info">
                    {isEditing ? (
                        <div className="edit-form">
                            <input 
                                type="text" 
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                placeholder="Имя пользователя"
                            />
                            <input 
                                type="text" 
                                value={formData.fullName}
                                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                placeholder="Полное имя"
                            />
                            <textarea 
                                value={formData.bio}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                placeholder="О себе"
                                rows="3"
                            />
                            <input 
                                type="date" 
                                value={formData.birthDate}
                                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                            />
                            <div className="edit-actions">
                                <button onClick={handleSave} className="btn-primary">Сохранить</button>
                                <button onClick={() => setIsEditing(false)}>Отмена</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2>@{user.username}</h2>
                            <h3>{user.fullName}</h3>
                            <p className="bio">{user.bio || 'Нет информации о себе'}</p>
                            <p className="birth-date">
                                {user.birthDate && `Дата рождения: ${new Date(user.birthDate).toLocaleDateString()}`}
                            </p>
                            <button onClick={() => setIsEditing(true)} className="btn-primary">
                                Редактировать профиль
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="profile-stats">
                <div className="stat">
                    <span className="stat-value">{posts.length}</span>
                    <span className="stat-label">публикаций</span>
                </div>
            </div>

            <div className="profile-posts">
                <h3>Мои публикации</h3>
                {posts.length === 0 ? (
                    <p>У вас еще нет публикаций</p>
                ) : (
                    posts.map(post => <PostCard key={post.id} post={post} />)
                )}
            </div>
        </div>
    );
}