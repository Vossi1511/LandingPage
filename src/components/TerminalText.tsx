import { useState, useEffect } from 'react';

interface TerminalTextProps {
  text: string;
  delay?: number;
  speed?: number;
  hideCursor?: boolean;
}

export function TerminalText({ text, delay = 0, speed = 50, hideCursor = false }: TerminalTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }
    }, currentIndex === 0 ? delay : speed);

    return () => clearTimeout(timer);
  }, [currentIndex, text, delay, speed]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span className="font-mono">
      {displayedText}
      {!hideCursor && currentIndex <= text.length && (
        <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
          ▊
        </span>
      )}
    </span>
  );
}
