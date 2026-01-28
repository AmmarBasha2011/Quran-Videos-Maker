import { AudioPreset, TextPosition } from './types';

export const STEPS = [
  { id: 1, label: 'التفاصيل' },
  { id: 2, label: 'الخلفية' },
  { id: 3, label: 'الصوت' },
  { id: 4, label: 'الإعدادات' },
  { id: 5, label: 'التصدير' },
];

export const AUDIO_PRESETS: AudioPreset[] = [
  { id: 'custom', name: 'مخصص', reverb: 0, echo: 0, normalize: false },
  { id: 'masjid', name: 'المسجد الحرام', reverb: 0.7, echo: 0.3, normalize: true },
  { id: 'studio', name: 'استوديو (نقي)', reverb: 0.1, echo: 0.05, normalize: true },
  { id: 'cave', name: 'صدى عميق (غار)', reverb: 0.9, echo: 0.5, normalize: false },
  { id: 'radio', name: 'إذاعة (جاف)', reverb: 0, echo: 0, normalize: true },
];

export const TEXT_POSITIONS: { value: TextPosition; label: string }[] = [
  { value: 'top-center', label: 'أعلى الوسط' },
  { value: 'top-right', label: 'أعلى اليمين' },
  { value: 'top-left', label: 'أعلى اليسار' },
  { value: 'center', label: 'الوسط' },
  { value: 'bottom-center', label: 'أسفل الوسط' },
  { value: 'bottom-right', label: 'أسفل اليمين' },
  { value: 'bottom-left', label: 'أسفل اليسار' },
];

// Fallback images if API fails or no key provided
export const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1542358936-22421dc2e3c0?q=80&w=800&auto=format&fit=crop", // Mosque
  "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800&auto=format&fit=crop", // Quran
  "https://images.unsplash.com/photo-1596627679093-85dc02379435?q=80&w=800&auto=format&fit=crop", // Lantern
  "https://images.unsplash.com/photo-1564121211835-e88c852648ab?q=80&w=800&auto=format&fit=crop", // Architecture
];