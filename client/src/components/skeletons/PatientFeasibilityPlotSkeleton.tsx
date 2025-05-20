import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Card, CardContent } from "@/components/ui/card";

export default function PatientFeasibilityPlotSkeleton() {
  return (
    <Card className="border border-gray-100 shadow-sm h-full">
      <CardContent className="p-4 h-full">
        <div className="flex justify-between items-center mb-2">
          <Skeleton width={200} height={24} />
          <div className="flex gap-2">
            <Skeleton width={40} height={24} />
            <Skeleton width={40} height={24} />
          </div>
        </div>
        
        <Skeleton width="60%" height={14} className="mb-4" />
        
        <div className="flex justify-center items-center h-64">
          {/* Skeleton for the radar chart */}
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton circle width={240} height={240} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton circle width={180} height={180} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton circle width={120} height={120} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton circle width={60} height={60} />
            </div>
            
            {/* Skeleton for the radar lines */}
            {Array(4).fill(0).map((_, index) => {
              const angle = (index * Math.PI) / 2;
              const style = {
                transform: `rotate(${angle}rad)`,
                transformOrigin: 'center',
              };
              
              return (
                <div 
                  key={index} 
                  className="absolute inset-0 flex items-center justify-center"
                  style={style}
                >
                  <div className="w-full h-0.5">
                    <Skeleton height={2} />
                  </div>
                </div>
              );
            })}
            
            {/* Skeleton for category labels */}
            {Array(4).fill(0).map((_, index) => {
              const positions = [
                { top: '-10px', left: '50%', transform: 'translateX(-50%)' },
                { top: '50%', right: '-60px', transform: 'translateY(-50%)' },
                { bottom: '-10px', left: '50%', transform: 'translateX(-50%)' },
                { top: '50%', left: '-60px', transform: 'translateY(-50%)' },
              ];
              
              return (
                <div 
                  key={index} 
                  className="absolute" 
                  style={positions[index]}
                >
                  <Skeleton width={60} height={16} />
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-4">
          <Skeleton width="100%" height={50} />
        </div>
      </CardContent>
    </Card>
  );
}