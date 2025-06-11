import { useContext, useMemo, useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { TrialDataContext, CATEGORIES, CategoryType } from "@/contexts/TrialDataContext";
import { getQuestionScore } from "@/lib/questionUtils";

// Improved force update hook with better performance
function useForceUpdate() {
  const [, setTick] = useState(0);
  const lastUpdateRef = useRef<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      // Only update if it's been at least 100ms since the last update
      if (now - lastUpdateRef.current >= 100) {
        lastUpdateRef.current = now;
        setTick(tick => tick + 1);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);
}

export default function PatientFeasibilityPlot() {
  // Get everything directly from context to ensure real-time updates
  const { getCurrentProfile, currentProfileId } = useContext(TrialDataContext);

  // Track base scores per profile (initial scores when component loads) for each category
  const [baseScoresByProfile, setBaseScoresByProfile] = useState<Record<string, Record<string, number>>>({});

  // Force re-render to catch updates
  useForceUpdate();

  // Get profile data directly from context each time
  const profileData = getCurrentProfile();
  const categories = profileData.categories || [];

  // Initialize base scores on first load for each profile
  useEffect(() => {
    if (categories.length > 0 && !baseScoresByProfile[currentProfileId]) {
      const initialScores: Record<string, number> = {};
      categories.forEach(category => {
        initialScores[category.name] = category.currentScore || 0;
      });
      setBaseScoresByProfile(prev => ({
        ...prev,
        [currentProfileId]: initialScores
      }));
    }
  }, [categories, currentProfileId, baseScoresByProfile]);

  // Get base scores for current profile
  const currentBaseScores = baseScoresByProfile[currentProfileId] || {};

  // Function to get score change indicator compared to base score
  const getScoreChangeIndicator = (categoryName: string, currentScore: number) => {
    const baseScore = currentBaseScores[categoryName];
    if (baseScore === undefined) return "";

    const scoreDiff = currentScore - baseScore;
    const threshold = 0.01; // Minimum difference to show arrows

    if (scoreDiff >= 15) {
      return `↑↑`; // Double up arrow for large increase
    } else if (scoreDiff > threshold) {
      return `↑`; // Single up arrow for small increase
    } else if (scoreDiff <= -15) {
      return `↓↓`; // Double down arrow for large decrease
    } else if (scoreDiff < -threshold) {
      return `↓`; // Single down arrow for small decrease
    }
    return "";
  };

  // Function to get arrow color based on profile-specific rules
  const getArrowColor = (profileId: string, categoryName: string, isUpArrow: boolean): string => {
    const defaultColor = '#6b7280'; // gray-500 fallback

    switch (profileId) {
      case 'profile1': // Under-supported Veteran
        switch (categoryName) {
          case 'Quality of Life':
            return isUpArrow ? '#ef4444' : '#10b981'; // up=red, down=green
          case 'Motivation':
            return isUpArrow ? '#ef4444' : '#10b981'; // up=red, down=green
          case 'Healthcare Engagement':
            return isUpArrow ? '#10b981' : '#ef4444'; // up=green, down=red
          case 'Logistics Challenge':
            return isUpArrow ? '#ef4444' : '#10b981'; // up=red, down=green
          default:
            return defaultColor;
        }

      case 'profile2': // Uninformed Newcomer
        switch (categoryName) {
          case 'Quality of Life':
            return isUpArrow ? '#ef4444' : '#10b981'; // up=red, down=green
          case 'Motivation':
            return isUpArrow ? '#10b981' : '#ef4444'; // up=green, down=red
          case 'Healthcare Engagement':
            return isUpArrow ? '#10b981' : '#ef4444'; // up=green, down=red
          case 'Logistics Challenge':
            return isUpArrow ? '#ef4444' : '#10b981'; // up=red, down=green
          default:
            return defaultColor;
        }

      case 'profile3': // Overloaded Advocate
        switch (categoryName) {
          case 'Quality of Life':
            return isUpArrow ? '#ef4444' : '#10b981'; // up=red, down=green
          case 'Motivation':
            return isUpArrow ? '#ef4444' : '#10b981'; // up=red, down=green
          case 'Healthcare Engagement':
            return '#ef4444'; // both up=red and down=red
          case 'Logistics Challenge':
            return isUpArrow ? '#ef4444' : '#10b981'; // up=red, down=green
          default:
            return defaultColor;
        }

      default:
        // For other profiles, use the old logic (green for up, red for down)
        return isUpArrow ? '#10b981' : '#ef4444';
    }
  };

  // Define colors for the radar chart using the new hex colors
  const categoryColors = {
    [CATEGORIES.LOGISTICS]: "#3992FE",
    [CATEGORIES.MOTIVATION]: "#12A54D",
    [CATEGORIES.HEALTHCARE]: "#B675FF",
    [CATEGORIES.QUALITY]: "#EF6C15"
  };

  // Define category labels for the axes
  const categoryLabels = useMemo(() => ({
    [CATEGORIES.LOGISTICS]: "Logistics Challenge",
    [CATEGORIES.MOTIVATION]: "Motivation",
    [CATEGORIES.HEALTHCARE]: "Healthcare Engagement",
    [CATEGORIES.QUALITY]: "Quality of Life"
  }), []);

  // Prepare data for the radar chart
  const radarData = useMemo(() => {
    // Create one data point for each category (axis) - exclude Uncategorized
    return Object.values(CATEGORIES)
      .filter(category => category !== CATEGORIES.UNCATEGORIZED)
      .map(category => {
        const categoryData = categories.find(c => c.name === category);

        let score = 0;
        if (categoryData?.questions?.length && categoryData?.questions?.length > 0) {
          // Calculate the score based on the questions using the same logic as the context
          // Use the averageScore that's already calculated in the context with proper multipliers
          score = categoryData.averageScore || 0;
        }

        // Convert to flat data structure for the chart
        // For profile1, profile2, and profile3, score is already 0-100, for others multiply by 10 to get 0-100 range
        const chartScore = (profileData.id === 'profile1' || profileData.id === 'profile2' || profileData.id === 'profile3') ? Math.min(score, 100) : Math.min(score * 10, 100);

        return {
          category: category,
          score: chartScore,
          color: categoryColors[category as keyof typeof categoryColors] // Safe access to color
        };
      });
  }, [categories, categoryColors]);

  // Check if there's data to display
  const hasDataToDisplay = useMemo(() => {
    return categories.some(cat => cat.questions && cat.questions.length > 0);
  }, [categories]);

  // Custom tooltip content for the radar chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      const dataPoint = radarData.find(d => d.category === entry.payload.category);
      const color = dataPoint?.color || entry.color;

      // Get score change information compared to base
      const categoryName = entry.payload.category;
      const currentScore = (profileData.id === 'profile1' || profileData.id === 'profile2' || profileData.id === 'profile3') ? entry.value : entry.value / 10; // Keep 0-100 for profile1/profile2/profile3, convert back to 0-10 for others
      const baseScore = currentBaseScores[categoryName];
      let scoreChangeText = "";

      if (baseScore !== undefined) {
        const scoreDiff = currentScore - baseScore;
        if (Math.abs(scoreDiff) > 0.01) {
          let arrow;
          if (scoreDiff >= 15) {
            arrow = '↑↑';
          } else if (scoreDiff > 0) {
            arrow = '↑';
          } else if (scoreDiff <= -15) {
            arrow = '↓↓';
          } else {
            arrow = '↓';
          }

          // Use the new arrow color logic
          const isUpArrow = arrow.includes('↑');
          const changeColor = getArrowColor(profileData.id, categoryName, isUpArrow);

          scoreChangeText = ` ${arrow} ${scoreDiff > 0 ? '+' : ''}${scoreDiff.toFixed(2)} from base (${baseScore.toFixed(2)})`;
        }
      }

      return (
        <div className="bg-white p-2 border border-gray-200 rounded text-xs">
          <div className="flex items-center">
            <div
              className="w-2 h-2 rounded-full mr-1.5"
              style={{ backgroundColor: color }}
            />
            <span className="font-medium">{categoryName}: {Math.round(entry.value)}</span>
            {scoreChangeText && (
              <span
                className="ml-1 font-bold"
                style={{ color: getArrowColor(profileData.id, categoryName, scoreChangeText.includes('↑')) }}
              >
                {scoreChangeText}
              </span>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Use fixed values for chart dimensions and styling
  const chartHeight = 800;
  const titleFontSize = "text-base";
  const subtitleFontSize = "text-sm";
  const tickFontSize = 15;
  const radiusTickFontSize = 11;

  // Get profile-specific title
  const getProfileTitle = (profileId: string) => {
    switch (profileId) {
      case 'profile1':
        return 'Under-supported Veteran';
      case 'profile2':
        return 'Uninformed Newcomer';
      case 'profile3':
        return 'Overloaded Advocate';
      default:
        return 'Patient Feasibility Plot';
    }
  };

  return (
    <Card className="bg-white mt-2 w-full">
      <CardContent className="p-3 h-full">
        <div className={`font-medium ${titleFontSize} mb-0.5`}>{getProfileTitle(profileData.id)}</div>
        <div className={`${subtitleFontSize} text-gray-500 mb-2`}>
          Visual representation of patient experience categories with dynamic scoring
        </div>

        <div className="w-full" style={{ height: chartHeight }}>
          {hasDataToDisplay ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                outerRadius="85%"
                data={radarData}
                margin={{ top: 40, right: 40, left: 40, bottom: 60 }}
              >
                <PolarGrid gridType="polygon" stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={(props) => {
                    const { x, y, textAnchor, payload } = props;
                    // Use gray color for all labels instead of category-specific colors
                    const color = '#6b7280'; // gray-500

                    // Get the current score for this category
                    const categoryData = categories.find(cat => cat.name === payload.value);
                    const currentScore = categoryData?.currentScore || 0;
                    const arrow = getScoreChangeIndicator(payload.value, currentScore);

                    // Determine arrow color using the new profile-specific logic
                    const isUpArrow = arrow.includes('↑');
                    const arrowColor = arrow ? getArrowColor(profileData.id, payload.value, isUpArrow) : color;

                    let horizontalOffset = 0;
                    let verticalOffset = 0;
                    switch (payload.value) {
                      case 'Logistics Challenge':
                        horizontalOffset = 0;
                        verticalOffset = -10;
                        break;
                      case 'Motivation':
                        horizontalOffset = 10;
                        verticalOffset = 0;
                        break;
                      case 'Healthcare Engagement':
                        horizontalOffset = 0;
                        verticalOffset = 20;
                        break;
                      case 'Quality of Life':
                        horizontalOffset = 0;
                        verticalOffset = 0;
                        break;
                      default:
                    }

                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={horizontalOffset}
                          y={verticalOffset}
                          textAnchor={textAnchor}
                          fill={color}
                          fontSize={tickFontSize}
                          fontWeight={500}
                        >
                          {payload.value}
                          {arrow && (
                            <tspan
                              fill={arrowColor}
                              fontSize={tickFontSize + 1}
                              fontWeight={700}
                              dx={5}
                            >
                              {arrow}
                            </tspan>
                          )}
                        </text>
                      </g>
                    );
                  }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  tick={{ fill: '#9ca3af', fontSize: radiusTickFontSize }}
                  tickCount={10}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip content={<CustomTooltip />} />

                <Radar
                  name="Category"
                  dataKey="score"
                  stroke={categoryColors[CATEGORIES.LOGISTICS]}
                  fill={categoryColors[CATEGORIES.LOGISTICS]}
                  fillOpacity={0.6}
                  dot={true}
                  activeDot={{ r: 5 }}
                  strokeWidth={1}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="text-gray-400 text-center px-2">
                <div className="text-base font-medium mb-1">No Data Available</div>
                <p className="text-sm">Drag questions into the Patient Insights Latent Traits to generate a visualization.</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
