import { useTitle } from "react-use";
import { useContext } from "react";
import TrialComplexityCard from "@/components/TrialComplexityCard";
import PatientFeasibilityPlot from "@/components/PatientFeasibilityPlot";
import ProfileTabs from "@/components/ProfileTabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PatientDemographics from "@/components/PatientDemographics";
import { TrialDataContext, ComplexityItem } from "@/contexts/TrialDataContext";
import LoadingAnimation from "@/components/LoadingAnimation";
import { PresentationModeToggle } from "@/components/PresentationModeToggle";
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
    <div className="p-3 border border-gray-100 rounded-md">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium">{categoryName}</h4>
        {/* Score is now hidden */}
      </div>
      <div className="space-y-1">
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
  const { isLoading, getCurrentProfile, moveItem, resetProfile } =
    useContext(TrialDataContext);
  const profile = getCurrentProfile();
  const currentProfile = profile; // Alias for clarity
  const trialData = currentProfile.trialData;

  // If we're in loading state, show the "thinking" animation instead of skeletons
  if (isLoading) {
    return <LoadingAnimation />;
  }

  // When data is loaded, show the dashboard
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Clinical Trial Dashboard
        </h1>
        <p className="text-gray-600">
          Monitor patient experience and trial complexity metrics
        </p>
      </header>

      <ProfileTabs />
      
      {/* Add the presentation mode toggle */}
      <PresentationModeToggle />

      <div className="mt-4 space-y-6">
        {/* Container with Available Elements and Feasibility Plot side by side */}
        <div className="border border-gray-100 shadow-sm rounded-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-2/5 p-4">
              <PatientDemographics />
            </div>
            <div className="lg:w-3/5 p-4">
              <PatientFeasibilityPlot />
            </div>
          </div>
        </div>

        {/* Four-Column Trial Complexity Categories Layout with Available Elements */}
        <div className="border border-gray-100 shadow-sm rounded-lg overflow-hidden">
          <div className="p-4">
            <h3 className="text-base font-medium text-gray-800 mb-4">
              Trial Complexity Categories
            </h3>

            {/* Five column layout: Available Elements + 4 categories */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Available Elements Panel */}
              <div
                className="p-3 border rounded-md transition-colors flex flex-col h-[200px] border-gray-200"
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

                  try {
                    // Get the item data from dataTransfer
                    const itemData = e.dataTransfer.getData("text/plain");

                    // Check if it's JSON data
                    if (itemData.startsWith("{")) {
                      // Parse the ComplexityItem from JSON
                      const complexityItem = JSON.parse(
                        itemData
                      ) as ComplexityItem;

                      // Only move if not already in available items (empty category)
                      if (complexityItem.category !== "") {
                        moveItem(complexityItem, "");
                      }
                    } else {
                      // Fallback to the old way with just an ID
                      const itemId = itemData;

                      // Find the item from either availableItems or any category
                      let foundItem = trialData.availableItems.find(
                        (item) => item.id === itemId
                      );

                      if (!foundItem) {
                        // Search through all categories
                        for (const category of Object.values(
                          trialData.complexityItems
                        )) {
                          foundItem = category.find(
                            (item) => item.id === itemId
                          );
                          if (foundItem) break;
                        }
                      }

                      if (foundItem && foundItem.category !== "") {
                        moveItem(foundItem, "");
                      }
                    }
                  } catch (error) {
                    console.error("Error handling drop to available:", error);
                  }
                }}
              >
                {/* Category header with name and badge */}
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Uncategorized</h4>
                  {/* <div className="flex items-center">
                    <Button
                      onClick={() => resetProfile()}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2"
                    >
                      Reset
                    </Button>
                  </div> */}
                </div>

                {/* Scrollable items container */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar mt-1">
                  {trialData.availableItems.length > 0 ? (
                    trialData.availableItems.map((item: ComplexityItem) => (
                      <div
                        key={`available-${item.id}`}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = "move";
                          // Store the full item data as JSON string
                          e.dataTransfer.setData(
                            "text/plain",
                            JSON.stringify(item)
                          );
                          // Add a visual indicator of what is being dragged
                          e.currentTarget.classList.add("bg-blue-50");

                          // Create a drag image
                          const dragImage = document.createElement("div");
                          dragImage.className =
                            "p-2 bg-white border rounded text-xs shadow-md";
                          dragImage.textContent = item.name;
                          document.body.appendChild(dragImage);
                          e.dataTransfer.setDragImage(dragImage, 0, 0);
                          setTimeout(
                            () => document.body.removeChild(dragImage),
                            0
                          );
                        }}
                        onDragEnd={(e) => {
                          e.currentTarget.classList.remove("bg-blue-50");
                        }}
                        className="text-xs text-gray-600 flex items-center justify-between py-1 px-2 rounded cursor-move hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <div className="w-1 h-1 rounded-full bg-gray-400 mr-2"></div>
                          {item.name}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center text-xs text-gray-400 italic border border-dashed rounded p-2 h-full">
                      All elements have been categorized
                    </div>
                  )}
                </div>
              </div>

              {/* Fixed set of categories, each with its own column */}
              {[
                "Logistics Challenge",
                "Motivation",
                "Healthcare Engagement",
                "Quality of Life",
              ].map((categoryName, idx) => {
                // Find the category data
                const categoryData = profile.categories?.find(
                  (cat) => cat.name === categoryName
                );
                const questionIds = categoryData?.questions || [];

                // Define colors for each category
                const colors = {
                  "Logistics Challenge":
                    "bg-blue-100 text-blue-800 border-blue-200",
                  Motivation: "bg-green-100 text-green-800 border-green-200",
                  "Healthcare Engagement":
                    "bg-purple-100 text-purple-800 border-purple-200",
                  "Quality of Life":
                    "bg-amber-100 text-amber-800 border-amber-200",
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
                    className={`p-3 border rounded-md transition-colors flex flex-col h-[200px] ${borderColor}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      const hoverColor =
                        color.split(" ")[0].replace("bg-", "bg-") + "/50";
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
                          if (complexityItem.category !== categoryName) {
                            // Make sure it's removed from the previous category first
                            if (complexityItem.category) {
                              console.log(
                                `Moving from ${complexityItem.category} to ${categoryName}`
                              );
                            }

                            // Move the item to the new category
                            moveItem(complexityItem, categoryName);
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
                            foundItem.category !== categoryName
                          ) {
                            moveItem(foundItem, categoryName);
                          }
                        }
                      } catch (error) {
                        console.error("Error handling drop:", error);
                      }
                    }}
                  >
                    {/* Category header with name and score */}
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">{categoryName}</h4>
                      {/* Score is now hidden */}
                    </div>

                    {/* Scrollable items container */}
                    <div className="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar mt-1">
                      {questionIds.length > 0 ? (
                        questionIds.map((questionId, qIdx) => {
                          // Get question details from the ID
                          const questionName = getQuestionName(questionId);
                          const questionScore = getQuestionScore(questionId);

                          // Create a full ComplexityItem for dragging
                          const complexityItem = {
                            id: questionId,
                            name: questionName,
                            category: categoryName,
                            complexity: 60, // Default complexity
                            score: questionScore, // Add the score
                          };

                          return (
                            <div
                              key={qIdx}
                              className="text-xs text-gray-600 flex items-center justify-between py-1 px-2 rounded cursor-move hover:bg-gray-100"
                              draggable={true}
                              onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = "move";
                                // Store the full item data as JSON string to preserve category info
                                e.dataTransfer.setData(
                                  "text/plain",
                                  JSON.stringify(complexityItem)
                                );
                                // Add a visual indicator of what is being dragged
                                e.currentTarget.classList.add("bg-blue-50");

                                // Create a drag image
                                const dragImage = document.createElement("div");
                                dragImage.className =
                                  "p-2 bg-white border rounded text-xs shadow-md";
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
                              }}
                            >
                              <div className="flex items-center">
                                <div className="w-1 h-1 rounded-full bg-gray-400 mr-2"></div>
                                {questionName}
                              </div>
                              {/* Score is now hidden */}
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex items-center justify-center text-xs text-gray-400 italic border border-dashed rounded p-2 h-full">
                          Drop items here
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
