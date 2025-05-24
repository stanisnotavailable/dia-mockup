import { usePresentationMode } from "@/contexts/PresentationModeContext";

export function PresentationModeToggle() {
  const { isPresentationMode, togglePresentationMode } = usePresentationMode();

  return (
    <button
      onClick={togglePresentationMode}
      className="fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg z-50 text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
      title={isPresentationMode ? "Switch to Normal Size" : "Switch to Presentation Mode"}
    >
      {/* Icon for presentation/normal mode */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        {isPresentationMode ? (
          // Compress icon for normal mode
          <>
            <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
          </>
        ) : (
          // Expand icon for presentation mode
          <>
            <path d="M4 10h6V4M20 14h-6v6M14 14l7 7M3 3l7 7" />
          </>
        )}
      </svg>
      {isPresentationMode ? "Normal Size" : "Presentation Mode"}
    </button>
  );
} 