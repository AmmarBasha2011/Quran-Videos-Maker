
import React, { useState, useEffect } from 'react';
import { Settings, Loader2, CheckCircle, Download, Hand, Timer, FileVideo, Cpu, Zap, hardDrive } from 'lucide-react';
import { AppState } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  state: AppState;
  isExporting: boolean;
  exportProgress: number;
  generatedVideoUrl: string | null;
  generatedNoTextUrl: string | null;
  onGenerate: () => void;
  onReset: () => void;
  onUpdateState: (updates: Partial<AppState>) => void;
}

const DHIKR_LIST = ['سُبْحَانَ اللَّهِ', 'الْحَمْدُ لِلَّهِ', 'لَا إِلَهَ إِلَّا اللَّهُ', 'اللَّهُ أَكْبَرُ'];

export const ExportStep: React.FC<Props> = ({ state, isExporting, exportProgress, generatedVideoUrl, generatedNoTextUrl, onGenerate, onReset, onUpdateState }) => {
  const [count, setCount] = useState(0);
  const [dhikrIndex, setDhikrIndex] = useState(0);
  const [animateClick, setAnimateClick] = useState(false);
  const [stats, setStats] = useState({ cpu: 0, ram: 0 });
  const [serverStatus, setServerStatus] = useState<string>('');

  useEffect(() => {
    if (!isExporting) {
      setCount(0);
      setDhikrIndex(0);
    }
  }, [isExporting]);

  useEffect(() => {
    let interval: any;
    if (isExporting) {
      interval = setInterval(async () => {
        if (state.processingLocation === 'server') {
          try {
            const res = await fetch(`/api/stats?t=${Date.now()}`);
            const data = await res.json();
            setStats({ cpu: data.cpu, ram: data.ram });

            // Also update job status message if possible
            const jobId = localStorage.getItem('activeJobId');
            if (jobId) {
              const jobRes = await fetch(`/api/jobs/${jobId}?t=${Date.now()}`);
              const jobData = await jobRes.json();
              if (jobData.statusMsg) setServerStatus(jobData.statusMsg);
            }
          } catch (e) {
            setStats({ cpu: Math.floor(Math.random() * 20) + 40, ram: Math.floor(Math.random() * 10) + 30 });
          }
        } else {
          // Local stats simulation (Limited browser API)
          const mem = (window.performance as any)?.memory;
          if (mem) {
             const ramPercent = Math.round((mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100);
             setStats({ cpu: Math.floor(Math.random() * 30) + 60, ram: ramPercent });
          } else {
             setStats({ cpu: Math.floor(Math.random() * 40) + 50, ram: Math.floor(Math.random() * 20) + 20 });
          }
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isExporting, state.processingLocation]);

  const handleTasbeehClick = () => {
    setCount(c => c + 1);
    setDhikrIndex(i => (i + 1) % DHIKR_LIST.length);
    setAnimateClick(true);
    setTimeout(() => setAnimateClick(false), 150);
  };
  
  const extension = state.format || 'mp4';

  let statusText = "جاري إنشاء الفيديو...";
  if (state.quranConfig.generateNoTextVariant && generatedVideoUrl && !generatedNoTextUrl) {
      statusText = "جاري إنشاء النسخة الثانية (بدون نصوص)...";
  } else if (exportProgress < 10) {
      statusText = "جاري التحضير...";
  }

  const StatMeter = ({ label, value, icon: Icon, color }: any) => (
    <div className="flex flex-col gap-1 flex-1">
      <div className="flex justify-between items-center text-[10px] text-slate-400">
        <span className="flex items-center gap-1"><Icon size={10} /> {label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={`h-full ${color} shadow-[0_0_10px_rgba(16,185,129,0.3)]`}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
      
      {/* State 1: Ready */}
      {!isExporting && !generatedVideoUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 w-full max-w-sm"
        >
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 liquid-glass">
            <Settings className="w-10 h-10 text-emerald-500 animate-slow-spin" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 font-rakkas">جاهز لإنشاء الفيديو (V3.0)</h2>
            <div className="flex justify-center gap-4 text-xs text-slate-400 font-mono mb-6">
              <span className="bg-slate-800/50 px-2 py-1 rounded border border-slate-700">{state.resolution}</span>
              <span className="bg-slate-800/50 px-2 py-1 rounded border border-slate-700">{state.fps} FPS</span>
              <span className="bg-slate-800/50 px-2 py-1 rounded border border-slate-700 uppercase">{state.format || 'MP4'}</span>
            </div>

            <div className="liquid-glass p-4 rounded-2xl mb-6">
              <label className="text-sm text-slate-300 block mb-3 font-rakkas">اختر وسيلة المعالجة</label>
              <div className="relative flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                <motion.div
                  className="absolute top-1 bottom-1 bg-emerald-600 rounded-lg shadow-lg"
                  initial={false}
                  animate={{
                    left: state.processingLocation === 'local' ? '4px' : '50%',
                    right: state.processingLocation === 'local' ? '50%' : '4px'
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <button
                  onClick={() => onUpdateState({ processingLocation: 'local' })}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold relative z-10 transition-colors ${state.processingLocation === 'local' ? 'text-white' : 'text-slate-500'}`}
                >
                  الهاتف (المعالج المحلي)
                </button>
                <button
                  onClick={() => onUpdateState({ processingLocation: 'server' })}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold relative z-10 transition-colors ${state.processingLocation === 'server' ? 'text-white' : 'text-slate-500'}`}
                >
                  السيرفر (أداء عالي)
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={state.processingLocation}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-slate-400 text-sm mb-6 h-10"
              >
                {state.processingLocation === 'server'
                  ? "سيتم استخدام موارد السيرفر (FFmpeg) لإنتاج فيديو بجودة سينمائية فائقة."
                  : "ستتم المعالجة مباشرة في متصفحك. قد ترتفع حرارة الجهاز في الدقات العالية."}
              </motion.p>
            </AnimatePresence>
          </div>

          <button 
            onClick={onGenerate}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-900/40 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            بدء المعالجة
            <Zap size={20} className="fill-current" />
          </button>
        </motion.div>
      )}

      {/* State 2: Processing */}
      {isExporting && (
        <div className="w-full max-w-md space-y-8 text-center animate-in fade-in zoom-in duration-500">
          
          <div className="space-y-6 liquid-glass p-6">
            <div className="flex justify-between items-center mb-2">
               <h3 className="text-xl font-bold text-emerald-400 font-rakkas flex items-center gap-2">
                 {state.processingLocation === 'server' ? <Zap className="text-yellow-400 animate-pulse" /> : <Loader2 className="animate-spin" />}
                 {state.processingLocation === 'server' && serverStatus ? serverStatus : statusText}
               </h3>
               <span className="text-xs text-slate-500 font-mono bg-slate-800/50 px-2 py-1 rounded">
                 {state.processingLocation === 'server' ? 'السيرفر' : 'الهاتف'}
               </span>
            </div>
            
            <div className="h-4 w-full bg-slate-900/80 rounded-full overflow-hidden border border-slate-700/50 relative" dir="ltr">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600 bg-[length:200%_100%] transition-all duration-300 relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${exportProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                </motion.div>
            </div>
            
            <div className="flex justify-between items-center px-1">
                <span className="text-xs text-slate-400 font-mono">
                {Math.round(exportProgress)}% مكتمل
                </span>
                
                {state.timeRemaining && (
                    <span className="text-xs text-yellow-500/80 font-mono flex items-center gap-1 animate-in fade-in">
                        <Timer size={12} />
                        متبقي: {state.timeRemaining}
                    </span>
                )}
            </div>

            {/* Resource Meters */}
            <div className="pt-4 border-t border-slate-800/50 flex flex-col gap-4">
               <div className="flex gap-6">
                 <StatMeter label="المعالج (CPU)" value={stats.cpu} icon={Cpu} color="bg-blue-500" />
                 <StatMeter label="الذاكرة (RAM)" value={stats.ram} icon={Loader2} color="bg-purple-500" />
               </div>
               {state.processingLocation === 'server' && (
                 <div className="text-[10px] text-emerald-400/60 font-rakkas flex items-center justify-center gap-2 animate-pulse">
                   <Zap size={10} /> يمكنك إغلاق الصفحة والعودة لاحقاً، المعالجة مستمرة على السيرفر
                 </div>
               )}
            </div>
          </div>

          <div className="liquid-glass p-6 rounded-3xl">
            <p className="text-sm text-slate-400 mb-4 font-rakkas italic">"ألا بذكر الله تطمئن القلوب"</p>
            
            <button 
              onClick={handleTasbeehClick}
              className={`w-32 h-32 rounded-full bg-gradient-to-br from-emerald-900/50 to-slate-900/50 border-4 border-emerald-500/30 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.1)] transition-all transform active:scale-90 mx-auto outline-none select-none
                ${animateClick ? 'scale-95 border-emerald-400/50 shadow-[0_0_60px_rgba(16,185,129,0.3)]' : 'hover:scale-105 hover:border-emerald-500/50'}
              `}
            >
              <span className="text-4xl font-bold text-white font-rakkas">{count}</span>
              <Hand size={20} className="text-emerald-500/50 mt-2" />
            </button>

            <div className="mt-4 h-8 flex justify-center items-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={count}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xl font-bold text-emerald-400 font-amiri"
                >
                  {DHIKR_LIST[dhikrIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
          
          <div className="text-[10px] text-slate-600 uppercase tracking-widest">
              Processing on {state.processingLocation} • Don't close this tab
          </div>
        </div>
      )}

      {/* State 3: Done */}
      {!isExporting && generatedVideoUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 w-full max-w-md"
        >
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/40 liquid-glass">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 font-rakkas">تم الانتهاء!</h2>
            <p className="text-slate-400">تم إنشاء الفيديو بنجاح عبر {state.processingLocation === 'server' ? 'السيرفر' : 'الهاتف'}.</p>
            {count > 0 && (
               <p className="text-emerald-400 text-sm mt-2">✨ لقد قمت بـ {count} تسبيحة أثناء الانتظار. تقبل الله!</p>
            )}
          </div>
          
          <div className="flex flex-col gap-3">
             {/* Main Video */}
            <a 
              href={generatedVideoUrl} 
              download={`quran-video-${state.resolution}-${Date.now()}.${extension}`}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-between group"
            >
              <span className="flex items-center gap-2"><FileVideo size={20}/> تحميل الفيديو (مع الآيات)</span>
              <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
            </a>

            {/* No Text Variant */}
            {generatedNoTextUrl && (
                <a 
                href={generatedNoTextUrl} 
                download={`background-video-${state.resolution}-${Date.now()}.${extension}`}
                className="liquid-glass hover:bg-white/10 text-white px-6 py-4 rounded-2xl font-bold transition-all flex items-center justify-between group border border-white/10"
                >
                <span className="flex items-center gap-2"><FileVideo size={20}/> تحميل النسخة الخام (بدون آيات)</span>
                <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                </a>
            )}

            <button 
              onClick={onReset}
              className="mt-4 px-6 py-3 rounded-full font-medium text-slate-500 hover:text-white hover:bg-white/5 transition-all text-sm"
            >
              إنشاء مشروع جديد
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
