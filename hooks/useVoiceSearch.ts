
import { useState, useCallback, useRef, useEffect } from 'react';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'error' | 'success';

export const useVoiceSearch = (onResult: (text: string) => void) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef(onResult);
  const silenceTimer = useRef<number | null>(null);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
    };
  }, []);

  const reset = useCallback(() => {
    setVoiceState('idle');
    setInterimTranscript('');
    setError(null);
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (voiceState === 'listening') {
       setVoiceState('processing');
    }
  }, [voiceState]);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceState('error');
      setError('Voice API not supported.');
      return;
    }

    if (voiceState === 'listening') {
      stopListening();
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = navigator.language || 'en-US';

      // Watchdog: 8s timeout
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      silenceTimer.current = window.setTimeout(() => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch(e){}
        }
        // Only show timeout error if we haven't transitioned to processing/success
        setVoiceState(prev => {
            if (prev === 'listening') {
                setError('Listening timed out.');
                return 'error';
            }
            return prev;
        });
      }, 8000);

      recognition.onstart = () => {
        setVoiceState('listening');
        setInterimTranscript('');
        setError(null);
      };

      recognition.onend = () => {
        if (silenceTimer.current) clearTimeout(silenceTimer.current);
        // Provide a small buffer to allow success state to settle
        setTimeout(() => {
            setVoiceState(prev => {
                if (prev === 'listening' || prev === 'processing') {
                    // If stuck in listening/processing without success
                    return 'idle';
                }
                return prev;
            });
        }, 500);
      };

      recognition.onerror = (event: any) => {
        if (silenceTimer.current) clearTimeout(silenceTimer.current);
        console.warn('Dragon Voice Error:', event.error);
        
        // Map errors to user-friendly messages
        switch (event.error) {
            case 'no-speech':
                setVoiceState('error');
                setError('No speech detected.');
                break;
            case 'audio-capture':
                setVoiceState('error');
                setError('Microphone not found.');
                break;
            case 'not-allowed':
                setVoiceState('error');
                setError('Microphone permission denied.');
                break;
            case 'network':
                setVoiceState('error');
                setError('Network connection failed.');
                break;
            case 'aborted':
                setVoiceState('idle');
                setError(null);
                break;
            default:
                setVoiceState('error');
                setError('Recognition failed.');
        }
      };

      recognition.onresult = (event: any) => {
        if (silenceTimer.current) clearTimeout(silenceTimer.current);
        // Refresh watchdog on activity
        silenceTimer.current = window.setTimeout(() => {
            try { recognition.stop(); } catch(e){}
        }, 3000);

        let final = '';
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          setVoiceState('processing');
          setInterimTranscript(final);
          
          setTimeout(() => {
            setVoiceState('success');
            if (onResultRef.current) {
                onResultRef.current(final.trim());
            }
            setTimeout(() => reset(), 1000);
          }, 500);
        } else {
          setInterimTranscript(interim);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (error) {
      console.error("Dragon Voice Init Failure:", error);
      setVoiceState('error');
      setError('Initialization failed.');
    }
  }, [voiceState, stopListening, reset]);

  return { 
    isListening: voiceState === 'listening',
    voiceState,
    interimTranscript, 
    error,
    startListening, 
    stopListening,
    reset
  };
};
