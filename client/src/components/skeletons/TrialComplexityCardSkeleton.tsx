import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Card, CardContent } from "@/components/ui/card";

export default function TrialComplexityCardSkeleton() {
  return (
    <Card className="border border-gray-100 shadow-sm lg:col-span-3">
      <CardContent className="p-4">
        <div className="mb-2">
          <Skeleton width={200} height={24} className="mb-1" />
          <Skeleton width="50%" height={14} />
        </div>
        
        {/* Categories grid - 2x2 layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, index) => (
            <div 
              key={index}
              className="border rounded-md p-3 bg-gray-50"
            >
              <div className="flex justify-between items-center mb-2">
                <Skeleton width={120} height={18} />
                <Skeleton width={50} height={18} circle={true} />
              </div>
              
              <div className="overflow-y-auto pr-1" style={{ height: "135px" }}>
                {Array(index + 1).fill(0).map((_, itemIndex) => (
                  <div 
                    key={itemIndex}
                    className="py-1 px-2 my-1 rounded border shadow-sm flex items-center justify-between"
                  >
                    <Skeleton width={110} height={16} />
                    <Skeleton width={20} height={16} />
                  </div>
                ))}
                
                {index === 0 && (
                  <div className="text-center py-8 border border-dashed rounded-md">
                    <Skeleton width={100} height={16} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-3 p-2 bg-gray-50 rounded flex items-center">
          <Skeleton width="90%" height={14} />
        </div>
      </CardContent>
    </Card>
  );
}