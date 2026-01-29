
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
    <div className="fixed inset-0 z-[100] flex flex-col md:flex-row bg-[#020617]/40 backdrop-blur-3xl animate-in fade-in duration-500">
      
      {/* Sidebar (Desktop) */}
      <div className="w-72 bg-white/5 border-l border-white/10 hidden md:flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
        <div className="p-8 border-b border-white/10 relative z-10">
             <h2 className="text-2xl font-black font-rakkas iridescent-text">مركز المساعدة</h2>
             <p className="text-[10px] text-slate-400 mt-2 font-mono tracking-widest uppercase">Documentation V3.0</p>
        </div>
        <div className="flex-1 overflow-y-auto py-6 relative z-10 custom-scrollbar">
            {DOC_SECTIONS.map((section) => (
                <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-right px-8 py-4 flex items-center gap-4 transition-all relative group ${activeSection === section.id ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    {activeSection === section.id && (
                        <div className="absolute inset-y-0 right-0 w-1 bg-white shadow-[0_0_15px_white]"></div>
                    )}
                    <div className={`p-2 rounded-lg transition-all ${activeSection === section.id ? 'bg-white/20 shadow-lg' : 'bg-transparent group-hover:bg-white/5'}`}>
                        <section.icon size={20} />
                    </div>
                    <span className="font-bold text-sm tracking-tight">{section.title}</span>
                </button>
            ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden p-5 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-xl">
            <h2 className="font-black iridescent-text text-lg">مركز المساعدة</h2>
            <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-lg active:scale-90 transition-all"
            >
                <X className="text-white" size={20} />
            </button>
        </div>

        {/* Desktop Header / Close Button */}
        <div className="hidden md:flex justify-end p-6">
            <button 
                onClick={onClose}
                className="liquid-button shiny-reflection flex items-center gap-2 text-white px-6 py-2.5 rounded-2xl transition-all hover:scale-105 active:scale-95 font-bold text-sm"
            >
                <X size={18} /> إغلاق الدليل
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 md:p-16 max-w-5xl mx-auto w-full custom-scrollbar pb-32 md:pb-16">
            {/* Mobile Nav (Horizontal) */}
            <div className="md:hidden flex overflow-x-auto gap-3 mb-8 pb-3 no-scrollbar">
                 {DOC_SECTIONS.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-xs font-black border transition-all ${activeSection === section.id ? 'bg-white/20 border-white/40 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-400'}`}
                    >
                        {section.title}
                    </button>
                ))}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center gap-6 mb-10 border-b border-white/10 pb-8">
                    <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20"></div>
                        {currentContent && React.createElement(currentContent.icon, { size: 32, className: "relative z-10 group-hover:scale-110 transition-transform duration-500" })}
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white font-rakkas tracking-tight">{currentContent?.title}</h1>
                        <p className="text-slate-400 text-sm mt-2 font-medium">قسم المساعدة والاستخدام</p>
                    </div>
                </div>
                
                <div className="prose prose-invert prose-lg max-w-none leading-relaxed prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white prose-li:text-slate-300">
                    {currentContent?.content}
                </div>
            </div>

            {/* Navigation Footer (Desktop Hidden) */}
            <div className="md:hidden mt-12 pt-8 border-t border-white/10 flex justify-between items-center">
                <button 
                    onClick={() => {
                        const idx = DOC_SECTIONS.findIndex(s => s.id === activeSection);
                        if (idx > 0) setActiveSection(DOC_SECTIONS[idx - 1].id);
                    }}
                    disabled={activeSection === DOC_SECTIONS[0].id}
                    className="text-slate-400 font-bold hover:text-white disabled:opacity-0 transition-all px-4 py-2"
                >
                     السابق
                </button>
                <button 
                     onClick={() => {
                        const idx = DOC_SECTIONS.findIndex(s => s.id === activeSection);
                        if (idx < DOC_SECTIONS.length - 1) setActiveSection(DOC_SECTIONS[idx + 1].id);
                        else onClose();
                    }}
                    className="liquid-button shiny-reflection px-8 py-3 rounded-2xl font-black text-white shadow-xl"
                >
                    {activeSection === DOC_SECTIONS[DOC_SECTIONS.length - 1].id ? 'إنهاء' : 'التالي'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
