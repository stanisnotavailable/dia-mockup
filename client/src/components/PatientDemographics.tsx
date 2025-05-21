import { useContext, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrialDataContext } from "@/contexts/TrialDataContext";

export default function PatientDemographics() {
  const { getCurrentProfile } = useContext(TrialDataContext);
  
  const profile = getCurrentProfile();
  const patientDemographic = profile.patientDemographic;
  
  // Calculate the average model value for the profile
  const averageModelValue = useMemo(() => {
    if (!profile.categories || profile.categories.length === 0) return 'N/A';
    
    const sum = profile.categories.reduce((acc, category) => acc + category.model_value, 0);
    return (sum / profile.categories.length).toFixed(1);
  }, [profile.categories]);
  
  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardContent className="p-3">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center">
            <h2 className="text-base font-medium text-gray-800">Patient Demographics</h2>
            <div className="ml-3 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              Avg. Model Value: {averageModelValue}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-x-2 gap-y-2 mt-2 text-sm">
          <div>
            <div className="text-gray-500 text-xs mb-1">Age Range</div>
            <div className="font-medium">{patientDemographic.age}</div>
          </div>
          
          <div className="col-span-2">
            <div className="text-gray-500 text-xs mb-1">Origin</div>
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
                  <div key={index} className="flex justify-between items-center mb-1">
                    <span className="flex items-center">
                      <span className="mr-1 text-base">{getFlagEmoji(item.country)}</span>
                      <span>{item.country}:</span>
                    </span>
                    <div className="flex items-center">
                      <span className="mr-1 text-xs">{item.percentage}%</span>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full" 
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
            <div className="text-gray-500 text-xs mb-1">Role</div>
            <div className="font-medium flex gap-2 flex-wrap">
              {patientDemographic.role && patientDemographic.role.map((item, index) => (
                <div key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
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