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
        className={`${itemClass} p-3 my-2 rounded-md border cursor-move shadow-sm transition-all hover:shadow-md`}
      >
        <div className="font-medium text-sm">{item.name}</div>
        <div className="text-xs text-gray-500 mt-1">Complexity: {item.complexity}</div>
      </div>
    );
  };

  return (
    <Card className="border border-gray-100 shadow-lg lg:col-span-3">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-medium text-gray-800 mb-2">Trial Complexity Elements</h2>
            <p className="text-sm text-gray-500">
              Drag elements to categorize them and affect patient experience metrics
            </p>
          </div>
          <Button onClick={() => resetProfile()} variant="outline">
            Reset Profile
          </Button>
        </div>
        
        {/* Available items section */}
        <div 
          className="mb-6 border rounded-md p-4 bg-gray-50"
          onDragOver={handleDragOver}
          onDrop={handleDropToAvailable}
        >
          <h3 className="text-md font-medium text-gray-700 mb-3">
            Available Elements ({trialData.availableItems.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {trialData.availableItems.map((item: ComplexityItem) => (
              <ComplexityItemComponent key={item.id} item={item} />
            ))}
            {trialData.availableItems.length === 0 && (
              <div className="text-gray-500 text-sm col-span-3 text-center py-8">
                All elements have been categorized. Drag items back here to return them to the available pool.
              </div>
            )}
          </div>
        </div>
        
        {/* Category sections in a grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(CATEGORIES).map(([key, category]) => (
            <div 
              key={category}
              className={`border rounded-md p-4 transition-all ${
                draggedItem && !draggedItem.category ? "ring-2 ring-blue-400" : ""
              }`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(category)}
            >
              <h3 className={`text-md font-medium mb-3 ${categoryColors[category as CategoryType].split(" ").slice(-1)[0]}`}>
                {category} ({trialData.complexityItems[category].length})
              </h3>
              
              <div className="max-h-44 overflow-y-auto pr-1">
                {trialData.complexityItems[category].map((item: ComplexityItem) => (
                  <ComplexityItemComponent key={item.id} item={item} />
                ))}
                {trialData.complexityItems[category].length === 0 && (
                  <div className="text-gray-400 text-sm text-center py-6 border border-dashed rounded-md">
                    Drag elements here to add to {category}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-md font-medium text-gray-700 mb-2">How to use:</h3>
          <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
            <li>Switch between profiles using the tabs at the top of the page</li>
            <li>Drag items from "Available Elements" into any of the four categories</li>
            <li>You can move items between categories</li>
            <li>Drag items back to the "Available Elements" section to remove them from a category</li>
            <li>The Patient Feasibility Plot updates based on how you categorize the elements</li>
            <li>Changes are saved per profile, so you can make different arrangements for each profile</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
