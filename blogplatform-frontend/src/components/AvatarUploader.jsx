// src/components/AvatarUploader.jsx
import { useRef, useState } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

export default function AvatarUploader({ onCropped }) {
  const [src, setSrc] = useState(null);
  const cropperRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSrc(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const crop = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.getCroppedCanvas().toBlob((blob) => {
        if (blob) {
          onCropped(blob);
        }
        setSrc(null);
      }, 'image/jpeg', 0.8); // Указываем тип JPEG и качество 80%
    }
  };

  // Автоматическая обрезка при закрытии кроппера (по желанию)
  const handleCancel = () => {
    setSrc(null);
    onCropped(null); // Сбрасываем аватар если пользователь отменил
  };

  return (
    <div className="avatar-uploader space-y-4">
      {!src ? (
        <label className="btn btn-outline w-full">
          Выбрать аватар
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFile} 
            hidden 
          />
        </label>
      ) : (
        <div className="space-y-4">
          <Cropper
            src={src}
            style={{ height: 300, width: '100%' }}
            aspectRatio={1}
            guides={false}
            ref={cropperRef}
            viewMode={1}
            autoCropArea={1}
            movable={false}
            zoomable={false}
          />
          <div className="flex gap-2">
            <button 
              className="btn btn-primary flex-1"
              onClick={crop}
            >
              Применить
            </button>
            <button 
              className="btn btn-outline flex-1"
              onClick={handleCancel}
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}