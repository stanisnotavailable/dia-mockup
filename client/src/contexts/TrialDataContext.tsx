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
  profile1: {
    [CATEGORIES.HEALTHCARE]: 'Medium',
    [CATEGORIES.LOGISTICS]: 'Medium',
    [CATEGORIES.QUALITY]: 'High',
    [CATEGORIES.MOTIVATION]: 'Low'
  },
  profile2: {
    [CATEGORIES.HEALTHCARE]: 'High',
    [CATEGORIES.LOGISTICS]: 'Low',
    [CATEGORIES.QUALITY]: 'Medium',
    [CATEGORIES.MOTIVATION]: 'High'
  },
  profile3: {
    [CATEGORIES.HEALTHCARE]: 'Low',
    [CATEGORIES.LOGISTICS]: 'High',
    [CATEGORIES.QUALITY]: 'Medium',
    [CATEGORIES.MOTIVATION]: 'Low'
  }
} as const;

// Define profile-specific scoring multipliers - REDUCED VALUES for better scaling
const PROFILE_SCORING_RULES = {
  profile1: {
    [CATEGORIES.HEALTHCARE]: { add: 0.75, remove: 1 },     // Engagement insight
    [CATEGORIES.MOTIVATION]: { add: 0.5, remove: 0.6 },     // Motivation insight
    [CATEGORIES.QUALITY]: { add: 0.4, remove: 0.4 },      // QoL impact insight
    [CATEGORIES.LOGISTICS]: { add: 0.6, remove: 0.5 }       // Logistical insight
  },
  profile2: {
    [CATEGORIES.HEALTHCARE]: { add: 1, remove: 0.75 },     // Engagement insight
    [CATEGORIES.MOTIVATION]: { add: 1, remove: 0.6 },     // Motivation insight
    [CATEGORIES.QUALITY]: { add: 0.5, remove: 0.4 },        // QoL impact insight
    [CATEGORIES.LOGISTICS]: { add: 0.25, remove: 0.25 }     // Logistical insight
  },
  profile3: {
    [CATEGORIES.HEALTHCARE]: { add: 0.5, remove: 0.4 },     // Engagement insight
    [CATEGORIES.MOTIVATION]: { add: 0.5, remove: 0.4 },     // Motivation insight
    [CATEGORIES.QUALITY]: { add: 0.75, remove: 0.6 },      // QoL impact insight
    [CATEGORIES.LOGISTICS]: { add: 1, remove: 0.75 }       // Logistical insight
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
      ],
      "Motivation": [
        "q96", // I'd feel more open to it if my medical team supported the idea.
        "q94", // I'd be interested if it offered better care than I'm getting now.
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
      ],
      "Logistics Challenge": [
        "q41", // Less than 30 minutes.
        "q50", // I haven't had to travel for treatment yet.
        "q47", // I live nearby, so travel wasn't a problem.
        "q31", // Just 1 or 2 appointments per month.
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
      ],
      "Healthcare Engagement": [
        "q64", // Yes, they explained the options clearly.
        "q69", // I looked into trials myself.
        "q66", // I asked about trials, but didn't get much information.
      ],
      "Motivation": [
        "q95", // I'd want to help others in the future by contributing to progress.
        "q91", // I'd want a chance at a cure.
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

      // Calculate initial score using profile-specific "add" multiplier to all insights in category
      const profileRules = profileScoringRules[categoryType as keyof typeof profileScoringRules] || { add: 0.1, remove: 0.1 };
      const addMultiplier = profileRules.add;
      let initialScore = 0;

      items.forEach(item => {
        const itemScore = item.score || 0;
        initialScore += itemScore * addMultiplier;
      });

      // Cap the maximum score at 10 (which will display as 100 on the radar chart)
      initialScore = Math.min(initialScore, 10);

      console.log(`Initial score for ${categoryName} (Profile ${profileId}): ${initialScore.toFixed(2)} from ${items.length} items (x${addMultiplier})`);

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

  ['profile1', 'profile2', 'profile3'].forEach(profileId => {
    const trialData = createPredefinedProfileData(profileId);
    const patientDemographic = getDemographicData(profileId);
    const categories = getCategoriesWithScores(profileId, trialData);

    profiles.push({
      id: profileId,
      name: profileId === 'profile1' ? 'Profile 1' : profileId === 'profile2' ? 'Profile 2' : 'Profile 3',
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
  currentProfileId: 'profile1',
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
  const [currentProfileId, setCurrentProfileId] = useState<string>('profile1');
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

      // Check if this category was affected by the move
      if (category.name === fromCategory || category.name === targetCategory) {
        // Get current items in this category from the updated trialData
        const currentItems = profile.trialData.complexityItems[categoryType] || [];

        // Recalculate score based on all items currently in the category using profile-specific rules
        let newScore = 0;
        currentItems.forEach(categoryItem => {
          const itemScore = categoryItem.score || 0;
          newScore += itemScore * profileRules.add;
        });

        // Ensure score doesn't go below 0 and cap at 10 (displays as 100 on radar chart)
        newScore = Math.max(0, Math.min(newScore, 10));

        console.log(`${category.name} (Profile ${profile.id}): Recalculated score = ${newScore.toFixed(2)} from ${currentItems.length} items (x${profileRules.add})`);

        return {
          ...category,
          currentScore: newScore,
          averageScore: newScore, // Update display score
          multiplierLevel: multiplierLevel
        };
      }

      return {
        ...category,
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
