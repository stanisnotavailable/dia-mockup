import { useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TrialDataContext } from "@/contexts/TrialDataContext";

export default function TrialComplexityCard() {
  const { 
    trialData, 
    setInclusionSelected, 
    setSequenceSelected, 
    setLifestyleSelected, 
    setOtherSelected,
    setSequenceValue,
    setLifestyleValue,
    setOtherValue
  } = useContext(TrialDataContext);

  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-xl font-medium text-gray-800 mb-2">Trial Complexity Elements</h2>
        <p className="text-sm text-gray-500 mb-6">
          Key metrics from trial design affecting the patient experience
        </p>
        
        <div className="space-y-6">
          {/* Inclusion criteria */}
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="inclusion-criteria" 
              checked={trialData.inclusionSelected}
              onCheckedChange={(checked) => setInclusionSelected(checked as boolean)}
              className="mt-1"
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="inclusion-criteria" className="text-gray-700">
                Inclusion criteria
              </Label>
            </div>
          </div>
          
          {/* Sequence */}
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="sequence" 
                checked={trialData.sequenceSelected}
                onCheckedChange={(checked) => setSequenceSelected(checked as boolean)}
                className="mt-1"
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="sequence" className="text-gray-700">
                  Sequence
                </Label>
              </div>
            </div>
            
            <div className="pl-7 mt-3">
              <Slider
                value={[trialData.sequenceValue]}
                min={5}
                max={15}
                step={1}
                className="w-full accent-pink-500"
                onValueChange={(value) => setSequenceValue(value[0])}
                disabled={!trialData.sequenceSelected}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5</span>
                <span>15+</span>
              </div>
            </div>
          </div>
          
          {/* Lifestyle adjustments */}
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="lifestyle-adjustments" 
                checked={trialData.lifestyleSelected}
                onCheckedChange={(checked) => setLifestyleSelected(checked as boolean)}
                className="mt-1"
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="lifestyle-adjustments" className="text-gray-700">
                  Lifestyle adjustments
                </Label>
              </div>
            </div>
            
            <div className="pl-7 mt-3">
              <Slider
                value={[trialData.lifestyleValue]}
                min={3}
                max={7}
                step={1}
                className="w-full accent-green-500"
                onValueChange={(value) => setLifestyleValue(value[0])}
                disabled={!trialData.lifestyleSelected}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>3</span>
                <span>7+</span>
              </div>
            </div>
          </div>
          
          {/* Other parameter */}
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="other-parameter" 
                checked={trialData.otherSelected}
                onCheckedChange={(checked) => setOtherSelected(checked as boolean)}
                className="mt-1"
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="other-parameter" className="text-gray-700">
                  Other parameter
                </Label>
              </div>
            </div>
            
            <div className="pl-7 mt-3">
              <Slider
                value={[trialData.otherValue]}
                min={0}
                max={100}
                step={1}
                className="w-full accent-blue-500"
                onValueChange={(value) => setOtherValue(value[0])}
                disabled={!trialData.otherSelected}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>XXX</span>
                <span>YYY</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
