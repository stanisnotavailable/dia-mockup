import { useTitle } from "react-use";
import { useContext, useEffect, useState } from "react";
import TrialComplexityCard from "@/components/TrialComplexityCard";
import PatientFeasibilityPlot from "@/components/PatientFeasibilityPlot";
import ProfileTabs from "@/components/ProfileTabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PatientDemographics from "@/components/PatientDemographics";
import { TrialDataContext, ComplexityItem, CATEGORIES } from "@/contexts/TrialDataContext";
import LoadingAnimation from "@/components/LoadingAnimation";
import {
  getQuestionById,
  getQuestionName,
  getQuestionScore,
} from "@/lib/questionUtils";

// Component for individual category elements
interface CategoryElementProps {
  categoryName: string;
  color: string;
}

const CategoryElement = ({ categoryName, color }: CategoryElementProps) => {
  const { getCurrentProfile } = useContext(TrialDataContext);
  const profile = getCurrentProfile();

  // Find the category data to display questions
  const categoryData = profile.categories?.find(
    (cat) => cat.name === categoryName
  );
  const averageScore = categoryData?.averageScore || 0;

  return (
    <div className="p-2 border border-gray-100 rounded-md">
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-sm font-medium">{categoryName}</h4>
        {/* Score is now hidden */}
      </div>
      <div className="space-compact">
        {categoryData?.questions.slice(0, 3).map((questionId, idx) => (
          <div key={idx} className="text-xs text-gray-600 flex items-center">
            <div className="w-1 h-1 rounded-full bg-gray-400 mr-2"></div>
            {getQuestionName(questionId)}
          </div>
        ))}
        {(categoryData?.questions.length || 0) > 3 && (
          <div className="text-xs text-gray-500 italic">
            +{(categoryData?.questions.length || 0) - 3} more items
          </div>
        )}
      </div>
    </div>
  );
};

// Dashboard component
export default function Dashboard() {
  useTitle("Clinical Trial Dashboard");
  const { isLoading, getCurrentProfile, getQuestionsForProfile, moveItem, resetProfile } =
    useContext(TrialDataContext);
  const profile = getCurrentProfile();
  const currentProfile = profile; // Alias for clarity
  const trialData = currentProfile.trialData;
  const [showUncategorized, setShowUncategorized] = useState(false);
  const [draggedItem, setDraggedItem] = useState<ComplexityItem | null>(null);

  // Distribute uncategorized items to other categories
  // Commented out to allow items to remain in availableItems when deleted
  /*
  useEffect(() => {
    // Only run if there are uncategorized items
    if (trialData.availableItems.length > 0) {
      // Get the category names as an array
      const categoryNames = Object.values(CATEGORIES);
      
      // Distribute each uncategorized item to a category
      trialData.availableItems.forEach((item, index) => {
        // Determine which category to assign this item to (round-robin distribution)
        const targetCategory = categoryNames[index % categoryNames.length];
        
        // Move the item to the selected category
        moveItem(item, targetCategory);
      });
    }
  }, [trialData.availableItems.length, moveItem]);
  */

  // If we're in loading state, show the "thinking" animation instead of skeletons
  if (isLoading) {
    return <LoadingAnimation />;
  }

  // When data is loaded, show the dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/30 via-purple-100/20 to-pink-100/30">
      <div className="container mx-auto px-4 py-4 max-w-7xl" style={{ paddingTop: '8px' }} >

        <ProfileTabs />

        <div className="space-y-4">
          {/* Container with Available Elements and Feasibility Plot side by side */}
          <div className="rounded-lg overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-2">
              <div className="lg:w-1/3 flex">
                <PatientDemographics />
              </div>
              <div className="lg:w-2/3 flex">
                <PatientFeasibilityPlot />
              </div>
            </div>
          </div>

          {/* Four-Column Trial Complexity Categories Layout */}
          <Card className="bg-white mt-2 w-full">
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-medium text-gray-800">
                  Patient Insights Latent Traits
                </h3>
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
              </div>

              {/* Four column layout for categories */}
              <div className={`grid grid-cols-1 ${showUncategorized ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-3`}>
                {/* Fixed set of categories, each with its own column */}
                {[
                  "Healthcare Engagement",
                  "Logistical Challenge",
                  "Quality of Life Impact",
                  "Motivation",
                ].map((categoryName, idx) => {
                  // Get items from trialData.complexityItems instead of profile.categories
                  // Map the display names to the actual category names used in the data
                  const categoryMapping = {
                    "Healthcare Engagement": "Healthcare Engagement",
                    "Logistical Challenge": "Logistics Challenge",
                    "Quality of Life Impact": "Quality of Life",
                    "Motivation": "Motivation",
                  };

                  const actualCategoryName = categoryMapping[categoryName as keyof typeof categoryMapping];
                  const categoryItems = trialData.complexityItems[actualCategoryName as keyof typeof trialData.complexityItems] || [];

                  // Define colors for each category
                  const colors = {
                    "Logistical Challenge":
                      "bg-[#3992FE]/10 text-[#3992FE] border-[#3992FE]/30",
                    "Motivation":
                      "bg-[#12A54D]/10 text-[#12A54D] border-[#12A54D]/30",
                    "Healthcare Engagement":
                      "bg-[#B675FF]/10 text-[#B675FF] border-[#B675FF]/30",
                    "Quality of Life Impact":
                      "bg-[#EF6C15]/10 text-[#EF6C15] border-[#EF6C15]/30",
                  };

                  const color =
                    colors[categoryName as keyof typeof colors] ||
                    "bg-gray-100 text-gray-800";
                  const borderColor =
                    color.split(" ").find((c) => c.startsWith("border-")) ||
                    "border-gray-200";

                  return (
                    <div
                      key={idx}
                      className={`border p-2 rounded-md transition-colors flex flex-col h-[200px]`}
                      style={{ backgroundColor: '#EDF3FD' }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        e.currentTarget.classList.add("bg-blue-50");
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove("bg-blue-50");
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove("bg-blue-50");

                        // Get the item data from dataTransfer
                        try {
                          const itemData = e.dataTransfer.getData("text/plain");

                          // Check if it's JSON data
                          if (itemData.startsWith("{")) {
                            // Parse the ComplexityItem from JSON
                            const complexityItem = JSON.parse(
                              itemData
                            ) as ComplexityItem;

                            // Don't move if it's already in this category
                            if (complexityItem.category !== actualCategoryName) {
                              // Make sure it's removed from the previous category first
                              if (complexityItem.category) {
                                console.log(
                                  `Moving from ${complexityItem.category} to ${actualCategoryName}`
                                );
                              }

                              // Move the item to the new category using the actual category name
                              moveItem(complexityItem, actualCategoryName);
                            }
                          } else {
                            // Fallback for backward compatibility - treat as ID only
                            const itemId = itemData;

                            // Find the item in available items first
                            let foundItem = profile.trialData.availableItems.find(
                              (item) => item.id === itemId
                            );

                            if (!foundItem) {
                              // Search through all categories in complexityItems
                              Object.values(
                                profile.trialData.complexityItems
                              ).forEach((categoryItems) => {
                                const item = categoryItems.find(
                                  (item) => item.id === itemId
                                );
                                if (item) foundItem = item;
                              });
                            }

                            // Move the item to this category if it exists and isn't already here
                            if (
                              foundItem &&
                              foundItem.category !== actualCategoryName
                            ) {
                              moveItem(foundItem, actualCategoryName);
                            }
                          }
                        } catch (error) {
                          console.error("Error handling drop:", error);
                        }
                      }}
                    >
                      {/* Category header with name and score */}
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <h4 className="text-base font-medium mr-2">{categoryName}</h4>
                          {/* Score indicator based on category */}
                          {categoryName === "Healthcare Engagement" && (
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full mr-1 relative bg-gray-300">
                                <div className="w-1.5 h-3 bg-gray-700 rounded-l-full"></div>
                              </div>
                              <span className="text-xs text-gray-500">(Medium)</span>
                            </div>
                          )}
                          {categoryName === "Logistical Challenge" && (
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full mr-1 relative bg-gray-300">
                                <div className="w-1.5 h-3 bg-gray-700 rounded-l-full"></div>
                              </div>
                              <span className="text-xs text-gray-500">(Medium)</span>
                            </div>
                          )}
                          {categoryName === "Quality of Life Impact" && (
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-gray-700 mr-1"></div>
                              <span className="text-xs text-gray-500">(High)</span>
                            </div>
                          )}
                          {categoryName === "Motivation" && (
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full border border-gray-700 bg-white mr-1"></div>
                              <span className="text-xs text-gray-500">(Low)</span>
                            </div>
                          )}
                        </div>
                        {/* Score is now hidden */}
                      </div>

                      {/* Scrollable items container */}
                      <div className="flex-1 overflow-y-auto pr-1 space-compact custom-scrollbar">
                        {categoryItems.length > 0 ? (
                          categoryItems.map((item, qIdx) => {
                            // Create a full ComplexityItem for dragging
                            const complexityItem = {
                              id: item.id,
                              name: item.name,
                              category: actualCategoryName,
                              complexity: item.complexity || 60,
                              score: item.score,
                            };

                            return (
                              <div
                                key={qIdx}
                                className="text-base text-gray-600 flex items-center justify-between py-1 px-2 rounded cursor-move"
                                style={{
                                  transition: 'background-color 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#E1E9FD';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                draggable={true}
                                onDragStart={(e) => {
                                  e.dataTransfer.effectAllowed = "move";
                                  // Store the full item data as JSON string to preserve category info
                                  e.dataTransfer.setData(
                                    "text/plain",
                                    JSON.stringify(complexityItem)
                                  );
                                  // Set the dragged item in state
                                  setDraggedItem(complexityItem);
                                  // Add a visual indicator of what is being dragged
                                  e.currentTarget.classList.add("bg-blue-50");

                                  // Create a drag image
                                  const dragImage = document.createElement("div");
                                  dragImage.className =
                                    "p-2 bg-white border rounded text-base shadow-md";
                                  dragImage.textContent = complexityItem.name;
                                  document.body.appendChild(dragImage);
                                  e.dataTransfer.setDragImage(dragImage, 0, 0);
                                  setTimeout(
                                    () => document.body.removeChild(dragImage),
                                    0
                                  );
                                }}
                                onDragEnd={(e) => {
                                  e.currentTarget.classList.remove("bg-blue-50");
                                  setDraggedItem(null);
                                }}
                              >
                                <div className="flex items-center">
                                  {item.name}
                                </div>
                                <div
                                  className="ml-2 text-gray-400 hover:text-red-500 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent drag event from triggering

                                    // Move the item to the availableItems array (empty category)
                                    moveItem(complexityItem, '');
                                  }}
                                >
                                  ✕
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="flex items-center justify-center text-base text-gray-400 italic border border-dashed rounded p-2 h-full">
                            Drop items here
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Uncategorized Card - appears as 5th column when enabled */}
                {showUncategorized && (
                  <div
                    className="border p-2 rounded-md transition-colors flex flex-col h-[200px] bg-[#6B7280]/10"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      e.currentTarget.classList.add("bg-gray-100");
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove("bg-gray-100");
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove("bg-gray-100");

                      // Get the item data from dataTransfer
                      try {
                        const itemData = e.dataTransfer.getData("text/plain");

                        // Check if it's JSON data
                        if (itemData.startsWith("{")) {
                          // Parse the ComplexityItem from JSON
                          const complexityItem = JSON.parse(
                            itemData
                          ) as ComplexityItem;

                          // Don't move if it's already in this category
                          if (complexityItem.category !== CATEGORIES.UNCATEGORIZED) {
                            // Move the item to the uncategorized category
                            moveItem(complexityItem, CATEGORIES.UNCATEGORIZED);
                          }
                        } else {
                          // Fallback for backward compatibility - treat as ID only
                          const itemId = itemData;

                          // Find the item in available items first
                          let foundItem = profile.trialData.availableItems.find(
                            (item) => item.id === itemId
                          );

                          if (!foundItem) {
                            // Search through all categories in complexityItems
                            Object.values(
                              profile.trialData.complexityItems
                            ).forEach((categoryItems) => {
                              const item = categoryItems.find(
                                (item) => item.id === itemId
                              );
                              if (item) foundItem = item;
                            });
                          }

                          // Move the item to this category if it exists and isn't already here
                          if (
                            foundItem &&
                            foundItem.category !== CATEGORIES.UNCATEGORIZED
                          ) {
                            moveItem(foundItem, CATEGORIES.UNCATEGORIZED);
                          }
                        }
                      } catch (error) {
                        console.error("Error handling drop:", error);
                      }
                    }}
                  >
                    {/* Category header with name and count */}
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-base font-medium text-gray-600">Uncategorized</h4>
                    </div>

                    {/* Scrollable items container */}
                    <div className="flex-1 overflow-y-auto pr-1 space-compact custom-scrollbar">
                      {(trialData.complexityItems[CATEGORIES.UNCATEGORIZED]?.length || 0) > 0 ? (
                        trialData.complexityItems[CATEGORIES.UNCATEGORIZED].map((item, qIdx) => {
                          // Create a full ComplexityItem for dragging
                          const complexityItem = {
                            id: item.id,
                            name: item.name,
                            category: CATEGORIES.UNCATEGORIZED,
                            complexity: item.complexity || 60,
                            score: item.score,
                          };

                          return (
                            <div
                              key={qIdx}
                              className="text-base text-gray-600 flex items-center justify-between py-1 px-2 rounded cursor-move"
                              style={{
                                transition: 'background-color 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#F3F4F6';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              draggable={true}
                              onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = "move";
                                // Store the full item data as JSON string to preserve category info
                                e.dataTransfer.setData(
                                  "text/plain",
                                  JSON.stringify(complexityItem)
                                );
                                // Set the dragged item in state
                                setDraggedItem(complexityItem);
                                // Add a visual indicator of what is being dragged
                                e.currentTarget.classList.add("bg-gray-100");

                                // Create a drag image
                                const dragImage = document.createElement("div");
                                dragImage.className =
                                  "p-2 bg-white border rounded text-base shadow-md";
                                dragImage.textContent = complexityItem.name;
                                document.body.appendChild(dragImage);
                                e.dataTransfer.setDragImage(dragImage, 0, 0);
                                setTimeout(
                                  () => document.body.removeChild(dragImage),
                                  0
                                );
                              }}
                              onDragEnd={(e) => {
                                e.currentTarget.classList.remove("bg-gray-100");
                                setDraggedItem(null);
                              }}
                            >
                              <div className="flex items-center">
                                {item.name}
                              </div>
                              <div
                                className="ml-2 text-gray-400 hover:text-red-500 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent drag event from triggering

                                  // Move the item to the availableItems array (empty category)
                                  moveItem(complexityItem, '');
                                }}
                              >
                                ✕
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex items-center justify-center text-base text-gray-400 italic border border-dashed rounded p-2 h-full">
                          Drop items here
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
