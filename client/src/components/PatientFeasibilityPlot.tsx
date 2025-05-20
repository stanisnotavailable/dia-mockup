import { useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from "recharts";
import { TrialDataContext } from "@/contexts/TrialDataContext";

export default function PatientFeasibilityPlot() {
  const { trialData } = useContext(TrialDataContext);
  
  // Calculate data points for the radar chart based on trial complexity elements
  const getRadarData = () => {
    // Map trial complexity values to radar chart data
    const axes = [
      "Logistics Challenge",
      "Another Variable",
      "Quality of Life",
      "Healthcare Engagement",
      "Motivation"
    ];
    
    const inclusionData = trialData.inclusionSelected 
      ? { name: "Inclusion criteria", color: "#6366f1" } 
      : null;
    
    const sequenceData = trialData.sequenceSelected 
      ? { name: "Sequence", color: "#ec4899", value: trialData.sequenceValue } 
      : null;
    
    const lifestyleData = trialData.lifestyleSelected 
      ? { name: "Lifestyle adjustments", color: "#10b981", value: trialData.lifestyleValue } 
      : null;
    
    const otherData = trialData.otherSelected 
      ? { name: "Other parameter", color: "#3b82f6", value: trialData.otherValue } 
      : null;
    
    // Data transformation for the radar chart
    return axes.map(axis => {
      const result: Record<string, any> = { axis };
      
      if (inclusionData) {
        result[inclusionData.name] = calculateAxisValue(axis, "inclusion");
      }
      
      if (sequenceData) {
        result[sequenceData.name] = calculateAxisValue(axis, "sequence", sequenceData.value);
      }
      
      if (lifestyleData) {
        result[lifestyleData.name] = calculateAxisValue(axis, "lifestyle", lifestyleData.value);
      }
      
      if (otherData) {
        result[otherData.name] = calculateAxisValue(axis, "other", otherData.value);
      }
      
      return result;
    });
  };
  
  // Calculate the value for a specific axis based on the trial element type
  const calculateAxisValue = (axis: string, elementType: string, value?: number) => {
    // Map values to a scale of 0-100 for the radar chart
    const baseValue = 50; // Default base value
    
    switch (elementType) {
      case "inclusion":
        // Fixed values for inclusion criteria
        switch (axis) {
          case "Logistics Challenge": return 65;
          case "Another Variable": return 70;
          case "Quality of Life": return 55;
          case "Healthcare Engagement": return 60;
          case "Motivation": return 75;
          default: return baseValue;
        }
      
      case "sequence":
        // Values depend on sequence slider value (5-15)
        const sequenceScale = ((value || 10) - 5) / 10; // Normalize to 0-1 scale
        switch (axis) {
          case "Logistics Challenge": return 90 * sequenceScale + 20;
          case "Another Variable": return 70 * sequenceScale + 30;
          case "Quality of Life": return 80 * sequenceScale + 20;
          case "Healthcare Engagement": return 65 * sequenceScale + 35;
          case "Motivation": return 75 * sequenceScale + 25;
          default: return baseValue;
        }
      
      case "lifestyle":
        // Values depend on lifestyle slider value (3-7)
        const lifestyleScale = ((value || 5) - 3) / 4; // Normalize to 0-1 scale
        switch (axis) {
          case "Logistics Challenge": return 50 * lifestyleScale + 40;
          case "Another Variable": return 80 * lifestyleScale + 20;
          case "Quality of Life": return 70 * lifestyleScale + 30;
          case "Healthcare Engagement": return 60 * lifestyleScale + 35;
          case "Motivation": return 40 * lifestyleScale + 45;
          default: return baseValue;
        }
      
      case "other":
        // Values depend on other slider value (0-100)
        const otherScale = (value || 50) / 100; // Already normalized to 0-1 scale
        switch (axis) {
          case "Logistics Challenge": return 60 * otherScale + 20;
          case "Another Variable": return 75 * otherScale + 25;
          case "Quality of Life": return 80 * otherScale + 10;
          case "Healthcare Engagement": return 50 * otherScale + 30;
          case "Motivation": return 65 * otherScale + 20;
          default: return baseValue;
        }
      
      default:
        return baseValue;
    }
  };
  
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
        <h2 className="text-xl font-medium text-gray-800 mb-2">Patient Feasibility Plot</h2>
        <p className="text-sm text-gray-500 mb-6">
          Visual representation of the interaction between the elements of the Patient Experience
        </p>
        
        <div className="w-full h-80 flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart 
              cx="50%" 
              cy="50%" 
              outerRadius="80%" 
              data={getRadarData()}
            >
              <PolarGrid />
              <PolarAngleAxis dataKey="axis" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              
              {trialData.inclusionSelected && (
                <Radar
                  name="Inclusion criteria"
                  dataKey="Inclusion criteria"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.2}
                />
              )}
              
              {trialData.sequenceSelected && (
                <Radar
                  name="Sequence"
                  dataKey="Sequence"
                  stroke="#ec4899"
                  fill="#ec4899"
                  fillOpacity={0.2}
                />
              )}
              
              {trialData.lifestyleSelected && (
                <Radar
                  name="Lifestyle adjustments"
                  dataKey="Lifestyle adjustments"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                />
              )}
              
              {trialData.otherSelected && (
                <Radar
                  name="Other parameter"
                  dataKey="Other parameter"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
              )}
              
              <Legend content={renderLegend} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
