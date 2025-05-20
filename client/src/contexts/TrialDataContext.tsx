import { createContext, useState, ReactNode } from 'react';

// Define the type for trial data
interface TrialData {
  inclusionSelected: boolean;
  sequenceSelected: boolean;
  lifestyleSelected: boolean;
  otherSelected: boolean;
  sequenceValue: number;
  lifestyleValue: number;
  otherValue: number;
}

// Define the context interface
interface TrialDataContextType {
  trialData: TrialData;
  setInclusionSelected: (selected: boolean) => void;
  setSequenceSelected: (selected: boolean) => void;
  setLifestyleSelected: (selected: boolean) => void;
  setOtherSelected: (selected: boolean) => void;
  setSequenceValue: (value: number) => void;
  setLifestyleValue: (value: number) => void;
  setOtherValue: (value: number) => void;
}

// Create context with default values
export const TrialDataContext = createContext<TrialDataContextType>({
  trialData: {
    inclusionSelected: true,
    sequenceSelected: true,
    lifestyleSelected: true,
    otherSelected: false,
    sequenceValue: 10,
    lifestyleValue: 5,
    otherValue: 50,
  },
  setInclusionSelected: () => {},
  setSequenceSelected: () => {},
  setLifestyleSelected: () => {},
  setOtherSelected: () => {},
  setSequenceValue: () => {},
  setLifestyleValue: () => {},
  setOtherValue: () => {},
});

// Create the provider component
export const TrialDataProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state
  const [inclusionSelected, setInclusionSelected] = useState(true);
  const [sequenceSelected, setSequenceSelected] = useState(true);
  const [lifestyleSelected, setLifestyleSelected] = useState(true);
  const [otherSelected, setOtherSelected] = useState(false);
  
  const [sequenceValue, setSequenceValue] = useState(10);
  const [lifestyleValue, setLifestyleValue] = useState(5);
  const [otherValue, setOtherValue] = useState(50);
  
  // Combine all state into one trialData object
  const trialData: TrialData = {
    inclusionSelected,
    sequenceSelected,
    lifestyleSelected,
    otherSelected,
    sequenceValue,
    lifestyleValue,
    otherValue,
  };
  
  return (
    <TrialDataContext.Provider
      value={{
        trialData,
        setInclusionSelected,
        setSequenceSelected,
        setLifestyleSelected,
        setOtherSelected,
        setSequenceValue,
        setLifestyleValue,
        setOtherValue,
      }}
    >
      {children}
    </TrialDataContext.Provider>
  );
};
