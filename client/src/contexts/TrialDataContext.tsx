import { createContext, useState, useEffect, ReactNode } from 'react';

// Define the type for a complexity element item
export interface ComplexityItem {
  id: string;
  name: string;
  category: string;
  complexity: number;
}

// Define the categories for complexity items
export const CATEGORIES = {
  LOGISTICS: 'Logistics Challenge',
  MOTIVATION: 'Motivation',
  HEALTHCARE: 'Healthcare Engagement',
  QUALITY: 'Quality of Life'
} as const;

// Define category type
export type CategoryType = typeof CATEGORIES[keyof typeof CATEGORIES];

// Define the type for trial data
export interface TrialData {
  // Map of complexity items by their category
  complexityItems: Record<CategoryType, ComplexityItem[]>;
  // List of all items that can be dragged
  availableItems: ComplexityItem[];
}

// Define patient demographic data
export interface PatientDemographic {
  age: number;
  gender: string;
  ethnicity: string;
  location: string;
  medicalHistory: string[];
  weight: number; // in kg
  height: number; // in cm
  compliance: number; // 1-100 scale
}

// Define type for profile containing trial data
export interface Profile {
  id: string;
  name: string;
  trialData: TrialData;
  diseaseBurdenScore: number;
  patientDemographic: PatientDemographic;
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

// Import questions data from JSON file
import questionsData from '@/data/questions.json';

// Define types for the JSON data
interface QuestionData {
  items: ComplexityItem[];
  categories: Record<string, Array<Record<string, string[]>>>;
  patientDemographics: Record<string, {
    age: number;
    gender: string;
    ethnicity: string;
    location: string;
    medicalHistory: string[];
    weight: number;
    height: number;
    compliance: number;
    diseaseBurdenScore: number;
  }>;
  profiles: Array<{id: string; name: string}>;
  loadingTime: number;
}

// All items available for the trial
const allItems: ComplexityItem[] = questionsData.items.map(item => ({
  ...item,
  category: ''
}));

// Create profile 1 data (has mixed item distribution)
const createProfile1Data = (): TrialData => {
  const categorizedItems: Record<CategoryType, ComplexityItem[]> = {
    [CATEGORIES.LOGISTICS]: [],
    [CATEGORIES.MOTIVATION]: [],
    [CATEGORIES.HEALTHCARE]: [],
    [CATEGORIES.QUALITY]: [],
  };
  
  // Use the category data from the JSON file
  Object.entries(questionsData.categories).forEach(([category, categoryData]) => {
    if (categoryData && categoryData.length > 0) {
      const profileItems = categoryData[0].profile1;
      if (profileItems && profileItems.length > 0) {
        profileItems.forEach(itemId => {
          const item = allItems.find(item => item.id === itemId);
          if (item) {
            categorizedItems[category as CategoryType].push({
              ...item,
              category: category as CategoryType
            });
          }
        });
      }
    }
  });

  // Keep only the items that weren't categorized in the available list
  const remainingItems = allItems.filter(item => 
    !Object.values(categorizedItems).flat().some(categorizedItem => 
      categorizedItem.id === item.id
    )
  ).map(item => ({ ...item, category: '' }));

  return {
    availableItems: remainingItems,
    complexityItems: categorizedItems
  };
};

// Create profile 2 data (focuses on logistics and quality of life)
const createProfile2Data = (): TrialData => {
  const categorizedItems: Record<CategoryType, ComplexityItem[]> = {
    [CATEGORIES.LOGISTICS]: [],
    [CATEGORIES.MOTIVATION]: [],
    [CATEGORIES.HEALTHCARE]: [],
    [CATEGORIES.QUALITY]: [],
  };
  
  // Use the category data from the JSON file
  Object.entries(questionsData.categories).forEach(([category, categoryData]) => {
    if (categoryData && categoryData.length > 0) {
      const profileItems = categoryData[0].profile2;
      if (profileItems && profileItems.length > 0) {
        profileItems.forEach(itemId => {
          const item = allItems.find(item => item.id === itemId);
          if (item) {
            categorizedItems[category as CategoryType].push({
              ...item,
              category: category as CategoryType
            });
          }
        });
      }
    }
  });

  // Keep only the items that weren't categorized in the available list
  const remainingItems = allItems.filter(item => 
    !Object.values(categorizedItems).flat().some(categorizedItem => 
      categorizedItem.id === item.id
    )
  ).map(item => ({ ...item, category: '' }));

  return {
    availableItems: remainingItems,
    complexityItems: categorizedItems
  };
};

// Create profile 3 data (focuses on healthcare and motivation)
const createProfile3Data = (): TrialData => {
  const categorizedItems: Record<CategoryType, ComplexityItem[]> = {
    [CATEGORIES.LOGISTICS]: [],
    [CATEGORIES.MOTIVATION]: [],
    [CATEGORIES.HEALTHCARE]: [],
    [CATEGORIES.QUALITY]: [],
  };
  
  // Use the category data from the JSON file
  Object.entries(questionsData.categories).forEach(([category, categoryData]) => {
    if (categoryData && categoryData.length > 0) {
      const profileItems = categoryData[0].profile3;
      if (profileItems && profileItems.length > 0) {
        profileItems.forEach(itemId => {
          const item = allItems.find(item => item.id === itemId);
          if (item) {
            categorizedItems[category as CategoryType].push({
              ...item,
              category: category as CategoryType
            });
          }
        });
      }
    }
  });

  // Keep only the items that weren't categorized in the available list
  const remainingItems = allItems.filter(item => 
    !Object.values(categorizedItems).flat().some(categorizedItem => 
      categorizedItem.id === item.id
    )
  ).map(item => ({ ...item, category: '' }));

  return {
    availableItems: remainingItems,
    complexityItems: categorizedItems
  };
};

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
  // Using type assertion to handle string index access
  const demographics = (questionsData as QuestionData).patientDemographics[profileId];
  
  return {
    age: demographics.age,
    gender: demographics.gender,
    ethnicity: demographics.ethnicity,
    location: demographics.location,
    medicalHistory: demographics.medicalHistory,
    weight: demographics.weight,
    height: demographics.height,
    compliance: demographics.compliance
  };
};

// Initial profiles
const initialProfiles: Profile[] = (questionsData as QuestionData).profiles.map(profile => {
  return {
    id: profile.id,
    name: profile.name,
    trialData: profile.id === 'profile1' 
      ? createProfile1Data() 
      : profile.id === 'profile2' 
        ? createProfile2Data() 
        : createProfile3Data(),
    diseaseBurdenScore: (questionsData as QuestionData).patientDemographics[profile.id].diseaseBurdenScore,
    patientDemographic: getDemographicData(profile.id)
  };
});

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
  
  // Simulate loading data from an API with time from the JSON file
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, (questionsData as any).loadingTime || 10000); // Use the loading time from JSON or default to 10 seconds
    
    return () => clearTimeout(timer);
  }, []);
  
  // Get the current profile
  const getCurrentProfile = (): Profile => {
    const profile = profiles.find(p => p.id === currentProfileId);
    return profile || profiles[0];
  };
  
  // Move an item to a target category
  const moveItem = (item: ComplexityItem, targetCategory: string, profileId?: string) => {
    const targetProfileId = profileId || currentProfileId;
    
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
      
      // Update disease burden score based on demographics (simplified example)
      if (demographicData.age || demographicData.medicalHistory || demographicData.compliance) {
        const age = demographicData.age || profile.patientDemographic.age;
        const medicalHistoryCount = demographicData.medicalHistory?.length || 
          profile.patientDemographic.medicalHistory.length;
        const compliance = demographicData.compliance || profile.patientDemographic.compliance;
        
        // Simple formula to calculate burden score based on demographics
        const ageImpact = Math.min(age / 20, 3); // Age divided by 20, max 3
        const historyImpact = medicalHistoryCount * 0.5; // Each condition adds 0.5
        const complianceImpact = (100 - compliance) / 20; // Lower compliance = higher score
        
        // Calculate new score (range ~2-7)
        profile.diseaseBurdenScore = Math.round((ageImpact + historyImpact + complianceImpact) * 100) / 100;
      }
      
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
      const originalBurdenScore = (questionsData as QuestionData).patientDemographics[profileId].diseaseBurdenScore;
      
      updatedProfiles[profileIndex] = {
        ...updatedProfiles[profileIndex],
        trialData,
        patientDemographic: freshDemographicData,
        diseaseBurdenScore: originalBurdenScore
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
