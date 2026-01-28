
import React, { useState } from 'react';
import { X, Settings, Image, Music, Type, Wand2, Layers, Download, KeyRound, Menu, FileVideo, Mic } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DOC_SECTIONS = [
    {
        id: 'intro',
        title: 'مقدمة',
        icon: Settings,
        content: (
            <div className="space-y-4">
                <p>أهلاً بك في <strong>صانع فيديوهات القرآن (V3.0)</strong>. هذه الأداة صممت خصيصاً لمساعدة صناع المحتوى الإسلامي على إنتاج مقاطع فيديو احترافية للتلاوات القرآنية بجودة عالية وبشكل مجاني تماماً.</p>
                <p>يعتمد التطبيق على أحدث تقنيات الويب والذكاء الاصطناعي لمزامنة الصوت مع النص، وتوليد خلفيات، وهندسة الصوت.</p>
            </div>
        )
    },
    {
        id: 'setup',
        title: 'الإعدادات الأولية',
        icon: FileVideo,
        content: (
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-emerald-400">ضبط أبعاد الفيديو</h3>
                <p>قبل البدء، يجب أن تحدد أين ستنشر الفيديو، لأن كل منصة لها مقاسات مفضلة:</p>
                <ul className="list-disc list-inside space-y-2 text-slate-300">
                    <li><strong>16:9 (عرضي):</strong> مثالي لليوتيوب (Video) وفيسبوك.</li>
                    <li><strong>9:16 (طولي):</strong> مثالي لـ TikTok، Reels، Shorts، وSnapchat.</li>
                    <li><strong>1:1 (مربع):</strong> مناسب لمنشورات انستغرام التقليدية.</li>
                </ul>
                <div className="bg-slate-800 p-4 rounded-lg border-r-4 border-emerald-500 mt-4">
                    <strong>نصيحة:</strong> إذا كنت ستنشر على عدة منصات، ابدأ بـ 9:16 لأنه الأكثر انتشاراً حالياً.
                </div>
            </div>
        )
    },
    {
        id: 'backgrounds',
        title: 'مكتبة الخلفيات',
        icon: Image,
        content: (
            <div className="space-y-4">
                <p>يوفر التطبيق اتصالاً مباشراً بخدمة Pexels لجلب صور عالية الجودة.</p>
                <ul className="list-disc list-inside space-y-2 text-slate-300">
                    <li>اضغط على زر <strong>"تحديث القائمة"</strong> لجلب 50 صورة جديدة تماماً بعناوين بحث عشوائية (مثل: مساجد، طبيعة، نجوم، زخارف).</li>
                    <li>يمكنك اختيار <strong>أكثر من صورة</strong>. سيقوم التطبيق بالتبديل بينها تلقائياً في الفيديو النهائي.</li>
                    <li>يمكنك التحكم في مدة عرض كل صورة من خلال "شريط الأحداث" (Timeline) أسفل الصور.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'audio',
        title: 'الصوت والتسجيل',
        icon: Music,
        content: (
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-emerald-400">خيارات الصوت</h3>
                <p>لديك خياران لإضافة التلاوة:</p>
                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                    <li><strong>رفع ملف:</strong> إذا كان لديك ملف MP3 أو WAV جاهز على جهازك.</li>
                    <li><strong>التسجيل المباشر:</strong> يمكنك استخدام الميكروفون للتسجيل مباشرة داخل الموقع.</li>
                </ol>
                
                <h3 className="text-xl font-bold text-emerald-400 mt-6">المؤثرات الصوتية</h3>
                <p>يمكنك تحسين جودة الصوت باستخدام الفلاتر المدمجة:</p>
                <ul className="list-disc list-inside space-y-2 text-slate-300">
                    <li><strong>الصدى (Reverb):</strong> يعطي إيحاء بأنك تقرأ في مكان واسع مثل المسجد.</li>
                    <li><strong>موازنة الصوت (Normalize):</strong> يقوم برفع الصوت المنخفض وتخفيض الصوت العالي ليكون متزناً.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'apikey',
        title: 'مفتاح الذكاء الاصطناعي',
        icon: KeyRound,
        content: (
            <div className="space-y-6">
                <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
                    <h4 className="font-bold text-red-400 mb-2">هام جداً لمزامنة الآيات</h4>
                    <p className="text-sm">هذه الخطوة ضرورية فقط إذا أردت استخدام ميزة "مزامنة الآيات التلقائية". بدونها لن يعمل الذكاء الاصطناعي.</p>
                </div>

                <h3 className="text-xl font-bold text-emerald-400">كيف تحصل على المفتاح (مجاناً)؟</h3>
                <div className="space-y-4 text-slate-300">
                    <p>1. افتح الموقع الرسمي لجوجل: <a href="https://aistudio.google.com" target="_blank" className="text-blue-400 underline">aistudio.google.com</a></p>
                    <p>2. قم بتسجيل الدخول باستخدام حساب Gmail الخاص بك.</p>
                    <p>3. ستجد زراً أزرق كبير باسم <strong>"Create API Key"</strong> أو "Get API Key". اضغط عليه.</p>
                    <p>4. اختر <strong>"Create API Key in new project"</strong>.</p>
                    <p>5. سيظهر لك كود طويل (يبدأ بـ AIza...). قم بنسخه.</p>
                    <p>6. عد إلى التطبيق، وفي قسم "الآيات"، الصق الكود في خانة "API Vault".</p>
                </div>
            </div>
        )
    },
    {
        id: 'verses',
        title: 'الآيات والمزامنة',
        icon: Type,
        content: (
            <div className="space-y-4">
                <p>هذه <strong>ميزة تجريبية</strong> تستخدم نماذج Gemini المتطورة لمطابقة صوتك مع نص القرآن.</p>
                <ul className="list-disc list-inside space-y-2 text-slate-300">
                    <li>اختر السورة والآيات أولاً.</li>
                    <li>اختر نمط المعالجة:
                        <ul className="list-disc list-inside mr-6 mt-1 text-slate-400 text-sm">
                            <li><strong>سريع:</strong> يستخدم نماذج خفيفة، جيد للتلاوات الواضحة جداً.</li>
                            <li><strong>متوسط:</strong> الخيار المتوازن (ينصح به).</li>
                            <li><strong>ثقيل:</strong> يستخدم أقوى النماذج، يأخذ وقتاً طويلاً لكنه الأدق.</li>
                        </ul>
                    </li>
                </ul>
                <p className="text-yellow-400 text-sm">ملاحظة: إذا أخطأ الذكاء الاصطناعي في التوقيت، يمكنك تعديل التوقيت يدوياً عبر المحرر الزمني في الأسفل.</p>
            </div>
        )
    },
    {
        id: 'style',
        title: 'الشكل والتصدير',
        icon: Wand2,
        content: (
            <div className="space-y-4">
                <p>في الخطوات الأخيرة، يمكنك تخصيص مظهر الفيديو:</p>
                <ul className="list-disc list-inside space-y-2 text-slate-300">
                    <li><strong>الخطوط:</strong> اختر من بين مجموعة خطوط عربية (الرسم العثماني، نسخ، رقعة).</li>
                    <li><strong>التلوين التلقائي:</strong> يمكنك جعل كلمة "الله" تظهر بلون ذهبي دائماً أينما وردت.</li>
                    <li><strong>التصدير:</strong> عند الانتهاء، يمكنك تحميل الفيديو. يوفر لك الموقع خيار تحميل "نسخة خام" (بدون نصوص) لاستخدامها في برامج مونتاج أخرى إذا رغبت.</li>
                </ul>
            </div>
        )
    }
];

export const DocumentationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState(DOC_SECTIONS[0].id);

  if (!isOpen) return null;

  const currentContent = DOC_SECTIONS.find(s => s.id === activeSection);

  return (
    <div className="fixed inset-0 z-[100] flex bg-[#020617]">
      
      {/* Sidebar (Desktop) */}
      <div className="w-64 bg-slate-950 border-l border-slate-800 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800">
             <h2 className="text-xl font-bold font-rakkas text-emerald-400">مركز المساعدة</h2>
             <p className="text-xs text-slate-500 mt-1">الدليل الشامل V3.0</p>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
            {DOC_SECTIONS.map((section) => (
                <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-right px-6 py-3 flex items-center gap-3 transition-all ${activeSection === section.id ? 'bg-emerald-900/20 text-emerald-400 border-r-2 border-emerald-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
                >
                    <section.icon size={18} />
                    <span className="font-bold text-sm">{section.title}</span>
                </button>
            ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
            <h2 className="font-bold text-emerald-400">مركز المساعدة</h2>
            <button onClick={onClose}><X className="text-slate-400" /></button>
        </div>

        {/* Desktop Header / Close Button */}
        <div className="hidden md:flex justify-end p-4">
            <button 
                onClick={onClose}
                className="flex items-center gap-2 text-slate-400 hover:text-white bg-slate-900 px-4 py-2 rounded-full transition-colors"
            >
                <X size={18} /> إغلاق الدليل
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12 max-w-4xl mx-auto w-full custom-scrollbar">
            {/* Mobile Nav (Horizontal) */}
            <div className="md:hidden flex overflow-x-auto gap-2 mb-6 pb-2 custom-scrollbar">
                 {DOC_SECTIONS.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all ${activeSection === section.id ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                        {section.title}
                    </button>
                ))}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-6 border-b border-slate-800 pb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-900/30 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        {currentContent && React.createElement(currentContent.icon, { size: 24 })}
                    </div>
                    <h1 className="text-3xl font-bold text-white font-rakkas">{currentContent?.title}</h1>
                </div>
                
                <div className="prose prose-invert prose-lg max-w-none leading-relaxed">
                    {currentContent?.content}
                </div>
            </div>

            {/* Navigation Footer */}
            <div className="mt-12 pt-6 border-t border-slate-800 flex justify-between">
                <button 
                    onClick={() => {
                        const idx = DOC_SECTIONS.findIndex(s => s.id === activeSection);
                        if (idx > 0) setActiveSection(DOC_SECTIONS[idx - 1].id);
                    }}
                    disabled={activeSection === DOC_SECTIONS[0].id}
                    className="text-slate-500 hover:text-white disabled:opacity-0 transition-colors"
                >
                     السابق
                </button>
                <button 
                     onClick={() => {
                        const idx = DOC_SECTIONS.findIndex(s => s.id === activeSection);
                        if (idx < DOC_SECTIONS.length - 1) setActiveSection(DOC_SECTIONS[idx + 1].id);
                        else onClose();
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold transition-colors"
                >
                    {activeSection === DOC_SECTIONS[DOC_SECTIONS.length - 1].id ? 'إنهاء' : 'التالي'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
