import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function ProfileTabsSkeleton() {
  return (
    <div className="mb-6">
      <div className="flex border-b border-gray-200">
        {Array(4).fill(0).map((_, index) => (
          <div 
            key={index}
            className="mr-6 pb-2 relative"
          >
            <Skeleton width={80} height={20} />
          </div>
        ))}
      </div>
    </div>
  );
}