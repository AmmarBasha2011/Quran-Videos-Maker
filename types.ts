export type TextPosition = { x: number; y: number }; // Percentage 0-100

export type Resolution = '360p' | '480p' | '720p' | '1080p' | '2K' | '4K';

// Broad list of fonts
export type FontType = 
  'Amiri' | 'Rakkas' | 'Lateef' | 'Scheherazade New' | 'Reem Kufi' | 
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
}

export interface TextStyle {
  font: FontType;
  color: string;
  fontSizeScale: number; // 1 = default
  hasShadow: boolean;
}

export interface AppState {
  step: number;
  
  // Text Content
  readerName: string;
  surahName: string;
  
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
  
  // Style / Typography (Refactored)
  surahPosition: TextPosition;
  readerPosition: TextPosition;
  surahStyle: TextStyle;
  readerStyle: TextStyle;
  
  // Processing
  isProcessing: boolean;
  progress: number;
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