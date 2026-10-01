import React from 'react';
import { TranslationStrings } from '../types';
import { CheckCircle2, Volume2, VolumeX, ShieldCheck, Info } from 'lucide-react';

interface EligibilityCardProps {
  t: TranslationStrings;
  isSpeaking: boolean;
  speechStatusText?: string | null;
  onToggleSpeech: (text: string, id: string) => void;
}

export const EligibilityCard: React.FC<EligibilityCardProps> = ({
  t,
  isSpeaking,
  speechStatusText,
  onToggleSpeech,
}) => {
  const cardId = 'eligibility-card';

  const points = [
    t.eligibilityPoint1,
    t.eligibilityPoint2,
    t.eligibilityPoint3,
    t.eligibilityPoint4,
    t.eligibilityPoint5,
  ];

  const fullSpokenText = `${t.eligibilityTitle}. ${points.join('. ')}. ${t.eligibilityNoteFreeCsc}. ${t.eligibilityNotePortalRules}`;

  return (
    <section
      aria-label={t.eligibilityTitle}
      className="bg-white/80 backdrop-blur-md border border-white/70 rounded-3xl p-4 sm:p-5 shadow-lg shadow-orange-950/5 relative overflow-hidden transition-all"
    >
      {/* Decorative top-right accent */}
      <div
        className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-100/60 to-transparent rounded-bl-full pointer-events-none"
        aria-hidden="true"
      />

      {/* Header Row with Title & Listen Button */}
      <div className="flex items-start justify-between gap-2.5 mb-3.5 relative z-10">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700 shrink-0 mt-0.5 shadow-2xs">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#1E1B4B] tracking-tight leading-snug">
              {t.eligibilityTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {t.eligibilitySubtitle}
            </p>
          </div>
        </div>

        {/* Listen Button */}
        <button
          type="button"
          onClick={() => onToggleSpeech(fullSpokenText, cardId)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm shrink-0 min-h-[36px] ${
            isSpeaking
              ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/30'
              : 'bg-gradient-to-r from-[#FF7A18] to-[#FF3D6E] text-white hover:brightness-105 shadow-orange-500/25'
          }`}
          title={isSpeaking ? t.stopListeningToSakhi : t.listenToSakhi}
          aria-label={isSpeaking ? t.stopListeningToSakhi : t.listenToSakhi}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{t.stopListeningToSakhi}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              <span>{t.listenToSakhi}</span>
            </>
          )}
        </button>
      </div>

      {/* Active Audio Visualizer if Speaking this card */}
      {isSpeaking && (
        <div className="mb-3 p-2 bg-orange-50/90 rounded-2xl border border-orange-200 flex items-center gap-2 text-xs text-[#FF7A18] font-bold">
          <div className="flex items-center gap-1 h-3.5">
            <span className="w-1 bg-[#FF7A18] rounded-full animate-wave-1" />
            <span className="w-1 bg-[#FF3D6E] rounded-full animate-wave-2" />
            <span className="w-1 bg-[#FF7A18] rounded-full animate-wave-3" />
          </div>
          <span>{speechStatusText || t.sakhiSpeaking}</span>
        </div>
      )}

      {/* 5 Checklist Items with Green Check Icons */}
      <div className="space-y-2.5 relative z-10">
        {points.map((pointText, index) => (
          <div
            key={index}
            className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-white/70 border border-emerald-100/60 shadow-2xs hover:bg-white transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" strokeWidth={2.5} />
            </div>
            <span className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
              {pointText}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Notes */}
      <div className="mt-4 pt-3.5 border-t border-slate-200/60 space-y-2 relative z-10 text-xs sm:text-sm text-slate-600">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" strokeWidth={2} />
          <p className="leading-relaxed">
            {t.eligibilityNoteFreeCsc}
          </p>
        </div>
        <div className="flex items-start gap-2 text-slate-500 pl-6">
          <p className="leading-relaxed italic">
            {t.eligibilityNotePortalRules}
          </p>
        </div>
      </div>
    </section>
  );
};
