// src/pages/PostDetailPage.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Comment from '../components/Comment';
import MediaPlayer from '../components/MediaPlayer';

export default function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);

  // добавляем токен перед каждым запросом
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, []);

  const loadData = async () => {
    try {
      const [postRes, commentsRes] = await Promise.all([
        api.get(`/posts/${id}`),
        api.get(`/comments/post/${id}`)
      ]);
      setPost(postRes.data);
      setComments(commentsRes.data);
    } catch (err) {
      console.error(err);
      
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (!post) return <p>Загрузка...</p>;

  return (
    <div className="post-detail">
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <MediaPlayer url={post.imageUrl} type="image" />
      <MediaPlayer url={post.videoUrl} type="video" />
      <MediaPlayer url={post.audioUrl} type="audio" />

      <h3>Комментарии</h3>
      {comments.map(c => <Comment key={c.id} comment={c} />)}
    </div>
  );
}