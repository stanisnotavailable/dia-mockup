import { useContext, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrialDataContext, ComplexityItem, CATEGORIES, CategoryType } from "@/contexts/TrialDataContext";

export default function TrialComplexityCard() {
  const { getCurrentProfile, moveItem, currentProfileId, resetProfile } = useContext(TrialDataContext);
  const [draggedItem, setDraggedItem] = useState<ComplexityItem | null>(null);
  const [draggedOverCategory, setDraggedOverCategory] = useState<string | null>(null);
  const [showUncategorized, setShowUncategorized] = useState<boolean>(true);
  
  // Track base scores per profile (initial scores when component loads) for each category
  const [baseScoresByProfile, setBaseScoresByProfile] = useState<Record<string, Record<string, number>>>({});

  // Get the current profile data
  const currentProfile = getCurrentProfile();
  const trialData = currentProfile.trialData;

  // Initialize base scores on first load for each profile
  useEffect(() => {
    if (currentProfile.categories && !baseScoresByProfile[currentProfileId]) {
      const initialScores: Record<string, number> = {};
      currentProfile.categories.forEach(category => {
        initialScores[category.name] = category.currentScore || 0;
      });
      setBaseScoresByProfile(prev => ({
        ...prev,
        [currentProfileId]: initialScores
      }));
    }
  }, [currentProfile.categories, currentProfileId, baseScoresByProfile]);

  // Get base scores for current profile
  const currentBaseScores = baseScoresByProfile[currentProfileId] || {};

  // Move item function (no need to track previous state anymore)
  const handleItemMove = (item: ComplexityItem, targetCategory: string) => {
    // Perform the move
    moveItem(item, targetCategory);
  };

  // Function to get score change indicator compared to base score
  const getScoreChangeIndicator = (categoryName: string, currentScore: number) => {
    const baseScore = currentBaseScores[categoryName];
    if (baseScore === undefined) return null;
    
    const scoreDiff = currentScore - baseScore;
    const threshold = 0.01; // Minimum difference to show arrows
    
    if (scoreDiff > threshold) {
      return <span className="text-green-500 font-bold ml-2" title={`Score increased by ${scoreDiff.toFixed(2)} from base (${baseScore.toFixed(2)})`}>↗ +{scoreDiff.toFixed(2)}</span>;
    } else if (scoreDiff < -threshold) {
      return <span className="text-red-500 font-bold ml-2" title={`Score decreased by ${Math.abs(scoreDiff).toFixed(2)} from base (${baseScore.toFixed(2)})`}>↘ {scoreDiff.toFixed(2)}</span>;
    }
    return null;
  };

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
      handleItemMove(foundItem, category);
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
      // Get profile-specific scoring rules from context (we'll need to pass this down or calculate it here)
      // For now, calculate based on the current profile and category
      let addMultiplier = 1;
      let removeMultiplier = 1;
      
      // Profile-specific multipliers based on category - UPDATED to reflect new lower values
      if (currentProfileId === 'profile0') {
        // Demo profile - all multipliers are 1.0 to maintain preset scores
        addMultiplier = 1.0;
        removeMultiplier = 1.0;
      } else if (currentProfileId === 'profile1') {
        // Profile1 uses fixed add/remove amounts instead of multipliers
        if (item.category === 'Healthcare Engagement') { addMultiplier = 15; removeMultiplier = 15; }
        else if (item.category === 'Motivation') { addMultiplier = 10; removeMultiplier = 10; }
        else if (item.category === 'Quality of Life') { addMultiplier = 15; removeMultiplier = 15; }
        else if (item.category === 'Logistics Challenge') { addMultiplier = 10; removeMultiplier = 10; }
      } else if (currentProfileId === 'profile2') {
        // Profile2 uses fixed add/remove amounts instead of multipliers
        if (item.category === 'Healthcare Engagement') { addMultiplier = 20; removeMultiplier = 20; }
        else if (item.category === 'Motivation') { addMultiplier = 25; removeMultiplier = 25; }
        else if (item.category === 'Quality of Life') { addMultiplier = 30; removeMultiplier = 30; }
        else if (item.category === 'Logistics Challenge') { addMultiplier = 25; removeMultiplier = 25; }
      } else if (currentProfileId === 'profile3') {
        // Profile3 uses fixed add/remove amounts instead of multipliers
        if (item.category === 'Healthcare Engagement') { addMultiplier = 5; removeMultiplier = 5; }
        else if (item.category === 'Motivation') { addMultiplier = 10; removeMultiplier = 10; }
        else if (item.category === 'Quality of Life') { addMultiplier = 0; removeMultiplier = 0; }
        else if (item.category === 'Logistics Challenge') { addMultiplier = 15; removeMultiplier = 15; }
      }

      // For profile1, profile2, and profile3, use fixed amounts; for others, use multipliers
      const addValue = (currentProfileId === 'profile1' || currentProfileId === 'profile2' || currentProfileId === 'profile3') ? addMultiplier : itemScore * addMultiplier;
      const removeValue = (currentProfileId === 'profile1' || currentProfileId === 'profile2' || currentProfileId === 'profile3') ? removeMultiplier : itemScore * removeMultiplier;

      if (multiplierLevel === 'High') {
        multiplierIndicator = "🔥"; // High multiplier
        multiplierTooltip = `Profile ${currentProfileId.slice(-1)} rules: +${addValue.toFixed(2)} when added, -${removeValue.toFixed(2)} when removed`;
      } else if (multiplierLevel === 'Medium') {
        multiplierIndicator = "⚡"; // Medium multiplier  
        multiplierTooltip = `Profile ${currentProfileId.slice(-1)} rules: +${addValue.toFixed(2)} when added, -${removeValue.toFixed(2)} when removed`;
      } else {
        multiplierIndicator = "🔹"; // Low multiplier
        multiplierTooltip = `Profile ${currentProfileId.slice(-1)} rules: +${addValue.toFixed(2)} when added, -${removeValue.toFixed(2)} when removed`;
      }
    }

    // Check if this is one of the special custom insights that should be blue
    const isCustomInsight = ['custom1', 'custom2', 'custom3', 'custom4', 'custom5', 'custom6', 'custom7'].includes(item.id);
    const textColorClass = isCustomInsight ? 'text-[#2563EB]' : '';

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, item)}
        className={`${itemClass} py-0.5 px-2 my-0.5 rounded border cursor-move transition-all hover:shadow-md flex items-center justify-between min-touch-target`}
        title={multiplierTooltip}
      >
        <div className={`font-medium text-xs flex items-center ${textColorClass}`}>
          {multiplierIndicator && <span className="mr-1">{multiplierIndicator}</span>}
          {item.name}
          <span className="ml-2 text-gray-500 text-xs">({itemScore})</span>
        </div>
        <div
          className="ml-2 text-gray-400 hover:text-red-500 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation(); // Prevent drag event from triggering

            // Move the item to the availableItems array (empty category)
            handleItemMove(item, '');
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
            <div className="font-medium text-blue-800 mb-1">📊 {currentProfile.name} - Category Scores</div>
            <div className="text-blue-700">
              {currentProfile.categories?.map(category => {
                const currentScore = (category as any).currentScore || 0;
                const baseScore = currentBaseScores[category.name] || 0;
                return (
                  <div key={category.name} className="flex items-center justify-between">
                    <span>
                      <strong>{category.name}</strong>: {(category as any).multiplierLevel || 'Medium'}
                      <br />
                      <span className="text-gray-600">Current: {currentScore.toFixed(2)}/10</span>
                      {Object.keys(currentBaseScores).length > 0 && (
                        <span className="text-gray-500"> | Base: {baseScore.toFixed(2)}/10</span>
                      )}
                    </span>
                    {getScoreChangeIndicator(category.name, currentScore)}
                  </div>
                );
              })}
            </div>
            {Object.keys(currentBaseScores).length > 0 && (
              <div className="mt-2 pt-2 border-t border-blue-300">
                <div className="flex justify-between items-center">
                  <div className="text-blue-600 text-xs">
                    <span className="font-medium">Base scores</span> captured at load. 
                    <span className="text-green-500">↗ +X.XX</span> = increase, 
                    <span className="text-red-500">↘ -X.XX</span> = decrease
                  </div>
                  <button
                    onClick={() => {
                      // Reset to base scores by recalculating from current state
                      if (currentProfile.categories) {
                        const currentScores: Record<string, number> = {};
                        currentProfile.categories.forEach(category => {
                          currentScores[category.name] = category.currentScore || 0;
                        });
                        setBaseScoresByProfile(prev => ({
                          ...prev,
                          [currentProfileId]: currentScores
                        }));
                      }
                    }}
                    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded border"
                    title="Set current scores as new base scores"
                  >
                    Reset Base
                  </button>
                </div>
              </div>
            )}
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
                    <h3 className={`font-medium ${categoryColors[category as CategoryType].split(" ").slice(-1)[0]} flex items-center`}>
                      {category}
                      {(() => {
                        const categoryData = currentProfile.categories?.find(cat => cat.name === category);
                        return categoryData ? getScoreChangeIndicator(category, categoryData.currentScore || 0) : null;
                      })()}
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
          <div className="flex items-center mb-2 gap-4">
            <div className="flex items-center">
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
            <button
              onClick={() => {
                // Reset the profile to its default state
                resetProfile();
                
                // Also reset our local base scores state
                setBaseScoresByProfile(prev => ({
                  ...prev,
                  [currentProfileId]: {}
                }));
              }}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded border"
              title="Reset profile to default state"
            >
              Baseline
            </button>
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
                <h3 className={`font-medium ${categoryColors[CATEGORIES.UNCATEGORIZED].split(" ").slice(-1)[0]} flex items-center`}>
                  {CATEGORIES.UNCATEGORIZED}
                  {(() => {
                    const categoryData = currentProfile.categories?.find(cat => cat.name === CATEGORIES.UNCATEGORIZED);
                    return categoryData ? getScoreChangeIndicator(CATEGORIES.UNCATEGORIZED, categoryData.currentScore || 0) : null;
                  })()}
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
          <div className="font-medium mb-1">{currentProfile.name} Scoring Rules:</div>
          <div className="space-y-0.5">
            {currentProfileId === 'profile0' && (
              <>
                <div>🎯 <strong>Profile 0</strong>: Calculated scores with demo insights</div>
                <div>🔥 <strong>Healthcare Engagement</strong>: +score×1.0 when added, -score×1.0 when removed (High)</div>
                <div>⚡ <strong>Motivation</strong>: +score×1.0 when added, -score×1.0 when removed (Medium)</div>
                <div>🔹 <strong>Logistics Challenge</strong>: +score×1.0 when added, -score×1.0 when removed (Low)</div>
                <div>🔹 <strong>Quality of Life</strong>: +score×1.0 when added, -score×1.0 when removed (Low)</div>
              </>
            )}
            {currentProfileId === 'profile1' && (
              <>
                <div>⚡ <strong>Healthcare Engagement</strong>: Base 25, +15 when added, -15 when removed (Medium)</div>
                <div>🔹 <strong>Motivation</strong>: Base 30, +10 when added, -10 when removed (Low)</div>
                <div>🔥 <strong>Quality of Life</strong>: Base 55, +15 when added, -15 when removed (High)</div>
                <div>⚡ <strong>Logistics Challenge</strong>: Base 45, +10 when added, -10 when removed (Medium)</div>
              </>
            )}
            {currentProfileId === 'profile2' && (
              <>
                <div>🔹 <strong>Healthcare Engagement</strong>: Base 20, +20 when added, -20 when removed (Low)</div>
                <div>🔹 <strong>Motivation</strong>: Base 35, +25 when added, -25 when removed (Low)</div>
                <div>⚡ <strong>Quality of Life</strong>: Base 60, +30 when added, -30 when removed (Medium)</div>
                <div>🔹 <strong>Logistics Challenge</strong>: Base 40, +25 when added, -25 when removed (Low)</div>
                <div>🎯 <strong>Custom Insights</strong>:</div>
                <div>📝 "I don't really understand...": +30 HC, +20 QoL when added to HC/QoL; -30 HC, -20 QoL when removed</div>
                <div>📝 "I'm starting to worry about work...": +20 QoL, +25 LC when added to QoL/LC; -20 QoL, -25 LC when removed</div>
              </>
            )}
            {currentProfileId === 'profile3' && (
              <>
                <div>🔥 <strong>Healthcare Engagement</strong>: Base 90, +5 when added, -5 when removed (High)</div>
                <div>🔥 <strong>Motivation</strong>: Base 90, +10 when added, -10 when removed (High)</div>
                <div>🔥 <strong>Quality of Life</strong>: Base 95, +0 when added, -0 when removed (High)</div>
                <div>🔥 <strong>Logistics Challenge</strong>: Base 85, +15 when added, -15 when removed (High)</div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
