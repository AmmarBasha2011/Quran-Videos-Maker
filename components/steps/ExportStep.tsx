import React, { useState, useEffect } from 'react';
import { Settings, Loader2, CheckCircle, Download, Hand } from 'lucide-react';
import { AppState } from '../../types';

interface Props {
  state: AppState;
  isExporting: boolean;
  exportProgress: number;
  generatedVideoUrl: string | null;
  onGenerate: () => void;
  onReset: () => void;
}

const DHIKR_LIST = ['سُبْحَانَ اللَّهِ', 'الْحَمْدُ لِلَّهِ', 'لَا إِلَهَ إِلَّا اللَّهُ', 'اللَّهُ أَكْبَرُ'];

export const ExportStep: React.FC<Props> = ({ state, isExporting, exportProgress, generatedVideoUrl, onGenerate, onReset }) => {
  const [count, setCount] = useState(0);
  const [dhikrIndex, setDhikrIndex] = useState(0);
  const [animateClick, setAnimateClick] = useState(false);

  useEffect(() => {
    if (!isExporting) {
      setCount(0);
      setDhikrIndex(0);
    }
  }, [isExporting]);

  const handleTasbeehClick = () => {
    setCount(c => c + 1);
    setDhikrIndex(i => (i + 1) % DHIKR_LIST.length);
    setAnimateClick(true);
    setTimeout(() => setAnimateClick(false), 150);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] animate-in fade-in zoom-in duration-500">
      
      {/* State 1: Ready */}
      {!isExporting && !generatedVideoUrl && (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <Settings className="w-10 h-10 text-emerald-500 animate-slow-spin" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 font-rakkas">جاهز لإنشاء الفيديو (V2.1)</h2>
            <div className="flex justify-center gap-4 text-xs text-slate-400 font-mono mb-2">
              <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">{state.resolution}</span>
              <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">{state.fps} FPS</span>
            </div>
            <p className="text-slate-400 max-w-sm mx-auto text-sm">
              ملاحظة: الجودات العالية (2K/4K) ومعدلات الإطارات العالية (60FPS) قد تستغرق وقتاً أطول في المعالجة.
            </p>
          </div>
          <button 
            onClick={onGenerate}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-emerald-900/40 transition-all hover:scale-105 active:scale-95 flex items-center mx-auto"
          >
            <Loader2 className="ml-2 w-5 h-5 animate-spin hidden" /> 
            بدء المعالجة
          </button>
        </div>
      )}

      {/* State 2: Processing (Queue + Render + Game) */}
      {isExporting && (
        <div className="w-full max-w-md space-y-8 text-center">
          
          {/* Header & Progress */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-emerald-400 animate-pulse font-rakkas">
              {exportProgress < 10 ? "جاري التحضير..." : "جاري إنشاء الفيديو..."}
            </h3>
            
            <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative" dir="ltr">
                <div 
                  className="h-full bg-gradient-to-l from-emerald-600 to-emerald-400 transition-all duration-300 relative"
                  style={{ width: `${exportProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
            </div>
            <p className="text-xs text-slate-500 font-mono">
              {Math.round(exportProgress)}% مكتمل
            </p>
          </div>

          {/* Tasbeeh Game */}
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl animate-in slide-in-from-bottom-4 duration-700">
            <p className="text-sm text-slate-400 mb-4">استغفر الله وسبح حتى تنتهي المعالجة</p>
            
            <button 
              onClick={handleTasbeehClick}
              className={`w-32 h-32 rounded-full bg-gradient-to-br from-emerald-900 to-slate-900 border-4 border-emerald-500/30 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all transform active:scale-95 mx-auto outline-none select-none
                ${animateClick ? 'scale-95 border-emerald-400/50 shadow-[0_0_40px_rgba(16,185,129,0.4)]' : 'hover:scale-105'}
              `}
            >
              <span className="text-3xl font-bold text-emerald-100 font-rakkas">{count}</span>
              <Hand size={20} className="text-emerald-500/50 mt-2" />
            </button>

            <div className="mt-4 h-8">
              <span key={count} className="text-lg font-bold text-emerald-400 font-amiri animate-in fade-in slide-in-from-bottom-2">
                {DHIKR_LIST[dhikrIndex]}
              </span>
            </div>
          </div>
          
          <div className="text-[10px] text-slate-600">
              يرجى عدم إغلاق الصفحة.
          </div>
        </div>
      )}

      {/* State 3: Done */}
      {!isExporting && generatedVideoUrl && (
        <div className="text-center space-y-6 animate-in zoom-in duration-300">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/40">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 font-rakkas">الفيديو جاهز!</h2>
            <p className="text-slate-400">تم إنشاء فيديو التلاوة بنجاح.</p>
            {count > 0 && (
               <p className="text-emerald-400 text-sm mt-2">✨ لقد قمت بـ {count} تسبيحة أثناء الانتظار. تقبل الله!</p>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a 
              href={generatedVideoUrl} 
              download={`quran-recitation-v2-${Date.now()}.webm`}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-emerald-900/40 transition-all hover:scale-105 flex items-center justify-center"
            >
              <Download className="ml-2 w-5 h-5" />
              تحميل الفيديو
            </a>
            <button 
              onClick={onReset}
              className="px-6 py-3 rounded-full font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              إنشاء فيديو آخر
            </button>
          </div>
          
          <p className="text-xs text-slate-600 mt-8">
              يتم حفظ الملف في ذاكرة المتصفح.
          </p>
        </div>
      )}
    </div>
  );
};