import { useTitle } from "react-use";
import StandardOfCareCard from "@/components/StandardOfCareCard";
import TrialComplexityCard from "@/components/TrialComplexityCard";
import PatientFeasibilityPlot from "@/components/PatientFeasibilityPlot";

export default function Dashboard() {
  useTitle("Clinical Trial Dashboard");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Clinical Trial Dashboard</h1>
        <p className="text-gray-600">Monitor patient experience and trial complexity metrics</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StandardOfCareCard />
        <TrialComplexityCard />
        <PatientFeasibilityPlot />
      </div>
    </div>
  );
}
