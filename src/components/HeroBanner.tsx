import React from 'react';
import { TranslationStrings, LanguageCode } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/translations';
import sakhiAvatar from '../assets/images/sakhi_guide_avatar_1790839146871.jpg';
import { Sparkles } from 'lucide-react';

interface HeroBannerProps {
  t: TranslationStrings;
  currentLanguage: LanguageCode;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ t, currentLanguage }) => {
  const currentLangMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) ||
    SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF7A18] via-[#FF5E4D] to-[#FF3D6E] p-5 sm:p-6 text-white shadow-xl shadow-orange-500/25 transition-all">
      {/* Decorative Traditional Rangoli / Mandala Pattern (10% Opacity) */}
      <svg
        viewBox="0 0 200 200"
        className="absolute -bottom-8 -right-8 w-44 h-44 text-white opacity-10 pointer-events-none select-none"
        fill="currentColor"
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="6 4" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="100" cy="100" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="100" cy="100" r="20" fill="currentColor" />
        {/* Floral Petals */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <ellipse
            key={deg}
            cx="100"
            cy="45"
            rx="10"
            ry="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            transform={`rotate(${deg} 100 100)`}
          />
        ))}
      </svg>

      <div className="relative z-10 flex items-center justify-between gap-3.5">
        <div className="flex-1 min-w-0 pr-1">
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase mb-2">
            <Sparkles className="w-3 h-3 text-amber-200" />
            <span>{t.appNameLocal}</span>
          </div>

          {/* Large Friendly Greeting (28-32px) */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-white drop-shadow-xs">
            {currentLangMeta.greeting}!
          </h1>

          {/* One-Line Subtitle */}
          <p className="text-sm sm:text-base text-orange-50 font-medium mt-1 leading-snug drop-shadow-2xs opacity-95">
            {t.tagline}
          </p>
        </div>

        {/* Avatar illustration on the right */}
        <div className="shrink-0 relative">
          <div className="p-1 rounded-3xl bg-white/25 backdrop-blur-md shadow-md">
            <img
              src={sakhiAvatar}
              alt={t.appNameLocal}
              referrerPolicy="no-referrer"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl object-cover border-2 border-white shadow-sm"
            />
          </div>
          {/* Decorative Sparkle Ring */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-300 rounded-full border-2 border-white shadow-2xs animate-pulse" />
        </div>
      </div>
    </div>
  );
};
