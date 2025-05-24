import { useContext, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrialDataContext } from "@/contexts/TrialDataContext";
import { usePresentationMode } from "@/contexts/PresentationModeContext";

export default function PatientDemographics() {
  const { getCurrentProfile } = useContext(TrialDataContext);
  const { isPresentationMode } = usePresentationMode();
  
  const profile = getCurrentProfile();
  const patientDemographic = profile.patientDemographic;
  
  // Calculate the average model value for the profile
  const averageModelValue = useMemo(() => {
    if (!profile.categories || profile.categories.length === 0) return 'N/A';
    
    // Use averageScore instead of model_value
    const sum = profile.categories.reduce((acc, category) => acc + (category.averageScore || 0), 0);
    return (sum / profile.categories.length).toFixed(1);
  }, [profile.categories]);
  
  // Calculate sizes based on presentation mode
  const titleFontSize = isPresentationMode ? "text-xl" : "text-base";
  const contentFontSize = isPresentationMode ? "text-base" : "text-sm";
  const labelFontSize = isPresentationMode ? "text-sm" : "text-xs";
  const padding = isPresentationMode ? "p-6" : "p-3";
  const barHeight = isPresentationMode ? "h-2" : "h-1.5";
  const flagFontSize = isPresentationMode ? "text-lg" : "text-base";
  
  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardContent className={padding}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <h2 className={`${titleFontSize} font-medium text-gray-800`}>Patient Demographics</h2>
            {/* <div className="ml-3 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              Avg. Model Value: {averageModelValue}
            </div> */}
          </div>
        </div>
        
        <div className={`grid grid-cols-3 gap-x-3 gap-y-3 mt-3 ${contentFontSize}`}>
          <div>
            <div className={`text-gray-500 ${labelFontSize} mb-1`}>Age Range</div>
            <div className="font-medium">{patientDemographic.age}</div>
          </div>
          
          <div className="col-span-2">
            <div className={`text-gray-500 ${labelFontSize} mb-1`}>Origin</div>
            <div className="font-medium">
              {patientDemographic.origin && patientDemographic.origin.map((item, index) => {
                // Get flag emoji for country code
                const getFlagEmoji = (countryCode: string) => {
                  const codePoints = countryCode
                    .toUpperCase()
                    .split('')
                    .map(char => 127397 + char.charCodeAt(0));
                  return String.fromCodePoint(...codePoints);
                };
                
                return (
                  <div key={index} className="flex justify-between items-center mb-2">
                    <span className="flex items-center">
                      <span className={`mr-1 ${flagFontSize}`}>{getFlagEmoji(item.country)}</span>
                      <span>{item.country}:</span>
                    </span>
                    <div className="flex items-center">
                      <span className={`mr-2 ${labelFontSize}`}>{item.percentage}%</span>
                      <div className={`w-20 bg-gray-200 rounded-full ${barHeight}`}>
                        <div 
                          className={`bg-blue-600 ${barHeight} rounded-full`} 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="col-span-3">
            <div className={`text-gray-500 ${labelFontSize} mb-1`}>Role</div>
            <div className="font-medium flex gap-2 flex-wrap">
              {patientDemographic.role && patientDemographic.role.map((item, index) => (
                <div 
                  key={index} 
                  className={`px-3 py-1.5 bg-gray-100 rounded-full ${isPresentationMode ? 'text-sm' : 'text-xs'}`}
                >
                  <span>{item.role_name} {item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}