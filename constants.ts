
import { AudioPreset, Resolution, FontType, AspectRatio } from './types';
import { Youtube, Instagram, Facebook, Smartphone } from 'lucide-react';

export const STEPS = [
  { id: 1, label: 'الإعدادات' },
  { id: 2, label: 'الخلفية' },
  { id: 3, label: 'الصوت' },
  { id: 4, label: 'الآيات' }, 
  { id: 5, label: 'الشكل العام' }, // NEW STEP
  { id: 6, label: 'التنسيق' }, // Was Style
  { id: 7, label: 'الجودة' },
  { id: 8, label: 'التصدير' },
];

export const AUDIO_PRESETS: AudioPreset[] = [
  { id: 'custom', name: 'مخصص', reverb: 0, echo: 0, normalize: false },
  { id: 'masjid', name: 'المسجد الحرام', reverb: 0.7, echo: 0.3, normalize: true },
  { id: 'studio', name: 'استوديو (نقي)', reverb: 0.1, echo: 0.05, normalize: true },
  { id: 'cave', name: 'صدى عميق (غار)', reverb: 0.9, echo: 0.5, normalize: false },
  { id: 'radio', name: 'إذاعة (جاف)', reverb: 0, echo: 0, normalize: true },
];

export const FONTS: { value: FontType; label: string; category: string }[] = [
  // Quranic Fonts
  { value: 'Amiri Quran', label: 'الرسم العثماني', category: 'مصحف' },
  { value: 'Qahiri', label: 'خط الثلث (محاكاة)', category: 'فني' }, 
  { value: 'Gulzar', label: 'نستعليق / ثلث', category: 'فني' },

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
  { value: 'Vibes', label: 'فابس', category: 'فني' },
  { value: 'Blaka Ink', label: 'بلاكا', category: 'فني' },
  { value: 'Mirza', label: 'ميرزا', category: 'فني' },
  { value: 'Harmattan', label: 'هارماتان', category: 'فني' },
];

export interface AspectRatioOption {
    id: AspectRatio;
    label: string;
    description: string;
    icon: any; 
    platforms: string[];
}

export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
    {
        id: '16:9',
        label: 'عرضي (Landscape)',
        description: 'مناسب لليوتيوب وفيسبوك فيديو',
        icon: Youtube,
        platforms: ['YouTube', 'Facebook Video']
    },
    {
        id: '9:16',
        label: 'طولي (Portrait)',
        description: 'مناسب للتيك توك، ريلز، سناب شات',
        icon: Smartphone, 
        platforms: ['TikTok', 'Instagram Reels', 'Snapchat', 'Facebook Reels', 'YouTube Shorts']
    },
    {
        id: '1:1',
        label: 'مربع (Square)',
        description: 'منشورات انستغرام وفيسبوك',
        icon: Instagram,
        platforms: ['Instagram Post', 'Facebook Post']
    },
    {
        id: '4:5',
        label: 'رأسي (Portrait 4:5)',
        description: 'مقاس انستغرام القياسي للمنشورات',
        icon: Instagram,
        platforms: ['Instagram Post']
    }
];

export const getDimensions = (res: Resolution, ratio: AspectRatio): { width: number; height: number } => {
    const baseShortSide: Record<Resolution, number> = {
        '360p': 360,
        '480p': 480,
        '720p': 720,
        '1080p': 1080,
        '2K': 1440,
        '4K': 2160,
        '8K': 4320,
    };

    const s = baseShortSide[res];

    switch (ratio) {
        case '16:9':
            return { width: (s * 16) / 9, height: s };
        case '9:16':
            return { width: s, height: (s * 16) / 9 };
        case '1:1':
            return { width: s, height: s };
        case '4:5':
            return { width: s, height: (s * 5) / 4 };
        default:
            return { width: 1920, height: 1080 };
    }
};

export const RESOLUTION_DIMENSIONS = {}; 
export const FALLBACK_IMAGES = [];

// --- SURAH DATA ---

export const VERSE_COUNTS: Record<number, number> = {
    1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
    11: 123, 12: 111, 13: 43, 14: 52, 15: 99, 16: 128, 17: 111, 18: 110, 19: 98, 20: 135,
    21: 112, 22: 78, 23: 118, 24: 64, 25: 77, 26: 227, 27: 93, 28: 88, 29: 69, 30: 60,
    31: 34, 32: 30, 33: 73, 34: 54, 35: 45, 36: 83, 37: 182, 38: 88, 39: 75, 40: 85,
    41: 54, 42: 53, 43: 89, 44: 59, 45: 37, 46: 35, 47: 38, 48: 29, 49: 18, 50: 45,
    51: 60, 52: 49, 53: 62, 54: 55, 55: 78, 56: 96, 57: 29, 58: 22, 59: 24, 60: 13,
    61: 14, 62: 11, 63: 11, 64: 18, 65: 12, 66: 12, 67: 30, 68: 52, 69: 52, 70: 44,
    71: 28, 72: 28, 73: 20, 74: 56, 75: 40, 76: 31, 77: 50, 78: 40, 79: 46, 80: 42,
    81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17, 87: 19, 88: 26, 89: 30, 90: 20,
    91: 15, 92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5, 98: 8, 99: 8, 100: 11,
    101: 11, 102: 8, 103: 3, 104: 9, 105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3,
    111: 5, 112: 4, 113: 5, 114: 6
};

export const SURAH_NAMES: string[] = [
    'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 'التوبة', 'يونس',
    'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه',
    'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم',
    'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر', 'يس', 'الصافات', 'ص', 'الزمر', 'غافر',
    'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية', 'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق',
    'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة',
    'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج',
    'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس',
    'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد',
    'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات',
    'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر',
    'المسد', 'الإخلاص', 'الفلق', 'الناس'
];
