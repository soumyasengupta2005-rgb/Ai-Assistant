import { useState, useCallback, useRef } from 'react';

export type SpeechStatus = 'idle' | 'listening' | 'speaking' | 'thinking';

const synth = window.speechSynthesis;

export function useSpeech() {
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const recognitionRef = useRef<any>(null);

  const speak = useCallback((text: string, rate = 1, pitch = 1, voice?: SpeechSynthesisVoice) => {
    return new Promise<void>((resolve) => {
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1;
      if (voice) utterance.voice = voice;
      utterance.onstart = () => setStatus('speaking');
      utterance.onend = () => { setStatus('idle'); resolve(); };
      utterance.onerror = () => { setStatus('idle'); resolve(); };
      synth.speak(utterance);
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    synth.cancel();
    setStatus('idle');
  }, []);

  const startListening = useCallback((onResult: (text: string) => void, onError?: () => void) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError?.();
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setStatus('listening');
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      onResult(transcript);
    };
    recognition.onerror = () => {
      setStatus('idle');
      onError?.();
    };
    recognition.onend = () => {
      setStatus('idle');
    };
    recognition.start();
  }, [status]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setStatus('idle');
  }, []);

  const setThinking = useCallback(() => setStatus('thinking'), []);
  const setIdle = useCallback(() => setStatus('idle'), []);

  return { status, setStatus, speak, stopSpeaking, startListening, stopListening, setThinking, setIdle };
}

export function getVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    let voices = synth.getVoices();
    if (voices.length > 0) { resolve(voices); return; }
    synth.onvoiceschanged = () => resolve(synth.getVoices());
  });
}
