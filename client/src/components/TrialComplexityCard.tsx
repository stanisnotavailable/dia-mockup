import { useContext, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrialDataContext, ComplexityItem, CATEGORIES, CategoryType } from "@/contexts/TrialDataContext";

export default function TrialComplexityCard() {
  const { getCurrentProfile, moveItem } = useContext(TrialDataContext);
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

  // Background colors for category containers
  const categoryBgColors = {
    [CATEGORIES.LOGISTICS]: "bg-blue-50",
    [CATEGORIES.MOTIVATION]: "bg-pink-50",
    [CATEGORIES.HEALTHCARE]: "bg-green-50",
    [CATEGORIES.QUALITY]: "bg-purple-50",
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

  // Item component with drag-and-drop functionality
  const ComplexityItemComponent = ({ item }: { item: ComplexityItem }) => {
    const itemClass = item.category ? categoryColors[item.category as CategoryType] || "" : "bg-gray-100 border-gray-300";
    
    return (
      <div
        draggable
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
        <div className="mb-2">
          <h2 className="text-lg font-medium text-gray-800">Trial Complexity Categories</h2>
          <p className="text-xs text-gray-500">
            Drag elements from the panel above into these categories to update the radar chart
          </p>
        </div>
        
        {/* Categories grid - 2x2 layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(CATEGORIES).map(([key, category]) => (
            <div 
              key={category}
              className={`${categoryBgColors[category as CategoryType]} border rounded-md p-3 transition-all ${
                draggedItem ? "ring-1 ring-blue-400" : ""
              }`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(category)}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className={`font-medium ${categoryColors[category as CategoryType].split(" ").slice(-1)[0]}`}>
                  {category}
                </h3>
                <span className="text-xs bg-white rounded-full px-2 py-0.5 border">
                  {trialData.complexityItems[category].length} items
                </span>
              </div>
              
              <div className="overflow-y-auto pr-1" style={{ height: "135px" }}>
                {trialData.complexityItems[category].map((item: ComplexityItem) => (
                  <ComplexityItemComponent key={item.id} item={item} />
                ))}
                {trialData.complexityItems[category].length === 0 && (
                  <div className="text-gray-400 text-sm text-center py-8 border border-dashed rounded-md">
                    Drop elements here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-gray-600 mt-3 p-2 bg-gray-50 rounded flex items-center">
          <span className="mr-1">💡</span>
          <span>Tip: The radar chart updates in real-time as you reorganize items between categories</span>
        </div>
      </CardContent>
    </Card>
  );
}
