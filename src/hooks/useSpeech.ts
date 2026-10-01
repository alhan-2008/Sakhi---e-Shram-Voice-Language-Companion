import { useState, useEffect, useRef, useCallback } from 'react';
import { LanguageCode } from '../types';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../data/translations';
import { fetchGeminiTTS } from '../services/api';

// Web Speech API interface definitions
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface VoiceDebugInfo {
  langCode: string;
  voiceName: string;
  hasNativeVoice: boolean;
  engine: 'gemini' | 'browser' | 'none';
}

/**
 * Searches for a browser voice matching the requested language
 */
export function findMatchingVoice(
  langCode: LanguageCode,
  speechCode: string,
  availableVoices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  if (!availableVoices || availableVoices.length === 0) return null;

  const targetCode = speechCode.toLowerCase().replace('_', '-');
  const prefix = targetCode.split('-')[0]; // e.g. 'ta', 'hi', 'te'

  // 1. Exact match e.g. 'ta-in'
  const exactMatch = availableVoices.find(
    (v) => v.lang.toLowerCase().replace('_', '-') === targetCode
  );
  if (exactMatch) return exactMatch;

  // 2. Prefix match e.g. starts with 'ta-' or is 'ta'
  const prefixMatch = availableVoices.find((v) => {
    const vLang = v.lang.toLowerCase().replace('_', '-');
    return vLang.startsWith(`${prefix}-`) || vLang === prefix;
  });
  if (prefixMatch) return prefixMatch;

  // 3. Name-based match for Indian languages
  const nameKeywords: Record<LanguageCode, string[]> = {
    ta: ['tamil', 'தமிழ்'],
    hi: ['hindi', 'हिन्दी', 'हिंदी'],
    te: ['telugu', 'తెలుగు'],
    kn: ['kannada', 'ಕನ್ನಡ'],
    ml: ['malayalam', 'മലയാളം'],
    mr: ['marathi', 'मराठी'],
    bn: ['bengali', 'bangla', 'বাংলা'],
    en: ['english', 'india', 'en-in', 'en_in'],
  };

  const keywords = nameKeywords[langCode] || [];
  const nameMatch = availableVoices.find((v) => {
    const vName = v.name.toLowerCase();
    return keywords.some((kw) => vName.includes(kw));
  });
  if (nameMatch) return nameMatch;

  return null;
}

/**
 * Splits text into short sentences for browser TTS fallback
 */
function splitIntoSentences(text: string): string[] {
  const rawParts = text.split(/(?<=[.!?।\n])\s+/);
  const sentences: string[] = [];

  for (const part of rawParts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed.length > 140) {
      const subParts = trimmed.split(/(?<=[,;])\s+/);
      for (const sp of subParts) {
        if (sp.trim()) sentences.push(sp.trim());
      }
    } else {
      sentences.push(trimmed);
    }
  }

  return sentences.length > 0 ? sentences : [text];
}

export function useSpeech(currentLanguage: LanguageCode) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeakingTextId, setActiveSpeakingTextId] = useState<string | null>(null);
  const [speechStatusText, setSpeechStatusText] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const [micError, setMicError] = useState<string | null>(null);

  // Available browser voices
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [debugVoiceInfo, setDebugVoiceInfo] = useState<VoiceDebugInfo | null>(null);

  // Client-side cache for Gemini TTS audio: key = messageId or textHash -> { dataUrl, mimeType }
  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const activeAudioElementRef = useRef<HTMLAudioElement | null>(null);

  const recognitionRef = useRef<any>(null);
  const onTranscriptRef = useRef<((text: string) => void) | null>(null);
  const activeMessageIdRef = useRef<string | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  const langInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) ||
    SUPPORTED_LANGUAGES[0];

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  // Load and listen for browser voices asynchronously
  const updateVoices = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    const available = window.speechSynthesis.getVoices();
    if (available && available.length > 0) {
      setBrowserVoices(available);
      const matched = findMatchingVoice(currentLanguage, langInfo.speechCode, available);
      setDebugVoiceInfo({
        langCode: langInfo.speechCode,
        voiceName: 'Gemini Natural Voice (gemini-2.5-flash-preview-tts)',
        hasNativeVoice: true,
        engine: 'gemini',
      });
    }
  }, [currentLanguage, langInfo.speechCode]);

  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecognitionSupported(false);
    }

    if ('speechSynthesis' in window) {
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if (activeAudioElementRef.current) {
        activeAudioElementRef.current.pause();
        activeAudioElementRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [updateVoices]);

  // Stop speaking (audio element or browser TTS)
  const stopSpeaking = useCallback(() => {
    isCancelledRef.current = true;
    if (activeAudioElementRef.current) {
      activeAudioElementRef.current.pause();
      activeAudioElementRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setActiveSpeakingTextId(null);
    setSpeechStatusText(null);
    activeMessageIdRef.current = null;
  }, []);

  /**
   * Browser SpeechSynthesis Fallback:
   * Only called if Gemini TTS fails AND a native voice exists for the target language.
   * NEVER reads Tamil/Hindi with an English voice!
   */
  const playBrowserTTSFallback = useCallback(
    (cleanText: string, targetMessageId: string) => {
      const currentVoices =
        browserVoices.length > 0
          ? browserVoices
          : 'speechSynthesis' in window
          ? window.speechSynthesis.getVoices()
          : [];

      const matchedVoice = findMatchingVoice(
        currentLanguage,
        langInfo.speechCode,
        currentVoices
      );

      // Rule 4: NEVER read Tamil or other non-English language with an English voice
      if (currentLanguage !== 'en' && !matchedVoice) {
        console.warn(`No native voice found for ${currentLanguage}. Blocking English voice fallback.`);
        setSpeechError(t.voiceNotAvailableNotice);
        setIsSpeaking(false);
        setActiveSpeakingTextId(null);
        setSpeechStatusText(null);
        activeMessageIdRef.current = null;
        return;
      }

      if (!('speechSynthesis' in window)) {
        setSpeechError(t.voiceNotAvailableNotice);
        setIsSpeaking(false);
        setActiveSpeakingTextId(null);
        return;
      }

      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const sentenceChunks = splitIntoSentences(cleanText);
      let currentSentenceIndex = 0;

      const speakNextChunk = () => {
        if (isCancelledRef.current || activeMessageIdRef.current !== targetMessageId) {
          setIsSpeaking(false);
          setActiveSpeakingTextId(null);
          setSpeechStatusText(null);
          return;
        }

        if (currentSentenceIndex >= sentenceChunks.length) {
          setIsSpeaking(false);
          setActiveSpeakingTextId(null);
          setSpeechStatusText(null);
          activeMessageIdRef.current = null;
          return;
        }

        const chunk = sentenceChunks[currentSentenceIndex];
        currentSentenceIndex++;

        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.lang = langInfo.speechCode;
        utterance.volume = 1;
        utterance.rate = 0.9;
        utterance.pitch = 1;

        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }

        utterance.onstart = () => {
          if (!isCancelledRef.current && activeMessageIdRef.current === targetMessageId) {
            setIsSpeaking(true);
            setSpeechStatusText(t.sakhiSpeaking);
          }
        };

        utterance.onend = () => {
          if (!isCancelledRef.current && activeMessageIdRef.current === targetMessageId) {
            speakNextChunk();
          }
        };

        utterance.onerror = (e) => {
          console.warn('Browser TTS error:', e.error);
          setIsSpeaking(false);
          setActiveSpeakingTextId(null);
          setSpeechStatusText(null);
          activeMessageIdRef.current = null;
        };

        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      };

      speakNextChunk();
    },
    [browserVoices, currentLanguage, langInfo.speechCode, t.sakhiSpeaking, t.voiceNotAvailableNotice]
  );

  /**
   * Main speech playback function:
   * 1. Check client audio cache.
   * 2. Call Gemini TTS API (gemini-2.5-flash-preview-tts / gemini-3.8-flash-lite-tts).
   * 3. Play audio via HTML5 Audio element synchronously on user tap.
   * 4. Fall back to browser TTS ONLY if native voice exists.
   */
  const speakText = useCallback(
    async (text: string, messageId?: string) => {
      const targetMessageId = messageId || 'speech-' + Date.now();

      // If user taps on the message currently speaking, stop it
      if (isSpeaking && activeSpeakingTextId === targetMessageId) {
        stopSpeaking();
        return;
      }

      stopSpeaking();

      isCancelledRef.current = false;
      activeMessageIdRef.current = targetMessageId;
      setActiveSpeakingTextId(targetMessageId);
      setIsSpeaking(true);
      setSpeechError(null);
      setSpeechStatusText(t.loadingVoice);

      const cleanText = text.replace(/[*_#`~>]/g, '').trim();
      if (!cleanText) {
        stopSpeaking();
        return;
      }

      // Check cache first
      const cacheKey = `${currentLanguage}:${targetMessageId}`;
      let audioDataUrl = audioCacheRef.current.get(cacheKey);

      if (!audioDataUrl) {
        try {
          const ttsResult = await fetchGeminiTTS(cleanText, currentLanguage);
          audioDataUrl = `data:${ttsResult.mimeType};base64,${ttsResult.audioBase64}`;
          audioCacheRef.current.set(cacheKey, audioDataUrl);
        } catch (apiErr: any) {
          console.warn('Gemini TTS failed, attempting browser voice fallback:', apiErr?.message || apiErr);
          // Try browser TTS fallback if native voice exists
          playBrowserTTSFallback(cleanText, targetMessageId);
          return;
        }
      }

      if (isCancelledRef.current || activeMessageIdRef.current !== targetMessageId) {
        return;
      }

      try {
        const audio = new Audio(audioDataUrl);
        activeAudioElementRef.current = audio;

        audio.onplay = () => {
          if (!isCancelledRef.current && activeMessageIdRef.current === targetMessageId) {
            setIsSpeaking(true);
            setSpeechStatusText(t.sakhiSpeaking);
          }
        };

        audio.onended = () => {
          if (activeMessageIdRef.current === targetMessageId) {
            setIsSpeaking(false);
            setActiveSpeakingTextId(null);
            setSpeechStatusText(null);
            activeMessageIdRef.current = null;
            activeAudioElementRef.current = null;
          }
        };

        audio.onerror = (e) => {
          console.warn('Audio playback error:', e);
          // Fall back to browser TTS
          playBrowserTTSFallback(cleanText, targetMessageId);
        };

        await audio.play();

        setDebugVoiceInfo({
          langCode: langInfo.speechCode,
          voiceName: 'Gemini Natural Voice (gemini-2.5-flash-preview-tts)',
          hasNativeVoice: true,
          engine: 'gemini',
        });
      } catch (playErr: any) {
        console.warn('HTML Audio play error, trying browser fallback:', playErr);
        playBrowserTTSFallback(cleanText, targetMessageId);
      }
    },
    [
      isSpeaking,
      activeSpeakingTextId,
      currentLanguage,
      langInfo.speechCode,
      t.loadingVoice,
      t.sakhiSpeaking,
      stopSpeaking,
      playBrowserTTSFallback,
    ]
  );

  /**
   * Safe microphone listening requested ONLY on user tap
   */
  const startListening = useCallback(
    async (onTranscript: (text: string) => void) => {
      const win = window as unknown as IWindow;
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setRecognitionSupported(false);
        return;
      }

      setMicError(null);
      stopSpeaking();

      // Explicitly request user media on tap
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Stop media stream tracks after permission verification so SpeechRecognition can take over
          stream.getTracks().forEach((track) => track.stop());
        } catch (mediaErr: any) {
          console.warn('Microphone permission not granted:', mediaErr?.name || mediaErr);
          setMicError('mic_permission_denied');
          setIsListening(false);
          return;
        }
      }

      try {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch {
            // ignore
          }
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        onTranscriptRef.current = onTranscript;

        recognition.lang = langInfo.speechCode;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0]?.[0]?.transcript;
          if (transcript && onTranscriptRef.current) {
            onTranscriptRef.current(transcript);
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.warn('Speech recognition status:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setMicError('mic_permission_denied');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch (err) {
        console.warn('Could not start recognition:', err);
        setIsListening(false);
      }
    },
    [langInfo.speechCode, stopSpeaking]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const dismissMicError = useCallback(() => {
    setMicError(null);
  }, []);

  return {
    isListening,
    isSpeaking,
    activeSpeakingTextId,
    speechStatusText,
    speechError,
    speechSupported,
    recognitionSupported,
    micError,
    voiceNotice,
    debugVoiceInfo,
    speakText,
    stopSpeaking,
    startListening,
    stopListening,
    dismissMicError,
  };
}
