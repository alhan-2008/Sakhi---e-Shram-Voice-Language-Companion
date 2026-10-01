import { LanguageCode } from '../types';
import { STATIC_FALLBACK_ANSWERS, SUPPORTED_LANGUAGES } from '../data/translations';

export interface SendMessageOptions {
  message: string;
  language: LanguageCode;
  actionKey?: string;
  history?: Array<{ role: 'user' | 'model'; text: string }>;
}

export interface ApiResponse {
  reply: string;
  isFallback?: boolean;
  language: LanguageCode;
  language_code?: string;
}

export async function askSakhi(options: SendMessageOptions): Promise<ApiResponse> {
  const langMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === options.language) ||
    SUPPORTED_LANGUAGES[0];

  const payload = {
    message: options.message,
    language: langMeta.englishLabel, // e.g. "Tamil", "Hindi", "Telugu"
    language_code: langMeta.speechCode, // e.g. "ta-IN", "hi-IN", "te-IN"
    language_id: options.language, // e.g. "ta", "hi", "te"
    actionKey: options.actionKey,
    history: options.history,
  };

  try {
    const response = await fetch('/api/help', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.reply) {
      return {
        reply: data.reply,
        isFallback: data.isFallback,
        language: data.language || options.language,
        language_code: data.language_code || langMeta.speechCode,
      };
    }
    throw new Error('No reply in response');
  } catch (error) {
    console.warn('API call failed, serving static fallback in selected language:', error);
    const { language, actionKey } = options;
    const fallbackText =
      (actionKey && STATIC_FALLBACK_ANSWERS[language]?.[actionKey]) ||
      STATIC_FALLBACK_ANSWERS[language]?.register ||
      STATIC_FALLBACK_ANSWERS.en.register;

    return {
      reply: fallbackText,
      isFallback: true,
      language,
      language_code: langMeta.speechCode,
    };
  }
}

export interface TTSResponse {
  audioBase64: string;
  mimeType: string;
}

export async function fetchGeminiTTS(text: string, language: LanguageCode): Promise<TTSResponse> {
  const langMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) ||
    SUPPORTED_LANGUAGES[0];

  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      language: langMeta.englishLabel,
      language_code: langMeta.speechCode,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `TTS request failed with status ${response.status}`);
  }

  const data = await response.json();
  if (!data.audioBase64) {
    throw new Error('No audio returned from TTS endpoint');
  }
  return data;
}

