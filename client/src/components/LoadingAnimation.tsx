import { useState, useEffect } from 'react';

type LoadingPhase = {
  message: string;
  detail: string;
};

const loadingPhases: LoadingPhase[] = [
  { 
    message: "Loading data structure...", 
    detail: "Preparing trial components and patient profiles" 
  },
  { 
    message: "Processing patient data...", 
    detail: "Analyzing demographics and trial complexity factors" 
  },
  { 
    message: "Generating model values...", 
    detail: "Calculating feasibility scores across categories" 
  },
  { 
    message: "Finalizing visualization...", 
    detail: "Preparing interactive components for display" 
  }
];

export default function LoadingAnimation() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [dots, setDots] = useState(1);
  const [progress, setProgress] = useState(5);

  useEffect(() => {
    // Update the dots for the animation effect
    const dotInterval = setInterval(() => {
      setDots(prev => (prev % 3) + 1);
    }, 500);

    // Progress through the loading phases
    const phaseInterval = setInterval(() => {
      if (currentPhase < loadingPhases.length - 1) {
        setCurrentPhase(prev => prev + 1);
      }
    }, 2000);

    // Update the progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const nextProgress = prev + 1;
        return nextProgress > 95 ? 95 : nextProgress;
      });
    }, 100);

    return () => {
      clearInterval(dotInterval);
      clearInterval(phaseInterval);
      clearInterval(progressInterval);
    };
  }, [currentPhase]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6 animate-fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Clinical Trial Dashboard
          </h2>
          <p className="text-gray-600">
            Please wait while we analyze the trial data
          </p>
        </div>

        <div className="mb-6">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {loadingPhases.map((phase, index) => (
            <div 
              key={index} 
              className={`flex items-start ${index === currentPhase ? 'text-blue-600 font-medium' : index < currentPhase ? 'text-gray-400' : 'text-gray-300'}`}
            >
              <div className="mr-3 mt-1">
                {index < currentPhase ? (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : index === currentPhase ? (
                  <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-medium">
                  {phase.message}
                  {index === currentPhase && '.'.repeat(dots)}
                </p>
                <p className="text-xs text-gray-500">{phase.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Powered by advanced data analysis algorithms</p>
        </div>
      </div>
    </div>
  );
}