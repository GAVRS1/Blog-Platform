// src/components/SkeletonPost.jsx (исправленная версия)
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function SkeletonPost() {
  return (
    <div className="card bg-base-100/90 backdrop-blur-sm shadow-xl border border-base-300/30 mb-4 sm:mb-6 rounded-2xl animate-pulse">
      <div className="card-body p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-base-300" />
          <div className="flex-1">
            <div className="h-3 sm:h-4 w-20 sm:w-24 bg-base-300 rounded mb-1" />
            <div className="h-2 sm:h-3 w-32 sm:w-40 bg-base-300 rounded" />
          </div>
        </div>
        <div className="h-4 sm:h-6 w-3/4 bg-base-300 rounded mb-2 sm:mb-3" />
        <div className="h-3 sm:h-4 w-full bg-base-300 rounded mb-1" />
        <div className="h-3 sm:h-4 w-2/3 bg-base-300 rounded mb-3 sm:mb-4" />
        <div className="h-32 sm:h-40 bg-base-300 rounded-xl mb-3 sm:mb-4" />
        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-base-300/50">
          <div className="flex gap-3 sm:gap-4">
            <div className="h-6 sm:h-8 w-12 sm:w-16 bg-base-300 rounded" />
            <div className="h-6 sm:h-8 w-12 sm:w-16 bg-base-300 rounded" />
          </div>
          <div className="h-5 sm:h-6 w-16 sm:w-20 bg-base-300 rounded" />
        </div>
      </div>
    </div>
  );
}