import { useTitle } from "react-use";
import { useContext } from "react";
import TrialComplexityCard from "@/components/TrialComplexityCard";
import PatientFeasibilityPlot from "@/components/PatientFeasibilityPlot";
import ProfileTabs from "@/components/ProfileTabs";
import ElementsPanel from "@/components/ElementsPanel";
import PatientDemographics from "@/components/PatientDemographics";
import { TrialDataContext } from "@/contexts/TrialDataContext";
import LoadingAnimation from "@/components/LoadingAnimation";

export default function Dashboard() {
  useTitle("Clinical Trial Dashboard");
  const { isLoading } = useContext(TrialDataContext);

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
            <div className="lg:w-1/2 p-4 border-b lg:border-b-0 lg:border-r border-gray-200">
              <ElementsPanel />
            </div>
            <div className="lg:w-1/2 p-4">
              <PatientFeasibilityPlot />
            </div>
          </div>
        </div>
        
        {/* Trial Complexity Card with reduced height */}
        <div className="border border-gray-100 shadow-sm rounded-lg overflow-hidden">
          <div className="p-4">
            <h3 className="text-base font-medium text-gray-800 mb-2">Trial Complexity Categories</h3>
            <div className="max-h-[250px] overflow-y-auto">
              <TrialComplexityCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}