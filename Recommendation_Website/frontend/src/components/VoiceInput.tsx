'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceInputProps {
    onResult: (text: string) => void;
    placeholder?: string;
    className?: string;
    lang?: string;
}

export default function VoiceInput({ onResult, className = "", lang = 'en-IN' }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                setIsSupported(true);
            }
        }
    }, []);

    const [showNudge, setShowNudge] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);

    const toggleListening = useCallback(() => {
        if (isListening && recognition) {
            recognition.stop();
            setIsListening(false);
            setShowNudge(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const newRecognition = new SpeechRecognition();

        newRecognition.continuous = true;
        newRecognition.interimResults = false;
        newRecognition.lang = lang; // Use the provided lang (defaults to en-IN)

        newRecognition.onstart = () => {
            setIsListening(true);
            // Show nudge after 1.5 seconds of listening
            setTimeout(() => setShowNudge(true), 1500);
        };

        newRecognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                onResult(finalTranscript.trim());
            }
        };

        newRecognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            setShowNudge(false);
        };

        newRecognition.onend = () => {
            setIsListening(false);
            setShowNudge(false);
        };

        newRecognition.start();
        setRecognition(newRecognition);
    }, [isListening, recognition, onResult]);

    if (!isSupported) return null;

    return (
        <div className={`relative flex items-center ${className}`}>
            <AnimatePresence>
                {isListening && showNudge && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: 20, y: 10 }}
                        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute bottom-full right-full mb-2 mr-2 pointer-events-none flex flex-col items-end whitespace-nowrap"
                    >
                        <span className="text-accent italic font-medium text-sm drop-shadow-sm mb-1">
                            Tap when you're done!
                        </span>
                        <svg 
                            width="40" 
                            height="30" 
                            viewBox="0 0 40 30" 
                            fill="none" 
                            className="text-accent -mr-2"
                        >
                            <path 
                                d="M5 5C15 5 25 10 35 25M35 25L30 20M35 25L38 18" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            />
                        </svg>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-full transition-all duration-300 relative ${
                    isListening 
                    ? 'bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                    : 'bg-accent/10 text-accent hover:bg-accent/20'
                }`}
                title={isListening ? "Listening..." : "Speak instead of typing"}
            >
                <AnimatePresence mode="wait">
                    {isListening ? (
                        <motion.div
                            key="mic-on"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: [1, 1.2, 1], opacity: 1 }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            <Mic size={18} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="mic-off"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            <Mic size={18} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>
            
            {isListening && (
                <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute left-full ml-3 text-xs font-medium text-red-500 whitespace-nowrap"
                >
                    Listening...
                </motion.span>
            )}
        </div>
    );
}
