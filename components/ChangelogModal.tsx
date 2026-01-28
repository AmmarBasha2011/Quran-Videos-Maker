import React from 'react';
import { X, Sparkles, Zap, Image, Type, MonitorPlay } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangelogModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold font-rakkas text-white mb-1">
              🎉 ما الجديد في إصدار <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-400 to-cyan-400">V2.1</span>؟
            </h2>
            <p className="text-xs text-slate-400">سجل التحديثات الشامل من الإصدار الأول حتى الآن</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors z-10"
          >
            <X size={24} />
          </button>
          
          {/* Decorative Gradient */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Section: Latest Updates V2.1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-slate-800 pb-2">
              <Sparkles size={18} />
              <h3>أبرز تحديثات الإصدار الحالي (V2.1)</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-300 list-disc list-inside marker:text-emerald-500">
              <li>
                <span className="text-white font-bold">حل مشكلة الشاشة السوداء:</span> تم إصلاح المشكلة التقنية التي كانت تمنع ظهور الصور عند تصدير الفيديو نهائياً.
              </li>
              <li>
                <span className="text-white font-bold">مكتبة خطوط ضخمة:</span> إضافة أكثر من 20 خط عربي جديد ومتنوع (نسخ، رقعة، كوفي، ديواني، حديث) عبر Google Fonts.
              </li>
              <li>
                <span className="text-white font-bold">حرية التنسيق:</span> إمكانية تخصيص (اللون، الخط، الحجم) لاسم القارئ بشكل منفصل تماماً عن اسم السورة.
              </li>
              <li>
                <span className="text-white font-bold">خلفيات روحانية:</span> تحسين جودة الصور المختارة لتكون ذات طابع إيماني (أزرق داكن، مساجد، نجوم) مع خلط عشوائي للصور لمنع التكرار.
              </li>
              <li>
                <span className="text-white font-bold">واجهة مستخدم محسنة:</span> تحسينات في التصميم وتجربة المستخدم لتكون أكثر سلاسة وعصرية.
              </li>
            </ul>
          </section>

          {/* Section: Content & Media */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-400 font-bold border-b border-slate-800 pb-2">
              <Image size={18} />
              <h3>تحسينات الوسائط والخلفيات (V1.5 - V2.0)</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-2">
                <span className="bg-slate-800 min-w-[20px] h-5 rounded-full flex items-center justify-center text-[10px] mt-0.5">1</span>
                <span>إضافة مكتبة Unsplash للصور عالية الجودة مدمجة داخل التطبيق.</span>
              </li>
              <li className="flex gap-2">
                <span className="bg-slate-800 min-w-[20px] h-5 rounded-full flex items-center justify-center text-[10px] mt-0.5">2</span>
                <span>دعم رفع الصور والفيديوهات الخاصة من جهاز المستخدم مباشرة.</span>
              </li>
              <li className="flex gap-2">
                <span className="bg-slate-800 min-w-[20px] h-5 rounded-full flex items-center justify-center text-[10px] mt-0.5">3</span>
                <span>نظام "شريط الأحداث" (Timeline) لترتيب الصور والفيديوهات وتحديد مدة كل منها بدقة.</span>
              </li>
            </ul>
          </section>

          {/* Section: Audio Features */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-purple-400 font-bold border-b border-slate-800 pb-2">
              <MonitorPlay size={18} />
              <h3>هندسة الصوت المتقدمة</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <h4 className="text-xs font-bold text-white mb-1">الصدى (Reverb)</h4>
                  <p className="text-[10px] text-slate-400">إضافة تأثيرات مكانية مثل (المسجد الحرام، استوديو، غار) لإعطاء عمق للتلاوة.</p>
               </div>
               <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <h4 className="text-xs font-bold text-white mb-1">موازنة الصوت (Normalize)</h4>
                  <p className="text-[10px] text-slate-400">رفع مستوى الصوت تلقائياً وجعله متوازناً دون تشويش.</p>
               </div>
            </div>
          </section>

          {/* Section: Export & Performance */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold border-b border-slate-800 pb-2">
              <Zap size={18} />
              <h3>الأداء والتصدير</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
              <li>دعم التصدير بجودات عالية تصل إلى <strong>4K</strong>.</li>
              <li>التحكم في معدل الإطارات (FPS) حتى 60 إطار في الثانية.</li>
              <li>إضافة <strong>لعبة التسبيح</strong> أثناء انتظار معالجة وتصدير الفيديو لاستغلال الوقت في الطاعة.</li>
              <li>حفظ سجل الفيديوهات السابقة (History) للرجوع لبياناتها.</li>
            </ul>
          </section>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2.5 rounded-lg font-bold transition-all shadow-lg hover:shadow-emerald-900/20"
          >
            ابدأ الاستخدام
          </button>
        </div>
      </div>
    </div>
  );
};