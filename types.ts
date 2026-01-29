
export type TextPosition = { x: number; y: number }; // Percentage 0-100

export type Resolution = '360p' | '480p' | '720p' | '1080p' | '2K' | '4K' | '8K';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';

export type VideoFormat = 'mp4' | 'webm';

// Broad list of fonts including new additions
export type FontType = 
  'Amiri' | 'Amiri Quran' | 'Rakkas' | 'Lateef' | 'Scheherazade New' | 'Reem Kufi' | 
  'Cairo' | 'Tajawal' | 'Almarai' | 'El Messiri' | 'Aref Ruqaa' | 
  'Lalezar' | 'Katibeh' | 'Gulzar' | 'Vibes' | 'Lemonada' | 
  'Changa' | 'Mada' | 'Noto Kufi Arabic' | 'Noto Naskh Arabic' | 
  'Noto Nastaliq Urdu' | 'Qahiri' | 'Mirza' | 'Harmattan' | 
  'Alexandria' | 'Blaka Ink' | 'Kufam' | 'Markazi Text' | 'IBM Plex Sans Arabic';

export interface BackgroundAsset {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string; 
  duration: number; 
  isUserUpload?: boolean;
}

export interface AudioPreset {
  id: string;
  name: string;
  reverb: number;
  echo: number;
  normalize: boolean;
  isCustom?: boolean;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  surahName: string;
  readerName: string;
  resolution: Resolution;
  aspectRatio: AspectRatio;
}

export interface TextStyle {
  font: FontType;
  color: string;
  fontSizeScale: number; // 1 = default
  hasShadow: boolean;
}

export interface Verse {
  text: string;
  numberInSurah: number;
  surahNumber: number;
}

export interface VerseTiming {
  verseIndex: number; // Index in the fetched array
  text: string;
  startTime: number; // Seconds
  endTime: number; // Seconds
}

export interface HighlightedWord {
  verseIndex: number;
  wordIndex: number;
  color: string;
}

export interface AutoHighlight {
    word: string;
    color: string;
}

export interface GlobalStyleConfig {
    transitionType: 'cut' | 'fade';
    textAnimation: 'fade' | 'slideUp' | 'scale' | 'none';
    autoHighlights: AutoHighlight[];
}

export interface QuranConfig {
  isEnabled: boolean;
  surahNumber: number;
  fromAyah: number;
  toAyah: number;
  verses: Verse[];
  timings: VerseTiming[];
  style: TextStyle; // Specifically for Quran text
  position: TextPosition;
  highlightColor: string;
  highlights: HighlightedWord[]; // Manual highlights (Verse Specific)
  apiKeys: string[]; // List of user keys
  generateNoTextVariant: boolean; // NEW: Generate second video without text
}

export interface AppState {
  step: number;
  processingLocation: 'local' | 'server';
  
  // Video Configuration
  aspectRatio: AspectRatio;

  // Text Content
  readerName: string;
  surahName: string;
  
  // Quran Text & Sync
  quranConfig: QuranConfig;

  // Global Styling
  globalStyle: GlobalStyleConfig;

  // Backgrounds
  selectedAssets: BackgroundAsset[]; 
  
  // Audio
  audioFile: File | null;
  audioUrl: string | null;
  audioDuration: number;
  
  // Audio Settings
  reverbAmount: number;
  echoAmount: number;
  isNormalized: boolean;
  selectedPresetId: string;
  customPresets: AudioPreset[];

  // Video Settings
  resolution: Resolution;
  fps: number;
  format: VideoFormat;
  
  // Style / Typography 
  surahPosition: TextPosition;
  readerPosition: TextPosition;
  surahStyle: TextStyle;
  readerStyle: TextStyle;
  
  // Processing
  isProcessing: boolean;
  progress: number;
  timeRemaining?: string; 
  queuePosition: number | null;

  // History
  history: HistoryItem[];
  showHistory: boolean;
}

export interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
    full: string;
  };
  alt_description: string;
  user: {
    name: string;
  };
}
