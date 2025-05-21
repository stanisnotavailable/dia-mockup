import { useContext, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrialDataContext, ComplexityItem, CategoryType } from "@/contexts/TrialDataContext";

export default function ElementsPanel() {
  const { getCurrentProfile, moveItem, resetProfile } = useContext(TrialDataContext);
  const [draggedItem, setDraggedItem] = useState<ComplexityItem | null>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  
  // Get the current profile data
  const currentProfile = getCurrentProfile();
  const trialData = currentProfile.trialData;

  // Reset dragged item when it's released without a proper drop
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      setDraggedItem(null);
      setIsDraggedOver(false);
    };
    
    window.addEventListener('dragend', handleGlobalDragEnd);
    return () => {
      window.removeEventListener('dragend', handleGlobalDragEnd);
    };
  }, []);

  // Handle starting to drag an item
  const handleDragStart = (e: React.DragEvent, item: ComplexityItem) => {
    e.dataTransfer.effectAllowed = "move";
    // Store the full item data as JSON string
    e.dataTransfer.setData("text/plain", JSON.stringify(item));
    setDraggedItem(item);
    
    // Create a drag image
    const dragImage = document.createElement('div');
    dragImage.className = 'p-2 bg-white border rounded text-xs shadow-md';
    dragImage.textContent = item.name;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  // Handle the drag over event to enable dropping
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // This is necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
    setIsDraggedOver(true);
  };
  
  // Handle drag leaving the element
  const handleDragLeave = () => {
    setIsDraggedOver(false);
  };

  // Handle dropping an item back to available items
  const handleDropToAvailable = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggedOver(false);
    
    try {
      // Get the item data from dataTransfer
      const itemData = e.dataTransfer.getData("text/plain");
      
      // Check if it's JSON data
      if (itemData.startsWith('{')) {
        // Parse the ComplexityItem from JSON
        const complexityItem = JSON.parse(itemData) as ComplexityItem;
        
        // Only move if not already in available items (empty category)
        if (complexityItem.category !== '') {
          moveItem(complexityItem, '');
        }
      } else {
        // Fallback to the old way with just an ID
        const itemId = itemData;
        
        // Find the item from either availableItems or any category
        let foundItem = trialData.availableItems.find(item => item.id === itemId);
        
        if (!foundItem) {
          // Search through all categories
          for (const category of Object.values(trialData.complexityItems)) {
            foundItem = category.find(item => item.id === itemId);
            if (foundItem) break;
          }
        }
        
        if (foundItem && foundItem.category !== '') {
          moveItem(foundItem, '');
        }
      }
    } catch (error) {
      console.error("Error handling drop to available:", error);
    }
  };

  // Item component with drag-and-drop functionality
  const ComplexityItemComponent = ({ item, isDraggable = true }: { item: ComplexityItem, isDraggable?: boolean }) => {
    return (
      <div
        draggable={isDraggable}
        onDragStart={(e) => handleDragStart(e, item)}
        className="bg-gray-100 border-gray-300 py-1 px-2 my-1 rounded border cursor-move shadow-sm transition-all hover:shadow-md flex items-center justify-between"
      >
        <div className="font-medium text-xs">{item.name}</div>
        <div className="text-xs text-gray-500 ml-1">{item.complexity}</div>
      </div>
    );
  };

  return (
    <Card className="border border-gray-100 shadow-sm h-full">
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
          className={`border rounded-md p-2 bg-gray-50 flex-grow overflow-hidden ${
            isDraggedOver ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200" : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
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
  );
}