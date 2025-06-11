import { createContext, useState, useEffect, ReactNode } from 'react';

// Import questions data from JSON file
import questionsData from '@/data/questions.json';
import { getQuestionById, getQuestionName, getQuestionScore, calculateAverageScore, canQuestionBeInCategory } from '@/lib/questionUtils';

// Define types for JSON structure
interface QuestionItem {
  id: string;
  name: string;
  score: number;
}

interface CategoryItem {
  name: string;
  questions: string[];
}

interface ProfileData {
  profile_details: {
    origin: Array<{ country: string; percentage: number }>;
    age: string;
    role: Array<{ role_name: string; percentage: number }>;
  };
  categories: CategoryItem[];
}

interface QuestionsData {
  allQuestions: QuestionItem[];
  profile0: ProfileData;
  profile1: ProfileData;
  profile2: ProfileData;
  profile3: ProfileData;
  loadingTime: number;
}

// Type assertion for our JSON data
const typedQuestionsData = questionsData as unknown as QuestionsData;

// Define the categories for complexity items
export const CATEGORIES = {
  LOGISTICS: 'Logistics Challenge',
  MOTIVATION: 'Motivation',
  HEALTHCARE: 'Healthcare Engagement',
  QUALITY: 'Quality of Life',
  UNCATEGORIZED: 'Uncategorized'
} as const;

// Define category type
export type CategoryType = typeof CATEGORIES[keyof typeof CATEGORIES];

// Define profile-specific category multipliers
const PROFILE_MULTIPLIERS = {
  profile0: {
    [CATEGORIES.HEALTHCARE]: 'High',    // Highest -> High
    [CATEGORIES.LOGISTICS]: 'Low',      // Low
    [CATEGORIES.QUALITY]: 'Low',        // Low
    [CATEGORIES.MOTIVATION]: 'Medium'   // Medium
  },
  profile1: {
    [CATEGORIES.HEALTHCARE]: 'Medium',  // Medium
    [CATEGORIES.LOGISTICS]: 'Medium',   // Medium
    [CATEGORIES.QUALITY]: 'High',       // High
    [CATEGORIES.MOTIVATION]: 'Low'      // Low
  },
  profile2: {
    [CATEGORIES.HEALTHCARE]: 'Low',     // Low
    [CATEGORIES.LOGISTICS]: 'Low',      // Low
    [CATEGORIES.QUALITY]: 'Medium',     // Medium
    [CATEGORIES.MOTIVATION]: 'Low'      // Low
  },
  profile3: {
    [CATEGORIES.HEALTHCARE]: 'High',    // High
    [CATEGORIES.LOGISTICS]: 'High',     // High
    [CATEGORIES.QUALITY]: 'High',       // High
    [CATEGORIES.MOTIVATION]: 'High'     // High
  }
} as const;

// Define profile-specific scoring rules with base scores and fixed add/remove amounts
const PROFILE_SCORING_RULES = {
  profile0: {
    [CATEGORIES.HEALTHCARE]: { base: 0, add: 1, remove: 1 },       // Will use base score instead
    [CATEGORIES.MOTIVATION]: { base: 0, add: 1, remove: 1 },       // Will use base score instead
    [CATEGORIES.QUALITY]: { base: 0, add: 1, remove: 1 },          // Will use base score instead
    [CATEGORIES.LOGISTICS]: { base: 0, add: 1, remove: 1 }         // Will use base score instead
  },
  profile1: {
    [CATEGORIES.HEALTHCARE]: { base: 40, add: 15, remove: 15 },    // Healthcare Engagement: base 25, ±15
    [CATEGORIES.LOGISTICS]: { base: 50, add: 10, remove: 10 },   // Logistics Challenge: base 45, ±10
    [CATEGORIES.QUALITY]: { base: 95, add: 15, remove: 15 },       // Quality of Life: base 55, ±15
    [CATEGORIES.MOTIVATION]: { base: 15, add: 10, remove: 10 },    // Motivation: base 30, ±10
  },
  profile2: {
    [CATEGORIES.HEALTHCARE]: { base: 30, add: 20, remove: 20 },    // Healthcare Engagement: base 20, ±20
    [CATEGORIES.MOTIVATION]: { base: 35, add: 25, remove: 25 },    // Motivation: base 35, ±25
    [CATEGORIES.QUALITY]: { base: 65, add: 30, remove: 30 },       // Quality of Life: base 60, ±30
    [CATEGORIES.LOGISTICS]: { base: 35, add: 25, remove: 25 }      // Logistics Challenge: base 40, ±25
  },
  profile3: {
    [CATEGORIES.HEALTHCARE]: { base: 90, add: 5, remove: 5 },      // Healthcare Engagement: base 90, ±5
    [CATEGORIES.MOTIVATION]: { base: 90, add: 10, remove: 10 },    // Motivation: base 90, ±10
    [CATEGORIES.QUALITY]: { base: 95, add: 0, remove: 0 },         // Quality of Life: base 95, ±0
    [CATEGORIES.LOGISTICS]: { base: 85, add: 15, remove: 15 }      // Logistics Challenge: base 85, ±15
  }
} as const;

// Keep the old SCORING_RULES for backward compatibility (fallback)
const SCORING_RULES = {
  Low: {
    add: 0.5,
    remove: 0.5
  },
  Medium: {
    add: 1.25,
    remove: 0.5
  },
  High: {
    add: 1.75,
    remove: 1.75
  }
} as const;

// Define the type for a complexity element item
export interface ComplexityItem {
  id: string;
  name: string;
  category: string;
  complexity?: number;
  score?: number;
}

// Define the type for trial data
export interface TrialData {
  // Map of complexity items by their category
  complexityItems: Record<CategoryType, ComplexityItem[]>;
  // List of all items that can be dragged
  availableItems: ComplexityItem[];
}

// Define profile details data
export interface ProfileDetails {
  origin: Array<{ country: string; percentage: number }>;
  age: string;
  role: Array<{ role_name: string; percentage: number }>;
}

// Define patient demographic data
export interface PatientDemographic {
  age: string;
  gender?: string;
  ethnicity?: string;
  location?: string;
  medicalHistory?: string[];
  weight?: number;
  height?: number;
  compliance?: number;
  origin: Array<{ country: string; percentage: number }>;
  role: Array<{ role_name: string; percentage: number }>;
}

// Define category data structure
export interface CategoryData {
  name: string;
  questions: string[];
  averageScore?: number;
  sensitivity?: number; // Add sensitivity field for debugging
  multiplierLevel?: 'Low' | 'Medium' | 'High'; // Add multiplier level
  currentScore?: number; // Track current accumulated score
}

// Define type for profile containing trial data
export interface Profile {
  id: string;
  name: string;
  trialData: TrialData;
  diseaseBurdenScore?: number;
  patientDemographic: PatientDemographic;
  categories?: CategoryData[];
}

// Define the context interface
interface TrialDataContextType {
  profiles: Profile[];
  currentProfileId: string;
  setCurrentProfileId: (id: string) => void;
  getCurrentProfile: () => Profile;
  getQuestionsForProfile: (profileId: string) => ComplexityItem[];
  moveItem: (item: ComplexityItem, targetCategory: string, profileId?: string) => void;
  resetProfile: (profileId?: string) => void;
  updatePatientDemographic: (demographicData: Partial<PatientDemographic>, profileId?: string) => void;
  isLoading: boolean;
  lastDataChangeTimestamp: number; // Add timestamp for tracking changes
}

// Get all 24 questions from the JSON data
const getAllItems = (): ComplexityItem[] => {
  // Use the allQuestions array from our JSON data
  const allQuestions = typedQuestionsData.allQuestions || [];

  console.log("Loading all questions:", allQuestions.length);

  // Map the questions to ComplexityItems
  return allQuestions.map(question => ({
    id: question.id,
    name: question.name,
    category: '', // Initially no category assigned
    complexity: 60, // Default complexity value
    score: question.score // Add the score from the JSON
  }));
};

const allItems = getAllItems();

// Helper function to create trial data for a specific profile
const createProfileData = (profileId: string): TrialData => {
  // Initialize categories with empty arrays
  const categorizedItems: Record<CategoryType, ComplexityItem[]> = {
    [CATEGORIES.LOGISTICS]: [],
    [CATEGORIES.MOTIVATION]: [],
    [CATEGORIES.HEALTHCARE]: [],
    [CATEGORIES.QUALITY]: [],
    [CATEGORIES.UNCATEGORIZED]: [],
  };

  // Filter questions that belong to this specific profile
  const profileQuestions = allItems.filter(item => {
    const question = getQuestionById(item.id);
    return question?.initialProfile && question.initialProfile.includes(profileId);
  });

  // Get the category names as an array (excluding Uncategorized for initial distribution)
  const categoryNames = [CATEGORIES.LOGISTICS, CATEGORIES.MOTIVATION, CATEGORIES.HEALTHCARE, CATEGORIES.QUALITY];

  // First, ensure every category gets at least one item by using a round-robin approach
  const availableItems = [...profileQuestions];
  let categoryIndex = 0;

  // Distribute items ensuring each category gets at least one item
  while (availableItems.length > 0 && categoryIndex < categoryNames.length) {
    const currentCategory = categoryNames[categoryIndex];

    // Find an item that can be placed in this category
    const itemIndex = availableItems.findIndex(item =>
      canQuestionBeInCategory(item.id, currentCategory)
    );

    if (itemIndex !== -1) {
      // Remove the item from available items and add to current category
      const item = availableItems.splice(itemIndex, 1)[0];
      const updatedItem = { ...item, category: currentCategory };
      categorizedItems[currentCategory as CategoryType].push(updatedItem);
    }

    categoryIndex++;
  }

  // Continue distributing remaining items using round-robin to maintain balance
  categoryIndex = 0;
  while (availableItems.length > 0) {
    const currentCategory = categoryNames[categoryIndex % categoryNames.length];

    // Find an item that can be placed in this category
    const itemIndex = availableItems.findIndex(item =>
      canQuestionBeInCategory(item.id, currentCategory)
    );

    if (itemIndex !== -1) {
      // Remove the item from available items and add to current category
      const item = availableItems.splice(itemIndex, 1)[0];
      const updatedItem = { ...item, category: currentCategory };
      categorizedItems[currentCategory as CategoryType].push(updatedItem);
    }

    categoryIndex++;

    // Safety check to prevent infinite loop if no items can be placed in any category
    if (categoryIndex > categoryNames.length * availableItems.length) {
      // Place remaining items in uncategorized
      availableItems.forEach(item => {
        const updatedItem = { ...item, category: CATEGORIES.UNCATEGORIZED };
        categorizedItems[CATEGORIES.UNCATEGORIZED].push(updatedItem);
      });
      break;
    }
  }

  // If we still have empty categories, fill them with any available questions from allItems
  // that haven't been assigned to this profile yet
  const usedQuestionIds = new Set(profileQuestions.map(q => q.id));
  const remainingQuestions = allItems.filter(item => !usedQuestionIds.has(item.id));

  categoryNames.forEach(categoryName => {
    if (categorizedItems[categoryName as CategoryType].length === 0 && remainingQuestions.length > 0) {
      // Find a question that can be placed in this category
      const itemIndex = remainingQuestions.findIndex(item =>
        canQuestionBeInCategory(item.id, categoryName)
      );

      if (itemIndex !== -1) {
        const item = remainingQuestions.splice(itemIndex, 1)[0];
        const updatedItem = { ...item, category: categoryName };
        categorizedItems[categoryName as CategoryType].push(updatedItem);
        usedQuestionIds.add(item.id);
      }
    }
  });

  // No items should remain in availableItems initially
  const availableItemsArray: ComplexityItem[] = [];

  // Log the distribution
  console.log(`Profile ${profileId} distribution (balanced approach ensuring all categories have items):`, {
    profileSpecificQuestions: profileQuestions.length,
    logistics: categorizedItems[CATEGORIES.LOGISTICS].length,
    motivation: categorizedItems[CATEGORIES.MOTIVATION].length,
    healthcare: categorizedItems[CATEGORIES.HEALTHCARE].length,
    quality: categorizedItems[CATEGORIES.QUALITY].length,
    uncategorized: categorizedItems[CATEGORIES.UNCATEGORIZED].length,
    total: Object.values(categorizedItems).reduce((sum, items) => sum + items.length, 0)
  });

  return {
    availableItems: availableItemsArray,
    complexityItems: categorizedItems
  };
};

// Helper function to create predefined trial data for specific profiles
const createPredefinedProfileData = (profileId: string): TrialData => {
  // Initialize categories with empty arrays
  const categorizedItems: Record<CategoryType, ComplexityItem[]> = {
    [CATEGORIES.LOGISTICS]: [],
    [CATEGORIES.MOTIVATION]: [],
    [CATEGORIES.HEALTHCARE]: [],
    [CATEGORIES.QUALITY]: [],
    [CATEGORIES.UNCATEGORIZED]: [],
  };

  // Define predefined insights for each profile based on user requirements
  const predefinedInsights = {
    profile0: {
      "Quality of Life": [
        "demo18", // Demo: Minimal impact on daily functioning (0.75)
        "demo19"  // Demo: Maintained social connections (0.75)
        // Total: 1.5 points = 15 on radar chart
      ],
      "Logistics Challenge": [
        "demo16", // Demo: Manageable travel distance to clinic (1.0)
        "demo17"  // Demo: Flexible appointment scheduling (1.0)
        // Total: 2.0 points = 20 on radar chart
      ],
      "Healthcare Engagement": [
        "demo1",  // Demo: High engagement with healthcare team (1.0)
        "demo2",  // Demo: Excellent communication with doctors (1.0)
        "demo3",  // Demo: Active participation in treatment decisions (1.0)
        "demo4",  // Demo: Regular follow-up appointments (1.0)
        "demo5",  // Demo: Strong patient-provider relationship (1.0)
        "demo6",  // Demo: Proactive health monitoring (1.0)
        "demo7",  // Demo: Access to specialized care (1.0)
        "demo8",  // Demo: Comprehensive care coordination (1.0)
        "demo9",  // Demo: Timely medical responses (1.0)
        "demo20"  // Demo: Excellent clinical trial coordination (1.0)
        // Total: 10.0 points = 100 on radar chart (close to target of 95)
      ],
      "Motivation": [
        "demo10", // Demo: Strong motivation for treatment adherence (1.0)
        "demo11", // Demo: Positive outlook on recovery (1.0)
        "demo12", // Demo: Family support system (1.0)
        "demo13", // Demo: Goal-oriented mindset (1.0)
        "demo14", // Demo: Commitment to lifestyle changes (1.0)
        "demo15", // Demo: Active participation in support groups (1.0)
        "demo21"  // Demo: Empowered patient advocacy (1.0)
        // Total: 7.0 points = 70 on radar chart (close to target of 65)
      ],
      "Uncategorized": [
        "q101", "q102", "q103", "q104", "q105", "q106", "q107", "q108", "q109", "q110",
        "q111", "q112", "q113", "q114", "q115", "q116", "q117", "q118", "q119", "q120",
        "q121", "q122", "q123", "q124", "q125", "q126", "q127", "q128", "q129", "q130",
        "q131", "q132", "q133", "q134", "q135", "q136", "q137", "q138", "q139"
      ]
    },
    profile1: {
      "Quality of Life": [
        "q12", // I was on radiation for a few weeks.
        "q13", // I've done surgery and chemotherapy for a few months.
        "q14", // I was treated with temozolomide over several months.
        "q74", // It was hard, but we got through it.
        "q73", // Moderate impact—we adjusted our budget.
        "q82", // Mild side effects—manageable.
        "q86", // My appetite or sleep was disrupted.
      ],
      "Logistics Challenge": [
        "q32", // Around 3 per month, fairly manageable.
        "q33", // 4 appointments a month, consistently.
        "q42", // About an hour each way.
        "q48", // It depended on the appointment and location.
        "q54", // Too many forms and check-ins.
      ],
      "Healthcare Engagement": [
        "q24", // I had one full appointment to go through the options.
        "q65", // It came up once but wasn't revisited.
        "q26", // I was given time to ask questions after the plan was proposed.
        "custom2", // I'm not sure if I could ask about other options.
      ],
      "Motivation": [
        "q96", // I'd feel more open to it if my medical team supported the idea.
        "q94", // I'd be interested if it offered better care than I'm getting now.
        "custom1", // I usually just go to appointments and follow what they say.
      ],
      "Uncategorized": [
        "q101", "q102", "q103", "q104", "q105", "q106", "q107", "q108", "q109", "q110",
        "q111", "q112", "q113", "q114", "q115", "q116", "q117", "q118", "q119", "q120",
        "q121", "q122", "q123", "q124", "q125", "q126", "q127", "q128", "q129", "q130",
        "q131", "q132", "q133", "q134", "q135", "q136", "q137", "q138", "q139"
      ]
    },
    profile2: {
      "Quality of Life": [
        "q90", // I didn't notice or can't recall any.
        "q71", // No impact at all.
        "q1", // I haven't started any therapy yet.
        "q11", // I've just started, so no therapy yet.
        "q37", // I had very few appointments overall.
        "q40", // I don't remember or never tracked it closely.
        "custom3", // I don't really understand what's going on with my treatment.
      ],
      "Logistics Challenge": [
        "q41", // Less than 30 minutes.
        "q50", // I haven't had to travel for treatment yet.
        "q47", // I live nearby, so travel wasn't a problem.
        "q31", // Just 1 or 2 appointments per month.
        "custom4", // I'm starting to worry about how I'll manage work.
      ],
      "Healthcare Engagement": [
        "q21", // I didn't really have time to discuss anything.
        "q27", // I got some basic information, but no discussion.
        "q29", // I relied on my family or caregiver to understand the options.
        "q61", // No, it was never mentioned.
        "q62", // I heard about trials from someone else, not my doctor.
        "q70", // I can't recall if it was discussed.
      ],
      "Motivation": [
        "q97", // I wouldn't consider anything beyond my current treatment.
      ],
      "Uncategorized": [
        "q101", "q102", "q103", "q104", "q105", "q106", "q107", "q108", "q109", "q110",
        "q111", "q112", "q113", "q114", "q115", "q116", "q117", "q118", "q119", "q120",
        "q121", "q122", "q123", "q124", "q125", "q126", "q127", "q128", "q129", "q130",
        "q131", "q132", "q133", "q134", "q135", "q136", "q137", "q138", "q139"
      ]
    },
    profile3: {
      "Quality of Life": [
        "q83", // Fatigue was a major issue.
        "q84", // Nausea or vomiting affected me.
        "q87", // I experienced long-term effects.
        "q89", // The side effects were worse than the disease.
      ],
      "Logistics Challenge": [
        "q34", // More than 4 appointments a month.
        "q35", // Weekly appointments, sometimes more.
        "q44", // More than two hours door to door.
        "q45", // I had to stay overnight near the facility.
        "q46", // Travel was exhausting and hard to organize.
        "custom5", // I have to schedule everything myself and it's exhausting.
      ],
      "Healthcare Engagement": [
        "q64", // Yes, they explained the options clearly.
        "q69", // I looked into trials myself.
        "q66", // I asked about trials, but didn't get much information.
        "custom6", // I'm constantly coordinating between doctors and pharmacies.
      ],
      "Motivation": [
        "q95", // I'd want to help others in the future by contributing to progress.
        "q91", // I'd want a chance at a cure.
        "custom7", // I'm trying to stay positive but it's becoming too much.
      ],
      "Uncategorized": [
        "q101", "q102", "q103", "q104", "q105", "q106", "q107", "q108", "q109", "q110",
        "q111", "q112", "q113", "q114", "q115", "q116", "q117", "q118", "q119", "q120",
        "q121", "q122", "q123", "q124", "q125", "q126", "q127", "q128", "q129", "q130",
        "q131", "q132", "q133", "q134", "q135", "q136", "q137", "q138", "q139"
      ]
    }
  };

  // Get predefined insights for this profile
  const profileInsights = predefinedInsights[profileId as keyof typeof predefinedInsights];

  if (!profileInsights) {
    // Fallback to original random distribution if profile not found
    return createProfileData(profileId);
  }

  // Place predefined insights in their designated categories
  Object.entries(profileInsights).forEach(([categoryName, questionIds]) => {
    const categoryType = categoryName as CategoryType;

    questionIds.forEach(questionId => {
      // Find the question in allItems
      const item = allItems.find(q => q.id === questionId);
      if (item) {
        const updatedItem = { ...item, category: categoryName };
        categorizedItems[categoryType].push(updatedItem);
      }
    });
  });

  // No items should remain in availableItems initially
  const availableItemsArray: ComplexityItem[] = [];

  // Log the predefined distribution
  console.log(`Profile ${profileId} predefined distribution:`, {
    logistics: categorizedItems[CATEGORIES.LOGISTICS].length,
    motivation: categorizedItems[CATEGORIES.MOTIVATION].length,
    healthcare: categorizedItems[CATEGORIES.HEALTHCARE].length,
    quality: categorizedItems[CATEGORIES.QUALITY].length,
    uncategorized: categorizedItems[CATEGORIES.UNCATEGORIZED].length,
    total: Object.values(categorizedItems).reduce((sum, items) => sum + items.length, 0)
  });

  return {
    availableItems: availableItemsArray,
    complexityItems: categorizedItems
  };
};

// Get demographic data from the JSON file
const getDemographicData = (profileId: string): PatientDemographic => {
  const profileData = typedQuestionsData[profileId as keyof typeof typedQuestionsData] as ProfileData | undefined;

  if (profileData && profileData.profile_details) {
    return {
      age: profileData.profile_details.age,
      origin: profileData.profile_details.origin,
      role: profileData.profile_details.role,
      // Optional fields with default values
      gender: '',
      ethnicity: '',
      location: '',
      medicalHistory: [],
      weight: 0,
      height: 0,
      compliance: 0
    };
  }

  // Fallback empty demographic data
  return {
    age: '',
    origin: [],
    role: [],
    gender: '',
    ethnicity: '',
    location: '',
    medicalHistory: [],
    weight: 0,
    height: 0,
    compliance: 0
  };
};

// Get categories with calculated average scores
const getCategoriesWithScores = (profileId: string, trialData: TrialData): CategoryData[] => {

  // Get profile-specific scoring rules
  const profileScoringRules = PROFILE_SCORING_RULES[profileId as keyof typeof PROFILE_SCORING_RULES] || PROFILE_SCORING_RULES.profile1;
  // Get multipliers for this profile (for display/backward compatibility)
  const profileMultipliers = PROFILE_MULTIPLIERS[profileId as keyof typeof PROFILE_MULTIPLIERS] || PROFILE_MULTIPLIERS.profile1;

  // Create category data from the provided trial data's complexityItems, excluding Uncategorized
  return Object.entries(CATEGORIES)
    .filter(([key, categoryName]) => categoryName !== CATEGORIES.UNCATEGORIZED)
    .map(([key, categoryName]) => {
      const categoryType = categoryName as CategoryType;
      const items = trialData.complexityItems[categoryType];

      // Extract question IDs
      const questionIds = items.map(item => item.id);

      // Get multiplier level for this category and profile (for display)
      const multiplierLevel = profileMultipliers[categoryType as keyof typeof profileMultipliers] || 'Medium';

      // Calculate initial score - for profile1, always use base score on initial load
      const profileRules = profileScoringRules[categoryType as keyof typeof profileScoringRules] || { add: 0.1, remove: 0.1 };
      let initialScore = 0;

      if ((profileId === 'profile1' || profileId === 'profile2' || profileId === 'profile3') && 'base' in profileRules) {
        // New scoring system: Always start with base score on initial load
        const baseScore = (profileRules as any).base || 0;
        initialScore = baseScore;
        console.log(`${categoryName} (Profile ${profileId}): Initial load with base score ${baseScore} (${items.length} insights present but not counted)`);
      } else {
        // Old scoring system: sum of (item score × multiplier)
        const addMultiplier = profileRules.add;
        items.forEach(item => {
          const itemScore = item.score || 0;
          initialScore += itemScore * addMultiplier;
        });
        console.log(`Initial score for ${categoryName} (Profile ${profileId}): ${initialScore.toFixed(2)} from ${items.length} items (x${addMultiplier})`);
      }

      // Cap the maximum score at 100 for profile1, profile2, and profile3 (since they use different scale), 10 for others
      const maxScore = (profileId === 'profile1' || profileId === 'profile2' || profileId === 'profile3') ? 100 : 10;
      initialScore = Math.min(initialScore, maxScore);

      return {
        name: categoryName,
        questions: questionIds,
        averageScore: initialScore, // Use calculated initial score for display
        multiplierLevel: multiplierLevel,
        currentScore: initialScore // Track current score for future calculations
      };
    });
};

// Initial profiles
const createInitialProfiles = (): Profile[] => {
  const profiles: Profile[] = [];

  ['profile0', 'profile1', 'profile2', 'profile3'].forEach(profileId => {
    const trialData = createPredefinedProfileData(profileId);
    const patientDemographic = getDemographicData(profileId);
    const categories = getCategoriesWithScores(profileId, trialData);

    const profileName = profileId === 'profile0' ? 'Profile 0' :
      profileId === 'profile1' ? 'Profile 1' :
        profileId === 'profile2' ? 'Profile 2' : 'Profile 3';

    profiles.push({
      id: profileId,
      name: profileName,
      trialData,
      patientDemographic,
      categories
    });
  });

  return profiles;
};

const initialProfiles = createInitialProfiles();

// Create context with default values
export const TrialDataContext = createContext<TrialDataContextType>({
  profiles: initialProfiles,
  currentProfileId: 'profile0',
  setCurrentProfileId: () => { },
  getCurrentProfile: () => initialProfiles[0],
  getQuestionsForProfile: () => [],
  moveItem: () => { },
  resetProfile: () => { },
  updatePatientDemographic: () => { },
  isLoading: true,
  lastDataChangeTimestamp: Date.now(), // Initialize with current timestamp
});

// Create the provider component
export const TrialDataProvider = ({ children }: { children: ReactNode }) => {
  // Initialize loading state
  const [isLoading, setIsLoading] = useState(true);
  // Initialize profiles state
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [currentProfileId, setCurrentProfileId] = useState<string>('profile0');
  // Add timestamp to track data changes
  const [lastDataChangeTimestamp, setLastDataChangeTimestamp] = useState<number>(Date.now());

  // Simulate loading data from an API with a "thinking" effect
  useEffect(() => {
    // First load the data structure (faster)
    const timer1 = setTimeout(() => {
      console.log("Phase 1: Loading data structure...");
      // Keep isLoading true, but we could update a more detailed loading state here
    }, 2000);

    // Then simulate processing the data
    const timer2 = setTimeout(() => {
      console.log("Phase 2: Processing patient data...");
      // Still loading
    }, 4000);

    // Then simulate analyzing the model values
    const timer3 = setTimeout(() => {
      console.log("Phase 3: Analyzing model values...");
      // Still loading
    }, 6000);

    // Finally, show the data
    const timer4 = setTimeout(() => {
      console.log("Data analysis complete");
      setIsLoading(false);
    }, 8000); // 8 seconds total loading time

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  // Get the current profile
  const getCurrentProfile = (): Profile => {
    const profile = profiles.find(p => p.id === currentProfileId);
    return profile || profiles[0];
  };

  // Get questions that belong to a specific profile
  const getQuestionsForProfile = (profileId: string): ComplexityItem[] => {
    return allItems.filter(item => {
      const question = getQuestionById(item.id);
      return question?.initialProfile && question.initialProfile.includes(profileId);
    });
  };

  // New Scoring System Business Logic
  const applyNewScoringLogic = (profile: Profile, item: ComplexityItem, targetCategory: string, fromCategory: string): Profile => {
    if (!profile.categories) return profile;

    // Get profile-specific scoring rules
    const profileScoringRules = PROFILE_SCORING_RULES[profile.id as keyof typeof PROFILE_SCORING_RULES] || PROFILE_SCORING_RULES.profile1;
    // Get multipliers for this profile (for display/backward compatibility)
    const profileMultipliers = PROFILE_MULTIPLIERS[profile.id as keyof typeof PROFILE_MULTIPLIERS] || PROFILE_MULTIPLIERS.profile1;

    const updatedCategories = profile.categories.map(category => {
      const categoryType = category.name as CategoryType;
      const multiplierLevel = profileMultipliers[categoryType as keyof typeof profileMultipliers] || 'Medium';
      const profileRules = profileScoringRules[categoryType as keyof typeof profileScoringRules] || { add: 1, remove: 1 };

      let newScore = category.currentScore || category.averageScore || 0;

      if ((profile.id === 'profile1' || profile.id === 'profile2' || profile.id === 'profile3') && 'base' in profileRules) {
        // New scoring system: Use add/subtract logic instead of recalculating from scratch
        const addAmount = (profileRules as any).add || 0;
        const removeAmount = (profileRules as any).remove || 0;

        // Apply custom logic for specific insights in profile1 only
        if (profile.id === 'profile1') {
          // Custom logic for "I usually just go to appointments and follow what they say" (custom1)
          if (item.id === 'custom1') {
            // When adding this insight to Healthcare Engagement or Motivation
            if (category.name === targetCategory && targetCategory !== '') {
              if (targetCategory === 'Healthcare Engagement') {
                // Apply both Healthcare Engagement AND Motivation bonuses when added to Healthcare Engagement
                if (category.name === 'Healthcare Engagement') {
                  newScore += 20; // +20 to Healthcare Engagement
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom1 added to Healthcare Engagement, +20 = ${newScore}`);
                }
              } else if (targetCategory === 'Motivation') {
                // Apply both Healthcare Engagement AND Motivation bonuses when added to Motivation
                if (category.name === 'Motivation') {
                  newScore += 10; // +10 to Motivation
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom1 added to Motivation, +10 = ${newScore}`);
                }
              } else {
                newScore += addAmount; // Default amount for other categories
                console.log(`${category.name} (Profile ${profile.id}): Custom insight custom1 added (default), +${addAmount} = ${newScore}`);
              }
            }
            // Handle the cross-category effects when adding custom1
            if (targetCategory === 'Healthcare Engagement' && category.name === 'Motivation') {
              newScore += 10; // +10 to Motivation when added to Healthcare Engagement
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom1 cross-effect (add to HC->Motivation), +10 = ${newScore}`);
            } else if (targetCategory === 'Motivation' && category.name === 'Healthcare Engagement') {
              newScore += 20; // +20 to Healthcare Engagement when added to Motivation
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom1 cross-effect (add to Motivation->HC), +20 = ${newScore}`);
            }

            // When removing this insight from Healthcare Engagement or Motivation
            if (category.name === fromCategory && fromCategory !== '') {
              if (fromCategory === 'Healthcare Engagement') {
                if (category.name === 'Healthcare Engagement') {
                  newScore -= 20; // -20 from Healthcare Engagement
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom1 removed from Healthcare Engagement, -20 = ${newScore}`);
                }
              } else if (fromCategory === 'Motivation') {
                if (category.name === 'Motivation') {
                  newScore -= 10; // -10 from Motivation
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom1 removed from Motivation, -10 = ${newScore}`);
                }
              } else {
                newScore -= removeAmount; // Default amount for other categories
                console.log(`${category.name} (Profile ${profile.id}): Custom insight custom1 removed (default), -${removeAmount} = ${newScore}`);
              }
            }
            // Handle the cross-category effects when removing custom1
            if (fromCategory === 'Healthcare Engagement' && category.name === 'Motivation') {
              newScore -= 10; // -10 from Motivation when removed from Healthcare Engagement
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom1 cross-effect (remove from HC->Motivation), -10 = ${newScore}`);
            } else if (fromCategory === 'Motivation' && category.name === 'Healthcare Engagement') {
              newScore -= 20; // -20 from Healthcare Engagement when removed from Motivation
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom1 cross-effect (remove from Motivation->HC), -20 = ${newScore}`);
            }
          }
          // Custom logic for "I'm not sure if I could ask about other options." (custom2)
          else if (item.id === 'custom2') {
            // When adding this insight to Healthcare Engagement or Quality of Life
            if (category.name === targetCategory && targetCategory !== '') {
              if (targetCategory === 'Healthcare Engagement') {
                if (category.name === 'Healthcare Engagement') {
                  newScore += 20; // +20 to Healthcare Engagement
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom2 added to Healthcare Engagement, +20 = ${newScore}`);
                }
              } else if (targetCategory === 'Quality of Life') {
                if (category.name === 'Quality of Life') {
                  newScore += 15; // +15 to Quality of Life
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom2 added to Quality of Life, +15 = ${newScore}`);
                }
              } else {
                newScore += addAmount; // Default amount for other categories
                console.log(`${category.name} (Profile ${profile.id}): Custom insight custom2 added (default), +${addAmount} = ${newScore}`);
              }
            }
            // Handle the cross-category effects when adding custom2
            if (targetCategory === 'Healthcare Engagement' && category.name === 'Quality of Life') {
              newScore += 15; // +15 to Quality of Life when added to Healthcare Engagement
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom2 cross-effect (add to HC->QoL), +15 = ${newScore}`);
            } else if (targetCategory === 'Quality of Life' && category.name === 'Healthcare Engagement') {
              newScore += 20; // +20 to Healthcare Engagement when added to Quality of Life
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom2 cross-effect (add to QoL->HC), +20 = ${newScore}`);
            }

            // When removing this insight from Healthcare Engagement or Quality of Life
            if (category.name === fromCategory && fromCategory !== '') {
              if (fromCategory === 'Healthcare Engagement') {
                if (category.name === 'Healthcare Engagement') {
                  newScore -= 20; // -20 from Healthcare Engagement
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom2 removed from Healthcare Engagement, -20 = ${newScore}`);
                }
              } else if (fromCategory === 'Quality of Life') {
                if (category.name === 'Quality of Life') {
                  newScore -= 15; // -15 from Quality of Life
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom2 removed from Quality of Life, -15 = ${newScore}`);
                }
              } else {
                newScore -= removeAmount; // Default amount for other categories
                console.log(`${category.name} (Profile ${profile.id}): Custom insight custom2 removed (default), -${removeAmount} = ${newScore}`);
              }
            }
            // Handle the cross-category effects when removing custom2
            if (fromCategory === 'Healthcare Engagement' && category.name === 'Quality of Life') {
              newScore -= 15; // -15 from Quality of Life when removed from Healthcare Engagement
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom2 cross-effect (remove from HC->QoL), -15 = ${newScore}`);
            } else if (fromCategory === 'Quality of Life' && category.name === 'Healthcare Engagement') {
              newScore -= 20; // -20 from Healthcare Engagement when removed from Quality of Life
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom2 cross-effect (remove from QoL->HC), -20 = ${newScore}`);
            }
          }
          // Default logic for other insights in profile1
          else {
            if (category.name === targetCategory && targetCategory !== '') {
              // Add to target category
              newScore += addAmount;
              console.log(`${category.name} (Profile ${profile.id}): Added insight, +${addAmount} = ${newScore}`);
            } else if (category.name === fromCategory && fromCategory !== '') {
              // Subtract from source category
              newScore -= removeAmount;
              console.log(`${category.name} (Profile ${profile.id}): Removed insight, -${removeAmount} = ${newScore}`);
            }
          }
        } else if (profile.id === 'profile2') {
          // Apply custom logic for specific insights in profile2
          // Custom logic for "I don't really understand what's going on with my treatment." (custom3)
          if (item.id === 'custom3') {
            // When adding this insight to Healthcare Engagement or Quality of Life Impact
            if (category.name === targetCategory && targetCategory !== '') {
              if (targetCategory === 'Healthcare Engagement') {
                if (category.name === 'Healthcare Engagement') {
                  newScore += 30; // +30 to Healthcare Engagement
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom3 added to Healthcare Engagement, +30 = ${newScore}`);
                }
              } else if (targetCategory === 'Quality of Life') {
                if (category.name === 'Quality of Life') {
                  newScore += 20; // +20 to Quality of Life Impact
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom3 added to Quality of Life, +20 = ${newScore}`);
                }
              } else {
                newScore += addAmount; // Default amount for other categories
                console.log(`${category.name} (Profile ${profile.id}): Custom insight custom3 added (default), +${addAmount} = ${newScore}`);
              }
            }
            // Handle the cross-category effects when adding custom3
            if (targetCategory === 'Healthcare Engagement' && category.name === 'Quality of Life') {
              newScore += 20; // +20 to Quality of Life when added to Healthcare Engagement
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom3 cross-effect (add to HC->QoL), +20 = ${newScore}`);
            } else if (targetCategory === 'Quality of Life' && category.name === 'Healthcare Engagement') {
              newScore += 30; // +30 to Healthcare Engagement when added to Quality of Life
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom3 cross-effect (add to QoL->HC), +30 = ${newScore}`);
            }

            // When removing this insight from Healthcare Engagement or Quality of Life Impact
            if (category.name === fromCategory && fromCategory !== '') {
              if (fromCategory === 'Healthcare Engagement') {
                if (category.name === 'Healthcare Engagement') {
                  newScore -= 30; // -30 from Healthcare Engagement
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom3 removed from Healthcare Engagement, -30 = ${newScore}`);
                }
              } else if (fromCategory === 'Quality of Life') {
                if (category.name === 'Quality of Life') {
                  newScore -= 20; // -20 from Quality of Life Impact
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom3 removed from Quality of Life, -20 = ${newScore}`);
                }
              } else {
                newScore -= removeAmount; // Default amount for other categories
                console.log(`${category.name} (Profile ${profile.id}): Custom insight custom3 removed (default), -${removeAmount} = ${newScore}`);
              }
            }
            // Handle the cross-category effects when removing custom3
            if (fromCategory === 'Healthcare Engagement' && category.name === 'Quality of Life') {
              newScore -= 20; // -20 from Quality of Life when removed from Healthcare Engagement
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom3 cross-effect (remove from HC->QoL), -20 = ${newScore}`);
            } else if (fromCategory === 'Quality of Life' && category.name === 'Healthcare Engagement') {
              newScore -= 30; // -30 from Healthcare Engagement when removed from Quality of Life
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom3 cross-effect (remove from QoL->HC), -30 = ${newScore}`);
            }
          }
          // Custom logic for "I'm starting to worry about how I'll manage work." (custom4)
          else if (item.id === 'custom4') {
            // When adding this insight to Quality of Life Impact or Logistical Challenge
            if (category.name === targetCategory && targetCategory !== '') {
              if (targetCategory === 'Quality of Life') {
                if (category.name === 'Quality of Life') {
                  newScore += 20; // +20 to Quality of Life Impact
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom4 added to Quality of Life, +20 = ${newScore}`);
                }
              } else if (targetCategory === 'Logistics Challenge') {
                if (category.name === 'Logistics Challenge') {
                  newScore += 25; // +25 to Logistical Challenge
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom4 added to Logistics Challenge, +25 = ${newScore}`);
                }
              } else {
                newScore += addAmount; // Default amount for other categories
                console.log(`${category.name} (Profile ${profile.id}): Custom insight custom4 added (default), +${addAmount} = ${newScore}`);
              }
            }
            // Handle the cross-category effects when adding custom4
            if (targetCategory === 'Quality of Life' && category.name === 'Logistics Challenge') {
              newScore += 25; // +25 to Logistics Challenge when added to Quality of Life
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom4 cross-effect (add to QoL->LC), +25 = ${newScore}`);
            } else if (targetCategory === 'Logistics Challenge' && category.name === 'Quality of Life') {
              newScore += 20; // +20 to Quality of Life when added to Logistics Challenge
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom4 cross-effect (add to LC->QoL), +20 = ${newScore}`);
            }

            // When removing this insight from Quality of Life Impact or Logistical Challenge
            if (category.name === fromCategory && fromCategory !== '') {
              if (fromCategory === 'Quality of Life') {
                if (category.name === 'Quality of Life') {
                  newScore -= 20; // -20 from Quality of Life Impact
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom4 removed from Quality of Life, -20 = ${newScore}`);
                }
              } else if (fromCategory === 'Logistics Challenge') {
                if (category.name === 'Logistics Challenge') {
                  newScore -= 25; // -25 from Logistical Challenge
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom4 removed from Logistics Challenge, -25 = ${newScore}`);
                }
              } else {
                newScore -= removeAmount; // Default amount for other categories
                console.log(`${category.name} (Profile ${profile.id}): Custom insight custom4 removed (default), -${removeAmount} = ${newScore}`);
              }
            }
            // Handle the cross-category effects when removing custom4
            if (fromCategory === 'Quality of Life' && category.name === 'Logistics Challenge') {
              newScore -= 25; // -25 from Logistics Challenge when removed from Quality of Life
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom4 cross-effect (remove from QoL->LC), -25 = ${newScore}`);
            } else if (fromCategory === 'Logistics Challenge' && category.name === 'Quality of Life') {
              newScore -= 20; // -20 from Quality of Life when removed from Logistics Challenge
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom4 cross-effect (remove from LC->QoL), -20 = ${newScore}`);
            }
          }
          // Default logic for other insights in profile2
          else {
            if (category.name === targetCategory && targetCategory !== '') {
              // Add to target category
              newScore += addAmount;
              console.log(`${category.name} (Profile ${profile.id}): Added insight, +${addAmount} = ${newScore}`);
            } else if (category.name === fromCategory && fromCategory !== '') {
              // Subtract from source category
              newScore -= removeAmount;
              console.log(`${category.name} (Profile ${profile.id}): Removed insight, -${removeAmount} = ${newScore}`);
            }
          }
        } else if (profile.id === 'profile3') {
          // Apply custom logic for specific insights in profile3
          // Custom logic for "I have to schedule everything myself and it's exhausting." (custom5)
          if (item.id === 'custom5') {
            // When adding this insight to Logistical Challenge or Quality of Life Impact
            if (category.name === targetCategory && targetCategory !== '') {
              if (targetCategory === 'Logistics Challenge') {
                if (category.name === 'Logistics Challenge') {
                  newScore += 15; // +15 to Logistical Challenge
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom5 added to Logistics Challenge, +15 = ${newScore}`);
                }
              } else if (targetCategory === 'Quality of Life') {
                if (category.name === 'Quality of Life') {
                  newScore += 5; // +5 to Quality of Life Impact
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom5 added to Quality of Life, +5 = ${newScore}`);
                }
              } else {
                newScore += addAmount; // Default amount for other categories
                console.log(`${category.name} (Profile ${profile.id}): Custom insight custom5 added (default), +${addAmount} = ${newScore}`);
              }
            }
            // Handle the cross-category effects when adding custom5
            if (targetCategory === 'Logistics Challenge' && category.name === 'Quality of Life') {
              newScore += 5; // +5 to Quality of Life when added to Logistics Challenge
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom5 cross-effect (add to LC->QoL), +5 = ${newScore}`);
            } else if (targetCategory === 'Quality of Life' && category.name === 'Logistics Challenge') {
              newScore += 15; // +15 to Logistics Challenge when added to Quality of Life
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom5 cross-effect (add to QoL->LC), +15 = ${newScore}`);
            }

            // When removing this insight from Logistical Challenge or Quality of Life Impact
            if (category.name === fromCategory && fromCategory !== '') {
              if (fromCategory === 'Logistics Challenge') {
                if (category.name === 'Logistics Challenge') {
                  newScore -= 15; // -15 from Logistical Challenge
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom5 removed from Logistics Challenge, -15 = ${newScore}`);
                }
              } else if (fromCategory === 'Quality of Life') {
                if (category.name === 'Quality of Life') {
                  newScore -= 5; // -5 from Quality of Life Impact
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom5 removed from Quality of Life, -5 = ${newScore}`);
                }
              } else {
                newScore -= removeAmount; // Default amount for other categories
                console.log(`${category.name} (Profile ${profile.id}): Custom insight custom5 removed (default), -${removeAmount} = ${newScore}`);
              }
            }
            // Handle the cross-category effects when removing custom5
            if (fromCategory === 'Logistics Challenge' && category.name === 'Quality of Life') {
              newScore -= 5; // -5 from Quality of Life when removed from Logistics Challenge
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom5 cross-effect (remove from LC->QoL), -5 = ${newScore}`);
            } else if (fromCategory === 'Quality of Life' && category.name === 'Logistics Challenge') {
              newScore -= 15; // -15 from Logistics Challenge when removed from Quality of Life
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom5 cross-effect (remove from QoL->LC), -15 = ${newScore}`);
            }
          }
          // Custom logic for "I'm constantly coordinating between doctors and pharmacies." (custom6)
          else if (item.id === 'custom6') {
            // When adding this insight to Logistical Challenge or Healthcare Engagement
            if (category.name === targetCategory && targetCategory !== '') {
              if (targetCategory === 'Logistics Challenge') {
                if (category.name === 'Logistics Challenge') {
                  newScore += 15; // +15 to Logistical Challenge
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom6 added to Logistics Challenge, +15 = ${newScore}`);
                }
              } else if (targetCategory === 'Healthcare Engagement') {
                if (category.name === 'Healthcare Engagement') {
                  newScore += 0; // +0 to Healthcare Engagement
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom6 added to Healthcare Engagement, +0 = ${newScore}`);
                }
              } else {
                newScore += addAmount; // Default amount for other categories
                console.log(`${category.name} (Profile ${profile.id}): Custom insight custom6 added (default), +${addAmount} = ${newScore}`);
              }
            }
            // Handle the cross-category effects when adding custom6
            if (targetCategory === 'Logistics Challenge' && category.name === 'Healthcare Engagement') {
              newScore += 0; // +0 to Healthcare Engagement when added to Logistics Challenge
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom6 cross-effect (add to LC->HC), +0 = ${newScore}`);
            } else if (targetCategory === 'Healthcare Engagement' && category.name === 'Logistics Challenge') {
              newScore += 15; // +15 to Logistics Challenge when added to Healthcare Engagement
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom6 cross-effect (add to HC->LC), +15 = ${newScore}`);
            }

            // When removing this insight from Logistical Challenge or Healthcare Engagement
            if (category.name === fromCategory && fromCategory !== '') {
              if (fromCategory === 'Logistics Challenge') {
                if (category.name === 'Logistics Challenge') {
                  newScore -= 15; // -15 from Logistical Challenge
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom6 removed from Logistics Challenge, -15 = ${newScore}`);
                }
              } else if (fromCategory === 'Healthcare Engagement') {
                if (category.name === 'Healthcare Engagement') {
                  newScore -= 0; // -0 from Healthcare Engagement
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom6 removed from Healthcare Engagement, -0 = ${newScore}`);
                }
              } else {
                newScore -= removeAmount; // Default amount for other categories
                console.log(`${category.name} (Profile ${profile.id}): Custom insight custom6 removed (default), -${removeAmount} = ${newScore}`);
              }
            }
            // Handle the cross-category effects when removing custom6
            if (fromCategory === 'Logistics Challenge' && category.name === 'Healthcare Engagement') {
              newScore -= 0; // -0 from Healthcare Engagement when removed from Logistics Challenge
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom6 cross-effect (remove from LC->HC), -0 = ${newScore}`);
            } else if (fromCategory === 'Healthcare Engagement' && category.name === 'Logistics Challenge') {
              newScore -= 15; // -15 from Logistics Challenge when removed from Healthcare Engagement
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom6 cross-effect (remove from HC->LC), -15 = ${newScore}`);
            }
          }
          // Custom logic for "I'm trying to stay positive but it's becoming too much." (custom7)
          else if (item.id === 'custom7') {
            // When adding this insight to Motivation or Quality of Life Impact
            if (category.name === targetCategory && targetCategory !== '') {
              if (targetCategory === 'Motivation') {
                if (category.name === 'Motivation') {
                  newScore += 10; // +10 to Motivation
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom7 added to Motivation, +10 = ${newScore}`);
                }
              } else if (targetCategory === 'Quality of Life') {
                if (category.name === 'Quality of Life') {
                  newScore += 5; // +5 to Quality of Life Impact
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom7 added to Quality of Life, +5 = ${newScore}`);
                }
              } else {
                newScore += addAmount; // Default amount for other categories
                console.log(`${category.name} (Profile ${profile.id}): Custom insight custom7 added (default), +${addAmount} = ${newScore}`);
              }
            }
            // Handle the cross-category effects when adding custom7
            if (targetCategory === 'Motivation' && category.name === 'Quality of Life') {
              newScore += 5; // +5 to Quality of Life when added to Motivation
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom7 cross-effect (add to Motivation->QoL), +5 = ${newScore}`);
            } else if (targetCategory === 'Quality of Life' && category.name === 'Motivation') {
              newScore += 10; // +10 to Motivation when added to Quality of Life
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom7 cross-effect (add to QoL->Motivation), +10 = ${newScore}`);
            }

            // When removing this insight from Motivation or Quality of Life Impact
            if (category.name === fromCategory && fromCategory !== '') {
              if (fromCategory === 'Motivation') {
                if (category.name === 'Motivation') {
                  newScore -= 10; // -10 from Motivation
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom7 removed from Motivation, -10 = ${newScore}`);
                }
              } else if (fromCategory === 'Quality of Life') {
                if (category.name === 'Quality of Life') {
                  newScore -= 5; // -5 from Quality of Life Impact
                  console.log(`${category.name} (Profile ${profile.id}): Custom insight custom7 removed from Quality of Life, -5 = ${newScore}`);
                }
              } else {
                newScore -= removeAmount; // Default amount for other categories
                console.log(`${category.name} (Profile ${profile.id}): Custom insight custom7 removed (default), -${removeAmount} = ${newScore}`);
              }
            }
            // Handle the cross-category effects when removing custom7
            if (fromCategory === 'Motivation' && category.name === 'Quality of Life') {
              newScore -= 5; // -5 from Quality of Life when removed from Motivation
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom7 cross-effect (remove from Motivation->QoL), -5 = ${newScore}`);
            } else if (fromCategory === 'Quality of Life' && category.name === 'Motivation') {
              newScore -= 10; // -10 from Motivation when removed from Quality of Life
              console.log(`${category.name} (Profile ${profile.id}): Custom insight custom7 cross-effect (remove from QoL->Motivation), -10 = ${newScore}`);
            }
          }
          // Default logic for other insights in profile3
          else {
            if (category.name === targetCategory && targetCategory !== '') {
              // Add to target category
              newScore += addAmount;
              console.log(`${category.name} (Profile ${profile.id}): Added insight, +${addAmount} = ${newScore}`);
            } else if (category.name === fromCategory && fromCategory !== '') {
              // Subtract from source category
              newScore -= removeAmount;
              console.log(`${category.name} (Profile ${profile.id}): Removed insight, -${removeAmount} = ${newScore}`);
            }
          }
        } else {
          // Default logic for other profiles
          if (category.name === targetCategory && targetCategory !== '') {
            // Add to target category
            newScore += addAmount;
            console.log(`${category.name} (Profile ${profile.id}): Added insight, +${addAmount} = ${newScore}`);
          } else if (category.name === fromCategory && fromCategory !== '') {
            // Subtract from source category
            newScore -= removeAmount;
            console.log(`${category.name} (Profile ${profile.id}): Removed insight, -${removeAmount} = ${newScore}`);
          }
        }
      } else {
        // Old scoring system: Check if this category was affected by the move
        if (category.name === fromCategory || category.name === targetCategory) {
          // Get current items in this category from the updated trialData
          const currentItems = profile.trialData.complexityItems[categoryType] || [];

          // Recalculate score based on all items currently in the category using profile-specific rules
          newScore = 0;
          currentItems.forEach(categoryItem => {
            const itemScore = categoryItem.score || 0;
            newScore += itemScore * profileRules.add;
          });
          console.log(`${category.name} (Profile ${profile.id}): Recalculated score = ${newScore.toFixed(2)} from ${currentItems.length} items (x${profileRules.add})`);
        }
      }

      // Ensure score doesn't go below 0 and cap appropriately
      const maxScore = (profile.id === 'profile1' || profile.id === 'profile2' || profile.id === 'profile3') ? 100 : 10;
      newScore = Math.max(0, Math.min(newScore, maxScore));

      return {
        ...category,
        currentScore: newScore,
        averageScore: newScore, // Update display score
        multiplierLevel: multiplierLevel
      };
    });

    return {
      ...profile,
      categories: updatedCategories
    };
  };

  // Move an item to a target category
  const moveItem = (item: ComplexityItem, targetCategory: string, profileId?: string) => {
    const targetProfileId = profileId || currentProfileId;

    // Log the movement for debugging
    console.log(`Moving from ${item.category} to ${targetCategory}`);

    setProfiles(prevProfiles => {
      const updatedProfiles = [...prevProfiles];
      const profileIndex = updatedProfiles.findIndex(p => p.id === targetProfileId);

      if (profileIndex === -1) return prevProfiles;

      const profile = { ...updatedProfiles[profileIndex] };
      const trialData = { ...profile.trialData };

      // If the item is in the available items list, remove it
      if (item.category === '') {
        trialData.availableItems = trialData.availableItems.filter(
          (i) => i.id !== item.id
        );
      } else {
        // Remove from previous category if it exists there
        const oldCategory = item.category as CategoryType;
        if (trialData.complexityItems[oldCategory]) {
          trialData.complexityItems[oldCategory] =
            trialData.complexityItems[oldCategory].filter(
              (i) => i.id !== item.id
            );
        }
      }

      // If the target is empty string, move to available items
      if (targetCategory === '') {
        trialData.availableItems.push({ ...item, category: '' });
      } else {
        // Add to the new category if it exists
        const category = targetCategory as CategoryType;
        if (trialData.complexityItems[category]) {
          trialData.complexityItems[category].push(
            { ...item, category }
          );
        }
      }

      // Also update the categories array for the radar chart
      if (profile.categories) {
        // First, remove the question from ALL categories and track which categories were modified
        const modifiedCategories = new Set<number>();

        profile.categories = profile.categories.map((cat, index) => {
          const previousLength = cat.questions.length;
          const newQuestions = cat.questions.filter(q => q !== item.id);

          // If questions were removed, track this category for score recalculation
          if (newQuestions.length !== previousLength) {
            modifiedCategories.add(index);
          }

          return {
            ...cat,
            questions: newQuestions
          };
        });

        // Now add the question to the target category if needed
        if (targetCategory !== '') {
          const categoryIndex = profile.categories.findIndex(cat => cat.name === targetCategory);

          if (categoryIndex !== -1) {
            // Create a new questions array for the category
            const questions = [...profile.categories[categoryIndex].questions];

            // Add the question ID to the category
            questions.push(item.id);

            // Update the category with the new questions array
            profile.categories[categoryIndex] = {
              ...profile.categories[categoryIndex],
              questions: questions
            };

            // Track this category for score recalculation
            modifiedCategories.add(categoryIndex);
          }
        }

        // Recalculate scores for all modified categories
        modifiedCategories.forEach(index => {
          const questions = profile.categories![index].questions;
          profile.categories![index] = {
            ...profile.categories![index],
            averageScore: calculateAverageScore(questions)
          };
        });
      }

      profile.trialData = trialData;
      updatedProfiles[profileIndex] = profile;

      // APPLY NEW SCORING SYSTEM - Apply to all profiles
      const fromCategory = item.category || '';
      const updatedProfile = applyNewScoringLogic(profile, item, targetCategory, fromCategory);
      updatedProfiles[profileIndex] = updatedProfile;

      return updatedProfiles;
    });

    // Update timestamp to indicate data has changed
    setLastDataChangeTimestamp(Date.now());
  };

  // Update patient demographic data
  const updatePatientDemographic = (demographicData: Partial<PatientDemographic>, profileId?: string) => {
    const targetProfileId = profileId || currentProfileId;

    setProfiles(prevProfiles => {
      const updatedProfiles = [...prevProfiles];
      const profileIndex = updatedProfiles.findIndex(p => p.id === targetProfileId);

      if (profileIndex === -1) return prevProfiles;

      const profile = { ...updatedProfiles[profileIndex] };

      // Update only the fields that are provided
      profile.patientDemographic = {
        ...profile.patientDemographic,
        ...demographicData
      };

      updatedProfiles[profileIndex] = profile;
      return updatedProfiles;
    });

    // Update timestamp to indicate data has changed
    setLastDataChangeTimestamp(Date.now());
  };

  // Reset a profile to its initial state
  const resetProfile = (profileId?: string) => {
    const targetProfileId = profileId || currentProfileId;

    console.log("Resetting profile:", targetProfileId);

    setProfiles(prevProfiles => {
      const updatedProfiles = [...prevProfiles];
      const profileIndex = updatedProfiles.findIndex(p => p.id === targetProfileId);

      if (profileIndex === -1) return prevProfiles;

      const profileId = updatedProfiles[profileIndex].id;

      // Create a fresh random distribution of questions
      const trialData = createPredefinedProfileData(profileId);

      console.log("Reset trialData:", {
        availableItems: trialData.availableItems.length,
        logistics: trialData.complexityItems[CATEGORIES.LOGISTICS].length,
        motivation: trialData.complexityItems[CATEGORIES.MOTIVATION].length,
        healthcare: trialData.complexityItems[CATEGORIES.HEALTHCARE].length,
        quality: trialData.complexityItems[CATEGORIES.QUALITY].length,
        total: trialData.availableItems.length +
          trialData.complexityItems[CATEGORIES.LOGISTICS].length +
          trialData.complexityItems[CATEGORIES.MOTIVATION].length +
          trialData.complexityItems[CATEGORIES.HEALTHCARE].length +
          trialData.complexityItems[CATEGORIES.QUALITY].length
      });

      // Get fresh demographic data from JSON
      const freshDemographicData = getDemographicData(profileId);

      // Get categories with calculated scores based on the new distribution
      const freshCategories = getCategoriesWithScores(profileId, trialData);

      updatedProfiles[profileIndex] = {
        ...updatedProfiles[profileIndex],
        trialData,
        patientDemographic: freshDemographicData,
        categories: freshCategories
      };

      return updatedProfiles;
    });

    // Update timestamp to indicate data has changed
    setLastDataChangeTimestamp(Date.now());
  };

  return (
    <TrialDataContext.Provider
      value={{
        profiles,
        currentProfileId,
        setCurrentProfileId,
        getCurrentProfile,
        getQuestionsForProfile,
        moveItem,
        resetProfile,
        updatePatientDemographic,
        isLoading,
        lastDataChangeTimestamp
      }}
    >
      {children}
    </TrialDataContext.Provider>
  );
};
