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
      
      <div className="mb-6">
        <PatientDemographics />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <ElementsPanel />
        </div>
        <div className="lg:col-span-2">
          <PatientFeasibilityPlot />
        </div>
        <div className="lg:col-span-3">
          <TrialComplexityCard />
        </div>
      </div>
    </div>
  );
}