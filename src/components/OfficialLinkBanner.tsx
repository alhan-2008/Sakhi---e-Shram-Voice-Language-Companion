import React from 'react';
import { ExternalLink, CheckCircle2 } from 'lucide-react';
import { TranslationStrings } from '../types';

interface OfficialLinkBannerProps {
  t: TranslationStrings;
}

export const OfficialLinkBanner: React.FC<OfficialLinkBannerProps> = ({ t }) => {
  return (
    <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 border border-emerald-500/30 rounded-3xl p-4 sm:p-5 shadow-lg shadow-emerald-950/5 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-xs shadow-emerald-600/30 shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-800 tracking-wide uppercase">
              {t.govLabel}
            </span>
            <p className="text-xs sm:text-sm text-slate-700 mt-0.5 font-medium leading-relaxed">
              {t.officialWebsiteDisclaimer}
            </p>
          </div>
        </div>

        <a
          href="https://www.eshram.gov.in/indexmain"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm sm:text-base font-bold rounded-2xl shadow-md shadow-emerald-700/25 active:scale-95 transition-all text-center whitespace-nowrap cursor-pointer shrink-0"
        >
          <span>{t.officialSiteButton}</span>
          <ExternalLink className="w-4 h-4 text-emerald-100 shrink-0" strokeWidth={2} />
        </a>
      </div>
    </div>
  );
};
