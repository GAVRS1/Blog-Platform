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
        onCropped(blob);
        setSrc(null);
      });
    }
  };

  return (
    <div className="avatar-uploader">
      <label>
        Выбрать аватар
        <input type="file" accept="image/*" onChange={handleFile} hidden />
      </label>

      {src && (
        <>
          <Cropper
            src={src}
            style={{ height: 300, width: '100%' }}
            aspectRatio={1}
            guides={false}
            ref={cropperRef}
          />
          <button onClick={crop}>Обрезать</button>
        </>
      )}
    </div>
  );
}