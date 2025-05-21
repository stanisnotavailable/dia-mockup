import { useContext, useMemo, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from "recharts";
import { TrialDataContext, CATEGORIES, CategoryType, Profile } from "@/contexts/TrialDataContext";

export default function PatientFeasibilityPlot() {
  const { getCurrentProfile } = useContext(TrialDataContext);
  const [profileData, setProfileData] = useState<Profile>(getCurrentProfile());
  
  // Update chart data when the current profile changes
  useEffect(() => {
    // Get latest profile data
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
  
  // Calculate data points for the radar chart based on items in each category
  const getRadarData = () => {
    // Get all axes for the radar chart
    const axes = Object.values(CATEGORIES);
    
    // Data transformation for the radar chart
    return axes.map(axis => {
      const result: Record<string, any> = { axis };
      
      // Get complexity items for this category
      const items = trialData.complexityItems[axis as CategoryType];
      
      // Only add data point if there are items in this category
      if (items && items.length > 0) {
        result[axis] = calculateCategoryValue(axis as CategoryType, axis as CategoryType, items.length);
      } else {
        // No items in this category, set value to 0
        result[axis] = 0;
      }
      
      return result;
    });
  };
  
  // Fallback calculation based on trial complexity (used if no categories with model_value are available)
  const calculateDataFromTrialComplexity = () => {
    const axes = Object.values(CATEGORIES);
    
    return axes.map(axis => {
      const result: Record<string, any> = { axis };
      
      // Add a datapoint for each category that has items
      Object.entries(trialData.complexityItems).forEach(([category, items]) => {
        if (items && items.length > 0) {
          result[category] = calculateCategoryValue(axis as CategoryType, category as CategoryType, items.length);
        }
      });
      
      return result;
    });
  };
  
  // Calculate the value for a specific axis based on the category and number of items
  const calculateCategoryValue = (axis: CategoryType, category: CategoryType, itemCount: number) => {
    // Base value for the axis
    const baseValue = 25;
    // Maximum value to scale to based on item count
    const maxValue = 100;
    // Maximum possible items in a category (arbitrary value for scaling)
    const maxPossibleItems = 6;
    
    // Scale based on item count: more items = higher value
    const itemScale = Math.min(itemCount / maxPossibleItems, 1);
    
    // If the axis is the same as the category, give it a boost
    const isSameCategory = axis === category;
    const categoryBoost = isSameCategory ? 25 : 0;
    
    // Calculate the value with a formula that gives higher values when:
    // 1. There are more items in the category
    // 2. The axis matches the category
    return baseValue + (maxValue - baseValue) * itemScale + categoryBoost;
  };
  
  // Check if there's data to display - should only show data if categories have questions
  const hasDataToDisplay = useMemo(() => {
    // Only show data if at least one category has questions
    return trialData.complexityItems && 
      Object.values(trialData.complexityItems).some(items => items && items.length > 0);
  }, [trialData.complexityItems]);
  
  // Get total items count for categories with data
  const getActiveCategoryCount = (category: string) => {
    return trialData.complexityItems[category as CategoryType]?.length || 0;
  };
  
  // Legend items for the radar chart
  const renderLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <div className="flex flex-wrap gap-3 justify-center mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center bg-white px-2 py-1 rounded-md shadow-sm border">
            <span 
              className="w-3 h-3 rounded-full mr-1" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-700">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <Card className="border border-gray-100 shadow-sm lg:col-span-2 h-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-lg font-medium text-gray-800">Patient Feasibility Plot</h2>
            <p className="text-xs text-gray-500">
              Visual representation of how categorized elements affect patient experience
            </p>
          </div>
        </div>
        
        {/* Category stats */}
        <div className="flex gap-2 mb-3 justify-between flex-wrap">
          {Object.entries(CATEGORIES).map(([key, category]) => (
            <div 
              key={category} 
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
              style={{ 
                backgroundColor: `${categoryColors[category as CategoryType]}20`,
                color: categoryColors[category as CategoryType]
              }}
            >
              <span className="font-medium">{category.split(' ')[0]}</span>
              <span className="bg-white px-1.5 py-0.5 rounded-full text-xs">
                {getActiveCategoryCount(category)}
              </span>
            </div>
          ))}
        </div>
        
        <div className="w-full" style={{ height: "350px" }}>
          {hasDataToDisplay ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart 
                cx="50%" 
                cy="50%" 
                outerRadius="70%" 
                data={getRadarData()}
                margin={{ top: 15, right: 15, bottom: 15, left: 15 }}
              >
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="axis" 
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickLine={false}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 125]} 
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  stroke="#e5e7eb"
                  tickCount={5}
                  axisLine={false}
                />
                
                {/* Render a single radar that shows all category values */}
                <Radar
                  name="Trial Complexity"
                  dataKey={(value) => value[value.axis]}
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                  dot={true}
                  activeDot={{ r: 4 }}
                />
                
                <Legend 
                  content={renderLegend} 
                  verticalAlign="bottom"
                  height={36}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border border-dashed">
              <div className="text-center text-gray-500 px-4">
                <p className="mb-2 font-medium">No data to display</p>
                <p className="text-xs">Drag elements into categories to see how they affect patient experience</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
