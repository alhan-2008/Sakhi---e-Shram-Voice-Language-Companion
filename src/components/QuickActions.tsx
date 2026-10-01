import React from 'react';
import { UserPlus, HelpCircle, FileText, HeartHandshake, ArrowRight } from 'lucide-react';
import { QuickActionKey, TranslationStrings } from '../types';

interface QuickActionsProps {
  t: TranslationStrings;
  onSelectAction: (key: QuickActionKey, query: string) => void;
  disabled?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  t,
  onSelectAction,
  disabled = false,
}) => {
  const actions: Array<{
    key: QuickActionKey;
    icon: React.ReactNode;
    iconTileGradient: string;
    cardBorder: string;
    coloredShadow: string;
    accentColor: string;
  }> = [
    {
      key: 'register',
      icon: <UserPlus className="w-7 h-7 text-white" strokeWidth={2} />,
      iconTileGradient: 'bg-gradient-to-br from-[#FF7A18] to-[#FF5E4D]',
      cardBorder: 'border-orange-100 hover:border-orange-300',
      coloredShadow: 'shadow-md shadow-orange-500/15 hover:shadow-xl hover:shadow-orange-500/25',
      accentColor: 'text-[#FF7A18]',
    },
    {
      key: 'what_is',
      icon: <HelpCircle className="w-7 h-7 text-white" strokeWidth={2} />,
      iconTileGradient: 'bg-gradient-to-br from-[#3B82F6] to-[#1E1B4B]',
      cardBorder: 'border-blue-100 hover:border-blue-300',
      coloredShadow: 'shadow-md shadow-blue-500/15 hover:shadow-xl hover:shadow-blue-500/25',
      accentColor: 'text-[#3B82F6]',
    },
    {
      key: 'what_need',
      icon: <FileText className="w-7 h-7 text-white" strokeWidth={2} />,
      iconTileGradient: 'bg-gradient-to-br from-[#059669] to-[#10B981]',
      cardBorder: 'border-emerald-100 hover:border-emerald-300',
      coloredShadow: 'shadow-md shadow-emerald-500/15 hover:shadow-xl hover:shadow-emerald-500/25',
      accentColor: 'text-[#059669]',
    },
    {
      key: 'need_help',
      icon: <HeartHandshake className="w-7 h-7 text-white" strokeWidth={2} />,
      iconTileGradient: 'bg-gradient-to-br from-[#E11D48] to-[#FF3D6E]',
      cardBorder: 'border-rose-100 hover:border-rose-300',
      coloredShadow: 'shadow-md shadow-rose-500/15 hover:shadow-xl hover:shadow-rose-500/25',
      accentColor: 'text-[#E11D48]',
    },
  ];

  return (
    <section aria-label="Quick actions" className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base sm:text-lg font-bold text-[#1E1B4B] tracking-tight">
          {t.quickActionsTitle}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {actions.map(({ key, icon, iconTileGradient, cardBorder, coloredShadow, accentColor }) => {
          const item = t.quickActions[key];
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onSelectAction(key, item.query)}
              className={`group flex flex-col justify-between p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-md border ${cardBorder} text-left transition-all duration-300 hover:-translate-y-1 active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${coloredShadow}`}
            >
              {/* Top Row: 56px Gradient Icon Tile & Arrow */}
              <div className="flex items-center justify-between w-full mb-3">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${iconTileGradient} transition-transform group-hover:scale-105`}
                >
                  {icon}
                </div>
                <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:${accentColor} group-hover:bg-white group-hover:shadow-xs transition-all`}>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                </div>
              </div>

              {/* Text content with bold typography */}
              <div className="mt-1">
                <span className="block text-base sm:text-lg font-bold text-[#1E1B4B] leading-snug group-hover:text-orange-950 transition-colors">
                  {item.title}
                </span>
                <span className="block text-xs sm:text-sm text-slate-500 font-medium truncate mt-1">
                  {item.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
