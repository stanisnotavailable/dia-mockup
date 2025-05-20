import { useContext, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { TrialDataContext, PatientDemographic } from "@/contexts/TrialDataContext";

export default function PatientDemographics() {
  const { getCurrentProfile, updatePatientDemographic, currentProfileId } = useContext(TrialDataContext);
  const currentProfile = getCurrentProfile();
  const { patientDemographic, diseaseBurdenScore } = currentProfile;
  
  // Local state for form values
  const [localData, setLocalData] = useState<PatientDemographic>(patientDemographic);
  const [isEditing, setIsEditing] = useState(false);
  
  // Update local data when profile changes
  useEffect(() => {
    setLocalData(getCurrentProfile().patientDemographic);
    setIsEditing(false);
  }, [currentProfileId, getCurrentProfile]);
  
  // Handle input changes
  const handleChange = (field: keyof PatientDemographic, value: any) => {
    setLocalData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle medical history changes (comma-separated string)
  const handleMedicalHistoryChange = (value: string) => {
    // Split by commas and trim whitespace
    const historyArray = value.split(',').map(item => item.trim()).filter(item => item);
    setLocalData(prev => ({
      ...prev,
      medicalHistory: historyArray
    }));
  };
  
  // Save changes
  const saveChanges = () => {
    updatePatientDemographic(localData);
    setIsEditing(false);
  };
  
  // Cancel changes
  const cancelChanges = () => {
    setLocalData(patientDemographic);
    setIsEditing(false);
  };
  
  // Calculate BMI
  const calculateBMI = (weight: number, height: number): number => {
    // BMI = weight (kg) / height² (m²)
    const heightInMeters = height / 100;
    return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
  };
  
  const bmi = calculateBMI(patientDemographic.weight, patientDemographic.height);
  
  // Get BMI category
  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };
  
  const bmiCategory = getBMICategory(bmi);
  
  // Get BMI color
  const getBMIColor = (category: string): string => {
    switch(category) {
      case "Underweight": return "text-yellow-600";
      case "Normal": return "text-green-600";
      case "Overweight": return "text-orange-600";
      case "Obese": return "text-red-600";
      default: return "text-gray-600";
    }
  };
  
  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <h2 className="text-lg font-medium text-gray-800">Patient Demographics</h2>
            <div className="ml-3 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              Disease Burden Score: {diseaseBurdenScore}
            </div>
          </div>
          
          {isEditing ? (
            <div className="flex gap-2">
              <Button 
                onClick={cancelChanges} 
                variant="outline" 
                size="sm" 
                className="text-xs h-7 px-2"
              >
                Cancel
              </Button>
              <Button 
                onClick={saveChanges} 
                size="sm" 
                className="text-xs h-7 px-2"
              >
                Save
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)} 
              variant="outline" 
              size="sm" 
              className="text-xs h-7 px-2"
            >
              Edit
            </Button>
          )}
        </div>
        
        {isEditing ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <div>
              <Label htmlFor="age" className="text-xs">Age</Label>
              <Input
                id="age"
                type="number"
                value={localData.age}
                onChange={e => handleChange('age', parseInt(e.target.value))}
                className="h-8 text-sm"
              />
            </div>
            
            <div>
              <Label htmlFor="gender" className="text-xs">Gender</Label>
              <Select 
                value={localData.gender}
                onValueChange={value => handleChange('gender', value)}
              >
                <SelectTrigger id="gender" className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="ethnicity" className="text-xs">Ethnicity</Label>
              <Select 
                value={localData.ethnicity}
                onValueChange={value => handleChange('ethnicity', value)}
              >
                <SelectTrigger id="ethnicity" className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Caucasian">Caucasian</SelectItem>
                  <SelectItem value="African American">African American</SelectItem>
                  <SelectItem value="Hispanic">Hispanic</SelectItem>
                  <SelectItem value="Asian">Asian</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="location" className="text-xs">Location</Label>
              <Select 
                value={localData.location}
                onValueChange={value => handleChange('location', value)}
              >
                <SelectTrigger id="location" className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Urban">Urban</SelectItem>
                  <SelectItem value="Suburban">Suburban</SelectItem>
                  <SelectItem value="Rural">Rural</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2 md:col-span-4">
              <Label htmlFor="medicalHistory" className="text-xs">Medical History (comma-separated)</Label>
              <Input
                id="medicalHistory"
                value={localData.medicalHistory.join(', ')}
                onChange={e => handleMedicalHistoryChange(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            
            <div>
              <Label htmlFor="weight" className="text-xs">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={localData.weight}
                onChange={e => handleChange('weight', parseFloat(e.target.value))}
                className="h-8 text-sm"
              />
            </div>
            
            <div>
              <Label htmlFor="height" className="text-xs">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={localData.height}
                onChange={e => handleChange('height', parseFloat(e.target.value))}
                className="h-8 text-sm"
              />
            </div>
            
            <div className="col-span-2">
              <div className="flex justify-between">
                <Label htmlFor="compliance" className="text-xs">Compliance Level ({localData.compliance}%)</Label>
              </div>
              <Slider
                id="compliance"
                min={0}
                max={100}
                step={1}
                value={[localData.compliance]}
                onValueChange={value => handleChange('compliance', value[0])}
                className="py-2"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3 mt-3 text-sm">
            <div>
              <div className="text-gray-500 text-xs mb-1">Age</div>
              <div className="font-medium">{patientDemographic.age} years</div>
            </div>
            
            <div>
              <div className="text-gray-500 text-xs mb-1">Gender</div>
              <div className="font-medium">{patientDemographic.gender}</div>
            </div>
            
            <div>
              <div className="text-gray-500 text-xs mb-1">Ethnicity</div>
              <div className="font-medium">{patientDemographic.ethnicity}</div>
            </div>
            
            <div>
              <div className="text-gray-500 text-xs mb-1">Location</div>
              <div className="font-medium">{patientDemographic.location}</div>
            </div>
            
            <div className="col-span-2 md:col-span-4">
              <div className="text-gray-500 text-xs mb-1">Medical History</div>
              <div className="font-medium">
                {patientDemographic.medicalHistory.length > 0 
                  ? patientDemographic.medicalHistory.join(', ')
                  : 'None'}
              </div>
            </div>
            
            <div>
              <div className="text-gray-500 text-xs mb-1">Weight</div>
              <div className="font-medium">{patientDemographic.weight} kg</div>
            </div>
            
            <div>
              <div className="text-gray-500 text-xs mb-1">Height</div>
              <div className="font-medium">{patientDemographic.height} cm</div>
            </div>
            
            <div>
              <div className="text-gray-500 text-xs mb-1">BMI</div>
              <div className={`font-medium ${getBMIColor(bmiCategory)}`}>
                {bmi} ({bmiCategory})
              </div>
            </div>
            
            <div>
              <div className="text-gray-500 text-xs mb-1">Compliance</div>
              <div className="font-medium flex items-center">
                <span className="mr-2">{patientDemographic.compliance}%</span>
                <div className="w-24 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full" 
                    style={{ width: `${patientDemographic.compliance}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}