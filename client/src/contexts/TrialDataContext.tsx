import { createContext, useState, useEffect, ReactNode } from 'react';

// Import questions data from JSON file
import questionsData from '@/data/questions.json';

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
  model_value: number;
  questions: ComplexityItem[];
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
  const allQuestions = questionsData.allQuestions || [];
  
  // Map the questions to ComplexityItems
  return allQuestions.map(question => ({
    ...question,
    category: '', // Initially no category assigned
    complexity: 60 // Default complexity value
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
  const profileData = questionsData[profileId as keyof typeof questionsData];
  
  // Make a copy of all items to distribute
  const allItemsCopy = [...allItems.map(item => ({ ...item, category: '' }))];
  
  // Distribute some questions to different categories
  // Logistics: Add questions 0 and 1
  categorizedItems[CATEGORIES.LOGISTICS].push(
    { ...allItemsCopy[0], category: CATEGORIES.LOGISTICS },
    { ...allItemsCopy[1], category: CATEGORIES.LOGISTICS }
  );
  
  // Motivation: Add questions 2 and 3
  categorizedItems[CATEGORIES.MOTIVATION].push(
    { ...allItemsCopy[2], category: CATEGORIES.MOTIVATION },
    { ...allItemsCopy[3], category: CATEGORIES.MOTIVATION }
  );
  
  // Healthcare: Add questions 4 and 5
  categorizedItems[CATEGORIES.HEALTHCARE].push(
    { ...allItemsCopy[4], category: CATEGORIES.HEALTHCARE },
    { ...allItemsCopy[5], category: CATEGORIES.HEALTHCARE }
  );
  
  // Quality of Life: Add questions 6 and 7
  categorizedItems[CATEGORIES.QUALITY].push(
    { ...allItemsCopy[6], category: CATEGORIES.QUALITY },
    { ...allItemsCopy[7], category: CATEGORIES.QUALITY }
  );
  
  // The remaining items (8-23) go to the available items
  const availableItems = allItemsCopy.slice(8);
  
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
  const profileData = questionsData[profileId as keyof typeof questionsData];
  
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

// Initial profiles
const initialProfiles: Profile[] = [
  {
    id: 'profile1',
    name: 'Profile 1',
    trialData: createProfile1Data(),
    patientDemographic: getDemographicData('profile1'),
    categories: questionsData.profile1?.categories
  },
  {
    id: 'profile2',
    name: 'Profile 2',
    trialData: createProfile2Data(),
    patientDemographic: getDemographicData('profile2'),
    categories: questionsData.profile2?.categories
  },
  {
    id: 'profile3',
    name: 'Profile 3',
    trialData: createProfile3Data(),
    patientDemographic: getDemographicData('profile3'),
    categories: questionsData.profile3?.categories
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
        // First, remove the question from ALL categories to ensure it's only in one place
        profile.categories = profile.categories.map(cat => ({
          ...cat,
          questions: cat.questions.filter(q => q.id !== item.id)
        }));
        
        // Now add the question to the target category if needed
        if (targetCategory !== '') {
          const categoryIndex = profile.categories.findIndex(cat => cat.name === targetCategory);
          
          if (categoryIndex !== -1) {
            // Create a new questions array for the category
            const questions = [...profile.categories[categoryIndex].questions];
            
            // Add the question to the category (it shouldn't be there already since we removed it from all categories)
            questions.push({
              id: item.id,
              name: item.name,
              category: targetCategory
            });
            
            // Update the category with the new questions
            profile.categories[categoryIndex] = {
              ...profile.categories[categoryIndex],
              questions: questions
            };
          }
        }
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
      
      // We're now using the model_value from the JSON data instead of calculating a disease burden score
      // This block is no longer needed but kept for reference
      /*
      if (demographicData.age || demographicData.medicalHistory || demographicData.compliance) {
        // Disease burden score is now derived from model_value in the JSON data
        const profileData = questionsData[profile.id as keyof typeof questionsData];
        if (profileData && profileData.categories && profileData.categories.length > 0) {
          // Could calculate an average model_value across categories if needed
        }
      }
      */
      
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
      
      // Reset the categories to have empty questions
      const freshCategories = questionsData[profileId as keyof typeof questionsData]?.categories || [];
      const categoriesWithEmptyQuestions = freshCategories.map(category => ({
        ...category,
        questions: [] // Reset questions to empty array
      }));
      
      updatedProfiles[profileIndex] = {
        ...updatedProfiles[profileIndex],
        trialData,
        patientDemographic: freshDemographicData,
        categories: categoriesWithEmptyQuestions
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
