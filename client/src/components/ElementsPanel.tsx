import { useContext, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrialDataContext, ComplexityItem, CategoryType, CATEGORIES } from "@/contexts/TrialDataContext";
import questionsData from '@/data/questions.json';

export default function ElementsPanel() {
  const { getCurrentProfile, getQuestionsForProfile, moveItem, resetProfile } = useContext(TrialDataContext);
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

  // Handle dropping an item - keep it in the available items
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
        
        // Validate that this item belongs to the current profile
        const profileQuestions = getQuestionsForProfile(currentProfile.id);
        const belongsToProfile = profileQuestions.some(q => q.id === complexityItem.id);
        
        if (belongsToProfile) {
          // Move the item to the available items (empty category)
          moveItem(complexityItem, '');
        } else {
          console.warn(`Item ${complexityItem.id} does not belong to profile ${currentProfile.id}`);
        }
      } else {
        // Fallback to the old way with just an ID
        const itemId = itemData;
        
        // Validate that this item belongs to the current profile
        const profileQuestions = getQuestionsForProfile(currentProfile.id);
        const belongsToProfile = profileQuestions.some(q => q.id === itemId);
        
        if (!belongsToProfile) {
          console.warn(`Item ${itemId} does not belong to profile ${currentProfile.id}`);
          return;
        }
        
        // Find the item from any category
        let foundItem = null;
        for (const category of Object.values(trialData.complexityItems)) {
          foundItem = category.find(item => item.id === itemId);
          if (foundItem) break;
        }
        
        if (foundItem) {
          // Move the item to the available items (empty category)
          moveItem(foundItem, '');
        }
      }
    } catch (error) {
      console.error("Error handling drop:", error);
    }
  };

  // Item component with drag-and-drop functionality
  const ComplexityItemComponent = ({ item, isDraggable = true }: { item: ComplexityItem, isDraggable?: boolean }) => {
    // Check if this is one of the special custom insights that should be blue
    const isCustomInsight = ['custom1', 'custom2', 'custom3', 'custom4', 'custom5', 'custom6', 'custom7'].includes(item.id);
    const textColorClass = isCustomInsight ? 'text-[#2563EB]' : '';

    return (
      <div
        draggable={isDraggable}
        onDragStart={(e) => handleDragStart(e, item)}
        className="bg-gray-100 border-gray-300 py-0.5 px-2 my-0.5 rounded border cursor-move transition-all hover:shadow-md flex items-center justify-between min-touch-target"
      >
        <div className={`font-medium text-xs ${textColorClass}`}>{item.name}</div>
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardContent className="p-3 h-full flex flex-col">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center">
            <h2 className="text-base font-medium text-gray-800">Available Elements</h2>
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
        
        <p className="text-xs text-gray-500 mb-2">
          Items removed from categories will appear here
        </p>
        
        <div 
          className={`border rounded-md p-2 bg-gray-50 flex-grow ${
            isDraggedOver ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200" : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDropToAvailable}
        >
          <div className="overflow-y-auto h-full max-h-[300px] custom-scrollbar pr-1 space-compact">
            {trialData.availableItems.map((item: ComplexityItem) => (
              <ComplexityItemComponent key={`available-${item.id}`} item={item} />
            ))}
            {trialData.availableItems.length === 0 && (
              <div className="text-gray-500 text-xs text-center py-4 border border-dashed rounded-md mt-2">
                No available elements.<br />
                Click the "✕" on items to move them here.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}