// src/pages/VerifyEmailPage.jsx
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * В текущем WebAPI нет ручки /Auth/verify-email-code.
 * Подтверждение выполняется по ссылке, которую обрабатывает БЭКЕНД.
 * Эта страница — просто “мягкий” экран: если пользователь попал сюда,
 * показываем статус и ведём на /login.
 */
export default function VerifyEmailPage() {
  const [sp] = useSearchParams();
  const [status, setStatus] = useState('ok'); // ok | info

  useEffect(() => {
    // Если бэк добавит параметры ?email=&code= и редирект сюда — можно их использовать,
    // но внешнего запроса делать не нужно (бэк уже подтвердил).
    if (!sp.get('email') && !sp.get('code')) {
      setStatus('info');
    } else {
      setStatus('ok');
    }
  }, [sp]);

  return (
    <motion.div className="min-h-screen flex items-center justify-center bg-base-200 p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          {status === 'ok' && (
            <>
              <div className="text-success text-4xl mb-2">✓</div>
              <h2 className="text-xl">Email подтверждён</h2>
              <p className="opacity-70 mt-2">Теперь вы можете войти в аккаунт.</p>
              <Link to="/login" className="btn btn-primary mt-4">Перейти ко входу</Link>
            </>
          )}
          {status === 'info' && (
            <>
              <div className="text-info text-4xl mb-2">ℹ</div>
              <h2 className="text-xl">Подтверждение email</h2>
              <p className="opacity-70 mt-2">Если вы перешли по ссылке из письма, email уже подтверждён.</p>
              <Link to="/login" className="btn btn-primary mt-4">Перейти ко входу</Link>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
