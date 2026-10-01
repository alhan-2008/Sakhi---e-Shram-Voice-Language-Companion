export type LanguageCode =
  | 'ta'
  | 'hi'
  | 'te'
  | 'kn'
  | 'ml'
  | 'mr'
  | 'bn'
  | 'en';

export interface LanguageInfo {
  code: LanguageCode;
  label: string; // e.g. "தமிழ்"
  englishLabel: string; // e.g. "Tamil"
  greeting: string; // e.g. "வணக்கம்"
  speechCode: string; // e.g. "ta-IN"
}

export type QuickActionKey = 'register' | 'what_is' | 'what_need' | 'need_help';

export interface QuickActionItem {
  key: QuickActionKey;
  label: string;
  sublabel?: string;
  icon: string;
  query: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'sakhi';
  text: string;
  timestamp: number;
  actionKey?: QuickActionKey;
  audioPlaying?: boolean;
}

export interface TranslationStrings {
  appName: string;
  appNameLocal: string;
  govLabel: string;
  tagline: string;
  selectLanguageTitle: string;
  selectLanguageSubtitle: string;
  languageSelectPrompt: string;
  languageSelectSub: string;
  changeLanguage: string;
  continueButton: string;
  langSafeNotice: string;
  speakButtonLabel: string;
  listeningState: string;
  stopListening: string;
  micTapToSpeak: string;
  listeningHint: string;
  inputPlaceholder: string;
  sendButton: string;
  officialSiteButton: string;
  officialPortalLink: string;
  safetyBanner: string;
  safetyBannerDetail: string;
  quickActionsTitle: string;
  quickActions: Record<QuickActionKey, { title: string; subtitle: string; query: string }>;
  welcomeMessage: string;
  listenToSakhi: string;
  stopListeningToSakhi: string;
  sakhiSpeaking: string;
  sakhiThinking: string;
  conversationHeading: string;
  resetButton: string;
  docsChecklistTitle: string;
  docsChecklistSubtitle: string;
  docsTag: string;
  docsAadhaarTitle: string;
  docsAadhaarDesc: string;
  docsMobileTitle: string;
  docsMobileDesc: string;
  docsBankTitle: string;
  docsBankDesc: string;
  fallbackErrorMessage: string;
  offlineNotice: string;
  micPermissionError: string;
  speechNotSupported: string;
  noVoiceInstalled: string;
  voiceNotAvailableNotice: string;
  unsupportedBrowser: string;
  loadingVoice: string;
  micGuideTitle: string;
  micGuideStep1: string;
  micGuideStep2: string;
  micGuideStep3: string;
  dismiss: string;
  officialWebsiteDisclaimer: string;
  footerText: string;
  // Part 1: Age check fields
  ageQuestionTitle: string;
  ageQuestionSubtitle: string;
  ageBelow16: string;
  age16to59: string;
  age60Plus: string;
  ageBelow16Message: string;
  age60PlusMessage: string;
  goBack: string;
  ageVoiceHint: string;
  ageVoiceUnclear: string;
  // Part 2: Who can register info card fields
  eligibilityTitle: string;
  eligibilitySubtitle: string;
  eligibilityPoint1: string;
  eligibilityPoint2: string;
  eligibilityPoint3: string;
  eligibilityPoint4: string;
  eligibilityPoint5: string;
  eligibilityNoteFreeCsc: string;
  eligibilityNotePortalRules: string;
}
