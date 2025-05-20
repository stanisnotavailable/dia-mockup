import { useContext, useState } from "react";
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
  const { getCurrentProfile, updatePatientDemographic } = useContext(TrialDataContext);
  const currentProfile = getCurrentProfile();
  const { patientDemographic, diseaseBurdenScore } = currentProfile;
  
  // Local state for form values
  const [localData, setLocalData] = useState<PatientDemographic>(patientDemographic);
  const [isEditing, setIsEditing] = useState(false);
  
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
  
  return (
    <Card className="border border-gray-100 shadow-sm mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <h2 className="text-lg font-medium text-gray-800">Patient Demographics</h2>
            <div className="ml-3 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              Score: {diseaseBurdenScore}
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
          <div className="grid grid-cols-2 gap-3 mt-3">
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
            
            <div className="col-span-2">
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
          <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
            <div className="flex">
              <span className="text-gray-500 w-24">Age:</span>
              <span className="font-medium">{patientDemographic.age} years</span>
            </div>
            
            <div className="flex">
              <span className="text-gray-500 w-24">Gender:</span>
              <span className="font-medium">{patientDemographic.gender}</span>
            </div>
            
            <div className="flex">
              <span className="text-gray-500 w-24">Ethnicity:</span>
              <span className="font-medium">{patientDemographic.ethnicity}</span>
            </div>
            
            <div className="flex">
              <span className="text-gray-500 w-24">Location:</span>
              <span className="font-medium">{patientDemographic.location}</span>
            </div>
            
            <div className="flex col-span-2">
              <span className="text-gray-500 w-24">History:</span>
              <span className="font-medium">{patientDemographic.medicalHistory.join(', ')}</span>
            </div>
            
            <div className="flex">
              <span className="text-gray-500 w-24">Weight:</span>
              <span className="font-medium">{patientDemographic.weight} kg</span>
            </div>
            
            <div className="flex">
              <span className="text-gray-500 w-24">Height:</span>
              <span className="font-medium">{patientDemographic.height} cm</span>
            </div>
            
            <div className="col-span-2">
              <div className="flex">
                <span className="text-gray-500 w-24">Compliance:</span>
                <span className="font-medium">{patientDemographic.compliance}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full" 
                  style={{ width: `${patientDemographic.compliance}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}