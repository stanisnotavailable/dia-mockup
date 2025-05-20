import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function StandardOfCareCard() {
  const { toast } = useToast();

  const handleViewInsights = () => {
    toast({
      title: "Insights View",
      description: "Insights functionality would open a detailed modal in the full application.",
    });
  };

  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-medium text-gray-800">Standard of Care</h2>
            <p className="text-sm text-gray-500 mt-1">
              Summary of the basic components of the Standard of Care treatment sequence in the selected country
            </p>
          </div>
          <Button 
            className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-600 transition"
            onClick={handleViewInsights}
          >
            View Insights
          </Button>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg text-gray-700 font-medium">Disease Burden Score</h3>
          <p className="text-sm text-gray-500 mb-2">Quantified score from Standard of Care</p>
          <div className="text-4xl font-semibold text-gray-800">4.81</div>
        </div>
      </CardContent>
    </Card>
  );
}
