import { createContext, useState, ReactNode } from 'react';

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
interface TrialData {
  // Map of complexity items by their category
  complexityItems: Record<CategoryType, ComplexityItem[]>;
  // List of all items that can be dragged
  availableItems: ComplexityItem[];
}

// Define the context interface
interface TrialDataContextType {
  trialData: TrialData;
  moveItem: (item: ComplexityItem, targetCategory: string) => void;
  resetItems: () => void;
}

// Initial data setup
const createInitialItemsData = (includeDemo = true): TrialData => {
  // All items available for the trial
  const allItems: ComplexityItem[] = [
    { id: '1', name: 'Frequent clinic visits', category: '', complexity: 65 },
    { id: '2', name: 'Protocol complexity', category: '', complexity: 70 },
    { id: '3', name: 'Travel requirements', category: '', complexity: 55 },
    { id: '4', name: 'Duration of treatment', category: '', complexity: 60 },
    { id: '5', name: 'Number of procedures', category: '', complexity: 75 },
    { id: '6', name: 'Dosing frequency', category: '', complexity: 50 },
    { id: '7', name: 'Dietary restrictions', category: '', complexity: 45 },
    { id: '8', name: 'Time commitment', category: '', complexity: 80 },
    { id: '9', name: 'Potential side effects', category: '', complexity: 65 },
    { id: '10', name: 'Insurance coverage', category: '', complexity: 70 },
    { id: '11', name: 'Support requirements', category: '', complexity: 60 },
    { id: '12', name: 'Monitoring complexity', category: '', complexity: 55 },
  ];

  // For demo purposes, pre-populate some items into categories
  if (includeDemo) {
    const categorizedItems: Record<CategoryType, ComplexityItem[]> = {
      [CATEGORIES.LOGISTICS]: [
        { ...allItems[0], category: CATEGORIES.LOGISTICS }, // Frequent clinic visits
        { ...allItems[2], category: CATEGORIES.LOGISTICS }, // Travel requirements
      ],
      [CATEGORIES.MOTIVATION]: [
        { ...allItems[6], category: CATEGORIES.MOTIVATION }, // Dietary restrictions
        { ...allItems[10], category: CATEGORIES.MOTIVATION }, // Support requirements
      ],
      [CATEGORIES.HEALTHCARE]: [
        { ...allItems[4], category: CATEGORIES.HEALTHCARE }, // Number of procedures
        { ...allItems[11], category: CATEGORIES.HEALTHCARE }, // Monitoring complexity
      ],
      [CATEGORIES.QUALITY]: [
        { ...allItems[8], category: CATEGORIES.QUALITY }, // Potential side effects
      ],
    };

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
  } 
  
  // Return all items in available list when reset
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

// Create context with default values
export const TrialDataContext = createContext<TrialDataContextType>({
  trialData: createInitialItemsData(),
  moveItem: () => {},
  resetItems: () => {},
});

// Create the provider component
export const TrialDataProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state
  const [trialData, setTrialData] = useState<TrialData>(createInitialItemsData());
  
  // Move an item to a target category
  const moveItem = (item: ComplexityItem, targetCategory: string) => {
    // If the item is already in a category, remove it first
    const updatedData = { ...trialData };
    
    // If the item is in the available items list, remove it
    if (item.category === '') {
      updatedData.availableItems = updatedData.availableItems.filter(
        (i) => i.id !== item.id
      );
    } else {
      // Remove from previous category if it exists there
      const oldCategory = item.category as CategoryType;
      if (updatedData.complexityItems[oldCategory]) {
        updatedData.complexityItems[oldCategory] = 
          updatedData.complexityItems[oldCategory].filter(
            (i) => i.id !== item.id
          );
      }
    }
    
    // If the target is empty string, move to available items
    if (targetCategory === '') {
      updatedData.availableItems.push({ ...item, category: '' });
    } else {
      // Add to the new category if it exists
      const category = targetCategory as CategoryType;
      if (updatedData.complexityItems[category]) {
        updatedData.complexityItems[category].push(
          { ...item, category }
        );
      }
    }
    
    setTrialData(updatedData);
  };
  
  // Reset all items to available
  const resetItems = () => {
    const initialData = createInitialItemsData();
    setTrialData(initialData);
  };
  
  return (
    <TrialDataContext.Provider
      value={{
        trialData,
        moveItem,
        resetItems,
      }}
    >
      {children}
    </TrialDataContext.Provider>
  );
};
