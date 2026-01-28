export type TextPosition = 'top-center' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'bottom-center' | 'center';

export type Resolution = '720p' | '1080p';

export interface AudioPreset {
  id: string;
  name: string;
  reverb: number; // 0-1
  echo: number; // 0-1
  normalize: boolean;
}

export interface AppState {
  step: number;
  readerName: string;
  surahName: string;
  backgroundImage: string | null;
  audioFile: File | null;
  audioUrl: string | null;
  audioDuration: number;
  
  // Audio Settings
  reverbAmount: number;
  echoAmount: number;
  isNormalized: boolean;
  selectedPresetId: string;

  // Video Settings
  resolution: Resolution;
  surahPosition: TextPosition;
  readerPosition: TextPosition;
  
  // Processing
  isProcessing: boolean;
  progress: number;
  queuePosition: number | null;
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