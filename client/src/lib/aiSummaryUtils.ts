import { Profile, CategoryType, CATEGORIES } from "@/contexts/TrialDataContext";

// Types of summaries we can generate
export type SummaryType = 'demographic' | 'compliance' | 'risk' | 'recommendation';

// Track previous states for profile 1 categories
let previousProfile1State: { qualityOfLifeCount: number; healthcareEngagementCount: number } | null = null;
let profile1SummaryIndex: number = 0; // Tracks which summary to show (0-4)

// Generate a summary based on profile data
export function generateAiSummary(profile: Profile): string {
  if (!profile || !profile.categories) {
    return "Insufficient data to generate AI summary.";
  }

  // Special logic for profile 1
  if (profile.id === 'profile1') {
    return getProfile1AiSummary(profile);
  }

  // Check if we have a custom summary for this profile ID
  const customSummary = getCustomSummaryForProfile(profile.id);
  if (customSummary) {
    return customSummary;
  }

  // Calculate overall average score
  const totalScore = profile.categories.reduce((sum, cat) => sum + (cat.averageScore || 0), 0);
  const averageScore = totalScore / profile.categories.length;

  // Get the highest and lowest scoring categories
  const sortedCategories = [...profile.categories].sort((a, b) =>
    (b.averageScore || 0) - (a.averageScore || 0)
  );

  const highestCategory = sortedCategories[0];
  const lowestCategory = sortedCategories[sortedCategories.length - 1];

  // Get demographic data
  const { age, origin, role } = profile.patientDemographic;

  // Generate summary parts
  const parts: string[] = [];

  // Demographic summary
  const mainOrigin = origin && origin.length > 0
    ? origin.sort((a, b) => b.percentage - a.percentage)[0].country
    : "unknown origin";

  const mainRole = role && role.length > 0
    ? role.sort((a, b) => b.percentage - a.percentage)[0].role_name
    : "unknown role";

  parts.push(`Patient is in ${age} age range from ${mainOrigin} with ${mainRole} background.`);

  // Compliance prediction based on average score
  const complianceLevel = averageScore >= 7 ? "high" : averageScore >= 5 ? "moderate" : "low";
  const compliancePercentage = Math.round(((averageScore / 10) * 100) * 0.9); // Scale to realistic percentage

  parts.push(`Analysis indicates ${complianceLevel} compliance potential with ${compliancePercentage}% adherence probability.`);

  // Risk factors based on lowest category
  if (lowestCategory) {
    const riskFactor = getRiskFactorByCategory(lowestCategory.name as CategoryType);
    parts.push(`Key risk factor: ${riskFactor}.`);
  }

  // Recommendation based on highest and lowest categories
  if (highestCategory && lowestCategory) {
    const recommendation = getRecommendationByCategories(
      highestCategory.name as CategoryType,
      lowestCategory.name as CategoryType
    );
    parts.push(`Recommended approach: ${recommendation}.`);
  }

  return parts.join(' ');
}

// Special AI summary logic for profile 1
function getProfile1AiSummary(profile: Profile): string {
  const profileSummaries = getProfile1Summaries();
  
  // Get current counts for the relevant categories
  const qualityOfLifeCategory = profile.categories?.find(cat => cat.name === CATEGORIES.QUALITY);
  const healthcareEngagementCategory = profile.categories?.find(cat => cat.name === CATEGORIES.HEALTHCARE);
  
  const currentQualityOfLifeCount = qualityOfLifeCategory?.questions?.length || 0;
  const currentHealthcareEngagementCount = healthcareEngagementCategory?.questions?.length || 0;

  // Initialize previous state if it doesn't exist
  if (previousProfile1State === null) {
    previousProfile1State = {
      qualityOfLifeCount: currentQualityOfLifeCount,
      healthcareEngagementCount: currentHealthcareEngagementCount
    };
    profile1SummaryIndex = 0; // Default summary
    return profileSummaries[0];
  }

  // Check for changes in Quality of Life category
  if (currentQualityOfLifeCount > previousProfile1State.qualityOfLifeCount) {
    // Quality of Life items were added
    profile1SummaryIndex = 1;
  } else if (currentQualityOfLifeCount < previousProfile1State.qualityOfLifeCount) {
    // Quality of Life items were removed
    profile1SummaryIndex = 2;
  }

  // Check for changes in Healthcare Engagement category (takes precedence)
  if (currentHealthcareEngagementCount > previousProfile1State.healthcareEngagementCount) {
    // Healthcare Engagement items were added
    profile1SummaryIndex = 3;
  } else if (currentHealthcareEngagementCount < previousProfile1State.healthcareEngagementCount) {
    // Healthcare Engagement items were removed
    profile1SummaryIndex = 4;
  }

  // Update previous state
  previousProfile1State = {
    qualityOfLifeCount: currentQualityOfLifeCount,
    healthcareEngagementCount: currentHealthcareEngagementCount
  };

  // Return the appropriate summary
  return profileSummaries[profile1SummaryIndex] || profileSummaries[0];
}

// Get profile 1 summaries array
function getProfile1Summaries(): string[] {
  return [
    "This patient appears to be navigating care with a moderate level of engagement and logistical complexity, but with a hidden or underreported burden. Their treatment is ongoing or recently completed, but they may not fully express the impact it has had. Clinical trial awareness and proactive care involvement are low. Logistical and emotional barriers are present but not always visible.",
    "This patient appears to be navigating care with a moderate level of engagement and logistical complexity, but with a hidden or underreported burden. Their treatment is ongoing or recently completed, but they may not fully express the impact it has had. Clinical trial awareness and proactive care involvement are low. Logistical and emotional barriers are present but not always visible. Patient burden appears more severe than initially indicated, suggesting deeper impacts on daily life.",
    "This patient appears to be navigating care with a moderate level of engagement and logistical complexity, but with a hidden or underreported burden. Their treatment is ongoing or recently completed, but they may not fully express the impact it has had. Clinical trial awareness and proactive care involvement are low. Logistical and emotional barriers are present but not always visible. Reported burden has decreased, but may still bemasked by limited engagement.",
    "This patient appears to be navigating care with a moderate level of engagement and logistical complexity, but with a hidden or underreported burden. Their treatment is ongoing or recently completed, but they may not fully express the impact it has had. Clinical trial awareness and proactive care involvement are low. Logistical and emotional barriers are present but not always visible. Signs of patient involvement are increasing, possibly indicating missed opportunities for support.",
    "This patient appears to be navigating care with a moderate level of engagement and logistical complexity, but with a hidden or underreported burden. Their treatment is ongoing or recently completed, but they may not fully express the impact it has had. Clinical trial awareness and proactive care involvement are low. Logistical and emotional barriers are present but not always visible. The patient continues to report low interaction with care teams."
  ];
}

// Custom summaries for each profile
function getCustomSummaryForProfile(profileId: string): string | null {
  // Collection of possible summaries for each profile
  const profileSummaries: Record<string, string[]> = {
    'profile2': [
      "Analysis of 55-65 age demographic with German residence (84%) shows high caregiver involvement (70%) and established healthcare system engagement patterns. Compliance prediction: 81% with strong healthcare engagement metrics and history of medication adherence. Primary concern: quality of life impact during trial participation, particularly regarding treatment side effects and appointment frequency. Secondary challenge: maintaining work-life balance during participation period.",

      "Patient demonstrates strong healthcare system engagement with 8.4/10 score in relevant metrics and established relationship with specialist providers. Primary caregiver (70%) will be instrumental in maintaining adherence and managing treatment protocol. Detailed assessment indicates caregiver has healthcare background, suggesting enhanced capacity for managing complex treatment regimens. Cognitive assessment shows above-average health literacy and treatment comprehension.",

      "Clinical profile indicates above-average compliance potential (79-85%) with strong support network and previous positive healthcare experiences. Key strength: healthcare engagement metrics show consistent appointment adherence and medication compliance. Challenge area: maintaining quality of life during participation, particularly regarding potential treatment side effects and appointment frequency. Psychological assessment indicates moderate anxiety about treatment outcomes requiring enhanced communication protocols."
    ],
    'profile3': [
      "Elderly patient (60-65) with primary caregiver support (82%) shows mixed compliance indicators and complex healthcare needs. Motivation metrics indicate potential challenges (5.4/10) with particular concerns regarding treatment benefit understanding. Cognitive assessment suggests information processing limitations requiring simplified communication strategies. Geographical analysis indicates rural residence with limited transportation options and significant travel time to trial facilities.",

      "Analysis of patient profile reveals strong caregiver presence but moderate risk of non-adherence (65%) based on historical participation patterns. Primary concern: motivation metrics below threshold for optimal participation with specific challenges in understanding trial benefits relative to current treatment. Secondary concern: cognitive assessment indicates mild memory challenges that may impact complex protocol adherence. Detailed evaluation of support network shows highly engaged primary caregiver with healthcare background but limited secondary support.",

      "Patient demographic (60-65, German residence 56%, US residence 44%) with strong caregiver support presents moderate compliance risk requiring enhanced engagement strategy. Key challenge areas: motivation and logistics coordination with specific barriers including limited understanding of treatment benefits and transportation constraints. Cognitive assessment indicates preserved executive function but slowed information processing speed requiring adjusted communication approach."
    ]
  };

  // If we have summaries for this profile, randomly select one
  if (profileSummaries[profileId] && profileSummaries[profileId].length > 0) {
    const summaries = profileSummaries[profileId];
    const randomIndex = Math.floor(Math.random() * summaries.length);
    return summaries[randomIndex];
  }

  // No custom summary found
  return null;
}

// Helper function to get risk factor description by category
function getRiskFactorByCategory(category: CategoryType): string {
  switch (category) {
    case CATEGORIES.LOGISTICS:
      return "logistical challenges including transportation and scheduling conflicts";
    case CATEGORIES.MOTIVATION:
      return "motivational barriers and engagement with trial objectives";
    case CATEGORIES.HEALTHCARE:
      return "limited healthcare access and support network";
    case CATEGORIES.QUALITY:
      return "quality of life concerns impacting trial participation";
    default:
      return "multiple factors affecting participation";
  }
}

// Helper function to get recommendation based on strongest and weakest categories
function getRecommendationByCategories(strongest: CategoryType, weakest: CategoryType): string {
  // Logistics recommendations
  if (weakest === CATEGORIES.LOGISTICS) {
    if (strongest === CATEGORIES.MOTIVATION) {
      return "leverage patient motivation with flexible scheduling options";
    } else if (strongest === CATEGORIES.HEALTHCARE) {
      return "coordinate with existing healthcare providers for integrated appointments";
    } else {
      return "implement transportation assistance and simplified visit schedule";
    }
  }

  // Motivation recommendations
  if (weakest === CATEGORIES.MOTIVATION) {
    if (strongest === CATEGORIES.LOGISTICS) {
      return "emphasize convenience of participation while building engagement through education";
    } else if (strongest === CATEGORIES.HEALTHCARE) {
      return "engage primary care providers to reinforce trial benefits";
    } else {
      return "focus on quality of life improvements and personalized benefit communication";
    }
  }

  // Healthcare recommendations
  if (weakest === CATEGORIES.HEALTHCARE) {
    if (strongest === CATEGORIES.LOGISTICS) {
      return "provide telehealth options and minimize healthcare system navigation challenges";
    } else if (strongest === CATEGORIES.MOTIVATION) {
      return "leverage patient motivation to overcome healthcare system barriers";
    } else {
      return "implement patient navigator support and simplified healthcare interactions";
    }
  }

  // Quality of life recommendations
  if (weakest === CATEGORIES.QUALITY) {
    if (strongest === CATEGORIES.LOGISTICS) {
      return "minimize burden of participation through streamlined processes";
    } else if (strongest === CATEGORIES.MOTIVATION) {
      return "emphasize long-term quality of life benefits of trial participation";
    } else {
      return "integrate trial participation with existing healthcare routines to minimize disruption";
    }
  }

  return "personalized support approach based on patient profile";
} 