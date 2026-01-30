
import React, { useState, useEffect } from 'react';
import { Settings, Loader2, CheckCircle, Download, Hand, Timer, FileVideo, Smartphone, Server } from 'lucide-react';
import { AppState } from '../../types';

interface Props {
  state: AppState;
  isExporting: boolean;
  exportProgress: number;
  generatedVideoUrl: string | null;
  generatedNoTextUrl: string | null; 
  generatedExtension: string; // New prop for actual extension
  onGenerate: () => void;
  onReset: () => void;
  updateState: (updates: Partial<AppState>) => void;
}

const DHIKR_LIST = ['سُبْحَانَ اللَّهِ', 'الْحَمْدُ لِلَّهِ', 'لَا إِلَهَ إِلَّا اللَّهُ', 'اللَّهُ أَكْبَرُ'];

export const ExportStep: React.FC<Props> = ({ state, isExporting, exportProgress, generatedVideoUrl, generatedNoTextUrl, generatedExtension, onGenerate, onReset, updateState }) => {
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
  
  // Use the actual extension returned by the recording process
  const extension = generatedExtension || state.format || 'mp4';

  const hasLocalAssets = state.selectedAssets.some(a => a.url.startsWith('blob:'));

  let statusText = "جاري إنشاء الفيديو...";
  if (state.quranConfig.generateNoTextVariant && generatedVideoUrl && !generatedNoTextUrl) {
      statusText = "جاري إنشاء النسخة الثانية (بدون نصوص)...";
  } else if (exportProgress < 10) {
      statusText = "جاري التحضير...";
  }

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] animate-in fade-in zoom-in duration-500">
      
      {/* State 1: Ready */}
      {!isExporting && !generatedVideoUrl && (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <Settings className="w-10 h-10 text-emerald-500 animate-slow-spin" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 font-rakkas">جاهز لإنشاء الفيديو (V3.1)</h2>
            <div className="flex justify-center gap-4 text-xs text-slate-400 font-mono mb-2">
              <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">{state.resolution}</span>
              <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">{state.fps} FPS</span>
              {/* Show intended format, actual may vary based on browser support */}
              <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700 uppercase">{state.format || 'MP4'}</span>
            </div>
            {state.quranConfig.generateNoTextVariant && (
                <div className="text-xs text-emerald-400 bg-emerald-900/20 p-2 rounded border border-emerald-900/50 max-w-xs mx-auto mb-2">
                    سيتم إنشاء نسختين: واحدة بالآيات وأخرى بدونها.
                </div>
            )}

            <div className="flex flex-col gap-3 max-w-sm mx-auto my-6">
                <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider text-right">مكان المعالجة:</p>
                <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                    <button
                        onClick={() => updateState({ processingMode: 'phone' })}
                        className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all ${state.processingMode === 'phone' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Smartphone size={16} />
                        <span className="text-sm font-bold">الهاتف</span>
                    </button>
                    <button
                        onClick={() => updateState({ processingMode: 'server' })}
                        className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all ${state.processingMode === 'server' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Server size={16} />
                        <span className="text-sm font-bold">السيرفر</span>
                    </button>
                </div>
                {state.processingMode === 'server' ? (
                    <div className="space-y-1">
                        <p className="text-[10px] text-emerald-400/80 bg-emerald-950/30 p-2 rounded border border-emerald-900/30">
                            * المعالجة على السيرفر أسرع ومناسبة لدقة 4K، ولكن تتطلب رفع الملف الصوتي.
                        </p>
                        {hasLocalAssets && (
                            <p className="text-[10px] text-red-400 bg-red-950/20 p-2 rounded border border-red-900/30">
                                تنبيه: قمت برفع خلفيات خاصة بك. حالياً المعالجة على السيرفر لا تدعم الخلفيات المرفوعة، سيتم استخدام شاشة سوداء. يرجى استخدام معالجة الهاتف أو اختيار صور من المكتبة.
                            </p>
                        )}
                    </div>
                ) : (
                    <p className="text-[10px] text-slate-500">
                        * يتم إنشاء الفيديو مباشرة على جهازك. لا يتم رفع أي ملفات.
                    </p>
                )}
            </div>

            <p className="text-slate-400 max-w-sm mx-auto text-sm">
              سيتم إنشاء الفيديو بأقصى جودة ممكنة. قد تستغرق العملية بعض الوقت خاصة مع دقة 4K.
            </p>
          </div>
          <button 
            id="start-processing-button"
            onClick={onGenerate}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-emerald-900/40 transition-all hover:scale-105 active:scale-95 flex items-center mx-auto"
          >
            <Loader2 className="ml-2 w-5 h-5 animate-spin hidden" /> 
            بدء المعالجة
          </button>
        </div>
      )}

      {/* State 2: Processing */}
      {isExporting && (
        <div className="w-full max-w-md space-y-8 text-center">
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-emerald-400 animate-pulse font-rakkas">
              {statusText}
            </h3>
            
            <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative" dir="ltr">
                <div 
                  className="h-full bg-gradient-to-l from-emerald-600 to-emerald-400 transition-all duration-300 relative"
                  style={{ width: `${exportProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
            </div>
            
            <div className="flex justify-between items-center px-2">
                <span className="text-xs text-slate-500 font-mono">
                {Math.round(exportProgress)}% مكتمل
                </span>
                
                {state.timeRemaining && (
                    <span className="text-xs text-yellow-500/80 font-mono flex items-center gap-1 animate-in fade-in">
                        <Timer size={12} />
                        متبقي: {state.timeRemaining}
                    </span>
                )}
            </div>
          </div>

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
        <div className="text-center space-y-6 animate-in zoom-in duration-300 w-full max-w-md">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/40">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 font-rakkas">تم الانتهاء!</h2>
            <p className="text-slate-400">تم إنشاء الفيديوهات بنجاح.</p>
            {count > 0 && (
               <p className="text-emerald-400 text-sm mt-2">✨ لقد قمت بـ {count} تسبيحة أثناء الانتظار. تقبل الله!</p>
            )}
          </div>
          
          <div className="flex flex-col gap-3">
             {/* Main Video */}
            <a 
              href={generatedVideoUrl} 
              download={`quran-video-${state.resolution}-${Date.now()}.${extension}`}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-between group"
            >
              <span className="flex items-center gap-2"><FileVideo size={20}/> تحميل الفيديو (مع الآيات)</span>
              <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-700 px-2 py-1 rounded uppercase font-mono">{extension}</span>
                  <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
              </div>
            </a>

            {/* No Text Variant */}
            {generatedNoTextUrl && (
                <a 
                href={generatedNoTextUrl} 
                download={`background-video-${state.resolution}-${Date.now()}.${extension}`}
                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-between group border border-slate-700"
                >
                <span className="flex items-center gap-2"><FileVideo size={20}/> تحميل النسخة الخام (بدون آيات)</span>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-900 px-2 py-1 rounded uppercase font-mono">{extension}</span>
                    <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                </div>
                </a>
            )}

            <button 
              onClick={onReset}
              className="mt-4 px-6 py-3 rounded-full font-medium text-slate-500 hover:text-white hover:bg-slate-900 transition-all text-sm"
            >
              إنشاء مشروع جديد
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
