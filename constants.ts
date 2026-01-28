import { AudioPreset, Resolution, FontType } from './types';

export const STEPS = [
  { id: 1, label: 'التفاصيل' },
  { id: 2, label: 'الخلفية' },
  { id: 3, label: 'الصوت' },
  { id: 4, label: 'الشكل' }, 
  { id: 5, label: 'الجودة' },
  { id: 6, label: 'التصدير' },
];

export const AUDIO_PRESETS: AudioPreset[] = [
  { id: 'custom', name: 'مخصص', reverb: 0, echo: 0, normalize: false },
  { id: 'masjid', name: 'المسجد الحرام', reverb: 0.7, echo: 0.3, normalize: true },
  { id: 'studio', name: 'استوديو (نقي)', reverb: 0.1, echo: 0.05, normalize: true },
  { id: 'cave', name: 'صدى عميق (غار)', reverb: 0.9, echo: 0.5, normalize: false },
  { id: 'radio', name: 'إذاعة (جاف)', reverb: 0, echo: 0, normalize: true },
];

export const FONTS: { value: FontType; label: string; category: string }[] = [
  { value: 'Amiri', label: 'النسخ (أميري)', category: 'نسخ' },
  { value: 'Scheherazade New', label: 'شهرزاد', category: 'نسخ' },
  { value: 'Noto Naskh Arabic', label: 'نوتو نسخ', category: 'نسخ' },
  { value: 'Lateef', label: 'لطيف', category: 'نسخ' },
  { value: 'Markazi Text', label: 'مركزي', category: 'نسخ' },
  
  { value: 'Rakkas', label: 'الرقعه (رقاص)', category: 'رقعة' },
  { value: 'Aref Ruqaa', label: 'عارف رقعة', category: 'رقعة' },
  
  { value: 'Cairo', label: 'كايرو', category: 'حديث' },
  { value: 'Tajawal', label: 'تجوّل', category: 'حديث' },
  { value: 'Almarai', label: 'المراعي', category: 'حديث' },
  { value: 'IBM Plex Sans Arabic', label: 'IBM Plex', category: 'حديث' },
  { value: 'Mada', label: 'مدى', category: 'حديث' },
  { value: 'Alexandria', label: 'الإسكندرية', category: 'حديث' },
  { value: 'Changa', label: 'تشانجا', category: 'حديث' },

  { value: 'Reem Kufi', label: 'ريم كوفي', category: 'كوفي' },
  { value: 'Noto Kufi Arabic', label: 'نوتو كوفي', category: 'كوفي' },
  { value: 'Kufam', label: 'كوفم', category: 'كوفي' },
  { value: 'Lalezar', label: 'لاليزار', category: 'كوفي' },
  
  { value: 'El Messiri', label: 'المسيري', category: 'فني' },
  { value: 'Lemonada', label: 'ليمونادة', category: 'فني' },
  { value: 'Katibeh', label: 'كتيبة', category: 'فني' },
  { value: 'Gulzar', label: 'جلزار', category: 'فني' },
  { value: 'Vibes', label: 'فابس', category: 'فني' },
  { value: 'Blaka Ink', label: 'بلاكا', category: 'فني' },
  { value: 'Qahiri', label: 'قاهري', category: 'فني' },
  { value: 'Mirza', label: 'ميرزا', category: 'فني' },
  { value: 'Harmattan', label: 'هارماتان', category: 'فني' },
];

export const RESOLUTION_DIMENSIONS: Record<Resolution, { width: number; height: number }> = {
  '360p': { width: 640, height: 360 },
  '480p': { width: 854, height: 480 },
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '2K': { width: 2560, height: 1440 },
  '4K': { width: 3840, height: 2160 },
};

export const FALLBACK_IMAGES = []; // Not used, handled in service