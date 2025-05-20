import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Card, CardContent } from "@/components/ui/card";

export default function PatientDemographicsSkeleton() {
  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Skeleton width={180} height={24} />
            <div className="ml-3">
              <Skeleton width={120} height={20} />
            </div>
          </div>
          <Skeleton width={60} height={28} />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3 mt-3">
          {Array(8).fill(0).map((_, index) => (
            <div key={index}>
              <Skeleton width={60} height={14} className="mb-1" />
              <Skeleton width={index % 2 === 0 ? 100 : 80} height={18} />
            </div>
          ))}
          
          <div className="col-span-2 md:col-span-4">
            <Skeleton width={100} height={14} className="mb-1" />
            <Skeleton width="100%" height={18} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}