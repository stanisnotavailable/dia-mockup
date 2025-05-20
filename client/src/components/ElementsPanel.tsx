import { useContext, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrialDataContext, ComplexityItem, CategoryType } from "@/contexts/TrialDataContext";
import PatientDemographics from "@/components/PatientDemographics";

export default function ElementsPanel() {
  const { getCurrentProfile, moveItem, resetProfile } = useContext(TrialDataContext);
  const [draggedItem, setDraggedItem] = useState<ComplexityItem | null>(null);
  
  // Get the current profile data
  const currentProfile = getCurrentProfile();
  const trialData = currentProfile.trialData;

  // Handle starting to drag an item
  const handleDragStart = (item: ComplexityItem) => {
    setDraggedItem(item);
  };

  // Handle the drag over event to enable dropping
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // This is necessary to allow dropping
  };

  // Handle dropping an item back to available items
  const handleDropToAvailable = () => {
    if (draggedItem && draggedItem.category !== '') {
      moveItem(draggedItem, '');
      setDraggedItem(null);
    }
  };

  // Item component with drag-and-drop functionality
  const ComplexityItemComponent = ({ item, isDraggable = true }: { item: ComplexityItem, isDraggable?: boolean }) => {
    return (
      <div
        draggable={isDraggable}
        onDragStart={() => handleDragStart(item)}
        className="bg-gray-100 border-gray-300 py-1 px-2 my-1 rounded border cursor-move shadow-sm transition-all hover:shadow-md flex items-center justify-between"
      >
        <div className="font-medium text-xs">{item.name}</div>
        <div className="text-xs text-gray-500 ml-1">{item.complexity}</div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Patient Demographics Section */}
      <PatientDemographics />
      
      {/* Available Elements Section */}
      <Card className="border border-gray-100 shadow-sm flex-grow">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <h2 className="text-lg font-medium text-gray-800">Available Elements</h2>
              <div className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {trialData.availableItems.length}
              </div>
            </div>
            <Button 
              onClick={() => resetProfile()} 
              variant="outline" 
              size="sm" 
              className="text-xs h-7 px-2"
            >
              Reset
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mb-3">
            Drag elements to categories in the Trial Complexity panel below
          </p>
          
          <div 
            className="border rounded-md p-2 bg-gray-50 flex-grow overflow-hidden"
            onDragOver={handleDragOver}
            onDrop={handleDropToAvailable}
          >
            <div className="overflow-y-auto h-full">
              {trialData.availableItems.map((item: ComplexityItem) => (
                <ComplexityItemComponent key={item.id} item={item} />
              ))}
              {trialData.availableItems.length === 0 && (
                <div className="text-gray-500 text-xs text-center py-6 border border-dashed rounded-md mt-4">
                  All elements have been categorized.<br />
                  Drag items back here to return them to the available pool.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}