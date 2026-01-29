
# 📖 صانع فيديوهات القرآن (Quran Video Generator V3.0)

مرحباً بك في التوثيق الرسمي لمشروع **Quran Recitation Video Generator**. هذا المشروع عبارة عن تطبيق ويب متكامل (Full-Stack Logic on Client) يهدف إلى تمكين المستخدمين من إنشاء مقاطع فيديو احترافية للتلاوات القرآنية مع مزامنة النصوص تلقائياً أو يدوياً.

---

## 🚀 نظرة عامة (Overview)

التطبيق مصمم ليعمل بالكامل داخل المتصفح (Browser-Based) دون الحاجة لخوادم معالجة ثقيلة (Serverless Video Rendering). يعتمد على تقنيات الويب الحديثة لدمج الصوت، الصور، والنصوص، وتصديرها كملف فيديو MP4/WebM.

### 🌟 المميزات الرئيسية
1.  **وضعان للعمل (Dual Mode):**
    *   **وضع الرفع (Upload Mode):** للمستخدمين الذين يمتلكون ملفات صوتية خاصة (أصواتهم أو تسجيلات نادرة). يستخدم **Google Gemini AI** لمزامنة الآيات.
    *   **وضع القارئ (Reciter Mode):** للمستخدمين الذين يريدون إنشاء فيديو لقارئ مشهور (مثل العفاسي، عبدالباسط). يستخدم **EveryAyah API** للمزامنة الدقيقة بنسبة 100%.

2.  **محرك الفيديو (Canvas Rendering):**
    *   رسم الإطارات (Frames) باستخدام HTML5 Canvas.
    *   دعم جودات متعددة: 360p, 480p, 720p, 1080p, 2K, 4K, 8K.
    *   دعم معدل إطارات متغير: 15fps - 120fps.

3.  **محرك الصوت (Web Audio API):**
    *   تحليل الموجات الصوتية في الوقت الفعلي.
    *   إضافة مؤثرات احترافية: صدى (Reverb)، تكرار (Echo)، وموازنة الصوت (Normalization).
    *   دعم التسجيل المباشر من الميكروفون.

4.  **مكتبة الأصول (Assets Library):**
    *   تكامل مع **Pexels/Unsplash** لجلب صور خلفيات عالية الجودة.
    *   دعم رفع الصور والفيديوهات المحلية.
    *   نظام الخط الزمني (Timeline) لترتيب الخلفيات.

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

*   **Framework:** React 19 + TypeScript + Vite
*   **Styling:** Tailwind CSS (Dark Mode focused)
*   **Icons:** Lucide React
*   **Video/Audio:**
    *   Native `MediaRecorder` API للتصدير.
    *   Native `Web Audio API` (AudioContext, OfflineAudioContext) للمعالجة.
    *   HTML5 Canvas للرسم.
*   **AI Integration:** Google Generative AI SDK (Gemini Flash/Pro).
*   **Fonts:** Google Fonts (Amiri, Rakkas, Scheherazade New, etc.).

---

## 📂 هيكلية المشروع (Folder Structure)

```bash
/
├── components/         # جميع مكونات واجهة المستخدم
│   ├── steps/          # خطوات المعالج (Step 1 to 9)
│   └── ...             # مكونات عامة (Header, Sidebar)
├── hooks/              # الخطافات المخصصة (Logic Separation)
│   ├── useAudioProcessing.ts  # مشغل الصوت والمؤثرات
│   └── useVideoExport.ts      # محرك تصدير الفيديو
├── services/           # الخدمات الخارجية
│   ├── audioService.ts     # جلب ومعالجة صوت القراء (EveryAyah)
│   ├── geminiService.ts    # التواصل مع الذكاء الاصطناعي
│   ├── quranService.ts     # جلب نصوص القرآن
│   └── unsplashService.ts  # جلب الصور
├── types.ts            # تعريفات TypeScript
├── constants.ts        # الثوابت (أسماء السور، القراء، الخطوط)
└── docs/               # هذا المجلد (التوثيق الشامل)
```

---

للمزيد من التفاصيل، يرجى مراجعة الملفات التالية في هذا المجلد:
*   [دليل المستخدم (USER_GUIDE.md)](./USER_GUIDE.md) - شرح كيفية استخدام التطبيق زر بزر.
*   [الدليل التقني (DEVELOPER_GUIDE.md)](./DEVELOPER_GUIDE.md) - شرح للكود والوظائف للمطورين.
*   [هندسة النظام (ARCHITECTURE.md)](./ARCHITECTURE.md) - كيف يعمل النظام خلف الكواليس.
