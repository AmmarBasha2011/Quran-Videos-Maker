
import React, { useState, useEffect } from 'react';
import { Settings, Loader2, CheckCircle, Download, Hand, Timer, FileVideo } from 'lucide-react';
import { AppState } from '../../types';

interface Props {
  state: AppState;
  isExporting: boolean;
  exportProgress: number;
  generatedVideoUrl: string | null;
  generatedNoTextUrl: string | null; // New prop for second video
  onGenerate: () => void;
  onReset: () => void;
}

const DHIKR_LIST = ['سُبْحَانَ اللَّهِ', 'الْحَمْدُ لِلَّهِ', 'لَا إِلَهَ إِلَّا اللَّهُ', 'اللَّهُ أَكْبَرُ'];

export const ExportStep: React.FC<Props> = ({ state, isExporting, exportProgress, generatedVideoUrl, generatedNoTextUrl, onGenerate, onReset }) => {
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
  
  const extension = state.format || 'mp4';

  // Helper text for status
  let statusText = "جاري إنشاء الفيديو...";
  if (state.quranConfig.generateNoTextVariant && generatedVideoUrl && !generatedNoTextUrl) {
      statusText = "جاري إنشاء النسخة الثانية (بدون نصوص)...";
  } else if (exportProgress < 10) {
      statusText = "جاري التحضير...";
  }

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] animate-in fade-in zoom-in-95 duration-700">
      
      {/* State 1: Ready */}
      {!isExporting && !generatedVideoUrl && (
        <div className="text-center space-y-8 animate-in fade-in zoom-in-95">
          <div className="w-24 h-24 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20"></div>
            <Settings className="w-12 h-12 text-white animate-spin-slow relative z-10" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white font-rakkas tracking-tight">جاهز لإنتاج الفيديو</h2>
            <div className="flex justify-center gap-3 text-[10px] font-black font-mono">
              <span className="bg-white/10 px-3 py-1 rounded-full text-white border border-white/10 backdrop-blur-md">{state.resolution}</span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-white border border-white/10 backdrop-blur-md">{state.fps} FPS</span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-white border border-white/10 backdrop-blur-md uppercase">{state.format || 'MP4'}</span>
            </div>
            <p className="text-slate-500 max-w-sm mx-auto text-sm font-medium leading-relaxed">
              سيتم إنشاء الفيديو بأقصى جودة ممكنة. قد تستغرق العملية بضع دقائق حسب الدقة المختارة.
            </p>
          </div>
          <button 
            onClick={onGenerate}
            className="liquid-button shiny-reflection text-white px-12 py-5 rounded-[1.5rem] font-black shadow-2xl transition-all hover:scale-110 active:scale-95 flex items-center mx-auto text-lg overflow-hidden"
          >
            بدء عملية التصدير
          </button>
        </div>
      )}

      {/* State 2: Processing */}
      {isExporting && (
        <div className="w-full max-w-md space-y-10 text-center animate-in fade-in">
          
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-white animate-pulse font-rakkas tracking-tight">
              {statusText}
            </h3>
            
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative shadow-inner" dir="ltr">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 relative shadow-[0_0_15px_rgba(167,139,250,0.5)]"
                  style={{ width: `${exportProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </div>
            </div>
            
            <div className="flex justify-between items-center px-4">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                {Math.round(exportProgress)}% Progress
                </span>
                
                {state.timeRemaining && (
                    <span className="text-[10px] text-purple-400 font-black flex items-center gap-2 animate-in fade-in uppercase tracking-widest">
                        <Timer size={14} strokeWidth={2.5} />
                        Est: {state.timeRemaining}
                    </span>
                )}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-8 duration-1000">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
            <p className="text-[10px] font-black text-slate-500 mb-6 relative z-10 uppercase tracking-[0.2em]">استغفر الله وسبح حتى تنتهي المعالجة</p>
            
            <button 
              onClick={handleTasbeehClick}
              className={`w-40 h-40 rounded-[2.5rem] bg-black/40 border border-white/20 flex flex-col items-center justify-center shadow-2xl transition-all duration-300 relative z-10 group overflow-hidden outline-none
                ${animateClick ? 'scale-90 bg-white shadow-[0_0_50px_rgba(255,255,255,0.4)]' : 'hover:scale-105 active:scale-95'}
              `}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className={`text-5xl font-black transition-colors duration-300 ${animateClick ? 'text-black' : 'text-white'}`}>{count}</span>
              <Hand size={24} strokeWidth={2.5} className={`mt-3 transition-colors duration-300 ${animateClick ? 'text-black/40' : 'text-slate-500'}`} />
            </button>

            <div className="mt-8 h-10 relative z-10">
              <span key={count} className="text-2xl font-black text-white font-amiri animate-in fade-in slide-in-from-bottom-4 block">
                {DHIKR_LIST[dhikrIndex]}
              </span>
            </div>
          </div>
          
          <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
              Please do not close this tab
          </div>
        </div>
      )}

      {/* State 3: Done */}
      {!isExporting && generatedVideoUrl && (
        <div className="text-center space-y-8 animate-in fade-in zoom-in-95 duration-700 w-full max-w-md">
          <div className="w-28 h-28 bg-white/10 rounded-[2.5rem] border border-white/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(255,255,255,0.2)]">
            <CheckCircle className="w-14 h-14 text-white" strokeWidth={3} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white mb-3 font-rakkas tracking-tight">تم بنجاح!</h2>
            <p className="text-slate-500 font-medium">تم إنشاء مقاطع الفيديو الخاصة بك بجودة احترافية.</p>
            {count > 0 && (
               <p className="text-purple-400 text-xs mt-4 font-black uppercase tracking-widest">✨ لقد قمت بـ {count} تسبيحة. تقبل الله!</p>
            )}
          </div>
          
          <div className="flex flex-col gap-4 relative z-10">
             {/* Main Video */}
            <a 
              href={generatedVideoUrl} 
              download={`quran-video-${state.resolution}-${Date.now()}.${extension}`}
              className="liquid-button shiny-reflection text-white px-8 py-5 rounded-2xl font-black shadow-2xl transition-all flex items-center justify-between group overflow-hidden"
            >
              <span className="flex items-center gap-3"><FileVideo size={24} strokeWidth={2.5}/> تحميل الفيديو (مع الآيات)</span>
              <Download className="w-6 h-6 group-hover:translate-y-1 transition-transform" strokeWidth={3} />
            </a>

            {/* No Text Variant */}
            {generatedNoTextUrl && (
                <a 
                href={generatedNoTextUrl} 
                download={`background-video-${state.resolution}-${Date.now()}.${extension}`}
                className="bg-white/5 hover:bg-white/10 text-white px-8 py-5 rounded-2xl font-black shadow-2xl transition-all flex items-center justify-between group border border-white/10 backdrop-blur-md overflow-hidden"
                >
                <span className="flex items-center gap-3"><FileVideo size={24} strokeWidth={2.5}/> تحميل النسخة الخام</span>
                <Download className="w-6 h-6 group-hover:translate-y-1 transition-transform" strokeWidth={3} />
                </a>
            )}

            <button 
              onClick={onReset}
              className="mt-6 px-8 py-4 rounded-2xl font-black text-slate-500 hover:text-white hover:bg-white/5 transition-all text-[10px] uppercase tracking-[0.2em] border border-transparent hover:border-white/5"
            >
              إنشاء مشروع جديد
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
