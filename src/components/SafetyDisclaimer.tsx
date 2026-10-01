import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { TranslationStrings } from '../types';

interface SafetyDisclaimerProps {
  t: TranslationStrings;
}

export const SafetyDisclaimer: React.FC<SafetyDisclaimerProps> = ({ t }) => {
  return (
    <aside
      aria-label="Privacy notice"
      className="bg-amber-50/90 backdrop-blur-md border border-amber-200/90 border-l-4 border-l-[#FF7A18] rounded-2xl p-3.5 sm:p-4 text-slate-800 shadow-md shadow-orange-950/5 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-200/80 rounded-xl text-amber-900 shrink-0 mt-0.5 shadow-2xs">
          <ShieldAlert className="w-5 h-5 text-[#FF7A18]" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base font-bold text-amber-950 leading-snug">
            {t.safetyBanner}
          </p>
          <p className="text-xs sm:text-sm text-amber-900/90 font-medium mt-1 leading-relaxed">
            {t.safetyBannerDetail}
          </p>
        </div>
      </div>
    </aside>
  );
};
