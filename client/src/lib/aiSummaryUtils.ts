import { Profile, CategoryType, CATEGORIES } from "@/contexts/TrialDataContext";

// Types of summaries we can generate
export type SummaryType = 'demographic' | 'compliance' | 'risk' | 'recommendation';

// Generate a summary based on profile data
export function generateAiSummary(profile: Profile): string {
  if (!profile || !profile.categories) {
    return "Insufficient data to generate AI summary.";
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

// Custom summaries for each profile
function getCustomSummaryForProfile(profileId: string): string | null {
  // Collection of possible summaries for each profile
  const profileSummaries: Record<string, string[]> = {
    'profile1': [
      "Patient in 45-55 age range demonstrates moderate compliance potential. Analysis indicates 72% adherence probability with primary concerns around transportation logistics. Recommended approach: implement simplified visit schedule with digital reminders and coordinate with existing healthcare providers.",
      "Clinical analysis of 45-55 age demographic shows balanced caregiver-patient relationship dynamic. Adherence metrics predict 68-75% compliance rate. Primary challenge identified in logistics category. Recommend telehealth options where possible and transportation assistance for in-person visits.",
      "Patient profile indicates moderate engagement potential with healthcare system. Key strength: motivation metrics above average (7.2/10). Key challenge: logistical barriers to consistent participation. Suggested intervention: flexible scheduling options with digital support tools."
    ],
    'profile2': [
      "Analysis of 55-65 age demographic with German residence shows high caregiver involvement (70%). Compliance prediction: 81% with strong healthcare engagement metrics. Primary concern: quality of life impact during trial participation. Recommended approach: emphasize long-term benefits while minimizing disruption to daily routines.",
      "Patient demonstrates strong healthcare system engagement with 8.4/10 score in relevant metrics. Primary caregiver (70%) will be instrumental in maintaining adherence. Recommend leveraging existing healthcare relationships while addressing moderate concerns about quality of life impact during trial.",
      "Clinical profile indicates above-average compliance potential (79-85%) with strong support network. Key strength: healthcare engagement. Challenge area: maintaining quality of life during participation. Suggested approach: integrated care coordination with emphasis on minimizing burden of participation."
    ],
    'profile3': [
      "Elderly patient (60-65) with primary caregiver support (82%) shows mixed compliance indicators. Motivation metrics indicate potential challenges (5.4/10). Recommend engagement strategy focused on caregiver education and simplified participation requirements to address logistical concerns.",
      "Analysis of patient profile reveals strong caregiver presence but moderate risk of non-adherence (65%). Primary concern: motivation metrics below threshold for optimal participation. Suggested approach: enhanced communication protocol with regular check-ins and simplified participation structure.",
      "Patient demographic (60-65, German residence) with strong caregiver support presents moderate compliance risk. Key challenge areas: motivation and logistics coordination. Recommended intervention: personalized engagement strategy with digital reminders and transportation assistance when required."
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
  switch(category) {
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