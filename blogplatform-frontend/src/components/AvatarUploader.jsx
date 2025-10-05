// src/components/AvatarUploader.jsx
import { useRef, useState } from 'react';
import Cropper from 'react-cropper';
import { mediaService } from '@/services/media';
import 'cropperjs/dist/cropper.css';
import toast from 'react-hot-toast';

/**
 * Если передан onUploaded(url) — после "Применить" сразу шлём на сервер и возвращаем URL.
 * Для обратной совместимости поддерживаем onCropped(blob) (если onUploaded не передан).
 */
export default function AvatarUploader({ onUploaded, onCropped }) {
  const [src, setSrc] = useState(null);
  const [busy, setBusy] = useState(false);
  const cropperRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSrc(reader.result);
    reader.readAsDataURL(file);
  };

  const apply = async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    const canvas = cropper.getCroppedCanvas({ width: 512, height: 512 });
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      if (onUploaded) {
        try {
          setBusy(true);
          const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
          const res = await mediaService.upload(file, 'avatar');
          toast.success('Аватар обновлён');
          onUploaded(res.url);
        } catch (e) {
          toast.error(e.response?.data || 'Не удалось загрузить аватар');
        } finally {
          setBusy(false);
          setSrc(null);
        }
      } else if (onCropped) {
        onCropped(blob);
        setSrc(null);
      } else {
        setSrc(null);
      }
    }, 'image/jpeg', 0.9);
  };

  const cancel = () => {
    setSrc(null);
  };

  return (
    <div className="space-y-3">
      {!src ? (
        <label className="btn btn-outline w-full">
          Выбрать аватар
          <input type="file" accept="image/*" hidden onChange={handleFile} />
        </label>
      ) : (
        <div className="space-y-3">
          <Cropper
            src={src}
            style={{ height: 320, width: '100%' }}
            aspectRatio={1}
            guides={false}
            viewMode={1}
            background={false}
            responsive
            ref={cropperRef}
          />
          <div className="flex gap-2">
            <button className={`btn btn-primary flex-1 ${busy ? 'loading' : ''}`} onClick={apply} disabled={busy}>
              Применить
            </button>
            <button className="btn btn-ghost flex-1" onClick={cancel} disabled={busy}>
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
