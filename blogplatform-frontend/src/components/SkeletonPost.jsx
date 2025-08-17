import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function SkeletonPost() {
  return (
    <div className="card bg-base-100 shadow-xl mb-6 animate-pulse">
      <div className="card-body">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-base-300" />
          <div>
            <div className="h-4 w-20 bg-base-300 rounded" />
            <div className="h-3 w-36 bg-base-300 rounded mt-1" />
          </div>
        </div>
        <div className="h-6 w-3/4 bg-base-300 rounded mt-2" />
        <div className="h-4 w-full bg-base-300 rounded mt-1" />
        <div className="h-40 bg-base-300 rounded mt-2" />
      </div>
    </div>
  );
}