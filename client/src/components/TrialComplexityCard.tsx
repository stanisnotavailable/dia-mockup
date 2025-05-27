import { useContext, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrialDataContext, ComplexityItem, CATEGORIES, CategoryType } from "@/contexts/TrialDataContext";

export default function TrialComplexityCard() {
  const { getCurrentProfile, moveItem } = useContext(TrialDataContext);
  const [draggedItem, setDraggedItem] = useState<ComplexityItem | null>(null);
  const [draggedOverCategory, setDraggedOverCategory] = useState<string | null>(null);
  
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

  // Background colors for category containers
  const categoryBgColors = {
    [CATEGORIES.LOGISTICS]: "bg-blue-50",
    [CATEGORIES.MOTIVATION]: "bg-pink-50",
    [CATEGORIES.HEALTHCARE]: "bg-green-50",
    [CATEGORIES.QUALITY]: "bg-purple-50",
  };

  // Reset dragged item when it's released without a proper drop
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      setDraggedItem(null);
      setDraggedOverCategory(null);
    };
    
    window.addEventListener('dragend', handleGlobalDragEnd);
    return () => {
      window.removeEventListener('dragend', handleGlobalDragEnd);
    };
  }, []);

  // Handle starting to drag an item
  const handleDragStart = (e: React.DragEvent, item: ComplexityItem) => {
    e.dataTransfer.effectAllowed = "move";
    // Store the item ID in dataTransfer
    e.dataTransfer.setData("text/plain", item.id);
    setDraggedItem(item);
  };

  // Handle the drag over event to enable dropping
  const handleDragOver = (e: React.DragEvent, category: string) => {
    e.preventDefault(); // This is necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
    setDraggedOverCategory(category);
  };

  // Handle drag leaving a category
  const handleDragLeave = () => {
    setDraggedOverCategory(null);
  };

  // Handle dropping an item into a category
  const handleDrop = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    setDraggedOverCategory(null);
    
    // Get the item ID from dataTransfer
    const itemId = e.dataTransfer.getData("text/plain");
    
    // Find the item from either availableItems or any category
    let foundItem = trialData.availableItems.find(item => item.id === itemId);
    
    if (!foundItem) {
      // Search through all categories
      for (const categoryItems of Object.values(trialData.complexityItems)) {
        foundItem = categoryItems.find(item => item.id === itemId);
        if (foundItem) break;
      }
    }
    
    if (foundItem) {
      moveItem(foundItem, category);
    }
  };

  // Item component with drag-and-drop functionality
  const ComplexityItemComponent = ({ item }: { item: ComplexityItem }) => {
    const itemClass = item.category ? categoryColors[item.category as CategoryType] || "" : "bg-gray-100 border-gray-300";
    
    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, item)}
        className={`${itemClass} py-0.5 px-2 my-0.5 rounded border cursor-move shadow-sm transition-all hover:shadow-md flex items-center justify-between min-touch-target`}
      >
        <div className="font-medium text-xs">{item.name}</div>
        <div 
          className="ml-2 text-gray-400 hover:text-red-500 cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation(); // Prevent drag event from triggering
            
            // Move the item to the availableItems array (empty category)
            moveItem(item, '');
          }}
        >
          ✕
        </div>
      </div>
    );
  };

  return (
    <Card className="border border-gray-100 shadow-sm lg:col-span-3">
      <CardContent className="p-3">
        <div className="mb-1">
          <h2 className="text-base font-medium text-gray-800">Trial Complexity Categories</h2>
          <p className="text-xs text-gray-500">
            Drag elements from the panel above into these categories to update the radar chart
          </p>
        </div>
        
        {/* Categories grid - 2x2 layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(CATEGORIES).map(([key, category]) => {
            const isDropTarget = draggedOverCategory === category;
            
            return (
              <div 
                key={category}
                className={`${categoryBgColors[category as CategoryType]} border rounded-md p-2 transition-all ${
                  isDropTarget 
                    ? `ring-2 ring-${key.toLowerCase()}-400 border-${key.toLowerCase()}-400` 
                    : ""
                }`}
                onDragOver={(e) => handleDragOver(e, category)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, category)}
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`font-medium ${categoryColors[category as CategoryType].split(" ").slice(-1)[0]}`}>
                    {category}
                  </h3>
                  <span className="text-xs bg-white rounded-full px-2 py-0.5 border">
                    {trialData.complexityItems[category].length} items
                  </span>
                </div>
                
                <div className="overflow-y-auto pr-1 space-compact" style={{ height: "135px" }}>
                  {trialData.complexityItems[category].map((item: ComplexityItem) => (
                    <ComplexityItemComponent key={item.id} item={item} />
                  ))}
                  {trialData.complexityItems[category].length === 0 && (
                    <div className={`text-gray-400 text-sm text-center py-6 border border-dashed rounded-md ${
                      isDropTarget ? "bg-white bg-opacity-50" : ""
                    }`}>
                      Drop elements here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="text-xs text-gray-600 mt-2 p-1.5 bg-gray-50 rounded flex items-center">
          <span className="mr-1">💡</span>
          <span>Tip: The radar chart updates in real-time as you reorganize items between categories</span>
        </div>
      </CardContent>
    </Card>
  );
}
