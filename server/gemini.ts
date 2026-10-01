import { GoogleGenAI } from '@google/genai';
import { STATIC_FALLBACK_ANSWERS, SUPPORTED_LANGUAGES } from '../src/data/translations';
import { LanguageCode } from '../src/types';

let genAIInstance: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIInstance) {
    genAIInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIInstance;
}

// Unicode script patterns for strict language validation
const SCRIPT_PATTERNS: Record<LanguageCode, RegExp> = {
  ta: /[\u0B80-\u0BFF]/g, // Tamil
  hi: /[\u0900-\u097F]/g, // Devanagari (Hindi)
  te: /[\u0C00-\u0C7F]/g, // Telugu
  kn: /[\u0C80-\u0CFF]/g, // Kannada
  ml: /[\u0D00-\u0D7F]/g, // Malayalam
  mr: /[\u0900-\u097F]/g, // Devanagari (Marathi)
  bn: /[\u0980-\u09FF]/g, // Bengali
  en: /[a-zA-Z]/g,        // English
};

/**
 * Validates that the AI response actually contains characters of the target language
 */
function validateLanguageScript(text: string, langCode: LanguageCode): boolean {
  if (langCode === 'en') return true;

  const scriptRegex = SCRIPT_PATTERNS[langCode];
  if (!scriptRegex) return true;

  const nativeMatches = text.match(scriptRegex);
  const nativeCount = nativeMatches ? nativeMatches.length : 0;

  // If the response contains fewer than 8 native script characters, it failed
  if (nativeCount < 8) {
    return false;
  }

  // Count Latin characters (excluding acceptable keywords like e-Shram, UAN, OTP, CSC, SMS, PIN)
  const strippedText = text.replace(/e-Shram|UAN|OTP|CSC|SMS|PIN|IFSC|https?:\/\/\S+/gi, '');
  const latinMatches = strippedText.match(/[a-zA-Z]/g);
  const latinCount = latinMatches ? latinMatches.length : 0;

  // If there are more Latin characters than native characters, it failed
  if (latinCount > nativeCount * 0.7) {
    return false;
  }

  return true;
}

/**
 * Resolve language code from input (could be code like 'ta', 'ta-IN', or name like 'Tamil')
 */
export function resolveLanguage(langInput?: string, langCodeInput?: string): {
  code: LanguageCode;
  name: string;
  speechCode: string;
  label: string;
} {
  const normalized = (langCodeInput || langInput || 'hi').toLowerCase().trim();

  const found = SUPPORTED_LANGUAGES.find(
    (l) =>
      l.code.toLowerCase() === normalized ||
      l.speechCode.toLowerCase() === normalized ||
      l.englishLabel.toLowerCase() === normalized ||
      l.label.toLowerCase() === normalized ||
      normalized.startsWith(l.code.toLowerCase())
  );

  if (found) {
    return {
      code: found.code,
      name: found.englishLabel,
      speechCode: found.speechCode,
      label: found.label,
    };
  }

  return {
    code: 'hi',
    name: 'Hindi',
    speechCode: 'hi-IN',
    label: 'हिन्दी',
  };
}

export async function handleChatMessage({
  message,
  language,
  language_code,
  actionKey,
  history = [],
}: {
  message: string;
  language?: string;
  language_code?: string;
  actionKey?: string;
  history?: Array<{ role: 'user' | 'model'; text: string }>;
}): Promise<{ reply: string; isFallback?: boolean; language: LanguageCode; language_code: string }> {
  const langMeta = resolveLanguage(language, language_code);
  const langCode = langMeta.code;

  const ai = getGenAI();

  // If API key is missing, return curated fallback immediately
  if (!ai) {
    const fallback =
      (actionKey && STATIC_FALLBACK_ANSWERS[langCode]?.[actionKey]) ||
      STATIC_FALLBACK_ANSWERS[langCode]?.register ||
      STATIC_FALLBACK_ANSWERS.en.register;
    return {
      reply: fallback,
      isFallback: true,
      language: langCode,
      language_code: langMeta.speechCode,
    };
  }

  // Developer / System instruction strictly enforcing selected language
  const systemInstruction = `You are Sakhi, a patient voice-first digital guide for first-time women users in India.

The user's selected language is: ${langMeta.name}
The user's language code is: ${langMeta.speechCode}

LANGUAGE RULE — ABSOLUTE:
Always reply only in the language selected by the user. If Tamil is selected, reply only in Tamil script.
You MUST reply entirely in the selected language (${langMeta.name}). Never switch to English.

If selected language is Tamil:
- Reply in Tamil script (தமிழ்).
- Do NOT translate the response into English.
- Do NOT use English sentences.
- Do NOT use English explanations.
- Use simple spoken Tamil that a person with little education can understand.
- Avoid unnecessary English technical words.
- If a government/service name must remain in English, such as e-Shram, keep only that proper name in English.
- Explain everything else in Tamil.

For example:
BAD: "e-Shram is a government portal. You can register yourself using Aadhaar."
GOOD: "e-Shram என்பது அமைப்புசாரா தொழிலாளர்களுக்கான அரசு இணையதளம். நீங்கள் இதில் பதிவு செய்யலாம். முதலில் உங்கள் ஆதார் அட்டை மற்றும் ஆதாருடன் இணைக்கப்பட்ட கைப்பேசி எண் தேவை."

If selected language is Hindi:
- Reply entirely in simple Hindi (हिन्दी) script.
- Do NOT use English sentences.

If selected language is Telugu:
- Reply entirely in simple Telugu (తెలుగు) script.
- Do NOT use English sentences.

If selected language is Kannada:
- Reply entirely in simple Kannada (ಕನ್ನಡ) script.
- Do NOT use English sentences.

If selected language is Malayalam:
- Reply entirely in simple Malayalam (മലയാളം) script.
- Do NOT use English sentences.

If selected language is Marathi:
- Reply entirely in simple Marathi (मराठी) script.
- Do NOT use English sentences.

If selected language is Bengali:
- Reply entirely in simple Bengali (বাংলা) script.
- Do NOT use English sentences.

If selected language is English:
- Reply in simple, friendly English.

NEVER silently switch to English.
The user's input language and selected UI language may be different.
ALWAYS prioritize the SELECTED LANGUAGE (${langMeta.name}).

IMPORTANT e-SHRAM BEHAVIOR:
- Keep answers short and beginner-friendly (2-3 sentences max).
- Give only ONE main next step at a time.
- Do not ask the user to understand technical terms.
- Never ask for: Aadhaar number, OTP, password, bank PIN, bank account number.
- Never claim that Sakhi completed government registration. Sakhi is only an informational guide.
- If information is uncertain, tell the user to check the official e-Shram website (https://www.eshram.gov.in/indexmain) or visit their nearest CSC (Common Service Centre / Jan Seva Kendra).

ELIGIBILITY & "WHO CAN REGISTER" RULES:
- When a user asks "Can I register?", "Am I eligible?", or about eligibility criteria, answer strictly in the selected language (${langMeta.name}) using these exact rules:
  1. Indian citizen.
  2. Age between 16 and 59 years.
  3. Working in the unorganised sector (e.g., daily wage labor, agriculture/farm work, domestic work, street vending, construction, gig/delivery work).
  4. Not a member of EPFO or ESIC.
  5. Not an income tax payer.
  6. Emphasize that registration is completely free, and if Aadhaar is not linked to mobile, they can visit a nearby CSC to register with fingerprint biometric.
- Suggest checking the official e-Shram portal (eshram.gov.in) or a CSC for final verification.
- Never promise or claim any specific cash benefit amounts that are not on the official portal.

PRESERVE LANGUAGE IN FOLLOW-UP QUESTIONS:
The conversation MUST remain in ${langMeta.name}. Do NOT suddenly respond in English in follow-up turns.`;

  try {
    const formattedHistory = history.slice(-4).map((h) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        ...formattedHistory,
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    let replyText = response.text?.trim() || '';

    // Step 6: LANGUAGE SAFETY CHECK
    // If the reply does not pass the script validation for the selected language, rewrite it!
    if (!validateLanguageScript(replyText, langCode)) {
      console.warn(
        `Language validation failed for ${langMeta.name}. Generated text had insufficient ${langMeta.name} characters. Triggering rewrite...`
      );

      const rewritePrompt = `Rewrite the following response entirely in simple ${langMeta.name}.
Keep only unavoidable proper names such as e-Shram in English.
Do not add new information.

Response:
${replyText}`;

      try {
        const rewriteResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: rewritePrompt,
          config: {
            systemInstruction: `You are a translator that outputs ONLY pure ${langMeta.name} script. Never use English sentences.`,
            temperature: 0.2,
          },
        });

        const rewrittenText = rewriteResponse.text?.trim();
        if (rewrittenText && validateLanguageScript(rewrittenText, langCode)) {
          replyText = rewrittenText;
        } else {
          // If rewrite also failed or still in English, fall back to curated native response
          const staticFallback =
            (actionKey && STATIC_FALLBACK_ANSWERS[langCode]?.[actionKey]) ||
            STATIC_FALLBACK_ANSWERS[langCode]?.register;
          if (staticFallback) {
            replyText = staticFallback;
          }
        }
      } catch (rewriteErr) {
        console.error('Rewrite failed:', rewriteErr);
        const staticFallback =
          (actionKey && STATIC_FALLBACK_ANSWERS[langCode]?.[actionKey]) ||
          STATIC_FALLBACK_ANSWERS[langCode]?.register;
        if (staticFallback) {
          replyText = staticFallback;
        }
      }
    }

    if (replyText) {
      return {
        reply: replyText,
        language: langCode,
        language_code: langMeta.speechCode,
      };
    }
  } catch (error) {
    console.error('Gemini API error, falling back to static response:', error);
  }

  // Graceful fallback
  const fallback =
    (actionKey && STATIC_FALLBACK_ANSWERS[langCode]?.[actionKey]) ||
    STATIC_FALLBACK_ANSWERS[langCode]?.register ||
    STATIC_FALLBACK_ANSWERS.en.register;

  return {
    reply: fallback,
    isFallback: true,
    language: langCode,
    language_code: langMeta.speechCode,
  };
}

// Server-side in-memory audio cache to prevent duplicate TTS API calls
const ttsAudioCache = new Map<string, { audioBase64: string; mimeType: string }>();

/**
 * Generates speech audio for answer text using Gemini TTS
 */
export async function handleGenerateSpeech({
  text,
  language,
  language_code,
}: {
  text: string;
  language?: string;
  language_code?: string;
}): Promise<{ audioBase64: string; mimeType: string }> {
  if (!text || !text.trim()) {
    throw new Error('Text is required for TTS');
  }

  const langMeta = resolveLanguage(language, language_code);
  const cleanText = text.replace(/[*_#`~>]/g, '').trim();

  // Check cache
  const cacheKey = `${langMeta.code}:${cleanText}`;
  if (ttsAudioCache.has(cacheKey)) {
    return ttsAudioCache.get(cacheKey)!;
  }

  const ai = getGenAI();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured on the server');
  }

  // Models to try:
  // Primary model requested by user: 'gemini-2.5-flash-preview-tts', fallback to 'gemini-3.8-flash-lite-tts'
  const candidateModels = [
    'gemini-2.5-flash-preview-tts',
    'gemini-3.8-flash-lite-tts',
    'gemini-3.8-flash-tts',
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanText,
                speechMetadata: {
                  style: `Clear, warm, friendly woman assistant speaking natural ${langMeta.name}`,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Kore',
              },
            },
          },
        },
      });

      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData?.data) {
            const result = {
              audioBase64: part.inlineData.data,
              mimeType: part.inlineData.mimeType || 'audio/wav',
            };
            if (ttsAudioCache.size > 200) {
              const firstKey = ttsAudioCache.keys().next().value;
              if (firstKey) ttsAudioCache.delete(firstKey);
            }
            ttsAudioCache.set(cacheKey, result);
            return result;
          }
        }
      }
    } catch (err: any) {
      console.warn(`TTS generation with model ${model} failed:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('No audio returned from Gemini TTS models');
}

