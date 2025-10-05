// src/pages/VerifyEmailPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '@/services/auth';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | ok | fail

  useEffect(() => {
    const email = sp.get('email');
    const code = sp.get('code');
    if (!email || !code) {
      setStatus('fail');
      return;
    }
    (async () => {
      try {
        const res = await authService.verifyEmailCode(email, code);
        if (res?.verified) {
          setStatus('ok');
          toast.success('Email подтверждён');
          // редирект в мастер регистрации на 3-й шаг
          setTimeout(() => navigate(`/register?email=${encodeURIComponent(email)}&verified=true`), 800);
        } else {
          setStatus('fail');
        }
      } catch {
        setStatus('fail');
      }
    })();
  }, [sp, navigate]);

  return (
    <motion.div className="min-h-screen flex items-center justify-center bg-base-200 p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          {status === 'loading' && (
            <>
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <h2 className="text-xl mt-4">Проверяем код...</h2>
            </>
          )}
          {status === 'ok' && (
            <>
              <div className="text-success text-4xl mb-2">✓</div>
              <h2 className="text-xl">Готово! Перенаправляем...</h2>
            </>
          )}
          {status === 'fail' && (
            <>
              <div className="text-error text-4xl mb-2">⚠</div>
              <h2 className="text-xl">Ссылка недействительна</h2>
              <p className="opacity-70 mt-2">Попробуйте ещё раз из формы регистрации</p>
              <Link to="/register" className="btn btn-primary mt-4">К регистрации</Link>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
