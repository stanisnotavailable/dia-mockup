import React, { useState, useEffect } from 'react';

interface AiSummaryAnimationProps {
  isGenerating?: boolean;
  darkMode?: boolean;
}

export default function AiSummaryAnimation({ isGenerating = false, darkMode = false }: AiSummaryAnimationProps) {
  const [dots, setDots] = useState<number>(0);
  
  useEffect(() => {
    if (!isGenerating) return;
    
    const interval = setInterval(() => {
      setDots((prev) => (prev + 1) % 4);
    }, 400);
    
    return () => clearInterval(interval);
  }, [isGenerating]);
  
  if (!isGenerating) {
    return null;
  }
  
  const textColor = darkMode ? 'text-gray-200' : 'text-blue-600';
  const borderColor = darkMode ? 'border-gray-200' : 'border-blue-500';
  
  return (
    <div className="flex items-center space-x-2 my-1">
      <div className="relative w-5 h-5">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-5 h-5 rounded-full border-2 ${borderColor} border-t-transparent animate-spin`}></div>
        </div>
      </div>
      <span className={`text-xs ${textColor} font-medium`}>
        AI generating summary{'.'.repeat(dots)}
      </span>
    </div>
  );
}

// AI thinking animation - more advanced version
export function AiThinkingAnimation({ darkMode = false }: { darkMode?: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % 3);
    }, 600);
    
    return () => clearInterval(interval);
  }, []);
  
  const activeColor = darkMode ? 'bg-gray-200' : 'bg-blue-600';
  const inactiveColor = darkMode ? 'bg-gray-500' : 'bg-blue-300';
  
  return (
    <div className="flex items-center justify-start space-x-1 my-1">
      {[0, 1, 2].map((index) => (
        <div 
          key={index}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            index === activeIndex 
              ? `${activeColor} scale-125` 
              : inactiveColor
          }`}
        />
      ))}
    </div>
  );
}

// AI pulse animation for the summary section
export function AiPulseAnimation({ isGenerating = false, darkMode = false }: { isGenerating?: boolean, darkMode?: boolean }) {
  // Define colors based on dark mode
  const leftBorderColors = darkMode
    ? isGenerating 
      ? 'from-blue-300/40 to-indigo-300/40' 
      : 'from-blue-300/30 to-indigo-300/30'
    : isGenerating 
      ? 'from-blue-500/40 to-indigo-500/40' 
      : 'from-blue-500/20 to-indigo-500/20';
      
  const bottomBorderColors = darkMode
    ? isGenerating
      ? 'from-blue-300/30 via-indigo-300/40 to-blue-300/30'
      : 'from-blue-300/20 via-indigo-300/30 to-blue-300/20'
    : isGenerating
      ? 'from-blue-500/30 via-indigo-500/40 to-blue-500/30'
      : 'from-blue-500/10 via-indigo-500/20 to-blue-500/10';
  
  const glowColor = darkMode
    ? 'from-blue-300/10 to-transparent'
    : 'from-blue-500/5 to-transparent';
  
  return (
    <div className="absolute left-0 top-0 w-full h-full pointer-events-none overflow-hidden">
      {/* Left border with enhanced animation when generating */}
      <div className={`absolute left-0 top-0 w-2 h-full bg-gradient-to-b ${leftBorderColors} animate-pulse`}></div>
      
      {/* Bottom border with enhanced animation when generating */}
      <div className={`absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r ${bottomBorderColors} animate-pulse`}></div>
      
      {/* Additional top glow when generating */}
      {isGenerating && (
        <div className={`absolute inset-0 bg-gradient-to-b ${glowColor}`}></div>
      )}
    </div>
  );
} 