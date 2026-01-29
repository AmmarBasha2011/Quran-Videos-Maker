
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
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] animate-in fade-in zoom-in duration-700">
      
      {/* State 1: Ready */}
      {!isExporting && !generatedVideoUrl && (
        <div className="text-center space-y-8">
          <div className="w-28 h-28 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-2xl backdrop-blur-md">
            <Settings className="w-14 h-14 text-emerald-400 animate-slow-spin" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-3 font-rakkas uppercase tracking-tight">Studio Ready</h2>
            <div className="flex justify-center gap-3 text-[10px] font-bold text-slate-400 font-mono mb-4 uppercase tracking-widest">
              <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5">{state.resolution}</span>
              <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5">{state.fps} FPS</span>
              <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5">{state.format || 'MP4'}</span>
            </div>
            {state.quranConfig.generateNoTextVariant && (
                <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 max-w-xs mx-auto mb-6 backdrop-blur-sm">
                    ✨ Dual Export: Version with verses + clean background.
                </div>
            )}
            <p className="text-slate-500 max-w-sm mx-auto text-sm font-medium leading-relaxed">
              سيتم إنشاء الفيديو بأقصى جودة ممكنة. قد تستغرق العملية بعض الوقت خاصة مع دقة 4K.
            </p>
          </div>
          <button 
            onClick={onGenerate}
            className="bg-emerald-500 hover:bg-emerald-400 text-white px-12 py-4 rounded-2xl font-bold shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center mx-auto border border-emerald-400/50 text-lg"
          >
            بدء التصدير النهائي
          </button>
        </div>
      )}

      {/* State 2: Processing */}
      {isExporting && (
        <div className="w-full max-w-md space-y-10 text-center">
          
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white animate-pulse font-rakkas uppercase tracking-widest">
              {statusText}
            </h3>
            
            <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner relative p-1" dir="ltr">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500 relative shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  style={{ width: `${exportProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
            </div>
            
            <div className="flex justify-between items-center px-2">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                {Math.round(exportProgress)}% COMPLETE
                </span>
                
                {state.timeRemaining && (
                    <span className="text-[10px] text-yellow-500/80 font-bold uppercase tracking-widest flex items-center gap-1.5 animate-in fade-in">
                        <Timer size={14} />
                        TIME: {state.timeRemaining}
                    </span>
                )}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] animate-in slide-in-from-bottom-6 duration-1000 backdrop-blur-xl shadow-2xl">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Tasbeeh Counter</p>
            
            <button 
              onClick={handleTasbeehClick}
              className={`w-36 h-36 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-white/10 flex flex-col items-center justify-center shadow-2xl transition-all transform active:scale-90 mx-auto outline-none select-none backdrop-blur-md
                ${animateClick ? 'scale-95 border-emerald-400/40 shadow-[0_0_50px_rgba(16,185,129,0.3)]' : 'hover:scale-105'}
              `}
            >
              <span className="text-4xl font-black text-white font-mono">{count}</span>
              <Hand size={24} className="text-emerald-400/50 mt-3" />
            </button>

            <div className="mt-8 h-10 flex items-center justify-center">
              <span key={count} className="text-2xl font-bold text-emerald-400 font-amiri animate-in fade-in slide-in-from-bottom-2 drop-shadow-md">
                {DHIKR_LIST[dhikrIndex]}
              </span>
            </div>
          </div>
          
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest opacity-50">
              PLEASE DO NOT CLOSE THIS PAGE
          </div>
        </div>
      )}

      {/* State 3: Done */}
      {!isExporting && generatedVideoUrl && (
        <div className="text-center space-y-8 animate-in zoom-in duration-500 w-full max-w-md">
          <div className="w-32 h-32 bg-green-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-green-500/20 shadow-2xl backdrop-blur-md">
            <CheckCircle className="w-16 h-16 text-green-400" />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-white mb-3 font-rakkas">تم الانتهاء!</h2>
            <p className="text-slate-400 font-medium leading-relaxed">تم إنشاء الفيديوهات بنجاح بجودة عالية.</p>
            {count > 0 && (
               <div className="mt-4 inline-block bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                    <p className="text-emerald-400 text-xs font-bold">✨ {count} تسبيحة مكتملة. تقبل الله!</p>
               </div>
            )}
          </div>
          
          <div className="flex flex-col gap-4">
             {/* Main Video */}
            <a 
              href={generatedVideoUrl} 
              download={`quran-video-${state.resolution}-${Date.now()}.${extension}`}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-5 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-between group border border-emerald-400/50"
            >
              <span className="flex items-center gap-3 text-lg"><FileVideo size={24}/> تحميل الفيديو (مع الآيات)</span>
              <Download className="w-6 h-6 group-hover:translate-y-1 transition-transform" />
            </a>

            {/* No Text Variant */}
            {generatedNoTextUrl && (
                <a 
                href={generatedNoTextUrl} 
                download={`background-video-${state.resolution}-${Date.now()}.${extension}`}
                className="bg-white/5 hover:bg-white/10 text-white px-8 py-5 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-between group border border-white/10 backdrop-blur-md"
                >
                <span className="flex items-center gap-3 text-lg"><FileVideo size={24}/> النسخة الخام (بدون آيات)</span>
                <Download className="w-6 h-6 group-hover:translate-y-1 transition-transform" />
                </a>
            )}

            <button 
              onClick={onReset}
              className="mt-6 px-10 py-4 rounded-2xl font-bold text-slate-500 hover:text-white hover:bg-white/5 transition-all text-sm uppercase tracking-widest border border-transparent hover:border-white/5"
            >
              Start New Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
