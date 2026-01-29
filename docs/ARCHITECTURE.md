
# 🏗️ هندسة النظام (System Architecture)

يوضح هذا المستند تدفق البيانات وكيفية عمل الأجزاء المختلفة معاً.

---

## 🔄 تدفق البيانات العام (Data Flow)

1.  **المدخلات (Inputs):**
    *   يختار المستخدم الوضع (Upload / Reciter).
    *   يتم تعبئة `AppState` بالبيانات (الصور، الصوت، النصوص).

2.  **المعالجة (Processing):**
    *   **الصوت:** يتم معالجته عبر `AudioContext` (دمج، قص، مؤثرات).
    *   **النصوص:** يتم جلبها من API وتوقيتها (إما عبر EveryAyah Audio Length أو Gemini AI).
    *   **الصور:** يتم تحميلها في الذاكرة (`Image()` objects).

3.  **الإخراج (Output):**
    *   يتم دمج كل شيء في `MediaRecorder`.
    *   يتم إنتاج ملف `Blob` (فيديو .webm أو .mp4).

---

## 🧠 منطق وضع القارئ (Reciter Mode Logic)

هذا هو الجزء الأكثر تعقيداً ودقة في النظام الجديد (V3).

```mermaid
graph TD
    A[Start Reciter Mode] --> B{Select Reciter & Range}
    B --> C[Fetch Verses Text (API)]
    B --> D[Loop through Verses]
    D --> E[Download MP3 for Verse(i)]
    E --> F[Decode to AudioBuffer]
    F --> G[Trim Silence (Start/End)]
    G --> H[Calculate Duration]
    H --> I[Append to Master Buffer]
    H --> J[Create Timing Object {text, start, end}]
    I --> K[Next Verse]
    K --> D
    K -- Done --> L[Ready for Export]
```

**لماذا هذا النظام دقيق؟**
لأننا لا نخمن التوقيت. نحن نبني ملف الصوت النهائي بدمج الآيات يدوياً. لذا، نحن نعرف بالضبط عند أي "مللي ثانية" تبدأ الآية رقم 5، لأننا نحن من وضعها في الشريط الزمني بعد الآية رقم 4 مباشرة!

---

## 🎨 منطق الرسم (Rendering Pipeline)

كيف يتم تحويل الـ DOM والـ State إلى فيديو؟

1.  **Init:** إنشاء `Canvas` بحجم الفيديو (مثلاً 1080x1920).
2.  **Loop (60 times/sec):**
    *   **Layer 1 (Background):**
        *   تحديد الصورة الحالية بناءً على `currentTime`.
        *   تطبيق تأثير الانتقال (Cross-fade) إذا كنا في لحظة انتقال.
        *   تطبيق تأثير التقريب (Ken Burns / Zoom) البسيط.
    *   **Layer 2 (Overlay):**
        *   رسم طبقة سوداء شفافة `rgba(0,0,0,0.3)` لتحسين قراءة النص.
    *   **Layer 3 (Text):**
        *   فحص `timings` لمعرفة الآية الحالية.
        *   إذا `quranConfig.isEnabled == true` -> ارسم النص.
        *   تطبيق الظل، الخط، اللون، والأنيميشن (Fade/Slide).
    *   **Layer 4 (Watermarks):**
        *   رسم اسم القارئ واسم السورة في أماكنهم.

3.  **Capture:**
    *   يتم أخذ صورة (Stream) من الـ Canvas وإرسالها للـ MediaRecorder.
    *   يتم أخذ الصوت من الـ Web Audio API Node وإرساله للـ MediaRecorder.

---

## 🔌 الخدمات الخارجية (External APIs)

| الخدمة | الغرض | الرابط |
| :--- | :--- | :--- |
| **AlQuran Cloud** | جلب النص العثماني للآيات | `api.alquran.cloud` |
| **EveryAyah** | جلب ملفات MP3 للقراء (مقسمة آيات) | `everyayah.com` |
| **Pexels** | جلب صور الخلفيات | `api.pexels.com` |
| **Google Gemini** | مزامنة الصوت (في وضع الرفع فقط) | `generativelanguage.googleapis.com` |

---

## ⚠️ اعتبارات هامة (Known Limitations)

1.  **الذاكرة (RAM):** إنشاء فيديو 4K يتطلب ذاكرة كبيرة في المتصفح. على الهواتف الضعيفة قد يحدث Crash. ينصح بـ 1080p للهواتف.
2.  **صيغة الفيديو:** المتصفحات غالباً تصدر `webm`. نقوم بمحاولة طلب `mp4` ولكن إذا لم يدعم المتصفح ذلك (مثل Firefox)، سيعود لـ `webm`.
3.  **CORS:** إذا فشل تحميل صورة بسبب CORS، لن تظهر في الفيديو. تم التعامل مع ذلك باستخدام `crossOrigin = "anonymous"`.
