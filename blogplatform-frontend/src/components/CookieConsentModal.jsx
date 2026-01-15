import { createPortal } from 'react-dom';

export default function CookieConsentModal({ open, onAccept }) {
  if (!open) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm">
      <div
        className="rounded-2xl bg-base-100 shadow-xl border border-base-300 p-4 flex items-center gap-4"
        role="status"
        aria-live="polite"
      >
        <div className="flex-1">
          <p className="text-sm font-semibold">Мы используем cookies</p>
          <p className="text-xs opacity-70">Это нужно для работы сессий и безопасности.</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={onAccept}>
          OK
        </button>
      </div>
    </div>,
    document.body
  );
}
