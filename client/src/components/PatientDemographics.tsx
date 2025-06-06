import { useContext, useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrialDataContext } from "@/contexts/TrialDataContext";
import AiSummaryAnimation, { AiPulseAnimation } from "./AiSummaryAnimation";
import { generateAiSummary } from "@/lib/aiSummaryUtils";
import TypingAnimation from "./TypingAnimation";
// Import flag-icons CSS
import "flag-icons/css/flag-icons.min.css";

// Flag component using flag-icons library
const FlagIcon = ({ countryCode, countryName }: { countryCode: string; countryName: string }) => {
  const code = countryCode.toLowerCase();
  return (
    <span
      className={`fi fi-${code} mr-1`}
      title={`${countryName} flag`}
    />
  );
};

// CSS-based flag representations using primary colors
const COUNTRY_FLAG_STYLES: { [key: string]: React.CSSProperties } = {
  'US': {
    background: `
      linear-gradient(to bottom,
        #B22234 0%, #B22234 7.69%,
        #FFFFFF 7.69%, #FFFFFF 15.38%,
        #B22234 15.38%, #B22234 23.07%,
        #FFFFFF 23.07%, #FFFFFF 30.76%,
        #B22234 30.76%, #B22234 38.45%,
        #FFFFFF 38.45%, #FFFFFF 46.14%,
        #B22234 46.14%, #B22234 53.83%,
        #FFFFFF 53.83%, #FFFFFF 61.52%,
        #B22234 61.52%, #B22234 69.21%,
        #FFFFFF 69.21%, #FFFFFF 76.90%,
        #B22234 76.90%, #B22234 84.59%,
        #FFFFFF 84.59%, #FFFFFF 92.28%,
        #B22234 92.28%, #B22234 100%
      ),
      linear-gradient(to right, 
        #3C3B6E 0%, #3C3B6E 38%, 
        transparent 38%)
    `,
    border: '1px solid #ccc'
  },
  'DE': {
    background: 'linear-gradient(to bottom, #000000 0%, #000000 33.33%, #DD0000 33.33%, #DD0000 66.66%, #FFCE00 66.66%)',
    border: '1px solid #ccc'
  },
  'CA': {
    background: 'linear-gradient(to right, #FF0000 0%, #FF0000 25%, #FFFFFF 25%, #FFFFFF 75%, #FF0000 75%)',
    border: '1px solid #ccc'
  },
  'UK': {
    background: `
      linear-gradient(to bottom, #012169 0%, #012169 100%),
      linear-gradient(45deg, transparent 0%, transparent 45%, #FFFFFF 45%, #FFFFFF 55%, transparent 55%),
      linear-gradient(-45deg, transparent 0%, transparent 45%, #FFFFFF 45%, #FFFFFF 55%, transparent 55%),
      linear-gradient(to bottom, transparent 0%, transparent 45%, #FFFFFF 45%, #FFFFFF 55%, transparent 55%),
      linear-gradient(to right, transparent 0%, transparent 45%, #FFFFFF 45%, #FFFFFF 55%, transparent 55%)
    `,
    border: '1px solid #ccc'
  },
  'GB': {
    background: `
      linear-gradient(to bottom, #012169 0%, #012169 100%),
      linear-gradient(45deg, transparent 0%, transparent 45%, #FFFFFF 45%, #FFFFFF 55%, transparent 55%),
      linear-gradient(-45deg, transparent 0%, transparent 45%, #FFFFFF 45%, #FFFFFF 55%, transparent 55%),
      linear-gradient(to bottom, transparent 0%, transparent 45%, #FFFFFF 45%, #FFFFFF 55%, transparent 55%),
      linear-gradient(to right, transparent 0%, transparent 45%, #FFFFFF 45%, #FFFFFF 55%, transparent 55%)
    `,
    border: '1px solid #ccc'
  },
  'FR': {
    background: 'linear-gradient(to right, #0055A4 0%, #0055A4 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #EF4135 66.66%)',
    border: '1px solid #ccc'
  },
  'IT': {
    background: 'linear-gradient(to right, #009246 0%, #009246 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #CE2B37 66.66%)',
    border: '1px solid #ccc'
  },
  'ES': {
    background: 'linear-gradient(to bottom, #AA151B 0%, #AA151B 25%, #F1BF00 25%, #F1BF00 75%, #AA151B 75%)',
    border: '1px solid #ccc'
  },
  'NL': {
    background: 'linear-gradient(to bottom, #21468B 0%, #21468B 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #AE1C28 66.66%)',
    border: '1px solid #ccc'
  },
  'AU': {
    background: '#012169',
    border: '1px solid #ccc'
  },
  'JP': {
    background: 'radial-gradient(circle at center, #BC002D 0%, #BC002D 30%, #FFFFFF 30%)',
    border: '1px solid #ccc'
  },
  'CN': {
    background: '#DE2910',
    border: '1px solid #ccc'
  },
  'IN': {
    background: 'linear-gradient(to bottom, #FF9933 0%, #FF9933 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #138808 66.66%)',
    border: '1px solid #ccc'
  },
  'BR': {
    background: '#009739',
    border: '1px solid #ccc'
  },
  'MX': {
    background: 'linear-gradient(to right, #006847 0%, #006847 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #CE1126 66.66%)',
    border: '1px solid #ccc'
  },
};

// Country code to name mapping
const COUNTRY_NAMES: { [key: string]: string } = {
  'US': 'United States',
  'DE': 'Germany',
  'CA': 'Canada',
  'UK': 'United Kingdom',
  'GB': 'United Kingdom',
  'FR': 'France',
  'IT': 'Italy',
  'ES': 'Spain',
  'NL': 'Netherlands',
  'AU': 'Australia',
  'JP': 'Japan',
  'CN': 'China',
  'IN': 'India',
  'BR': 'Brazil',
  'MX': 'Mexico',
  'AR': 'Argentina',
  'CL': 'Chile',
  'PE': 'Peru',
  'CO': 'Colombia',
  'VE': 'Venezuela',
  'KR': 'South Korea',
  'TH': 'Thailand',
  'VN': 'Vietnam',
  'PH': 'Philippines',
  'ID': 'Indonesia',
  'MY': 'Malaysia',
  'SG': 'Singapore',
  'TR': 'Turkey',
  'RU': 'Russia',
  'PL': 'Poland',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'CH': 'Switzerland',
  'AT': 'Austria',
  'BE': 'Belgium',
  'PT': 'Portugal',
  'IE': 'Ireland',
  'GR': 'Greece',
  'CZ': 'Czech Republic',
  'HU': 'Hungary',
  'RO': 'Romania',
  'BG': 'Bulgaria',
  'HR': 'Croatia',
  'SK': 'Slovakia',
  'SI': 'Slovenia',
  'LT': 'Lithuania',
  'LV': 'Latvia',
  'EE': 'Estonia',
  'IS': 'Iceland',
  'MT': 'Malta',
  'CY': 'Cyprus',
  'LU': 'Luxembourg',
  'ZA': 'South Africa',
  'EG': 'Egypt',
  'MA': 'Morocco',
  'NG': 'Nigeria',
  'KE': 'Kenya',
  'GH': 'Ghana',
  'ET': 'Ethiopia',
  'TZ': 'Tanzania',
  'UG': 'Uganda',
  'ZW': 'Zimbabwe',
  'IL': 'Israel',
  'SA': 'Saudi Arabia',
  'AE': 'United Arab Emirates',
  'QA': 'Qatar',
  'KW': 'Kuwait',
  'BH': 'Bahrain',
  'OM': 'Oman',
  'JO': 'Jordan',
  'LB': 'Lebanon',
  'IQ': 'Iraq',
  'IR': 'Iran',
  'PK': 'Pakistan',
  'BD': 'Bangladesh',
  'LK': 'Sri Lanka',
  'NP': 'Nepal',
  'MM': 'Myanmar',
  'KH': 'Cambodia',
  'LA': 'Laos',
  'NZ': 'New Zealand',
  'FJ': 'Fiji',
};

export default function PatientDemographics() {
  const { getCurrentProfile, lastDataChangeTimestamp, currentProfileId } = useContext(TrialDataContext);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState<number>(0);

  const profile = getCurrentProfile();
  const patientDemographic = profile.patientDemographic;

  // Check if current profile is profile0 to conditionally hide sections
  const isProfile0 = currentProfileId === 'profile0';

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

  // Helper function to get country name from country code
  const getCountryName = (countryCode: string): string => {
    return COUNTRY_NAMES[countryCode.toUpperCase()] || countryCode;
  };

  // Helper function to get country flag component or styles
  const getCountryFlag = (countryCode: string, countryName: string): JSX.Element => {
    return <FlagIcon countryCode={countryCode} countryName={countryName} />;
  };

  // Helper function to get legend data based on profile
  const getLegendData = () => {
    switch (currentProfileId) {
      case 'profile0':
        return [
          { name: "Healthcare Engagement", level: "High", visual: "full" },
          { name: "Logistical Challenge", level: "Low", visual: "empty" },
          { name: "Quality of Life Impact", level: "Low", visual: "empty" },
          { name: "Motivation", level: "Medium", visual: "half" }
        ];
      case 'profile1':
        return [
          { name: "Healthcare Engagement", level: "Medium", visual: "half" },
          { name: "Logistical Challenge", level: "Medium", visual: "half" },
          { name: "Quality of Life Impact", level: "High", visual: "full" },
          { name: "Motivation", level: "Low", visual: "empty" }
        ];
      case 'profile2':
        return [
          { name: "Healthcare Engagement", level: "Low", visual: "empty" },
          { name: "Logistical Challenge", level: "Low", visual: "empty" },
          { name: "Quality of Life Impact", level: "Medium", visual: "half" },
          { name: "Motivation", level: "Low", visual: "empty" }
        ];
      case 'profile3':
        return [
          { name: "Healthcare Engagement", level: "High", visual: "full" },
          { name: "Logistical Challenge", level: "High", visual: "full" },
          { name: "Quality of Life Impact", level: "High", visual: "full" },
          { name: "Motivation", level: "High", visual: "full" }
        ];
      default:
        return [
          { name: "Healthcare Engagement", level: "Medium", visual: "half" },
          { name: "Logistical Challenge", level: "Medium", visual: "half" },
          { name: "Quality of Life Impact", level: "High", visual: "full" },
          { name: "Motivation", level: "Low", visual: "empty" }
        ];
    }
  };

  // Helper function to get visual indicator based on level
  const getVisualIndicator = (visual: string) => {
    switch (visual) {
      case "full":
        return <div className="w-3 h-3 rounded-full bg-gray-700 mr-2"></div>;
      case "half":
        return (
          <div className="w-3 h-3 rounded-full mr-2 relative bg-gray-300">
            <div className="w-1.5 h-3 bg-gray-700 rounded-l-full"></div>
          </div>
        );
      case "empty":
        return <div className="w-3 h-3 rounded-full border border-gray-700 bg-white mr-2"></div>;
      default:
        return <div className="w-3 h-3 rounded-full border border-gray-700 bg-white mr-2"></div>;
    }
  };

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
        <div className={`font-medium ${titleFontSize} mb-0.5`}>Origin</div>
        <div className={`${contentFontSize} text-gray-500 mb-2`}>Patient geographic distribution</div>

        <div>
          <div className="flex flex-row justify-between">
            <div>
              <div className={`text-gray-500 ${labelFontSize} mb-0.5`}>Age Range</div>
              {isProfile0 && <div className="font-medium">&infin; - &infin;</div>}
              <div className="font-medium" style={{ visibility: isProfile0 ? 'hidden' : 'visible' }}>{patientDemographic.age}</div>
            </div>


            <div className="col-span-2">
              <div className={`text-gray-500 ${labelFontSize} mb-0.5`}>Countries</div>
              <div className="font-medium space-compact">
                {patientDemographic.origin && patientDemographic.origin.map((item, index) => {
                  const countryName = getCountryName(item.country);
                  const flagComponent = getCountryFlag(item.country, countryName);

                  return (
                    <div key={index} className="flex justify-between" >
                      <span className="flex items-center">
                        {flagComponent}
                        <span style={{ marginRight: '8px' }}>{countryName}:</span>
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
          </div>

          {/* Legend Section */}
          <div className="mt-4 mb-2">
            <div className={`text-gray-500 ${labelFontSize} mb-2`}>Legend</div>
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-2 px-3 font-medium border-b border-r border-gray-300">Trait</th>
                    <th className="text-left py-2 px-3 font-medium border-b border-gray-300">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {getLegendData().map((item, index) => (
                    <tr key={item.name} className={index < getLegendData().length - 1 ? "border-b border-gray-300" : ""}>
                      <td className="py-2 px-3 border-r border-gray-300">{item.name}</td>
                      <td className="py-2 px-3 flex items-center">
                        {getVisualIndicator(item.visual)}
                        <span>({item.level})</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Summary Section with Dark Background and High Contrast */}
          <div className="col-span-3 mt-4 pt-2 border-t border-gray-100 relative">
            <div className="flex items-center mb-3">
              <div className={`text-gray-500 text-base flex items-center`}>
                <span className="mr-1">AI Summary</span>
                <span className="text-blue-500 text-xs">✨</span>
              </div>
            </div>

            <div>
              {/* Show the thinking animation only during initial generation */}
              {isGeneratingAi && !aiSummary && (
                <div className="px-3 py-2">
                  <AiSummaryAnimation isGenerating={true} darkMode={true} />
                </div>
              )}

              <div
                className="font-normal text-base rounded-md overflow-hidden"
                style={{ backgroundColor: "#EDF3FD", minHeight: "120px" }}
              >
                {/* Fancy AI border animation */}
                <div className="relative">
                  <AiPulseAnimation isGenerating={isGeneratingAi} darkMode={true} />
                  <div className="relative z-10 p-3">
                    <div className="font-regular overflow-y-auto" style={{ maxHeight: "350px", color: "#1A1A2E", visibility: isProfile0 ? 'hidden' : 'visible' }}>
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
        </div>
      </CardContent>
    </Card>
  );
}