import { useContext, useMemo, useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { TrialDataContext, CATEGORIES, CategoryType } from "@/contexts/TrialDataContext";

// Improved force update hook with better performance
function useForceUpdate() {
  const [, setTick] = useState(0);
  const lastUpdateRef = useRef<number>(Date.now());
  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      // Only update if it's been at least 100ms since the last update
      if (now - lastUpdateRef.current >= 100) {
        lastUpdateRef.current = now;
        setTick(tick => tick + 1);
      }
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
  const categories = profileData.categories || [];
  
  // Define colors for the radar chart using the new hex colors
  const categoryColors = {
    [CATEGORIES.LOGISTICS]: "#3992FE",
    [CATEGORIES.MOTIVATION]: "#12A54D",
    [CATEGORIES.HEALTHCARE]: "#B675FF",
    [CATEGORIES.QUALITY]: "#EF6C15"
  };
  
  // Define category labels for the axes
  const categoryLabels = useMemo(() => ({
    [CATEGORIES.LOGISTICS]: "Logistics Challenge",
    [CATEGORIES.MOTIVATION]: "Motivation",
    [CATEGORIES.HEALTHCARE]: "Healthcare Engagement",
    [CATEGORIES.QUALITY]: "Quality of Life"
  }), []);
  
  // Prepare data for the radar chart
  const radarData = useMemo(() => {
    // Create one data point for each category (axis) - exclude Uncategorized
    return Object.values(CATEGORIES)
      .filter(category => category !== CATEGORIES.UNCATEGORIZED)
      .map(category => {
        const categoryData = categories.find(c => c.name === category);
        const score = categoryData?.averageScore || 0;
        
        // Convert to flat data structure for the chart
        return { 
          category: category,
          score: score * 10, // Scale to 0-100 for better visualization
          color: categoryColors[category as keyof typeof categoryColors] // Safe access to color
        };
      });
  }, [categories, categoryColors]);
  
  // Check if there's data to display
  const hasDataToDisplay = useMemo(() => {
    return categories.some(cat => cat.questions && cat.questions.length > 0);
  }, [categories]);
  
  // Custom tooltip content for the radar chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      const dataPoint = radarData.find(d => d.category === entry.payload.category);
      const color = dataPoint?.color || entry.color;
      
      return (
        <div className="bg-white p-2 border border-gray-200 rounded text-xs">
          <div className="flex items-center">
            <div 
              className="w-2 h-2 rounded-full mr-1.5"
              style={{ backgroundColor: color }}
            />
            <span className="font-medium">{entry.payload.category}: {Math.round(entry.value)}</span>
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Use fixed values for chart dimensions and styling
  const chartHeight = 600;
  const titleFontSize = "text-base";
  const subtitleFontSize = "text-sm";
  const tickFontSize = 11;
  const radiusTickFontSize = 9;
  
  return (
    <Card className="bg-white mt-2 w-full">
      <CardContent className="p-3 h-full">
        <div className={`font-medium ${titleFontSize} mb-0.5`}>Patient Feasibility Plot</div>
        <div className={`${subtitleFontSize} text-gray-500 mb-2`}>Visual representation of patient experience categories</div>
        
        <div className="w-full" style={{ height: chartHeight }}>
          {hasDataToDisplay ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart 
                outerRadius="70%"
                data={radarData}
                margin={{ top: 20, right: 20, left: 20, bottom: 30 }}
              >
                <PolarGrid gridType="polygon" stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="category" 
                  tick={(props) => {
                    const { x, y, textAnchor, payload } = props;
                    // Use gray color for all labels instead of category-specific colors
                    const color = '#6b7280'; // gray-500
                    
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={0}
                          y={0}
                          textAnchor={textAnchor}
                          fill={color}
                          fontSize={tickFontSize}
                          fontWeight={500}
                        >
                          {payload.value}
                        </text>
                      </g>
                    );
                  }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <PolarRadiusAxis 
                  domain={[0, 100]} 
                  tick={{ fill: '#9ca3af', fontSize: radiusTickFontSize }}
                  tickCount={10}
                  axisLine={false}
                  tickLine={false}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                <Radar
                  name="Category"
                  dataKey="score"
                  stroke={categoryColors[CATEGORIES.LOGISTICS]}
                  fill={categoryColors[CATEGORIES.LOGISTICS]}
                  fillOpacity={0.6}
                  dot={true}
                  activeDot={{ r: 5 }}
                  strokeWidth={1}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="text-gray-400 text-center px-2">
                <div className="text-base font-medium mb-1">No Data Available</div>
                <p className="text-sm">Drag questions into the Trial Complexity Categories to generate a visualization.</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
