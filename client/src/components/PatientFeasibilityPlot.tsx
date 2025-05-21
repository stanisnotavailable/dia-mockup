import { useContext, useMemo, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from "recharts";
import { TrialDataContext, CATEGORIES, CategoryType, Profile } from "@/contexts/TrialDataContext";

export default function PatientFeasibilityPlot() {
  const { getCurrentProfile } = useContext(TrialDataContext);
  const [profileData, setProfileData] = useState<Profile>(getCurrentProfile());
  
  // Update chart data when the current profile changes
  useEffect(() => {
    const currentProfile = getCurrentProfile();
    setProfileData(currentProfile);
  }, [getCurrentProfile]);
  
  // For easier access in the component
  const trialData = profileData.trialData;
  
  // Define colors for each category
  const categoryColors = useMemo(() => ({
    [CATEGORIES.LOGISTICS]: "#3b82f6", // Blue
    [CATEGORIES.MOTIVATION]: "#ec4899", // Pink
    [CATEGORIES.HEALTHCARE]: "#10b981", // Green
    [CATEGORIES.QUALITY]: "#8b5cf6", // Purple
  }), []);
  
  // Calculate data for the radar chart
  const chartData = useMemo(() => {
    return Object.values(CATEGORIES).map(category => {
      const items = trialData.complexityItems[category as CategoryType] || [];
      const value = items.length > 0 ? Math.min(100, items.length * 20) : 0;
      
      return {
        category,
        value
      };
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
  
  // Custom legend renderer
  const renderCustomLegend = () => {
    if (!hasDataToDisplay) return null;
    
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {Object.entries(categoryColors).map(([category, color]) => {
          const count = getQuestionCount(category);
          if (count === 0) return null;
          
          return (
            <div key={category} className="flex items-center text-xs px-2 py-1 rounded-md bg-white shadow-sm border">
              <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: color }} />
              <span>{category} ({count})</span>
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
        
        <div className="w-full h-[300px]">
          {hasDataToDisplay ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart 
                outerRadius="70%" 
                data={chartData}
              >
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="category" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <PolarRadiusAxis 
                  domain={[0, 100]} 
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  tickCount={5}
                  axisLine={false}
                />
                
                {Object.values(CATEGORIES).map(category => {
                  const items = trialData.complexityItems[category as CategoryType];
                  if (!items || items.length === 0) return null;
                  
                  // Create individual radar for each category with items
                  return (
                    <Radar
                      key={category}
                      dataKey="value"
                      name={category}
                      stroke={categoryColors[category as CategoryType]}
                      fill={categoryColors[category as CategoryType]}
                      fillOpacity={0.3}
                      dot 
                      isAnimationActive
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
          
          {/* Display category legend below chart */}
          {renderCustomLegend()}
        </div>
      </CardContent>
    </Card>
  );
}
