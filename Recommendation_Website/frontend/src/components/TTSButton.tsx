'use client';

import { useState } from 'react';
import { Volume2, AlertCircle } from 'lucide-react';

interface TTSButtonProps {
  text: string;
  label?: string;
  language?: string;
}

const SUPPORTED_LANGUAGES = {
  'en-IN': 'English (India)',
  'hi-IN': 'Hindi',
  'gu-IN': 'Gujarati',
  'kn-IN': 'Kannada',
  'ml-IN': 'Malayalam',
  'mr-IN': 'Marathi',
  'ta-IN': 'Tamil',
  'te-IN': 'Telugu',
};

export default function TTSButton({ text, label, language = 'en-IN' }: TTSButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSpeak = () => {
    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if (!text && !label) {
      setError('Nothing to read');
      return;
    }

    // Use label if provided, otherwise use the actual text
    const textToSpeak = label || text;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsPlaying(true);
      setError(null);
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = (event) => {
      setError(`TTS Error: ${event.error}`);
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="relative">
      <button
        onClick={handleSpeak}
        title={`Read in ${SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES] || 'English'}`}
        className={`p-2 rounded-lg transition-all ${
          isPlaying
            ? 'bg-accent text-background'
            : 'bg-background border border-cards text-accent hover:bg-cards'
        }`}
        disabled={!text && !label}
      >
        <Volume2 size={16} />
      </button>

      {error && (
        <div className="absolute top-full mt-2 right-0 bg-red-900 text-red-200 text-xs p-2 rounded-lg whitespace-nowrap flex items-center gap-1 z-10">
          <AlertCircle size={12} />
          {error}
        </div>
      )}
    </div>
  );
}
