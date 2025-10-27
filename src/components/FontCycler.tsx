import { useState, useEffect, useRef } from 'react';

const fonts = [
  'Arial',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Impact',
  'Comic Sans MS',
  'Trebuchet MS',
  'Arial Black',
  'Palatino',
  'Garamond',
  'Bookman',
  'Tahoma',
  'Brush Script MT',
  'Papyrus',
  'Copperplate',
  'Helvetica',
  'Futura',
  'Optima',
  'Gill Sans',
  'Baskerville',
  'Didot',
  'Rockwell',
  'Century Gothic',
  'Candara',
  'Lucida Handwriting',
  'Bradley Hand',
  'Trattatello',
  'Luminari',
  'Marker Felt',
  'Chalkboard',
  'Noteworthy',
  'Snell Roundhand',
  'Zapfino',
  'Herculanum',
  'Party LET',
  'American Typewriter',
  'Andale Mono',
  'Courier New',
  'Lucida Sans Typewriter',
  'Monaco',
  'Consolas',
  'Menlo',
  'SF Mono',
  'Fira Code',
  'Source Code Pro',
  'IBM Plex Mono',
  'JetBrains Mono',
  'Inconsolata',
  'DejaVu Sans Mono',
  'Ubuntu Mono',
  'Roboto Mono',
  'Noto Sans Mono',
  'Cascadia Code',
  'Hack',
  'Fantasque Sans Mono',
  'Victor Mono',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'serif',
  'sans-serif',
  // More handwriting fonts
  'Apple Chancery',
  'Lucida Calligraphy',
  'Brush Script',
  'Freestyle Script',
  'French Script MT',
  'Edwardian Script ITC',
  'Kunstler Script',
  'Mistral',
  'Vivaldi',
  'Vladimir Script',
  'Curlz MT',
  'Monotype Corsiva',
  'Palace Script MT',
  'Pristina',
  'Script MT',
  'Segoe Script',
  'Viner Hand ITC',
];

const fontStyles = [
  { italic: false, weight: 'normal' },
  { italic: true, weight: 'normal' },
  { italic: false, weight: 'bold' },
  { italic: true, weight: 'bold' },
];

interface FontCyclerProps {
  text: string;
  finalFont?: string;
  duration?: number;
  delay?: number;
}

// Shared audio context for optimization
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// Function to play a satisfying switch click sound (like Eleven Labs)
function playSwitchClick(volume: number = 0.2) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Create a satisfying "click down" sound
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  
  // Higher frequency for the initial "click"
  osc1.frequency.setValueAtTime(800, now);
  osc1.frequency.exponentialRampToValueAtTime(400, now + 0.015);
  osc1.type = 'sine';
  
  gain1.gain.setValueAtTime(volume, now);
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.035);
  
  osc1.start(now);
  osc1.stop(now + 0.035);
  
  // Add a subtle "thock" sound for satisfaction
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  
  osc2.frequency.setValueAtTime(200, now);
  osc2.frequency.exponentialRampToValueAtTime(80, now + 0.04);
  osc2.type = 'triangle';
  
  gain2.gain.setValueAtTime(volume * 0.6, now);
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
  
  osc2.start(now);
  osc2.stop(now + 0.05);
  
  // Add subtle white noise for texture
  const bufferSize = ctx.sampleRate * 0.03;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  const noise = ctx.createBufferSource();
  const noiseGain = ctx.createGain();
  const noiseFilter = ctx.createBiquadFilter();
  
  noise.buffer = noiseBuffer;
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 2000;
  
  noiseGain.gain.setValueAtTime(volume * 0.15, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.02);
  
  noise.start(now);
  noise.stop(now + 0.02);
}

export function FontCycler({ 
  text, 
  finalFont = '"Courier New", Consolas, Monaco, "Lucida Console", monospace',
  duration = 3000,
  delay = 0
}: FontCyclerProps) {
  const [currentFont, setCurrentFont] = useState(fonts[0]);
  const [currentStyle, setCurrentStyle] = useState(fontStyles[0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const startDelay = setTimeout(() => {
      setIsAnimating(true);
      startTimeRef.current = Date.now();
      
      const animate = () => {
        if (!startTimeRef.current) return;
        
        const elapsed = Date.now() - startTimeRef.current;
        
        if (elapsed >= duration) {
          setCurrentFont(finalFont);
          setCurrentStyle({ italic: false, weight: 'bold' });
          setIsAnimating(false);
          return;
        }

        // Calculate interval based on ease-out function (starts fast, slows down smoothly)
        const progress = elapsed / duration;
        const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease-out for smooth deceleration
        const interval = 10 + (easeOut * 350); // Start at 10ms, gradually increase to 360ms

        animationRef.current = window.setTimeout(() => {
          const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
          const randomStyle = fontStyles[Math.floor(Math.random() * fontStyles.length)];
          setCurrentFont(randomFont);
          setCurrentStyle(randomStyle);
          
          // Play switch click sound, quieter as we slow down
          const volume = 0.18 * (1 - progress * 0.5);
          playSwitchClick(volume);
          
          animate();
        }, interval);
      };

      animate();
    }, delay);

    return () => {
      clearTimeout(startDelay);
      if (animationRef.current !== null) {
        clearTimeout(animationRef.current);
      }
      setIsAnimating(false);
    };
  }, [duration, delay, finalFont]);

  return (
    <span 
      style={{ 
        fontFamily: currentFont,
        fontStyle: currentStyle.italic ? 'italic' : 'normal',
        fontWeight: currentStyle.weight
      }}
    >
      {text}
    </span>
  );
}
