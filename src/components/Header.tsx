import React from 'react';
import { Globe, ExternalLink, ShieldCheck, ChevronDown } from 'lucide-react';
import { LanguageCode } from '../types';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../data/translations';
import sakhiAvatar from '../assets/images/sakhi_guide_avatar_1790839146871.jpg';

interface HeaderProps {
  currentLanguage: LanguageCode;
  onOpenLanguageModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onOpenLanguageModal,
}) => {
  const currentLangMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) ||
    SUPPORTED_LANGUAGES[0];
  const t = TRANSLATIONS[currentLanguage];

  return (
    <header className="sticky top-3 z-30 mx-3 mt-3 sm:mx-4 sm:mt-4">
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-3xl bg-white/85 backdrop-blur-md border border-white/70 shadow-lg shadow-orange-950/5 flex items-center justify-between gap-2 transition-all">
        {/* Brand Zone: Avatar with Saffron-to-Rose gradient ring & App Name */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative">
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-[#FF7A18] to-[#FF3D6E] shadow-xs">
              <img
                src={sakhiAvatar}
                alt={t.appNameLocal}
                referrerPolicy="no-referrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white shadow-2xs"
              />
            </div>
            <span
              className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-2xs"
              aria-label="Online"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#1E1B4B]">
              {t.appNameLocal}
            </span>
            <span className="text-[10px] font-bold text-orange-600 tracking-wider uppercase mt-0.5">
              e-Shram
            </span>
          </div>
        </div>

        {/* Action Controls: Language Pill & Emerald e-Shram Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Selector Pill */}
          <button
            type="button"
            onClick={onOpenLanguageModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/95 hover:bg-orange-50/70 border border-orange-200/80 text-[#1E1B4B] text-xs sm:text-sm font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
            title={t.changeLanguage}
            aria-label={t.changeLanguage}
          >
            <Globe className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span className="truncate max-w-[70px] sm:max-w-none">{currentLangMeta.label}</span>
            <ChevronDown className="w-3 h-3 text-orange-400 shrink-0" />
          </button>

          {/* e-Shram Portal Button */}
          <a
            href="https://www.eshram.gov.in/indexmain"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs shadow-emerald-700/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            title={t.officialPortalLink}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-100 shrink-0" />
            <span className="hidden xs:inline">{t.officialPortalLink}</span>
            <ExternalLink className="w-3 h-3 text-emerald-200 shrink-0" />
          </a>
        </div>
      </div>
    </header>
  );
};
