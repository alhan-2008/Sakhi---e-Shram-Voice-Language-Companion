import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { TranslationStrings } from '../types';

interface VoiceMicButtonProps {
  isListening: boolean;
  onToggleListening: () => void;
  t: TranslationStrings;
  disabled?: boolean;
}

export const VoiceMicButton: React.FC<VoiceMicButtonProps> = ({
  isListening,
  onToggleListening,
  t,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-4 sm:py-5">
      <button
        type="button"
        disabled={disabled}
        onClick={onToggleListening}
        aria-label={isListening ? t.stopListening : t.speakButtonLabel}
        className={`relative group flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:scale-95 ${
          isListening
            ? 'w-24 h-24 bg-rose-600 text-white ring-8 ring-rose-200 animate-pulse shadow-2xl shadow-rose-500/50'
            : 'w-24 h-24 bg-gradient-to-br from-[#FF7A18] via-[#FF5E4D] to-[#FF3D6E] text-white shadow-2xl shadow-orange-500/45 hover:shadow-orange-500/60 hover:brightness-105 active:scale-95'
        }`}
      >
        {isListening ? (
          <MicOff className="w-11 h-11 animate-bounce" strokeWidth={2.2} />
        ) : (
          <Mic className="w-11 h-11 drop-shadow-xs" strokeWidth={2.2} />
        )}

        {/* 2-3 Concentric Pulsing Rings while listening */}
        {isListening && (
          <>
            <span className="absolute -inset-3 rounded-full border-2 border-rose-400 animate-ping opacity-60 pointer-events-none" />
            <span className="absolute -inset-6 rounded-full border border-rose-300 animate-pulse opacity-40 pointer-events-none" />
            <span className="absolute -inset-9 rounded-full border border-orange-200 animate-pulse opacity-25 pointer-events-none" />
          </>
        )}
      </button>

      {/* Label under mic button with animated sound bars when active */}
      <div className="mt-3.5 text-center flex flex-col items-center">
        <div className="flex items-center gap-2">
          {isListening && (
            <div className="flex items-center gap-1 h-3.5">
              <span className="w-1 bg-rose-600 rounded-full animate-wave-1" />
              <span className="w-1 bg-rose-500 rounded-full animate-wave-2" />
              <span className="w-1 bg-rose-600 rounded-full animate-wave-3" />
            </div>
          )}
          <span
            className={`text-base sm:text-lg font-extrabold tracking-tight transition-colors ${
              isListening ? 'text-rose-700' : 'text-[#1E1B4B]'
            }`}
          >
            {isListening ? t.listeningState : t.speakButtonLabel}
          </span>
          {isListening && (
            <div className="flex items-center gap-1 h-3.5">
              <span className="w-1 bg-rose-600 rounded-full animate-wave-3" />
              <span className="w-1 bg-rose-500 rounded-full animate-wave-2" />
              <span className="w-1 bg-rose-600 rounded-full animate-wave-1" />
            </div>
          )}
        </div>

        <span className="block text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          {isListening ? t.listeningHint : t.micTapToSpeak}
        </span>
      </div>
    </div>
  );
};
