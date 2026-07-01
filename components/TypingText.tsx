import React, { useState, useEffect } from 'react';

interface TypingTextProps {
  text: string;
  delay?: number;
  className?: string;
  onComplete?: () => void;
  startDelay?: number;
}

const TypingText: React.FC<TypingTextProps> = ({ 
  text, 
  delay = 50, 
  className = '', 
  onComplete,
  startDelay = 0
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStarted(true);
    }, startDelay);
    return () => clearTimeout(timer);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        const char = text[currentIndex];
        setDisplayedText(prev => prev + char);
        currentIndex++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, delay);

    return () => clearInterval(interval);
  }, [text, delay, onComplete, started]);

  return <span className={className}>{displayedText}</span>;
};

export default TypingText;