import { useTitle } from "react-use";
import { useContext } from "react";
import TrialComplexityCard from "@/components/TrialComplexityCard";
import PatientFeasibilityPlot from "@/components/PatientFeasibilityPlot";
import ProfileTabs from "@/components/ProfileTabs";
import ElementsPanel from "@/components/ElementsPanel";
import PatientDemographics from "@/components/PatientDemographics";
import { TrialDataContext } from "@/contexts/TrialDataContext";
import LoadingAnimation from "@/components/LoadingAnimation";

// Component for individual category elements
interface CategoryElementProps {
  categoryName: string;
  color: string;
}

const CategoryElement = ({ categoryName, color }: CategoryElementProps) => {
  const { getCurrentProfile } = useContext(TrialDataContext);
  const profile = getCurrentProfile();
  
  // Find the category data to display questions
  const categoryData = profile.categories?.find(cat => cat.name === categoryName);
  const modelValue = categoryData?.model_value || 0;
  
  return (
    <div className="p-3 border border-gray-100 rounded-md">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium">{categoryName}</h4>
        <div className={`text-xs px-2 py-0.5 rounded-full ${color}`}>
          {modelValue.toFixed(1)}
        </div>
      </div>
      <div className="space-y-1">
        {categoryData?.questions.slice(0, 3).map((question, idx) => (
          <div key={idx} className="text-xs text-gray-600 flex items-center">
            <div className="w-1 h-1 rounded-full bg-gray-400 mr-2"></div>
            {question.name}
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
  const { isLoading, getCurrentProfile, moveItem } = useContext(TrialDataContext);
  const profile = getCurrentProfile();
  const currentProfile = profile; // Alias for clarity

  // If we're in loading state, show the "thinking" animation instead of skeletons
  if (isLoading) {
    return <LoadingAnimation />;
  }

  // When data is loaded, show the dashboard
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Clinical Trial Dashboard</h1>
        <p className="text-gray-600">Monitor patient experience and trial complexity metrics</p>
      </header>

      <ProfileTabs />
      
      <div className="mt-4 space-y-6">
        {/* Patient Demographics takes full width */}
        <PatientDemographics />
        
        {/* Container with Available Elements and Feasibility Plot side by side */}
        <div className="border border-gray-100 shadow-sm rounded-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2 p-4">
              <ElementsPanel />
            </div>
            <div className="lg:w-1/2 p-4">
              <PatientFeasibilityPlot />
            </div>
          </div>
        </div>
        
        {/* Trial Complexity Categories - One container with four category elements */}
        <div className="border border-gray-100 shadow-sm rounded-lg overflow-hidden">
          <div className="p-4">
            <h3 className="text-base font-medium text-gray-800 mb-4">Trial Complexity Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Display each complexity category as a separate card */}
              {profile.categories?.map((category, idx) => {
                // Define colors for each category
                const colors = {
                  "Logistics Challenge": "bg-blue-100 text-blue-800",
                  "Motivation": "bg-green-100 text-green-800",
                  "Healthcare Engagement": "bg-purple-100 text-purple-800",
                  "Quality of Life": "bg-amber-100 text-amber-800"
                };
                
                const color = colors[category.name as keyof typeof colors] || "bg-gray-100 text-gray-800";
                
                return (
                  <div 
                    key={idx} 
                    className="p-3 border border-gray-100 rounded-md transition-colors"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      e.currentTarget.classList.add('bg-blue-50', 'border-blue-200');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('bg-blue-50', 'border-blue-200');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('bg-blue-50', 'border-blue-200');
                      
                      // Get the item ID from dataTransfer
                      const itemId = e.dataTransfer.getData("text/plain");
                      
                      // Find the item in available items
                      let foundItem = profile.trialData.availableItems.find(item => item.id === itemId);
                      
                      if (!foundItem) {
                        // Search through all categories in complexityItems
                        Object.values(profile.trialData.complexityItems).forEach(categoryItems => {
                          const item = categoryItems.find(item => item.id === itemId);
                          if (item) foundItem = item;
                        });
                      }
                      
                      // Move the item to this category
                      if (foundItem) {
                        // Don't move if it's already in this category
                        if (foundItem.category !== category.name) {
                          moveItem(foundItem, category.name);
                        }
                      }
                    }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">{category.name}</h4>
                      <div className={`text-xs px-2 py-0.5 rounded-full ${color}`}>
                        {category.model_value.toFixed(1)}
                      </div>
                    </div>
                    <div className="max-h-[120px] overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                      {category.questions.map((question, qIdx) => {
                        // Create a full ComplexityItem for dragging
                        const complexityItem = {
                          id: question.id,
                          name: question.name,
                          category: category.name,
                          complexity: 0 // Add default complexity if needed
                        };
                        
                        return (
                          <div 
                            key={qIdx} 
                            className="text-xs text-gray-600 flex items-center py-1 px-1 rounded cursor-move hover:bg-gray-100"
                            draggable={true}
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = "move";
                              e.dataTransfer.setData("text/plain", complexityItem.id);
                              // Add a visual indicator of what is being dragged
                              e.currentTarget.classList.add('bg-blue-50');
                              
                              // Create a drag image
                              const dragImage = document.createElement('div');
                              dragImage.className = 'p-2 bg-white border rounded text-xs shadow-md';
                              dragImage.textContent = complexityItem.name;
                              document.body.appendChild(dragImage);
                              e.dataTransfer.setDragImage(dragImage, 0, 0);
                              setTimeout(() => document.body.removeChild(dragImage), 0);
                            }}
                            onDragEnd={(e) => {
                              e.currentTarget.classList.remove('bg-blue-50');
                            }}
                          >
                            <div className="w-1 h-1 rounded-full bg-gray-400 mr-2"></div>
                            {question.name}
                          </div>
                        );
                      })}
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