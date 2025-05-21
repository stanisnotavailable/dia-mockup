import { useContext, useMemo, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from "recharts";
import { TrialDataContext, CATEGORIES, CategoryType, Profile } from "@/contexts/TrialDataContext";

export default function PatientFeasibilityPlot() {
  // Access entire context instead of just getCurrentProfile
  const { getCurrentProfile, profiles, currentProfileId } = useContext(TrialDataContext);
  const [profileData, setProfileData] = useState<Profile>(getCurrentProfile());
  
  // Update chart data whenever profiles state changes or current profile changes
  useEffect(() => {
    const currentProfile = getCurrentProfile();
    setProfileData(currentProfile);
  }, [profiles, currentProfileId, getCurrentProfile]);
  
  // For easier access in the component
  const trialData = profileData.trialData;
  
  // Define colors for each category
  const categoryColors = useMemo(() => ({
    [CATEGORIES.LOGISTICS]: "#3b82f6", // Blue
    [CATEGORIES.MOTIVATION]: "#ec4899", // Pink
    [CATEGORIES.HEALTHCARE]: "#10b981", // Green
    [CATEGORIES.QUALITY]: "#8b5cf6", // Purple
  }), []);
  
  // Calculate data for the radar chart - force update when trial data changes
  const chartData = useMemo(() => {
    console.log("Chart data updated"); // Debug log
    
    return Object.values(CATEGORIES).map(category => {
      const items = trialData.complexityItems[category as CategoryType] || [];
      // Scale: 1 item = 20%, max 5 items = 100%
      const value = items.length > 0 ? Math.min(100, items.length * 20) : 0;
      
      return {
        category,
        value
      };
    });
  }, [trialData.complexityItems, profileData.id]);
  
  // Check if there's data to display
  const hasDataToDisplay = useMemo(() => {
    return Object.values(trialData.complexityItems).some(items => items && items.length > 0);
  }, [trialData.complexityItems]);
  
  // Get number of questions in a category
  const getQuestionCount = (category: string) => {
    return trialData.complexityItems[category as CategoryType]?.length || 0;
  };
  
  // Custom legend renderer with better styling
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
        
        <div className="w-full h-[300px]">
          {hasDataToDisplay ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart 
                outerRadius="70%" 
                data={chartData}
                margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
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
                
                {/* Single Radar approach - simplifies visualization */}
                <Radar
                  dataKey="value"
                  name="Trial Complexity"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  dot={true}
                  activeDot={{ r: 5 }}
                  isAnimationActive={true}
                />
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
