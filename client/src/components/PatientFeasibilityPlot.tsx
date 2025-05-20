import { useContext, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from "recharts";
import { TrialDataContext, CATEGORIES, CategoryType } from "@/contexts/TrialDataContext";

export default function PatientFeasibilityPlot() {
  const { getCurrentProfile } = useContext(TrialDataContext);
  
  // Get the current profile data
  const currentProfile = getCurrentProfile();
  const trialData = currentProfile.trialData;
  
  // Define colors for each category
  const categoryColors = useMemo(() => ({
    [CATEGORIES.LOGISTICS]: "#3b82f6", // Blue
    [CATEGORIES.MOTIVATION]: "#ec4899", // Pink
    [CATEGORIES.HEALTHCARE]: "#10b981", // Green
    [CATEGORIES.QUALITY]: "#8b5cf6", // Purple
  }), []);
  
  // Calculate data points for the radar chart based on trial complexity elements
  const getRadarData = () => {
    // Map trial complexity values to radar chart data
    const axes = Object.values(CATEGORIES);
    
    // Data transformation for the radar chart
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
  
  // Check if there's data to display
  const hasDataToDisplay = useMemo(() => {
    return trialData.complexityItems && 
      Object.values(trialData.complexityItems).some(items => items && items.length > 0);
  }, [trialData.complexityItems]);
  
  // Legend items for the radar chart
  const renderLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <div className="flex flex-wrap gap-4 justify-center mt-6">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center">
            <span 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <Card className="border border-gray-100 shadow-sm lg:col-span-2">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-medium text-gray-800 mb-2">Patient Feasibility Plot</h2>
            <p className="text-sm text-gray-500">
              Visual representation of the interaction between the elements of the Patient Experience
            </p>
          </div>
          <div className="bg-blue-100 px-3 py-1 rounded-md text-blue-800 font-semibold">
            Disease Burden: {currentProfile.diseaseBurdenScore}
          </div>
        </div>
        
        <div className="w-full h-80 flex justify-center items-center">
          {hasDataToDisplay ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart 
                cx="50%" 
                cy="50%" 
                outerRadius="80%" 
                data={getRadarData()}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="axis" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 125]} />
                
                {/* Render a radar for each category that has items */}
                {Object.entries(trialData.complexityItems).map(([category, items]) => {
                  if (!items || items.length === 0) return null;
                  
                  return (
                    <Radar
                      key={category}
                      name={`${category} (${items.length})`}
                      dataKey={category}
                      stroke={categoryColors[category as CategoryType]}
                      fill={categoryColors[category as CategoryType]}
                      fillOpacity={0.2}
                    />
                  );
                })}
                
                <Legend content={renderLegend} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500">
              <p>Drag items into categories to see the patient feasibility plot</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
