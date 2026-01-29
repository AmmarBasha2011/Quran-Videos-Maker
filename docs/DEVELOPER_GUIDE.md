
# 👨‍💻 دليل المطور (Developer Guide)

مرحباً بك في الكواليس! هذا المستند يشرح كيف يعمل الكود، الهيكلية، وأهم الدوال المستخدمة.

---

## 1️⃣ الملفات الأساسية (Core Files)

### `App.tsx`
*   **الوظيفة:** هو المايسترو (Orchestrator). يدير الحالة العامة للتطبيق (`AppState`) ويقرر أي "خطوة" (Step Component) يجب عرضها بناءً على `state.step` و `state.mode`.
*   **الحالة (State):** يحتوي على كائن `state` ضخم يضم كل شيء (الصوت، الفيديو، النصوص، الإعدادات).

### `types.ts`
*   ملف التعريفات. أي كائن يتم استخدامه في أكثر من مكان يتم تعريفه هنا.
*   أهم الأنواع: `AppState`, `QuranConfig`, `VerseTiming`, `BackgroundAsset`.

### `constants.ts`
*   يحتوي على البيانات الثابتة مثل:
    *   قائمة أسماء السور (`SURAH_NAMES`).
    *   عدد الآيات لكل سورة (`VERSE_COUNTS`).
    *   معرفات القراء لخدمة EveryAyah (`RECITERS_MAP`).
    *   إعدادات الصوت المسبقة (`AUDIO_PRESETS`).

---

## 2️⃣ الخدمات (Services)

### `services/audioService.ts`
*   **الغرض:** التعامل مع تحميل ودمج الصوت في وضع القارئ (Reciter Mode).
*   **دالة `prepareReciterAudio`:**
    1.  تستقبل `reciterId`، رقم السورة، ومجال الآيات.
    2.  تقوم بعمل Loop لتحميل كل آية كملف MP3 منفصل من `everyayah.com`.
    3.  تستخدم `AudioContext.decodeAudioData` لتحويل MP3 إلى PCM Data.
    4.  تستدعي `analyzeSilence` لحذف الصمت من بداية ونهاية كل آية.
    5.  تقوم بدمج (Concatenate) جميع المخازن المؤقتة (Buffers) في `masterBuffer` واحد طويل.
    6.  تحسب التوقيتات (`VerseTiming`) بناءً على طول كل آية بعد القص.

### `services/geminiService.ts`
*   **الغرض:** التواصل مع Google Gemini API لمزامنة الصوت في وضع الرفع.
*   **دالة `syncAudioWithVersesPipeline`:**
    *   ترسل ملف الصوت + نص الآيات للذكاء الاصطناعي.
    *   تطلب من الـ AI إرجاع JSON يحتوي على `startTime` و `endTime` لكل آية.
    *   تستخدم استراتيجية "المحاولات المتعددة" (Pipeline) مع نماذج مختلفة (`flash`, `pro`) لضمان الدقة.

---

## 3️⃣ الخطافات (Hooks)

### `hooks/useVideoExport.ts`
*   **هذا هو محرك الفيديو (The Engine).**
*   **دالة `generateVideo`:**
    1.  تقوم بإنشاء `OfflineAudioContext` لدمج الصوت مع المؤثرات (Reverb/Echo) وتصدير ملف صوتي نهائي.
    2.  تنشئ `Canvas` خفية بحجم الفيديو المطلوب (مثلاً 1920x1080).
    3.  تنشئ `MediaStreamDestination` وتوصل الصوت به.
    4.  تستخدم `MediaRecorder` لتسجيل الـ Canvas Stream + Audio Stream.
    5.  تبدأ حلقة رسم (`requestAnimationFrame` loop):
        *   تحسب الوقت الحالي.
        *   تحدد الصورة الحالية بناءً على الـ Timeline.
        *   ترسم الصورة على الـ Canvas.
        *   ترسم النصوص (الآيات، اسم القارئ) فوق الصورة.
    6.  عند انتهاء الصوت، توقف التسجيل وتعيد `Blob URL`.

### `hooks/useAudioProcessing.ts`
*   يدير تشغيل الصوت داخل المتصفح للمعاينة.
*   يستخدم `Web Audio API` لإنشاء Nodes: `Source -> Reverb -> Echo -> Gain -> Destination`.
*   يسمح بتغيير القيم (مثل حجم الصدى) في الوقت الفعلي أثناء التشغيل.

---

## 4️⃣ المكونات (Components)

*   **`components/StepWizard.tsx`:** شريط التقدم العلوي (الدوائر المرقمة).
*   **`components/steps/ReciterSetupStep.tsx`:** واجهة اختيار القارئ وتفعيل النصوص.
*   **`components/steps/BackgroundStep.tsx`:** واجهة اختيار الصور (تتعامل مع Pexels API أو الرفع المحلي).

---

## 💡 ملاحظات للمطورين
*   **الأداء:** التعامل مع Canvas بدقة 4K يستهلك ذاكرة عالية. تم استخدام `desynchronized: true` في الـ Context لتحسين الأداء.
*   **CORS:** عند رسم صور من رابط خارجي على Canvas، يجب أن يكون السيرفر يدعم CORS، وإلا ستفشل عملية التصدير (Tainted Canvas). صور Pexels و Unsplash تدعم ذلك.
