# 🎥 Quran Recitation Video Generator (V3.0)

مُولد فيديوهات تلاوة القرآن الكريم - تطبيق ويب متطور لإنشاء فيديوهات تلاوة احترافية مع دعم كامل للذكاء الاصطناعي والمعالجة السحابية.

![Banner](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

## 🌟 المميزات (Features)

- **مزامنة ذكية بالذكاء الاصطناعي**: استخدام نماذج Gemini لمزامنة الصوت مع الآيات بدقة عالية.
- **تخصيص كامل**: التحكم في الخطوط، الألوان، الظلال، وأماكن النصوص.
- **مؤثرات صوتية**: إضافة صدى (Reverb/Echo) وتحسين مستوى الصوت (Normalization).
- **خلفيات متنوعة**: دعم الصور والفيديوهات مع تأثيرات حركية (Ken Burns).
- **دقة عالية**: دعم استخراج فيديوهات تصل دقتها إلى 4K و 8K.
- **معالجة سحابية (جديد)**: خيار لمعالجة الفيديو على سيرفر خارجي لتوفير موارد الهاتف.

---

## 🛠 هيكلية المشروع (Project Structure)

المشروع ينقسم إلى جزئين:
1. **Frontend**: تطبيق React (Vite) يعمل في المتصفح.
2. **Backend API**: سيرفر Node.js (Express + FFmpeg) للمعالجة السحابية.

---

## 🚀 التشغيل المحلي (Local Setup)

### 1. المتطلبات (Prerequisites)
- Node.js (v18+)
- FFmpeg (مثبت على النظام)

### 2. تشغيل الواجهة (Frontend)
```bash
# تثبيت الاعتماديات
npm install

# تشغيل التطبيق
npm run dev
```
تأكد من ضبط `GEMINI_API_KEY` في ملف `.env.local`.

### 3. تشغيل السيرفر (Backend API)
```bash
cd server
npm install
npm run dev
```

---

## ☁️ الدفع للسيرفر (Deployment - Koyeb)

تم تجهيز السيرفر ليكون جاهزاً للدفع مباشرة على منصة **Koyeb** باستخدام Docker.

1. ارفع الكود إلى GitHub.
2. في Koyeb، اختر "New Service" ثم "GitHub".
3. اختر المستودع وحدد مسار السيرفر `server`.
4. سيقوم Koyeb تلقائياً باستخدام الـ `Dockerfile` الموجود لبناء وتشغيل السيرفر.
5. تأكد من ضبط المتغيرات البيئية (Environment Variables) إذا لزم الأمر (مثل `PORT`).

---

## 📡 مرجع الـ API (API Reference)

### `POST /api/generate`

يستخدم لإنشاء الفيديو.

**المعاملات (Body - Multipart/Form-Data):**
- `audio`: ملف الصوت (MP3/WAV).
- `config`: نص JSON يحتوي على إعدادات الفيديو (مثل `surahName`, `selectedAssets`, `quranConfig`, إلخ).

**الاستجابة:**
- ملف الفيديو الناتج (MP4).

---

## 📖 توثيق الربط (Integration Guide)

لربط الموقع بالسيرفر الجديد، يجب تعديل دالة `generateVideo` في الفرونت اند لترسل طلب `POST` إلى السيرفر بدلاً من المعالجة المحلية عند اختيار "Server Processing".

مثال للطلب:
```javascript
const formData = new FormData();
formData.append('audio', audioFile);
formData.append('config', JSON.stringify(appState));

const response = await fetch('https://your-api-url.koyeb.app/api/generate', {
  method: 'POST',
  body: formData
});

const blob = await response.blob();
const videoUrl = URL.createObjectURL(blob);
```

---

## 📜 ملاحظات تقنية

- تم استخدام مكتبة `canvas` في السيرفر لضمان تطابق الرندرة مع المتصفح.
- يتم تحميل الخطوط العربية تلقائياً عند أول تشغيل للسيرفر.
- السيرفر يدعم المعالجة المتعددة عبر FFmpeg لضمان السرعة.

---

**تطوير**: [اسمك/فريقك]
**الإصدار**: 3.0.0
