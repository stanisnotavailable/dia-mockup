import { useContext, useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrialDataContext } from "@/contexts/TrialDataContext";
import AiSummaryAnimation, { AiPulseAnimation } from "./AiSummaryAnimation";
import { generateAiSummary } from "@/lib/aiSummaryUtils";
import TypingAnimation from "./TypingAnimation";

export default function PatientDemographics() {
  const { getCurrentProfile, lastDataChangeTimestamp, currentProfileId } = useContext(TrialDataContext);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState<number>(0);

  const profile = getCurrentProfile();
  const patientDemographic = profile.patientDemographic;

  // Calculate the average model value for the profile
  const averageModelValue = useMemo(() => {
    if (!profile.categories || profile.categories.length === 0) return 'N/A';

    // Use averageScore instead of model_value
    const sum = profile.categories.reduce((acc, category) => acc + (category.averageScore || 0), 0);
    return (sum / profile.categories.length).toFixed(1);
  }, [profile.categories]);

  // Use fixed sizes instead of dynamic presentation mode sizes
  const titleFontSize = "text-base";
  const contentFontSize = "text-sm";
  const labelFontSize = "text-xs";
  const padding = "p-3";
  const barHeight = "h-1";
  const flagFontSize = "text-base";

  // Match the chart height from PatientFeasibilityPlot
  const chartHeight = 450;

  // Generate AI summary whenever profile data changes or profile changes
  useEffect(() => {
    // Force regeneration when profile changes
    const now = Date.now();

    // Show animation
    setIsGeneratingAi(true);

    // Reset summary when profile changes
    if (profile.id !== currentProfileId) {
      setAiSummary("");
    }

    // Simulate AI thinking time - longer for more "thinking" appearance
    const thinkingTime = Math.random() * 1500 + 1000; // 1000-2500ms

    const timerId = setTimeout(() => {
      // Generate new summary
      const summary = generateAiSummary(profile);
      setAiSummary(summary);

      // Keep isGenerating true for the typing animation
      // It will be set to false when typing is complete
      // Use a much longer typing time to simulate thinking
      const typingDuration = summary.length * 40 + 2000; // Much slower typing + pauses
      setTimeout(() => {
        setIsGeneratingAi(false);
      }, typingDuration);

      setLastUpdateTimestamp(now);
    }, thinkingTime);

    return () => clearTimeout(timerId);
  }, [profile.categories, lastDataChangeTimestamp, currentProfileId]);

  return (
    <Card className="bg-white mt-2 w-full">
      <CardContent className={`${padding} h-full flex flex-col`} style={{ minHeight: "450px" }}>
        <div className={`font-medium ${titleFontSize} mb-0.5`}>Patient Demographics</div>
        <div className={`${contentFontSize} text-gray-500 mb-2`}>Personal and demographic information</div>

        <div className={`grid grid-cols-3 gap-x-2 gap-y-2 ${contentFontSize} flex-grow`}>
          <div className="flex flex-col">
            <div className={`text-gray-500 ${labelFontSize} mb-0.5`}>Age Range</div>
            <div className="font-medium">{patientDemographic.age}</div>
          </div>

          <div className="col-span-2">
            <div className={`text-gray-500 ${labelFontSize} mb-0.5`}>Origin</div>
            <div className="font-medium space-compact">
              {patientDemographic.origin && patientDemographic.origin.map((item, index) => {
                // Get flag emoji for country code
                const getFlagEmoji = (countryCode: string) => {
                  const codePoints = countryCode
                    .toUpperCase()
                    .split('')
                    .map(char => 127397 + char.charCodeAt(0));
                  return String.fromCodePoint(...codePoints);
                };

                return (
                  <div key={index} className="flex  items-center mb-1">
                    <span className="flex items-center">
                      <span className={`mr-1 ${flagFontSize}`}>{getFlagEmoji(item.country)}</span>
                      <span style={{ marginRight: '8px' }} >{item.country}:</span>
                    </span>
                    <div className="flex items-center">
                      <span className={`mr-1 ${labelFontSize}`}>{item.percentage}%</span>
                      <div className={`w-16 bg-gray-200 rounded-full ${barHeight}`}>
                        <div
                          className={`bg-blue-600 ${barHeight} rounded-full`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-span-3">
            <div className={`text-gray-500 ${labelFontSize} mb-0.5`}>Role</div>
            <div className="font-medium flex gap-1 flex-wrap">
              {patientDemographic.role && patientDemographic.role.map((item, index) => {
                // Define an array of gradient color combinations
                const gradientColors = [
                  'bg-gradient-to-r from-blue-400 to-purple-500',
                  'bg-gradient-to-r from-purple-400 to-pink-500',
                  'bg-gradient-to-r from-pink-400 to-red-500',
                  'bg-gradient-to-r from-green-400 to-blue-500',
                  'bg-gradient-to-r from-yellow-400 to-orange-500',
                  'bg-gradient-to-r from-indigo-400 to-cyan-500',
                  'bg-gradient-to-r from-teal-400 to-green-500',
                  'bg-gradient-to-r from-orange-400 to-red-500'
                ];

                // Select a random gradient based on the index to ensure consistency
                const selectedGradient = gradientColors[index % gradientColors.length];

                return (
                  <div
                    key={index}
                    className={`px-2 py-1 rounded-full text-xs text-white font-medium ${selectedGradient}`}
                  >
                    <span>{item.role_name} {item.percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Summary Section with Dark Background and High Contrast */}
          <div className="col-span-3 mt-2 pt-2 border-t border-gray-100 relative" style={{ height: "400px" }} >
            <div className="flex items-center">
              <div className={`text-gray-500 text-base mb-0.5 flex items-center`} style={{ marginBottom: '16px' }} >
                <span className="mr-1">AI Summary</span>
                <span className="text-blue-500 text-xs">✨</span>
              </div>
            </div>

            {/* Show the thinking animation only during initial generation */}
            {isGeneratingAi && !aiSummary && (
              <div className="px-3 py-2">
                <AiSummaryAnimation isGenerating={true} darkMode={true} />
              </div>
            )}

            <div
              className="font-normal text-base rounded-md overflow-hidden"
              style={{ backgroundColor: "#EDF3FD", maxHeight: "350px", minHeight: "120px" }}
            >
              {/* Fancy AI border animation */}
              <div className="relative">
                <AiPulseAnimation isGenerating={isGeneratingAi} darkMode={true} />
                <div className="relative z-10 p-3">
                  <div className="font-regular overflow-y-auto" style={{ maxHeight: "350px", color: "#1A1A2E" }}>
                    {aiSummary ? (
                      <TypingAnimation
                        text={aiSummary}
                        isGenerating={isGeneratingAi}
                        speed={40}  // Much slower typing speed
                        initialDelay={400}  // Longer initial delay
                        thinkingPauses={true}  // Enable random pauses while typing
                        darkMode={true}  // Enable dark mode styling
                      />
                    ) : (
                      <span className="text-gray-200">Analyzing patient data to generate insights...</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}