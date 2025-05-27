import React, { useState, useEffect, useRef } from 'react';

interface TypingAnimationProps {
  text: string;
  isGenerating: boolean;
  speed?: number; // ms per character
  initialDelay?: number; // ms before starting
  thinkingPauses?: boolean; // enable random pauses while typing
  darkMode?: boolean; // whether the component is on a dark background
}

export default function TypingAnimation({ 
  text, 
  isGenerating, 
  speed = 20, 
  initialDelay = 300,
  thinkingPauses = false,
  darkMode = false
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const previousTextRef = useRef('');
  
  // Reset animation when text changes completely
  useEffect(() => {
    if (previousTextRef.current !== text) {
      setCurrentIndex(0);
      setDisplayedText('');
      setIsComplete(false);
      setCursorVisible(true);
      setIsPaused(false);
      previousTextRef.current = text;
    }
  }, [text]);
  
  // Handle the typing animation
  useEffect(() => {
    // If we're not generating or already finished, do nothing
    if (!isGenerating && isComplete) return;
    
    // If text is empty, do nothing
    if (!text) return;
    
    // If we've reached the end of the text
    if (currentIndex >= text.length) {
      setIsComplete(true);
      return;
    }
    
    // If we're in a thinking pause, don't proceed
    if (isPaused) return;
    
    // Add initial delay before starting to type
    const initialTimer = setTimeout(() => {
      // Set up the interval for typing effect
      const timer = setInterval(() => {
        setCurrentIndex(prevIndex => {
          const nextIndex = prevIndex + 1;
          
          // Add a small random delay to make typing feel more natural
          const randomDelay = Math.random() * 30;
          setTimeout(() => {
            setDisplayedText(text.substring(0, nextIndex));
          }, randomDelay);
          
          // Stop when we reach the end
          if (nextIndex >= text.length) {
            clearInterval(timer);
            setIsComplete(true);
          }
          
          // Maybe add a thinking pause
          if (thinkingPauses && Math.random() < 0.1) { // 10% chance of pausing
            setIsPaused(true);
            
            // Resume after a random pause (500-2000ms)
            const pauseDuration = Math.random() * 1500 + 500;
            setTimeout(() => {
              setIsPaused(false);
            }, pauseDuration);
          }
          
          return nextIndex;
        });
      }, speed);
      
      return () => clearInterval(timer);
    }, currentIndex === 0 ? initialDelay : 0);
    
    return () => clearTimeout(initialTimer);
  }, [text, currentIndex, isGenerating, isComplete, speed, initialDelay, isPaused, thinkingPauses]);
  
  // Blinking cursor effect
  useEffect(() => {
    if (!isGenerating && isComplete) return;
    
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, isPaused ? 400 : 530); // Faster blink during pauses
    
    return () => clearInterval(cursorInterval);
  }, [isGenerating, isComplete, isPaused]);
  
  // If text is empty or not generating, just return the full text
  if (!text || (!isGenerating && !isComplete)) {
    return <div>{text}</div>;
  }
  
  // Set cursor color based on mode
  const cursorColor = darkMode 
    ? isPaused ? '#90cdf4' : '#ffffff'  // Light blue or white on dark
    : isPaused ? '#60a5fa' : '#3b82f6'; // Blue shades on light
  
  return (
    <div className="relative">
      <span>{displayedText}</span>
      {(!isComplete || isGenerating) && (
        <span 
          className={`inline-block ml-0.5 transition-opacity duration-200 ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            width: '2px', 
            height: '1em', 
            backgroundColor: cursorColor, 
            verticalAlign: 'middle',
            marginBottom: '1px'
          }}
        />
      )}
    </div>
  );
} 