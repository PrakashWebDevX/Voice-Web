'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

// Use any-typed interface to avoid TypeScript DOM lib dependency issues
interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

export default function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimText(interim);
      if (final) {
        onTranscript(final);
        setInterimText('');
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'aborted') {
        toast.error(`Voice error: ${event.error}`);
      }
      setIsListening(false);
      setInterimText('');
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
    };

    recognitionRef.current = recognition;
  }, [onTranscript]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.success('Listening…', { duration: 1500 });
      } catch {
        toast.error('Could not start voice input');
      }
    }
  }, [isListening]);

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted font-mono">
        <MicOff size={14} />
        <span>Voice not supported in this browser</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={toggleListening}
        disabled={disabled}
        type="button"
        className={cn(
          'relative flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm font-semibold transition-all border',
          isListening
            ? 'bg-red-500/10 border-red-500/50 text-red-400 animate-pulse-acid'
            : 'bg-surface-2 border-border hover:border-acid/40 hover:text-acid text-muted',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {/* Ripple when listening */}
        {isListening && (
          <>
            <motion.span
              className="absolute inset-0 rounded-lg border border-red-400"
              animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <motion.span
              className="absolute inset-0 rounded-lg border border-red-400"
              animate={{ scale: [1, 1.6], opacity: [0.3, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
            />
          </>
        )}

        {isListening ? (
          <>
            <Square size={14} className="fill-red-400 text-red-400" />
            <span>Stop</span>
          </>
        ) : (
          <>
            <Mic size={14} />
            <span>Speak</span>
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {interimText && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs font-mono text-muted italic truncate max-w-[200px]"
          >
            "{interimText}…"
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}