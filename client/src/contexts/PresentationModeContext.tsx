import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface PresentationModeContextType {
  isPresentationMode: boolean;
  togglePresentationMode: () => void;
}

const PresentationModeContext = createContext<PresentationModeContextType | undefined>(undefined);

export function PresentationModeProvider({ children }: { children: ReactNode }) {
  // Start with presentation mode enabled by default
  const [isPresentationMode, setIsPresentationMode] = useState(true);

  // Apply presentation mode class on initial render
  useEffect(() => {
    if (isPresentationMode) {
      document.documentElement.classList.add('presentation-mode');
    }
  }, []);

  const togglePresentationMode = () => {
    setIsPresentationMode((prev) => {
      const newValue = !prev;
      
      // Toggle class based on the new value
      if (newValue) {
        document.documentElement.classList.add('presentation-mode');
      } else {
        document.documentElement.classList.remove('presentation-mode');
      }
      
      return newValue;
    });
  };

  return (
    <PresentationModeContext.Provider value={{ isPresentationMode, togglePresentationMode }}>
      {children}
    </PresentationModeContext.Provider>
  );
}

export function usePresentationMode() {
  const context = useContext(PresentationModeContext);
  if (context === undefined) {
    throw new Error("usePresentationMode must be used within a PresentationModeProvider");
  }
  return context;
} 