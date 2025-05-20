import { useTitle } from "react-use";
import { useContext } from "react";
import TrialComplexityCard from "@/components/TrialComplexityCard";
import PatientFeasibilityPlot from "@/components/PatientFeasibilityPlot";
import ProfileTabs from "@/components/ProfileTabs";
import ElementsPanel from "@/components/ElementsPanel";
import PatientDemographics from "@/components/PatientDemographics";
import { TrialDataContext } from "@/contexts/TrialDataContext";

// Import skeleton components
import ProfileTabsSkeleton from "@/components/skeletons/ProfileTabsSkeleton";
import PatientDemographicsSkeleton from "@/components/skeletons/PatientDemographicsSkeleton";
import ElementsPanelSkeleton from "@/components/skeletons/ElementsPanelSkeleton";
import PatientFeasibilityPlotSkeleton from "@/components/skeletons/PatientFeasibilityPlotSkeleton";
import TrialComplexityCardSkeleton from "@/components/skeletons/TrialComplexityCardSkeleton";

export default function Dashboard() {
  useTitle("Clinical Trial Dashboard");
  const { isLoading } = useContext(TrialDataContext);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Clinical Trial Dashboard</h1>
        <p className="text-gray-600">Monitor patient experience and trial complexity metrics</p>
      </header>

      {isLoading ? (
        <>
          <ProfileTabsSkeleton />
          
          {/* Patient Demographics Section Skeleton */}
          <div className="mb-6">
            <PatientDemographicsSkeleton />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <ElementsPanelSkeleton />
            </div>
            <div className="lg:col-span-2">
              <PatientFeasibilityPlotSkeleton />
            </div>
            <div className="lg:col-span-3">
              <TrialComplexityCardSkeleton />
            </div>
          </div>
        </>
      ) : (
        <>
          <ProfileTabs />
          
          {/* Patient Demographics Section */}
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
        </>
      )}
    </div>
  );
}
