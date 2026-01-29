
import React from 'react';
import { Upload, Mic2, User, Sparkles } from 'lucide-react';
import { AppMode } from '../../types';

interface Props {
  onSelect: (mode: AppMode) => void;
}

export const ModeSelectionStep: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col justify-center">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-rakkas text-emerald-100 mb-2">كيف تود إنشاء الفيديو؟</h2>
        <p className="text-slate-400">اختر الطريقة التي تناسبك للبدء في مشروعك الجديد</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
        
        {/* Option 1: Upload (Custom) */}
        <button 
            onClick={() => onSelect('upload')}
            className="group relative bg-slate-950 p-8 rounded-2xl border border-slate-800 hover:border-emerald-500 hover:bg-slate-900 transition-all text-right flex flex-col gap-4 shadow-xl overflow-hidden"
        >
            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform border border-slate-800 group-hover:border-emerald-500/30">
                <Upload size={32} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    رفع ملف صوتي خاص
                    <span className="text-[10px] bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">الوضع الافتراضي</span>
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                    استخدم هذا الخيار إذا كان لديك تسجيل صوتي خاص بك أو ملف جاهز. 
                    سنستخدم <strong className="text-emerald-400">الذكاء الاصطناعي (Gemini)</strong> لمزامنة الآيات مع صوتك تلقائياً.
                </p>
            </div>
            <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -translate-x-10 -translate-y-10 group-hover:bg-emerald-500/10 transition-colors" />
        </button>

        {/* Option 2: Reciter (Ready Made) */}
        <button 
            onClick={() => onSelect('reciter')}
            className="group relative bg-slate-950 p-8 rounded-2xl border border-slate-800 hover:border-blue-500 hover:bg-slate-900 transition-all text-right flex flex-col gap-4 shadow-xl overflow-hidden"
        >
             <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform border border-slate-800 group-hover:border-blue-500/30">
                <User size={32} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    اختيار قارئ مشهور
                    <span className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">جديد</span>
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                    اختر قارئاً من القائمة (العفاسي، عبدالباسط، إلخ) وحدد الآيات.
                    <br/>
                    <strong className="text-blue-400">دقة 100%</strong> في التزامن بدون ذكاء اصطناعي، حيث يتم دمج الآيات بناءً على التوقيت الأصلي للتلاوة.
                </p>
            </div>
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-x-10 -translate-y-10 group-hover:bg-blue-500/10 transition-colors" />
        </button>

      </div>
    </div>
  );
};
