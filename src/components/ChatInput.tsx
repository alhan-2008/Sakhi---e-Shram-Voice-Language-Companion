import React, { useState } from 'react';
import { SendHorizonal } from 'lucide-react';
import { TranslationStrings } from '../types';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  t: TranslationStrings;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  t,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-3 sm:bottom-4 z-20 flex items-center gap-2 p-1.5 sm:p-2 bg-white/95 backdrop-blur-lg border border-white/80 rounded-full shadow-xl shadow-orange-950/10 focus-within:ring-2 focus-within:ring-[#FF7A18] transition-all"
    >
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        disabled={isLoading}
        placeholder={t.inputPlaceholder}
        className="flex-1 bg-transparent px-4 py-2 text-[16px] sm:text-[17px] text-[#1E1B4B] placeholder:text-slate-400 focus:outline-hidden disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!inputText.trim() || isLoading}
        aria-label={t.sendButton}
        className="w-11 h-11 rounded-full bg-gradient-to-r from-[#FF7A18] to-[#FF3D6E] text-white flex items-center justify-center shadow-md shadow-orange-500/30 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none shrink-0 cursor-pointer hover:brightness-105"
      >
        <SendHorizonal className="w-5 h-5 ml-0.5" strokeWidth={2.2} />
      </button>
    </form>
  );
};
