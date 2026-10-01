import React from 'react';
import { CreditCard, Smartphone, Building2, CheckCircle2 } from 'lucide-react';
import { TranslationStrings } from '../types';

interface DocumentRoadmapProps {
  t: TranslationStrings;
}

export const DocumentRoadmap: React.FC<DocumentRoadmapProps> = ({ t }) => {
  const items = [
    {
      step: '1',
      iconBg: 'bg-orange-100/80 text-[#FF7A18]',
      icon: <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />,
      title: t.docsAadhaarTitle,
      desc: t.docsAadhaarDesc,
    },
    {
      step: '2',
      iconBg: 'bg-sky-100/80 text-sky-600',
      icon: <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />,
      title: t.docsMobileTitle,
      desc: t.docsMobileDesc,
    },
    {
      step: '3',
      iconBg: 'bg-emerald-100/80 text-emerald-600',
      icon: <Building2 className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />,
      title: t.docsBankTitle,
      desc: t.docsBankDesc,
    },
  ];

  return (
    <section aria-label="Required documents" className="bg-white/80 backdrop-blur-md border border-white/70 rounded-3xl p-4 sm:p-5 shadow-lg shadow-orange-950/5">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" strokeWidth={2.5} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#1E1B4B] tracking-tight">
            {t.docsChecklistTitle}
          </h3>
        </div>
        <span className="text-xs font-bold text-orange-900 bg-orange-100/80 border border-orange-200/80 px-3 py-1 rounded-full shrink-0 shadow-2xs">
          {t.docsTag}
        </span>
      </div>

      <p className="text-xs sm:text-sm text-slate-500 mb-4 font-medium">
        {t.docsChecklistSubtitle}
      </p>

      {/* 3 Equal Glass Cards with Dotted Progression Line */}
      <div className="relative">
        {/* Horizontal Dotted Progression Line (visible on sm+) */}
        <div
          className="hidden sm:block absolute top-7 left-12 right-12 h-0.5 border-t-2 border-dashed border-orange-300/70 z-0 pointer-events-none"
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between p-4 rounded-3xl bg-white/90 backdrop-blur-xs border border-orange-100/80 shadow-xs hover:shadow-md transition-all group"
            >
              {/* Top row: Icon in soft circle + Saffron-to-Rose gradient number badge */}
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-2xl ${item.iconBg} shadow-2xs transition-transform group-hover:scale-105`}>
                  {item.icon}
                </div>
                <div
                  className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF7A18] to-[#FF3D6E] text-white flex items-center justify-center text-xs font-black shadow-xs shadow-orange-500/30"
                  aria-label={`Step ${item.step}`}
                >
                  {item.step}
                </div>
              </div>

              {/* Title & Description */}
              <div className="mt-1">
                <span className="text-sm sm:text-base font-bold text-[#1E1B4B] block leading-snug">
                  {item.title}
                </span>
                <span className="text-xs sm:text-sm text-slate-600 font-medium block mt-1 leading-relaxed">
                  {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
