import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Card, CardContent } from "@/components/ui/card";

export default function ElementsPanelSkeleton() {
  return (
    <Card className="border border-gray-100  h-full">
      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <Skeleton width={140} height={24} />
            <div className="ml-2">
              <Skeleton width={30} height={20} circle={true} />
            </div>
          </div>
          <Skeleton width={60} height={28} />
        </div>
        
        <Skeleton width="70%" height={14} className="mb-3" />
        
        <div className="border rounded-md p-2 bg-gray-50 flex-grow overflow-hidden">
          <div className="overflow-y-auto h-full">
            {Array(8).fill(0).map((_, index) => (
              <div 
                key={index}
                className="py-1 px-2 my-1 rounded border flex items-center justify-between"
              >
                <Skeleton width={120} height={16} />
                <Skeleton width={20} height={16} />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}