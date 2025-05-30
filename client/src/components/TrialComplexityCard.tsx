import { useContext, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrialDataContext, ComplexityItem, CATEGORIES, CategoryType } from "@/contexts/TrialDataContext";

export default function TrialComplexityCard() {
  const { getCurrentProfile, moveItem, currentProfileId } = useContext(TrialDataContext);
  const [draggedItem, setDraggedItem] = useState<ComplexityItem | null>(null);
  const [draggedOverCategory, setDraggedOverCategory] = useState<string | null>(null);
  const [showUncategorized, setShowUncategorized] = useState<boolean>(true);

  // Get the current profile data
  const currentProfile = getCurrentProfile();
  const trialData = currentProfile.trialData;

  // Colors for the categories - using the new hex colors
  const categoryColors = {
    [CATEGORIES.LOGISTICS]: "border-[#3992FE] text-[#3992FE]",
    [CATEGORIES.MOTIVATION]: "border-[#12A54D] text-[#12A54D]",
    [CATEGORIES.HEALTHCARE]: "border-[#B675FF] text-[#B675FF]",
    [CATEGORIES.QUALITY]: "border-[#EF6C15] text-[#EF6C15]",
    [CATEGORIES.UNCATEGORIZED]: "border-[#6B7280] text-[#6B7280]",
  };

  // Background colors for category containers - using lighter versions of the hex colors
  const categoryBgColors = {
    [CATEGORIES.LOGISTICS]: "bg-[#3992FE]/10",
    [CATEGORIES.MOTIVATION]: "bg-[#12A54D]/10",
    [CATEGORIES.HEALTHCARE]: "bg-[#B675FF]/10",
    [CATEGORIES.QUALITY]: "bg-[#EF6C15]/10",
    [CATEGORIES.UNCATEGORIZED]: "bg-[#6B7280]/10",
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

    // Determine multiplier indicator for current profile
    let multiplierIndicator = "";
    let multiplierTooltip = "";

    // Find the category data for this item
    const categoryData = currentProfile.categories?.find(cat => cat.name === item.category);
    const multiplierLevel = (categoryData as any)?.multiplierLevel || 'Medium';
    const itemScore = item.score || 0;

    if (item.category) {
      const addValue = multiplierLevel === 'Low' ? itemScore * 0.5 :
        multiplierLevel === 'Medium' ? itemScore * 1.25 :
          itemScore * 1.75;
      const removeValue = multiplierLevel === 'High' ? itemScore * 1.75 : itemScore * 0.5;

      if (multiplierLevel === 'High') {
        multiplierIndicator = "🔥"; // High multiplier
        multiplierTooltip = `High multiplier: +${addValue.toFixed(1)} when added, -${removeValue.toFixed(1)} when removed`;
      } else if (multiplierLevel === 'Medium') {
        multiplierIndicator = "⚡"; // Medium multiplier  
        multiplierTooltip = `Medium multiplier: +${addValue.toFixed(1)} when added, -${removeValue.toFixed(1)} when removed`;
      } else {
        multiplierIndicator = "🔹"; // Low multiplier
        multiplierTooltip = `Low multiplier: +${addValue.toFixed(1)} when added, -${removeValue.toFixed(1)} when removed`;
      }
    }

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, item)}
        className={`${itemClass} py-0.5 px-2 my-0.5 rounded border cursor-move transition-all hover:shadow-md flex items-center justify-between min-touch-target`}
        title={multiplierTooltip}
      >
        <div className="font-medium text-xs flex items-center">
          {multiplierIndicator && <span className="mr-1">{multiplierIndicator}</span>}
          {item.name}
          <span className="ml-2 text-gray-500 text-xs">({itemScore})</span>
        </div>
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
    <Card className="border border-gray-100 lg:col-span-3">
      <CardContent className="p-3">
        <div className="mb-1">
          <h2 className="text-base font-medium text-gray-800">Patient Insights Latent Traits</h2>
          <p className="text-xs text-gray-500">
            Drag elements from the panel above into these categories to update the radar chart
          </p>
          <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
            <div className="font-medium text-blue-800 mb-1">📊 {currentProfile.name} - Category Multipliers</div>
            <div className="text-blue-700">
              {currentProfile.categories?.map(category => (
                <div key={category.name}>
                  • <strong>{category.name}</strong>: {(category as any).multiplierLevel || 'Medium'}
                  {(category as any).currentScore !== undefined && (
                    <span className="text-gray-600"> (Score: {((category as any).currentScore).toFixed(1)}/10)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Categories grid - 2x2 layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(CATEGORIES)
            .filter(([key, category]) => category !== CATEGORIES.UNCATEGORIZED)
            .map(([key, category]) => {
              const isDropTarget = draggedOverCategory === category;

              return (
                <div
                  key={category}
                  className={`${categoryBgColors[category as CategoryType]} border rounded-md p-2 transition-all ${isDropTarget
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
                      <div className={`text-gray-400 text-sm text-center py-6 border border-dashed rounded-md ${isDropTarget ? "bg-white bg-opacity-50" : ""
                        }`}>
                        Drop elements here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Uncategorized Section */}
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="show-uncategorized"
              checked={showUncategorized}
              onChange={(e) => setShowUncategorized(e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="show-uncategorized" className="text-sm font-medium text-gray-700 cursor-pointer">
              Show Uncategorized
            </label>
          </div>

          {showUncategorized && (
            <div
              className={`${categoryBgColors[CATEGORIES.UNCATEGORIZED]} border rounded-md p-2 transition-all ${draggedOverCategory === CATEGORIES.UNCATEGORIZED
                ? "ring-2 ring-gray-400 border-gray-400"
                : ""
                }`}
              onDragOver={(e) => handleDragOver(e, CATEGORIES.UNCATEGORIZED)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, CATEGORIES.UNCATEGORIZED)}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className={`font-medium ${categoryColors[CATEGORIES.UNCATEGORIZED].split(" ").slice(-1)[0]}`}>
                  {CATEGORIES.UNCATEGORIZED}
                </h3>
                <span className="text-xs bg-white rounded-full px-2 py-0.5 border">
                  {trialData.complexityItems[CATEGORIES.UNCATEGORIZED].length} items
                </span>
              </div>

              <div className="overflow-y-auto pr-1 space-compact" style={{ height: "135px" }}>
                {trialData.complexityItems[CATEGORIES.UNCATEGORIZED].map((item: ComplexityItem) => (
                  <ComplexityItemComponent key={item.id} item={item} />
                ))}
                {trialData.complexityItems[CATEGORIES.UNCATEGORIZED].length === 0 && (
                  <div className={`text-gray-400 text-sm text-center py-6 border border-dashed rounded-md ${draggedOverCategory === CATEGORIES.UNCATEGORIZED ? "bg-white bg-opacity-50" : ""
                    }`}>
                    Drop elements here
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-600 mt-2 p-1.5 bg-gray-50 rounded flex items-center">
          <span className="mr-1">💡</span>
          <span>Tip: The radar chart updates based on scoring multipliers - drag items to see real-time score changes</span>
        </div>

        <div className="text-xs text-gray-600 mt-2 p-1.5 bg-blue-50 rounded">
          <div className="font-medium mb-1">Scoring System Rules:</div>
          <div className="space-y-0.5">
            <div>🔥 <strong>High</strong>: +score×1.75 when added, -score×1.75 when removed</div>
            <div>⚡ <strong>Medium</strong>: +score×1.25 when added, -score×0.5 when removed</div>
            <div>🔹 <strong>Low</strong>: +score×0.5 when added, -score×0.5 when removed</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
