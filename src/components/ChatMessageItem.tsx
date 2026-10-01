import React from 'react';
import { Volume2, VolumeX, Sparkles, AlertCircle } from 'lucide-react';
import { ChatMessage, TranslationStrings } from '../types';
import sakhiAvatar from '../assets/images/sakhi_guide_avatar_1790839146871.jpg';

interface ChatMessageItemProps {
  message: ChatMessage;
  isSpeaking: boolean;
  speechStatusText?: string | null;
  speechError?: string | null;
  onToggleSpeech: (text: string, id: string) => void;
  t: TranslationStrings;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  isSpeaking,
  speechStatusText,
  speechError,
  onToggleSpeech,
  t,
}) => {
  const isSakhi = message.sender === 'sakhi';

  return (
    <div
      className={`flex items-start gap-2.5 sm:gap-3 my-3 sm:my-4 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        isSakhi ? 'justify-start' : 'justify-end'
      }`}
    >
      {isSakhi && (
        <div className="shrink-0 mt-1">
          <div className="p-0.5 rounded-full bg-gradient-to-tr from-[#FF7A18] to-[#FF3D6E] shadow-xs">
            <img
              src={sakhiAvatar}
              alt={t.appNameLocal}
              referrerPolicy="no-referrer"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white shadow-2xs"
            />
          </div>
        </div>
      )}

      <div
        className={`max-w-[92%] sm:max-w-[85%] rounded-3xl p-4 sm:p-5 transition-shadow shadow-md ${
          isSakhi
            ? 'bg-white/95 backdrop-blur-md border border-white/80 border-l-4 border-l-[#FF7A18] text-[#1E1B4B] rounded-tl-sm shadow-orange-950/5'
            : 'bg-gradient-to-r from-[#1E1B4B] to-[#312E81] text-white rounded-tr-sm shadow-indigo-950/20'
        }`}
      >
        {isSakhi && (
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-orange-100/80 gap-2">
            <span className="text-xs sm:text-sm font-bold text-[#FF7A18] tracking-wide flex items-center gap-1.5 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" strokeWidth={2.5} />
              {t.appNameLocal}
            </span>

            {/* Read Aloud / Stop Button (Gradient Pill with Sound-Wave Animation) */}
            <button
              type="button"
              onClick={() => onToggleSpeech(message.text, message.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer shadow-sm ${
                isSpeaking
                  ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/30'
                  : 'bg-gradient-to-r from-[#FF7A18] to-[#FF3D6E] text-white hover:brightness-105 shadow-orange-500/25'
              }`}
              title={isSpeaking ? t.stopListeningToSakhi : t.listenToSakhi}
              aria-label={isSpeaking ? t.stopListeningToSakhi : t.listenToSakhi}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4" strokeWidth={2} />
                  <span>{t.stopListeningToSakhi}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-white" strokeWidth={2} />
                  <span>{t.listenToSakhi}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Answer text: large (17px minimum), line-height 1.6 */}
        <div
          className={`text-[17px] sm:text-[18px] leading-[1.65] font-medium whitespace-pre-wrap ${
            isSakhi ? 'text-[#1E1B4B]' : 'text-white'
          }`}
        >
          {message.text}
        </div>

        {/* Audio Visualizer Bar while Sakhi is speaking */}
        {isSpeaking && (
          <div className="mt-3 pt-2.5 border-t border-orange-100 flex items-center gap-2 text-xs sm:text-sm text-[#FF7A18] font-bold">
            <div className="flex items-center gap-1 h-4">
              <span className="w-1 bg-[#FF7A18] rounded-full animate-wave-1" />
              <span className="w-1 bg-[#FF3D6E] rounded-full animate-wave-2" />
              <span className="w-1 bg-[#FF7A18] rounded-full animate-wave-3" />
            </div>
            <span>{speechStatusText || t.sakhiSpeaking}</span>
          </div>
        )}

        {/* Speech Error Display if voice cannot play */}
        {speechError && isSpeaking && (
          <div className="mt-2.5 pt-2 border-t border-rose-100 flex items-center gap-1.5 text-xs sm:text-sm text-rose-700 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" strokeWidth={2} />
            <span>{speechError}</span>
          </div>
        )}
      </div>
    </div>
  );
};
