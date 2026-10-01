import React from 'react';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../data/translations';
import { LanguageCode } from '../types';
import { Volume2, CheckCircle2, Globe2 } from 'lucide-react';
import sakhiAvatar from '../assets/images/sakhi_guide_avatar_1790839146871.jpg';
import { findMatchingVoice } from '../hooks/useSpeech';

interface LanguageSelectorProps {
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onClose?: () => void;
  isInitialScreen?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onSelectLanguage,
  onClose,
  isInitialScreen = false,
}) => {
  const currentT = TRANSLATIONS[currentLanguage];

  const handlePlaySample = (
    e: React.MouseEvent,
    langCode: LanguageCode,
    speechCode: string,
    greeting: string
  ) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = findMatchingVoice(langCode, speechCode, voices);

    if (langCode !== 'en' && !matchedVoice) {
      console.warn(`No native voice installed for ${speechCode}. Skipping audio preview.`);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(greeting);
    utterance.lang = speechCode;
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF7ED] to-[#FFE8D1] relative overflow-hidden flex flex-col justify-between p-4 sm:p-6 max-w-[480px] mx-auto">
      {/* Decorative Background Blurred Blobs */}
      <div
        className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-[#FFB347] opacity-25 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-20 right-1/4 w-72 h-72 rounded-full bg-[#F9A8D4] opacity-20 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Banner / Hero Intro */}
      <header className="relative z-10 pt-4 pb-2 text-center">
        <div className="inline-flex items-center justify-center p-1 rounded-full bg-gradient-to-tr from-[#FF7A18] to-[#FF3D6E] mb-3 shadow-md">
          <img
            src={sakhiAvatar}
            alt={currentT.appNameLocal}
            referrerPolicy="no-referrer"
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white shadow-sm"
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E1B4B] mb-1">
          {isInitialScreen ? currentT.appNameLocal : currentT.changeLanguage}
        </h1>
        <p className="text-sm sm:text-base text-slate-700 font-medium px-4">
          {currentT.languageSelectPrompt}
          <span className="block text-xs sm:text-sm text-slate-500 mt-1">
            {currentT.languageSelectSub}
          </span>
        </p>
      </header>

      {/* 8 Big Language Cards */}
      <main className="relative z-10 my-4">
        <div
          role="radiogroup"
          aria-label="Select language"
          className="grid grid-cols-2 gap-3"
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            return (
              <div
                key={lang.code}
                role="radio"
                tabIndex={0}
                aria-checked={isSelected}
                onClick={() => onSelectLanguage(lang.code)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectLanguage(lang.code);
                  }
                }}
                className={`relative flex flex-col items-start p-4 rounded-3xl border-2 text-left transition-all active:scale-95 min-h-[104px] justify-between cursor-pointer select-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7A18] ${
                  isSelected
                    ? 'bg-white/95 border-[#FF7A18] shadow-lg shadow-orange-500/20 ring-2 ring-[#FF7A18]/20'
                    : 'bg-white/80 backdrop-blur-md border-white/80 hover:border-orange-200 hover:bg-white/95 shadow-sm'
                }`}
              >
                <div className="w-full flex items-start justify-between">
                  <span className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] tracking-tight">
                    {lang.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) =>
                        handlePlaySample(e, lang.code, lang.speechCode, lang.greeting)
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          handlePlaySample(
                            e as any,
                            lang.code,
                            lang.speechCode,
                            lang.greeting
                          );
                        }
                      }}
                      title={`Listen to sample greeting in ${lang.englishLabel}`}
                      aria-label={`Listen to sample greeting in ${lang.englishLabel}`}
                      className="p-1 text-slate-400 hover:text-[#FF7A18] active:scale-95 transition-transform rounded-full hover:bg-orange-50 cursor-pointer inline-flex items-center justify-center"
                    >
                      <Volume2 className="w-4 h-4" strokeWidth={2} />
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-[#FF7A18] shrink-0" strokeWidth={2.5} />
                    )}
                  </div>
                </div>

                <div className="mt-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {lang.englishLabel}
                  </span>
                  <span className="block text-xs sm:text-sm text-orange-700 font-bold truncate mt-0.5">
                    {lang.greeting}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Safety and Confirm Actions */}
      <footer className="relative z-10 pt-2 pb-4 space-y-3">
        <div className="bg-white/80 backdrop-blur-md border border-white/80 border-l-4 border-l-[#FF7A18] rounded-2xl p-3.5 text-center shadow-xs">
          <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
            {currentT.langSafeNotice}
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 sm:py-4 px-4 bg-gradient-to-r from-[#FF7A18] to-[#FF3D6E] text-white font-bold text-base rounded-full shadow-lg shadow-orange-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer hover:brightness-105"
          >
            <Globe2 className="w-5 h-5" strokeWidth={2} />
            <span>{currentT.continueButton}</span>
          </button>
        )}
      </footer>
    </div>
  );
};
