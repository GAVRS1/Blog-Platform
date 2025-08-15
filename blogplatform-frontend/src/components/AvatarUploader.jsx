// src/components/AvatarUploader.jsx
export default function AvatarUploader({ onFile }) {
  const handleFile = e => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  };

  return (
    <label className="avatar-uploader">
      Выбрать аватар
      <input type="file" accept="image/*" onChange={handleFile} hidden />
    </label>
  );
}