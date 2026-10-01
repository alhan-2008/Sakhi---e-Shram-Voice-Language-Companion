import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { LanguageSelector } from './components/LanguageSelector';
import { QuickActions } from './components/QuickActions';
import { DocumentRoadmap } from './components/DocumentRoadmap';
import { ChatMessageItem } from './components/ChatMessageItem';
import { VoiceMicButton } from './components/VoiceMicButton';
import { ChatInput } from './components/ChatInput';
import { SafetyDisclaimer } from './components/SafetyDisclaimer';
import { OfficialLinkBanner } from './components/OfficialLinkBanner';
import { useSpeech } from './hooks/useSpeech';
import { askSakhi } from './services/api';
import { ChatMessage, LanguageCode, QuickActionKey } from './types';
import { TRANSLATIONS } from './data/translations';
import { RefreshCw, VolumeX, AlertCircle, Sparkles } from 'lucide-react';
import sakhiAvatar from './assets/images/sakhi_guide_avatar_1790839146871.jpg';

const STORAGE_LANG_KEY = 'sakhi_selected_language';

export function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | null>(() => {
    const saved = localStorage.getItem(STORAGE_LANG_KEY);
    return (saved as LanguageCode) || null;
  });

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Active language fallback to Hindi if not set yet
  const currentLang = selectedLanguage || 'hi';
  const t = TRANSLATIONS[currentLang];

  const {
    isListening,
    isSpeaking,
    activeSpeakingTextId,
    speechStatusText,
    speechError,
    speechSupported,
    micError,
    voiceNotice,
    debugVoiceInfo,
    speakText,
    stopSpeaking,
    startListening,
    stopListening,
    dismissMicError,
  } = useSpeech(currentLang);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // When language is selected or changed, initialize with warm welcome message
  useEffect(() => {
    if (selectedLanguage) {
      localStorage.setItem(STORAGE_LANG_KEY, selectedLanguage);
      const welcomeText = TRANSLATIONS[selectedLanguage].welcomeMessage;
      setMessages([
        {
          id: 'welcome-' + Date.now(),
          sender: 'sakhi',
          text: welcomeText,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [selectedLanguage]);

  // Handle switching language
  const handleSelectLanguage = (lang: LanguageCode) => {
    stopSpeaking();
    stopListening();
    setSelectedLanguage(lang);
    setShowLanguageModal(false);
  };

  // User sends a message or invokes a quick action
  const handleSendMessage = async (text: string, actionKey?: QuickActionKey) => {
    if (!text.trim() || isLoading) return;

    stopSpeaking();

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: Date.now(),
      actionKey,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Build conversation history
      const history = messages.slice(-4).map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        text: m.text,
      }));

      const res = await askSakhi({
        message: text.trim(),
        language: currentLang,
        actionKey,
        history,
      });

      const sakhiMsgId = 'sakhi-' + Date.now();
      const sakhiReply: ChatMessage = {
        id: sakhiMsgId,
        sender: 'sakhi',
        text: res.reply,
        timestamp: Date.now(),
        actionKey,
      };

      setMessages((prev) => [...prev, sakhiReply]);

      // If user invoked query by voice mic or quick button, automatically offer voice playback
      if (actionKey || isListening) {
        speakText(res.reply, sakhiMsgId);
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'sakhi',
        text: t.fallbackErrorMessage,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle voice speech recognition
  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((transcript) => {
        handleSendMessage(transcript);
      });
    }
  };

  // Reset conversation to initial state
  const handleResetChat = () => {
    stopSpeaking();
    stopListening();
    const welcomeText = t.welcomeMessage;
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'sakhi',
        text: welcomeText,
        timestamp: Date.now(),
      },
    ]);
  };

  // First-time users see the prominent full-screen language choice
  if (!selectedLanguage) {
    return (
      <LanguageSelector
        currentLanguage="hi"
        onSelectLanguage={handleSelectLanguage}
        isInitialScreen={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF7ED] to-[#FFE8D1] text-[#1E1B4B] relative overflow-x-hidden flex flex-col justify-between selection:bg-orange-200 selection:text-orange-950 font-sans">
      {/* Decorative Background Blurred Blobs (Marigold & Rose) */}
      <div
        className="fixed top-12 left-1/2 -translate-x-1/2 -translate-y-12 w-[480px] h-[360px] rounded-full bg-[#FFB347] opacity-25 blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[440px] h-[340px] rounded-full bg-[#F9A8D4] opacity-20 blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Main Container - Mobile First 360px, Max Width 480px centered */}
      <div className="w-full max-w-[480px] mx-auto flex flex-col min-h-screen">
        {/* Floating Glass Header */}
        <Header
          currentLanguage={currentLang}
          onOpenLanguageModal={() => setShowLanguageModal(true)}
        />

        {/* Content Body */}
        <main className="flex-1 px-4 py-4 space-y-5 w-full">
          {/* Hero Banner Section */}
          <HeroBanner t={t} currentLanguage={currentLang} />

          {/* Voice & Language Status Pill */}
          <div
            role="status"
            aria-label="Voice & language status"
            className="flex items-center justify-between px-3.5 py-1.5 bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl text-[11px] font-mono text-slate-700 shadow-xs"
          >
            <span>
              Lang: <strong className="text-orange-950 font-bold">{debugVoiceInfo?.langCode || currentLang}</strong>
            </span>
            <span className="truncate max-w-[65%] text-right">
              Voice:{' '}
              <strong
                className={
                  debugVoiceInfo?.hasNativeVoice
                    ? 'text-emerald-700 font-bold'
                    : 'text-orange-700 font-bold'
                }
              >
                {debugVoiceInfo?.voiceName || 'Detecting voices...'}
              </strong>
            </span>
          </div>

          {/* Unsupported Browser Warning */}
          {!speechSupported && (
            <div className="flex items-center gap-2 p-3.5 bg-amber-50/90 backdrop-blur-md border-l-4 border-l-amber-500 rounded-2xl text-amber-950 text-xs sm:text-sm font-semibold shadow-xs">
              <VolumeX className="w-5 h-5 shrink-0 text-amber-700" strokeWidth={2} />
              <span>{t.unsupportedBrowser}</span>
            </div>
          )}

          {/* Voice Missing Warning */}
          {voiceNotice && (
            <div className="flex items-start gap-2.5 p-3.5 bg-amber-50/90 backdrop-blur-md border-l-4 border-l-amber-500 rounded-2xl text-amber-950 text-xs sm:text-sm font-medium shadow-xs">
              <VolumeX className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" strokeWidth={2} />
              <div className="flex-1 whitespace-pre-line leading-relaxed">
                {voiceNotice}
              </div>
            </div>
          )}

          {/* Safety Disclaimer Banner */}
          <SafetyDisclaimer t={t} />

          {/* Official Government Website Trust Banner */}
          <OfficialLinkBanner t={t} />

          {/* 4 Large Quick Action Option Cards */}
          <QuickActions
            t={t}
            disabled={isLoading}
            onSelectAction={(key, query) => handleSendMessage(query, key)}
          />

          {/* "Keep These 3 Ready" Progression Roadmap */}
          <DocumentRoadmap t={t} />

          {/* Chat / Interaction Feed */}
          <section aria-label="Conversation" className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1E1B4B]">
                  {t.conversationHeading}
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetChat}
                className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 hover:text-[#1E1B4B] transition-colors cursor-pointer px-3 py-1 rounded-full bg-white/60 hover:bg-white border border-white/70 shadow-2xs font-bold active:scale-95"
                title={t.resetButton}
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#FF7A18]" strokeWidth={2} />
                <span>{t.resetButton}</span>
              </button>
            </div>

            <div className="bg-white/75 backdrop-blur-md border border-white/80 rounded-3xl p-3.5 sm:p-5 min-h-[200px] shadow-lg shadow-orange-950/5">
              {messages.map((msg) => (
                <ChatMessageItem
                  key={msg.id}
                  message={msg}
                  isSpeaking={activeSpeakingTextId === msg.id}
                  speechStatusText={activeSpeakingTextId === msg.id ? speechStatusText : null}
                  speechError={activeSpeakingTextId === msg.id ? speechError : null}
                  onToggleSpeech={speakText}
                  t={t}
                />
              ))}

              {/* Animated Three-Dot Typing Indicator when Sakhi is thinking */}
              {isLoading && (
                <div className="flex items-start gap-3 my-3.5 transition-all animate-in fade-in duration-300">
                  <div className="shrink-0 mt-1">
                    <div className="p-0.5 rounded-full bg-gradient-to-tr from-[#FF7A18] to-[#FF3D6E] shadow-xs">
                      <img
                        src={sakhiAvatar}
                        alt={t.appNameLocal}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-2xs"
                      />
                    </div>
                  </div>
                  <div className="bg-white/95 backdrop-blur-md border border-white/80 border-l-4 border-l-[#FF7A18] rounded-3xl rounded-tl-sm p-4 shadow-md shadow-orange-950/5">
                    <div className="flex items-center gap-2.5 text-sm sm:text-base text-orange-950 font-bold">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#FF7A18] animate-bounce [animation-delay:0ms]" />
                        <span className="w-2 h-2 rounded-full bg-[#FF5E4D] animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 rounded-full bg-[#FF3D6E] animate-bounce [animation-delay:300ms]" />
                      </div>
                      <span>{t.sakhiThinking}</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </section>

          {/* Speech Error Warning */}
          {speechError && (
            <div className="flex items-start gap-2.5 p-3.5 bg-amber-50/90 backdrop-blur-md border-l-4 border-l-amber-500 rounded-2xl text-amber-950 text-xs sm:text-sm font-medium shadow-xs">
              <VolumeX className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" strokeWidth={2} />
              <div className="flex-1 whitespace-pre-line leading-relaxed">
                {speechError}
              </div>
            </div>
          )}

          {/* Microphone Permission Warning & Step-by-Step Resolution Guide */}
          {micError && (
            <div className="p-4 bg-rose-50/90 backdrop-blur-md border-l-4 border-l-rose-500 rounded-2xl text-rose-950 text-xs sm:text-sm font-medium shadow-md shadow-rose-950/5 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-rose-950">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" strokeWidth={2.5} />
                  <span>{t.micPermissionError}</span>
                </div>
                <button
                  type="button"
                  onClick={dismissMicError}
                  className="text-xs px-2.5 py-1 rounded-full bg-rose-200 hover:bg-rose-300 text-rose-950 font-bold cursor-pointer shrink-0 transition-colors shadow-2xs active:scale-95"
                  title={t.dismiss}
                >
                  {t.dismiss}
                </button>
              </div>
              <div className="pl-6 space-y-1 text-xs text-rose-800 leading-relaxed font-normal">
                <span className="font-bold text-rose-950 block">{t.micGuideTitle}</span>
                <p>{t.micGuideStep1}</p>
                <p>{t.micGuideStep2}</p>
                <p>{t.micGuideStep3}</p>
              </div>
            </div>
          )}

          {/* Hero Microphone Voice Button (96px Saffron-to-Rose Circle) */}
          <VoiceMicButton
            isListening={isListening}
            onToggleListening={handleToggleListening}
            disabled={isLoading}
            t={t}
          />

          {/* Floating Pill Input Bar */}
          <ChatInput
            onSendMessage={(text) => handleSendMessage(text)}
            isLoading={isLoading}
            t={t}
          />
        </main>

        {/* Footer */}
        <footer className="py-6 px-4 text-center border-t border-orange-200/50 bg-white/40 backdrop-blur-md mt-6">
          <p className="text-xs text-slate-500 font-medium">
            {t.footerText}
          </p>
        </footer>
      </div>

      {/* Language Switcher Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 bg-[#1E1B4B]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-[#FFF7ED] to-[#FFE8D1] rounded-3xl max-w-[440px] w-full max-h-[90vh] overflow-y-auto shadow-2xl p-2 border border-white/80">
            <LanguageSelector
              currentLanguage={currentLang}
              onSelectLanguage={handleSelectLanguage}
              onClose={() => setShowLanguageModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
