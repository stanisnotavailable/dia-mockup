import { useContext, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrialDataContext, ComplexityItem, CATEGORIES, CategoryType } from "@/contexts/TrialDataContext";

export default function TrialComplexityCard() {
  const { getCurrentProfile, moveItem, resetProfile } = useContext(TrialDataContext);
  const [draggedItem, setDraggedItem] = useState<ComplexityItem | null>(null);
  
  // Get the current profile data
  const currentProfile = getCurrentProfile();
  const trialData = currentProfile.trialData;

  // Colors for the categories
  const categoryColors = {
    [CATEGORIES.LOGISTICS]: "bg-blue-100 border-blue-300 text-blue-700",
    [CATEGORIES.MOTIVATION]: "bg-pink-100 border-pink-300 text-pink-700",
    [CATEGORIES.HEALTHCARE]: "bg-green-100 border-green-300 text-green-700",
    [CATEGORIES.QUALITY]: "bg-purple-100 border-purple-300 text-purple-700",
  };

  // Handle starting to drag an item
  const handleDragStart = (item: ComplexityItem) => {
    setDraggedItem(item);
  };

  // Handle the drag over event to enable dropping
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // This is necessary to allow dropping
  };

  // Handle dropping an item into a category
  const handleDrop = (category: string) => {
    if (draggedItem) {
      moveItem(draggedItem, category);
      setDraggedItem(null);
    }
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
    const itemClass = item.category ? categoryColors[item.category as CategoryType] || "" : "bg-gray-100 border-gray-300";
    
    return (
      <div
        draggable={isDraggable}
        onDragStart={() => handleDragStart(item)}
        className={`${itemClass} py-1 px-2 my-1 rounded border cursor-move shadow-sm transition-all hover:shadow-md flex items-center justify-between`}
      >
        <div className="font-medium text-xs">{item.name}</div>
        <div className="text-xs text-gray-500 ml-1">{item.complexity}</div>
      </div>
    );
  };

  return (
    <Card className="border border-gray-100 shadow-sm lg:col-span-3">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <div className="flex items-center">
              <h2 className="text-lg font-medium text-gray-800">Trial Complexity Elements</h2>
              <Button 
                onClick={() => resetProfile()} 
                variant="outline" 
                size="sm" 
                className="ml-3 text-xs h-7 px-2"
              >
                Reset
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Drag elements to categories to update the radar chart
            </p>
          </div>
        </div>
        
        {/* Two-column layout for elements and categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          {/* Left column: Available items */}
          <div>
            <div 
              className="border rounded-md p-2 bg-gray-50 h-full"
              onDragOver={handleDragOver}
              onDrop={handleDropToAvailable}
            >
              <h3 className="text-sm font-medium text-gray-700 mb-1 flex justify-between">
                <span>Available Elements</span>
                <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5">
                  {trialData.availableItems.length}
                </span>
              </h3>
              
              <div className="overflow-y-auto" style={{ maxHeight: "250px" }}>
                {trialData.availableItems.map((item: ComplexityItem) => (
                  <ComplexityItemComponent key={item.id} item={item} />
                ))}
                {trialData.availableItems.length === 0 && (
                  <div className="text-gray-500 text-xs text-center py-2 border border-dashed rounded-md">
                    All elements categorized
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right column: Categories grid */}
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(CATEGORIES).map(([key, category]) => (
              <div 
                key={category}
                className={`border rounded-md p-2 transition-all ${
                  draggedItem && !draggedItem.category ? "ring-1 ring-blue-400" : ""
                }`}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(category)}
              >
                <h3 className={`text-sm font-medium mb-1 flex justify-between ${categoryColors[category as CategoryType].split(" ").slice(-1)[0]}`}>
                  <span>{category}</span>
                  <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5">
                    {trialData.complexityItems[category].length}
                  </span>
                </h3>
                
                <div className="overflow-y-auto" style={{ maxHeight: "60px" }}>
                  {trialData.complexityItems[category].map((item: ComplexityItem) => (
                    <ComplexityItemComponent key={item.id} item={item} />
                  ))}
                  {trialData.complexityItems[category].length === 0 && (
                    <div className="text-gray-400 text-xs text-center py-1 border border-dashed rounded-md">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <div className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded">
              Drag items between categories to see how the radar chart updates in real-time
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
