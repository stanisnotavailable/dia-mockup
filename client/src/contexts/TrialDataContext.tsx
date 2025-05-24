import { createContext, useState, useEffect, ReactNode } from 'react';

// Import questions data from JSON file
import questionsData from '@/data/questions.json';
import { getQuestionById, getQuestionName, getQuestionScore, calculateAverageScore } from '@/lib/questionUtils';

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
    origin: Array<{country: string; percentage: number}>;
    age: string;
    role: Array<{role_name: string; percentage: number}>;
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
  QUALITY: 'Quality of Life'
} as const;

// Define category type
export type CategoryType = typeof CATEGORIES[keyof typeof CATEGORIES];

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
  origin: Array<{country: string; percentage: number}>;
  age: string;
  role: Array<{role_name: string; percentage: number}>;
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
  origin: Array<{country: string; percentage: number}>;
  role: Array<{role_name: string; percentage: number}>;
}

// Define category data structure
export interface CategoryData {
  name: string;
  questions: string[];
  averageScore?: number;
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
  moveItem: (item: ComplexityItem, targetCategory: string, profileId?: string) => void;
  resetProfile: (profileId?: string) => void;
  updatePatientDemographic: (demographicData: Partial<PatientDemographic>, profileId?: string) => void;
  isLoading: boolean;
}

// Get all 24 questions from the JSON data
const getAllItems = (): ComplexityItem[] => {
  // Use the allQuestions array from our JSON data
  const allQuestions = typedQuestionsData.allQuestions || [];
  
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
  // Initialize categories with some pre-distributed questions
  const categorizedItems: Record<CategoryType, ComplexityItem[]> = {
    [CATEGORIES.LOGISTICS]: [],
    [CATEGORIES.MOTIVATION]: [],
    [CATEGORIES.HEALTHCARE]: [],
    [CATEGORIES.QUALITY]: [],
  };
  
  // Get the profile data from our JSON
  const profileData = typedQuestionsData[profileId as keyof typeof typedQuestionsData] as ProfileData | undefined;
  
  // Make a copy of all items to distribute
  const allItemsCopy = [...allItems.map(item => ({ ...item, category: '' }))];
  
  if (profileData && profileData.categories) {
    // Process each category
    profileData.categories.forEach((category: CategoryItem) => {
      const categoryName = category.name as CategoryType;
      
      // Get the question IDs from the questions array (now string array)
      const questionIds = category.questions;
      
      // For each question ID, find the corresponding item and add to the category
      questionIds.forEach((questionId: string) => {
        // Find the item in our allItemsCopy
        const itemIndex = allItemsCopy.findIndex(item => item.id === questionId);
        
        if (itemIndex !== -1) {
          // Get the item and update its category
          const item = { ...allItemsCopy[itemIndex], category: categoryName };
          
          // Add to the appropriate category
          categorizedItems[categoryName].push(item);
          
          // Remove from allItemsCopy to avoid duplicates
          allItemsCopy.splice(itemIndex, 1);
        }
      });
    });
  }
  
  // The remaining items go to the available items
  const availableItems = allItemsCopy;
  
  return {
    availableItems,
    complexityItems: categorizedItems
  };
};

// Create data for each profile using the helper function
const createProfile1Data = (): TrialData => createProfileData('profile1');
const createProfile2Data = (): TrialData => createProfileData('profile2');
const createProfile3Data = (): TrialData => createProfileData('profile3');

// Create the empty trial data (all items available)
const createEmptyTrialData = (): TrialData => {
  return {
    availableItems: allItems.map(item => ({ ...item, category: '' })),
    complexityItems: {
      [CATEGORIES.LOGISTICS]: [],
      [CATEGORIES.MOTIVATION]: [],
      [CATEGORIES.HEALTHCARE]: [],
      [CATEGORIES.QUALITY]: [],
    }
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
const getCategoriesWithScores = (profileId: string): CategoryData[] => {
  const profileData = typedQuestionsData[profileId as keyof typeof typedQuestionsData] as ProfileData | undefined;
  
  if (profileData && profileData.categories) {
    return profileData.categories.map(category => {
      // Calculate the average score for this category's questions
      const averageScore = calculateAverageScore(category.questions);
      
      return {
        name: category.name,
        questions: category.questions,
        averageScore
      };
    });
  }
  
  return [];
};

// Initial profiles
const initialProfiles: Profile[] = [
  {
    id: 'profile1',
    name: 'Profile 1',
    trialData: createProfile1Data(),
    patientDemographic: getDemographicData('profile1'),
    categories: getCategoriesWithScores('profile1')
  },
  {
    id: 'profile2',
    name: 'Profile 2',
    trialData: createProfile2Data(),
    patientDemographic: getDemographicData('profile2'),
    categories: getCategoriesWithScores('profile2')
  },
  {
    id: 'profile3',
    name: 'Profile 3',
    trialData: createProfile3Data(),
    patientDemographic: getDemographicData('profile3'),
    categories: getCategoriesWithScores('profile3')
  }
];

// Create context with default values
export const TrialDataContext = createContext<TrialDataContextType>({
  profiles: initialProfiles,
  currentProfileId: 'profile1',
  setCurrentProfileId: () => {},
  getCurrentProfile: () => initialProfiles[0],
  moveItem: () => {},
  resetProfile: () => {},
  updatePatientDemographic: () => {},
  isLoading: true,
});

// Create the provider component
export const TrialDataProvider = ({ children }: { children: ReactNode }) => {
  // Initialize loading state
  const [isLoading, setIsLoading] = useState(true);
  // Initialize profiles state
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [currentProfileId, setCurrentProfileId] = useState<string>('profile1');
  
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
  
  // Move an item to a target category
  const moveItem = (item: ComplexityItem, targetCategory: string, profileId?: string) => {
    const targetProfileId = profileId || currentProfileId;
    
    // Log the movement for debugging
    console.log(`Moving from ${item.category} to ${targetCategory}`);
    
    setProfiles(prevProfiles => {
      const updatedProfiles = [...prevProfiles];
      const profileIndex = updatedProfiles.findIndex(p => p.id === targetProfileId);
      
      if (profileIndex === -1) return prevProfiles;
      
      const profile = {...updatedProfiles[profileIndex]};
      const trialData = {...profile.trialData};
      
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
      
      return updatedProfiles;
    });
  };
  
  // Update patient demographic data
  const updatePatientDemographic = (demographicData: Partial<PatientDemographic>, profileId?: string) => {
    const targetProfileId = profileId || currentProfileId;
    
    setProfiles(prevProfiles => {
      const updatedProfiles = [...prevProfiles];
      const profileIndex = updatedProfiles.findIndex(p => p.id === targetProfileId);
      
      if (profileIndex === -1) return prevProfiles;
      
      const profile = {...updatedProfiles[profileIndex]};
      
      // Update only the fields that are provided
      profile.patientDemographic = {
        ...profile.patientDemographic,
        ...demographicData
      };
      
      updatedProfiles[profileIndex] = profile;
      return updatedProfiles;
    });
  };
  
  // Reset a profile to its initial state
  const resetProfile = (profileId?: string) => {
    const targetProfileId = profileId || currentProfileId;
    
    setProfiles(prevProfiles => {
      const updatedProfiles = [...prevProfiles];
      const profileIndex = updatedProfiles.findIndex(p => p.id === targetProfileId);
      
      if (profileIndex === -1) return prevProfiles;
      
      const profileId = updatedProfiles[profileIndex].id;
      let trialData: TrialData;
      
      // Use the appropriate initial data based on profile ID
      switch(profileId) {
        case 'profile1':
          trialData = createProfile1Data();
          break;
        case 'profile2':
          trialData = createProfile2Data();
          break;
        case 'profile3':
          trialData = createProfile3Data();
          break;
        default:
          trialData = createEmptyTrialData();
      }
      
      // Get fresh demographic data from JSON
      const freshDemographicData = getDemographicData(profileId);
      
      // Get categories with calculated scores
      const freshCategories = getCategoriesWithScores(profileId);
      
      updatedProfiles[profileIndex] = {
        ...updatedProfiles[profileIndex],
        trialData,
        patientDemographic: freshDemographicData,
        categories: freshCategories
      };
      
      return updatedProfiles;
    });
  };
  
  return (
    <TrialDataContext.Provider
      value={{
        profiles,
        currentProfileId,
        setCurrentProfileId,
        getCurrentProfile,
        moveItem,
        resetProfile,
        updatePatientDemographic,
        isLoading
      }}
    >
      {children}
    </TrialDataContext.Provider>
  );
};
