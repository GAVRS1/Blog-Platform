// src/pages/BlockedPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { appealsService } from '@/services/appeals';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function BlockedPage() {
  const [loading, setLoading] = useState(true);
  const [blockInfo, setBlockInfo] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await appealsService.getBlockStatus();
        setBlockInfo(data);
      } catch (e) {
        toast.error(e.response?.data?.message || 'Не удалось загрузить информацию о блокировке');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[60vh] flex items-center justify-center px-4"
    >
      <div className="card bg-base-100 shadow max-w-lg w-full">
        <div className="card-body text-center">
          <h1 className="text-2xl font-bold">Аккаунт заблокирован</h1>
          {loading ? (
            <div className="flex justify-center py-6">
              <span className="loading loading-spinner text-primary" />
            </div>
          ) : (
            <>
              <p className="opacity-70 mt-2">
                Администратор ограничил доступ к вашему аккаунту.
              </p>
              {blockInfo?.reason && (
                <div className="alert alert-warning mt-4 text-left">
                  <div>
                    <div className="font-semibold">Причина блокировки</div>
                    <div className="text-sm opacity-80 mt-1">{blockInfo.reason}</div>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="card-actions justify-center mt-6">
            <Link to="/appeal" className="btn btn-primary">
              Подать апелляцию
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
