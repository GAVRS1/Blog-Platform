import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef } from 'react';

export default function CookieConsentModal({ open, status, onAccept, onDecline, onRequestClose }) {
  const dialogRef = useRef(null);
  const locked = status === 'pending';

  const focusableSelectors = useMemo(
    () => [
      'button',
      '[href]',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])',
    ].join(','),
    []
  );

  useEffect(() => {
    if (!open) return undefined;
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement;
    const body = document.body;
    const originalOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    const focusable = dialog?.querySelectorAll(focusableSelectors) || [];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (first && typeof first.focus === 'function') first.focus();
    else dialog?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Tab' && focusable.length > 0) {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      if (e.key === 'Escape' && !locked) {
        e.preventDefault();
        onRequestClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      body.style.overflow = originalOverflow;
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [focusableSelectors, locked, onRequestClose, open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-base-300/70 backdrop-blur-sm flex items-center justify-center px-4 py-6"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !locked) {
          onRequestClose?.();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-xl rounded-2xl bg-base-100 shadow-2xl p-6 sm:p-8 outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
        tabIndex={-1}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Ваша конфиденциальность</p>
            <h2 id="cookie-consent-title" className="text-2xl font-bold mt-1">Используем cookies</h2>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            aria-label="Закрыть уведомление о cookies"
            onClick={() => !locked && onRequestClose?.()}
            disabled={locked}
          >
            ✕
          </button>
        </div>

        <p id="cookie-consent-description" className="mt-3 text-base leading-relaxed opacity-80">
          Мы применяем cookies, чтобы хранить сессию, защищать ваш аккаунт и понимать, как сервисом пользуются.
          Вы можете принять или отклонить их использование. При отклонении доступ к сервису будет ограничен.
        </p>

        <ul className="mt-4 space-y-2 text-sm opacity-80">
          <li className="flex gap-2">
            <span aria-hidden="true">•</span>
            <span>Функциональные cookies нужны для входа и работы чатов.</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true">•</span>
            <span>Без них мы отключим API-запросы и очистим активные сессии.</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true">•</span>
            <span>Решение можно изменить в любой момент.</span>
          </li>
        </ul>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center">
          <button
            type="button"
            className="btn btn-primary w-full sm:w-auto"
            onClick={onAccept}
          >
            Принять cookies
          </button>
          <button
            type="button"
            className="btn btn-outline w-full sm:w-auto"
            onClick={onDecline}
          >
            Отклонить
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
