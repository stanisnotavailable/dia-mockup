import { useContext, useMemo, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from "recharts";
import { TrialDataContext, CATEGORIES, CategoryType, Profile } from "@/contexts/TrialDataContext";

// Force component to rerender on interval (temporary fix for real-time updates)
function useForceUpdate() {
  const [, setValue] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setValue(value => value + 1);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
}

export default function PatientFeasibilityPlot() {
  // Get everything directly from context to ensure real-time updates
  const { getCurrentProfile } = useContext(TrialDataContext);
  
  // Force re-render to catch updates
  useForceUpdate();
  
  // Get profile data directly from context each time
  const profileData = getCurrentProfile();
  const trialData = profileData.trialData;
  
  // Define colors for each category
  const categoryColors = useMemo(() => ({
    [CATEGORIES.LOGISTICS]: "#3b82f6", // Blue
    [CATEGORIES.MOTIVATION]: "#ec4899", // Pink
    [CATEGORIES.HEALTHCARE]: "#10b981", // Green
    [CATEGORIES.QUALITY]: "#8b5cf6", // Purple
  }), []);
  
  // Prepare data for the radar chart
  const radarData = useMemo(() => {
    // Create one data point for each axis
    return Object.values(CATEGORIES).map(category => {
      // Convert to flat data structure for the chart
      const dataPoint: Record<string, any> = { category };
      
      // For each category, add a value
      Object.values(CATEGORIES).forEach(cat => {
        const items = trialData.complexityItems[cat as CategoryType] || [];
        dataPoint[cat] = items.length > 0 ? Math.min(100, items.length * 20) : 0;
      });
      
      return dataPoint;
    });
  }, [trialData.complexityItems]);
  
  // Check if there's data to display
  const hasDataToDisplay = useMemo(() => {
    return Object.values(trialData.complexityItems).some(items => items && items.length > 0);
  }, [trialData.complexityItems]);
  
  // Get number of questions in a category
  const getQuestionCount = (category: string) => {
    return trialData.complexityItems[category as CategoryType]?.length || 0;
  };
  
  // Legend for chart
  const renderCustomLegend = () => {
    if (!hasDataToDisplay) return null;
    
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {Object.entries(categoryColors).map(([category, color]) => {
          const count = getQuestionCount(category);
          if (count === 0) return null;
          
          return (
            <div 
              key={category} 
              className="flex items-center text-xs px-2 py-1 rounded-full" 
              style={{ 
                backgroundColor: `${color}15`, 
                color: color,
                border: `1px solid ${color}30`
              }}
            >
              <div 
                className="w-2.5 h-2.5 rounded-full mr-1.5" 
                style={{ backgroundColor: color }} 
              />
              <span className="font-medium">{category}</span>
              <span className="ml-1 bg-white px-1.5 py-0.5 rounded-full text-xs font-medium" style={{ color }}>
                {count}
              </span>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <Card className="bg-white shadow-sm mt-4">
      <CardContent className="p-4">
        <div className="font-medium text-lg mb-1">Patient Feasibility Plot</div>
        <div className="text-sm text-gray-500 mb-4">Visualizing trial complexity across key dimensions</div>
        
        <div className="w-full h-[300px] relative">
          {/* Display category legend inside the chart at the top */}
          <div className="absolute top-0 left-0 right-0 z-10 py-2">
            {renderCustomLegend()}
          </div>
          
          {hasDataToDisplay ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart 
                outerRadius="70%" 
                data={radarData}
                margin={{ top: 30, right: 30, left: 30, bottom: 5 }}
              >
                <PolarGrid gridType="polygon" stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="category" 
                  tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <PolarRadiusAxis 
                  domain={[0, 100]} 
                  tick={{ fill: '#9ca3af', fontSize: 9 }}
                  tickCount={5}
                  axisLine={false}
                  tickLine={false}
                />
                
                {/* One radar per category with respective colors */}
                {Object.values(CATEGORIES).map(category => {
                  const items = trialData.complexityItems[category as CategoryType] || [];
                  if (items.length === 0) return null; // Skip empty categories
                  
                  return (
                    <Radar
                      key={category}
                      name={category}
                      dataKey={category}
                      stroke={categoryColors[category as CategoryType]}
                      fill={categoryColors[category as CategoryType]}
                      fillOpacity={0.3}
                      dot 
                      activeDot={{ r: 5 }}
                    />
                  );
                })}
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="text-gray-400 text-center px-2">
                <div className="text-lg font-medium mb-2">No Data Available</div>
                <p className="text-sm">Drag questions into the Trial Complexity Categories to generate a visualization.</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
