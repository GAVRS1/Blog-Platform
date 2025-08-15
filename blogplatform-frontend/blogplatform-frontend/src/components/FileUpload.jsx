import { useState } from 'react';

export default function FileUpload({ onUpload, accept = "image/*", children }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://localhost:7141/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      onUpload(data.url);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className="file-upload">
      <input 
        type="file" 
        accept={accept} 
        onChange={(e) => handleUpload(e.target.files[0])}
        disabled={uploading}
        style={{ display: 'none' }}
      />
      {uploading ? 'Загрузка...' : children}
    </label>
  );
}