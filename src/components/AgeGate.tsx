import React, { useState } from 'react';
import { TranslationStrings, LanguageCode } from '../types';
import sakhiAvatar from '../assets/images/sakhi_guide_avatar_1790839146871.jpg';
import { Sparkles, ArrowLeft, Volume2, Mic, MicOff, Info, HelpCircle } from 'lucide-react';

interface AgeGateProps {
  currentLanguage: LanguageCode;
  t: TranslationStrings;
  onVerified: () => void;
  onSpeakText?: (text: string) => void;
}

type AgeStatus = 'idle' | 'below_16' | 'sixty_plus';

export const AgeGate: React.FC<AgeGateProps> = ({
  t,
  onVerified,
  onSpeakText,
}) => {
  const [ageStatus, setAgeStatus] = useState<AgeStatus>('idle');
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const handleSelectAge = (range: 'below16' | '16to59' | '60plus') => {
    setVoiceNotice(null);
    if (range === '16to59') {
      try {
        localStorage.setItem('sakhi_age_verified', 'true');
      } catch (e) {
        console.warn('localStorage not accessible, using in-memory state:', e);
      }
      onVerified();
    } else if (range === 'below16') {
      setAgeStatus('below_16');
      if (onSpeakText) {
        onSpeakText(t.ageBelow16Message);
      }
    } else if (range === '60plus') {
      setAgeStatus('sixty_plus');
      if (onSpeakText) {
        onSpeakText(t.age60PlusMessage);
      }
    }
  };

  const handleVoiceAgeAnswer = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceNotice(t.ageVoiceUnclear);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN'; // Will detect numbers and words
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = (event.results[0]?.[0]?.transcript || '').toLowerCase().trim();
        setIsListening(false);

        // Check for 16-59 keywords
        if (
          transcript.includes('16') ||
          transcript.includes('59') ||
          transcript.includes('yes') ||
          transcript.includes('बीच') ||
          transcript.includes('முதல்') ||
          transcript.includes('మధ్య') ||
          transcript.includes('ನಡುವೆ') ||
          /\b(1[6-9]|[2-5][0-9])\b/.test(transcript)
        ) {
          handleSelectAge('16to59');
          return;
        }

        // Check for below 16 keywords
        if (
          transcript.includes('below') ||
          transcript.includes('under') ||
          transcript.includes('कम') ||
          transcript.includes('கீழ்') ||
          transcript.includes('తక్కువ') ||
          transcript.includes('ಕಡಿಮೆ') ||
          /\b([0-9]|1[0-5])\b/.test(transcript)
        ) {
          handleSelectAge('below16');
          return;
        }

        // Check for 60 or above keywords
        if (
          transcript.includes('60') ||
          transcript.includes('above') ||
          transcript.includes('senior') ||
          transcript.includes('अधिक') ||
          transcript.includes('மேல்') ||
          transcript.includes('ఎక్కువ') ||
          transcript.includes('ಹೆಚ್ಚು') ||
          /\b([6-9][0-9]|1[0-9][0-9])\b/.test(transcript)
        ) {
          handleSelectAge('60plus');
          return;
        }

        // Unclear speech
        setVoiceNotice(t.ageVoiceUnclear);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceNotice(t.ageVoiceUnclear);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceNotice(t.ageVoiceUnclear);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF7ED] to-[#FFE8D1] relative overflow-hidden flex flex-col justify-between p-4 sm:p-6 max-w-[480px] mx-auto transition-all animate-in fade-in duration-300">
      {/* Decorative Background Blurred Blobs */}
      <div
        className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-[#FFB347] opacity-25 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-20 right-1/4 w-72 h-72 rounded-full bg-[#F9A8D4] opacity-20 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Header Card */}
      <header className="relative z-10 pt-4 pb-2 text-center">
        <div className="inline-flex items-center justify-center p-1 rounded-full bg-gradient-to-tr from-[#FF7A18] to-[#FF3D6E] mb-3 shadow-md">
          <img
            src={sakhiAvatar}
            alt={t.appNameLocal}
            referrerPolicy="no-referrer"
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white shadow-sm"
          />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-orange-200/80 text-xs font-bold text-orange-950 mb-2 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          <span>{t.appNameLocal}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E1B4B]">
          {t.ageQuestionTitle}
        </h1>
        <p className="text-sm sm:text-base text-slate-700 font-medium px-3 mt-1 leading-snug">
          {t.ageQuestionSubtitle}
        </p>

        {/* Read Question Aloud Button */}
        {onSpeakText && (
          <button
            type="button"
            onClick={() => onSpeakText(`${t.ageQuestionTitle}. ${t.ageQuestionSubtitle}`)}
            className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-orange-200 text-xs sm:text-sm font-bold text-orange-900 shadow-2xs hover:bg-orange-50 active:scale-95 transition-all cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-orange-600" />
            <span>{t.listenToSakhi}</span>
          </button>
        )}
      </header>

      {/* Main Choice or Response Content */}
      <main className="relative z-10 my-4 flex-1 flex flex-col justify-center">
        {ageStatus === 'idle' ? (
          <div className="space-y-3.5 w-full">
            {/* Option 1: Below 16 */}
            <button
              type="button"
              onClick={() => handleSelectAge('below16')}
              className="w-full min-h-[56px] py-4 px-5 rounded-3xl bg-white/90 backdrop-blur-md border border-white/80 hover:border-orange-200 text-[#1E1B4B] font-bold text-base sm:text-lg shadow-md shadow-orange-950/5 hover:shadow-lg transition-all active:scale-95 flex items-center justify-between text-left cursor-pointer group"
            >
              <span>{t.ageBelow16}</span>
              <span className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-xs font-bold text-orange-800 group-hover:bg-orange-100 transition-colors">
                &lt;16
              </span>
            </button>

            {/* Option 2: 16 to 59 (Primary Gradient Button) */}
            <button
              type="button"
              onClick={() => handleSelectAge('16to59')}
              className="w-full min-h-[60px] py-4 px-5 rounded-3xl bg-gradient-to-r from-[#FF7A18] via-[#FF5E4D] to-[#FF3D6E] text-white font-extrabold text-lg sm:text-xl shadow-xl shadow-orange-500/35 hover:brightness-105 transition-all active:scale-95 flex items-center justify-between text-left cursor-pointer ring-2 ring-white/60"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-200 shrink-0" />
                <span>{t.age16to59}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black tracking-wider uppercase">
                Eligible
              </span>
            </button>

            {/* Option 3: 60 or above */}
            <button
              type="button"
              onClick={() => handleSelectAge('60plus')}
              className="w-full min-h-[56px] py-4 px-5 rounded-3xl bg-white/90 backdrop-blur-md border border-white/80 hover:border-orange-200 text-[#1E1B4B] font-bold text-base sm:text-lg shadow-md shadow-orange-950/5 hover:shadow-lg transition-all active:scale-95 flex items-center justify-between text-left cursor-pointer group"
            >
              <span>{t.age60Plus}</span>
              <span className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-xs font-bold text-orange-800 group-hover:bg-orange-100 transition-colors">
                60+
              </span>
            </button>

            {/* Voice microphone option for hands-free answering */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleVoiceAgeAnswer}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full transition-all active:scale-95 cursor-pointer shadow-xs ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-white/80 hover:bg-white text-slate-700 border border-orange-200'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span className="text-xs font-bold">{t.listeningState}</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-[#FF7A18]" />
                    <span className="text-xs font-bold">{t.ageVoiceHint}</span>
                  </>
                )}
              </button>
            </div>

            {/* Voice warning if speech unclear */}
            {voiceNotice && (
              <div className="p-3 bg-rose-50/90 border border-rose-200 rounded-2xl text-rose-900 text-xs font-medium text-center">
                {voiceNotice}
              </div>
            )}
          </div>
        ) : ageStatus === 'below_16' ? (
          /* Below 16 Kind Guidance Card */
          <div className="p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-white/80 border-l-4 border-l-[#FF7A18] shadow-xl shadow-orange-950/10 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-orange-100 text-[#FF7A18] rounded-2xl shrink-0 mt-0.5 shadow-2xs">
                <Info className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1E1B4B]">
                  {t.ageBelow16}
                </h3>
                <p className="text-base text-slate-700 font-medium mt-2 leading-relaxed">
                  {t.ageBelow16Message}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setAgeStatus('idle');
                setVoiceNotice(null);
              }}
              className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
              <span>{t.goBack}</span>
            </button>
          </div>
        ) : (
          /* 60 or above Kind Guidance Card */
          <div className="p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-white/80 border-l-4 border-l-sky-500 shadow-xl shadow-sky-950/10 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-sky-100 text-sky-700 rounded-2xl shrink-0 mt-0.5 shadow-2xs">
                <HelpCircle className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1E1B4B]">
                  {t.age60Plus}
                </h3>
                <p className="text-base text-slate-700 font-medium mt-2 leading-relaxed">
                  {t.age60PlusMessage}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setAgeStatus('idle');
                setVoiceNotice(null);
              }}
              className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
              <span>{t.goBack}</span>
            </button>
          </div>
        )}
      </main>

      {/* Safety Notice Footer */}
      <footer className="relative z-10 pt-2 pb-4 text-center">
        <p className="text-xs text-slate-500 font-medium">
          {t.officialWebsiteDisclaimer}
        </p>
      </footer>
    </div>
  );
};
