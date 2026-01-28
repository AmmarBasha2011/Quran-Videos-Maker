import React, { useState, useEffect } from 'react';
import { AppState, AudioPreset, UnsplashImage } from './types';
import { STEPS, AUDIO_PRESETS, TEXT_POSITIONS } from './constants';
import { fetchIslamicImages } from './services/unsplashService';
import { useAudioProcessing } from './hooks/useAudioProcessing';
import { useVideoExport } from './hooks/useVideoExport';
import { 
  Music, Image as ImageIcon, FileAudio, Settings, Download, 
  Play, Pause, ChevronRight, ChevronLeft, RefreshCw, Upload,
  CheckCircle, Loader2, Volume2, Move, Smartphone
} from 'lucide-react';

export default function App() {
  // --- Global State ---
  const [state, setState] = useState<AppState>({
    step: 1,
    readerName: '',
    surahName: '',
    backgroundImage: null,
    audioFile: null,
    audioUrl: null,
    audioDuration: 0,
    reverbAmount: 0,
    echoAmount: 0,
    isNormalized: false,
    selectedPresetId: 'custom',
    resolution: '1080p',
    surahPosition: 'top-center',
    readerPosition: 'bottom-center',
    isProcessing: false,
    progress: 0,
    queuePosition: null,
  });

  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  // --- Hooks ---
  const { 
    isPlaying, currentTime, duration, isReady, togglePlay, audioBuffer 
  } = useAudioProcessing({
    file: state.audioFile,
    reverbAmount: state.reverbAmount,
    echoAmount: state.echoAmount,
    normalize: state.isNormalized
  });

  const { isExporting, exportProgress, generateVideo } = useVideoExport();

  // --- Effects ---
  
  // Load initial preset from localStorage
  useEffect(() => {
    const savedPresetId = localStorage.getItem('lastPresetId');
    if (savedPresetId) {
      applyPreset(savedPresetId);
    }
  }, []);

  const fetchImages = async () => {
    setLoadingImages(true);
    const imgs = await fetchIslamicImages();
    setImages(imgs);
    setLoadingImages(false);
  };

  useEffect(() => {
    if (state.step === 2 && images.length === 0) {
      fetchImages();
    }
  }, [state.step]);

  // --- Handlers ---

  const handleNext = () => setState(s => ({ ...s, step: Math.min(s.step + 1, 5) }));
  const handleBack = () => setState(s => ({ ...s, step: Math.max(s.step - 1, 1) }));

  const applyPreset = (id: string) => {
    const preset = AUDIO_PRESETS.find(p => p.id === id);
    if (preset) {
      setState(s => ({
        ...s,
        selectedPresetId: id,
        reverbAmount: preset.reverb,
        echoAmount: preset.echo,
        isNormalized: preset.normalize
      }));
      localStorage.setItem('lastPresetId', id);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setState(s => ({ ...s, audioFile: file, audioUrl: url }));
    }
  };

  const handleGenerate = () => {
    setState(s => ({ ...s, isProcessing: true }));
    generateVideo(state, audioBuffer, (url) => {
      setGeneratedVideoUrl(url);
      setState(s => ({ ...s, isProcessing: false }));
    });
  };

  // --- Render Helpers ---

  const StepWizard = () => (
    <div className="flex justify-between items-center mb-8 px-2 md:px-4 max-w-2xl mx-auto overflow-x-auto pb-4 md:pb-0">
      {STEPS.map((step, idx) => {
        const isActive = state.step === step.id;
        const isDone = state.step > step.id;
        return (
          <div key={step.id} className="flex flex-col items-center z-10 min-w-[70px]">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2 
              ${isActive ? 'bg-emerald-600 border-emerald-400 text-white scale-110' : 
                isDone ? 'bg-emerald-900 border-emerald-800 text-emerald-400' : 
                'bg-slate-900 border-slate-700 text-slate-500'}`}>
              {isDone ? <CheckCircle size={16} /> : step.id}
            </div>
            <span className={`text-xs mt-2 font-medium ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>{step.label}</span>
          </div>
        )
      })}
      {/* Progress Line - Hidden on very small screens if needed, or adjusted */}
      <div className="hidden md:block absolute top-[88px] right-0 w-full h-0.5 bg-slate-800 -z-0" /> 
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-emerald-500/30 font-amiri" dir="rtl">
      
      {/* Header */}
      <header className="p-4 md:p-6 border-b border-slate-800/50 bg-[#020617]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-900 to-slate-900 flex items-center justify-center border border-emerald-800/30 shadow-lg shadow-emerald-900/20">
              <Music className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold font-rakkas tracking-wide text-transparent bg-clip-text bg-gradient-to-l from-emerald-100 to-emerald-400">
                صانع فيديوهات القرآن
              </h1>
              <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest font-mono">Video Studio</p>
            </div>
          </div>
          <div className="hidden md:block text-xs font-mono text-slate-600 border border-slate-800 rounded px-2 py-1">v1.0.0</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 relative pb-24 md:pb-6">
        <StepWizard />

        <div className="bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm rounded-2xl p-4 md:p-8 min-h-[500px] shadow-2xl relative overflow-hidden flex flex-col">
          
          {/* STEP 1: Details */}
          {state.step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold font-rakkas text-emerald-100">بيانات التلاوة</h2>
                <p className="text-slate-400 text-sm">أدخل التفاصيل التي ستظهر في الفيديو.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">اسم السورة</label>
                  <input 
                    type="text" 
                    dir="auto"
                    placeholder="سورة الفاتحة"
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all font-rakkas text-lg"
                    value={state.surahName}
                    onChange={(e) => setState(s => ({ ...s, surahName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">اسم القارئ</label>
                  <input 
                    type="text"
                    dir="auto" 
                    placeholder="مشاري راشد العفاسي"
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                    value={state.readerName}
                    onChange={(e) => setState(s => ({ ...s, readerName: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Background */}
          {state.step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold font-rakkas">اختر الخلفية</h2>
                <button 
                  onClick={fetchImages}
                  disabled={loadingImages}
                  className="text-xs flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full transition-colors"
                >
                  <RefreshCw size={12} className={loadingImages ? 'animate-spin' : ''} />
                  تغيير الصور
                </button>
              </div>

              {loadingImages ? (
                <div className="h-64 flex items-center justify-center text-slate-500">
                  <Loader2 className="animate-spin ml-2" /> جاري تحميل الصور...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {images.map(img => (
                    <div 
                      key={img.id}
                      onClick={() => setState(s => ({ ...s, backgroundImage: img.urls.regular }))}
                      className={`group relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${state.backgroundImage === img.urls.regular ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-transparent hover:border-slate-600'}`}
                    >
                      <img src={img.urls.small} alt={img.alt_description} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <span className="text-xs text-white truncate" dir="ltr">By {img.user.name}</span>
                      </div>
                      {state.backgroundImage === img.urls.regular && (
                        <div className="absolute top-2 left-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                          <CheckCircle size={16} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Audio */}
          {state.step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
              <div className="text-center">
                <h2 className="text-xl font-bold font-rakkas mb-2">رفع التلاوة</h2>
                {!state.audioFile ? (
                  <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 md:p-12 hover:border-emerald-500/50 hover:bg-slate-800/30 transition-all cursor-pointer relative group">
                    <input type="file" accept="audio/*" onChange={handleAudioUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4 group-hover:text-emerald-400 transition-colors" />
                    <p className="text-slate-400 group-hover:text-slate-300">اضغط للرفع أو اسحب الملف هنا (MP3/WAV)</p>
                  </div>
                ) : (
                  <div className="bg-slate-950/50 rounded-xl p-4 md:p-6 border border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4 max-w-[70%]">
                        <div className="w-12 h-12 rounded-full bg-emerald-900/20 text-emerald-500 flex flex-shrink-0 items-center justify-center">
                          <FileAudio />
                        </div>
                        <div className="text-right overflow-hidden">
                          <p className="font-medium text-slate-200 truncate" dir="ltr">{state.audioFile.name}</p>
                          <p className="text-xs text-slate-500">
                             {isPlaying ? "جاري التشغيل..." : "جاهز"}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={togglePlay}
                        disabled={!isReady}
                        className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all shadow-lg shadow-emerald-900/50 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      >
                         {isPlaying ? <Pause /> : <Play className="mr-1" />}
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden mb-6" dir="ltr">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-100 ease-linear"
                        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                      />
                    </div>

                    {/* Controls */}
                    <div className="grid md:grid-cols-2 gap-8">
                       <div>
                         <label className="text-xs font-medium text-slate-400 mb-3 block">إعدادات جاهزة</label>
                         <div className="flex flex-wrap gap-2">
                           {AUDIO_PRESETS.map(preset => (
                             <button
                               key={preset.id}
                               onClick={() => applyPreset(preset.id)}
                               className={`text-xs px-3 py-1.5 rounded-md border transition-all ${state.selectedPresetId === preset.id ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'border-slate-700 hover:border-slate-500 text-slate-400'}`}
                             >
                               {preset.name}
                             </button>
                           ))}
                         </div>
                       </div>

                       <div className="space-y-4">
                         <div>
                           <div className="flex justify-between text-xs text-slate-400 mb-1">
                             <span>الصدى (Reverb)</span>
                             <span>{Math.round(state.reverbAmount * 100)}%</span>
                           </div>
                           <input 
                             type="range" min="0" max="1" step="0.05"
                             value={state.reverbAmount}
                             onChange={(e) => setState(s => ({ ...s, reverbAmount: parseFloat(e.target.value), selectedPresetId: 'custom' }))}
                             className="w-full accent-emerald-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                             dir="ltr"
                           />
                         </div>
                         <div>
                           <div className="flex justify-between text-xs text-slate-400 mb-1">
                             <span>التكرار (Echo)</span>
                             <span>{Math.round(state.echoAmount * 100)}%</span>
                           </div>
                           <input 
                             type="range" min="0" max="1" step="0.05"
                             value={state.echoAmount}
                             onChange={(e) => setState(s => ({ ...s, echoAmount: parseFloat(e.target.value), selectedPresetId: 'custom' }))}
                             className="w-full accent-emerald-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                             dir="ltr"
                           />
                         </div>
                       </div>
                    </div>

                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Config */}
          {state.step === 4 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
               <h2 className="text-xl font-bold font-rakkas mb-4">إعدادات الفيديو</h2>
               
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-sm text-slate-400 block">أماكن النصوص</label>
                    <div className="space-y-3">
                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                        <label className="text-xs text-emerald-500 mb-1 block">مكان اسم السورة</label>
                        <select 
                          className="w-full bg-slate-900 border-none text-sm rounded outline-none focus:ring-1 focus:ring-emerald-500"
                          value={state.surahPosition}
                          onChange={(e) => setState(s => ({ ...s, surahPosition: e.target.value as any }))}
                        >
                          {TEXT_POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                      </div>
                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                        <label className="text-xs text-emerald-500 mb-1 block">مكان اسم القارئ</label>
                        <select 
                          className="w-full bg-slate-900 border-none text-sm rounded outline-none focus:ring-1 focus:ring-emerald-500"
                          value={state.readerPosition}
                          onChange={(e) => setState(s => ({ ...s, readerPosition: e.target.value as any }))}
                        >
                           {TEXT_POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Preview Box */}
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400 block">معاينة الشكل</label>
                    <div className="aspect-video bg-slate-950 rounded-lg border border-slate-800 relative overflow-hidden" dir="ltr">
                       {state.backgroundImage && (
                         <img src={state.backgroundImage} className="w-full h-full object-cover opacity-50" alt="Preview" />
                       )}
                       
                       {/* Mock Text Placement */}
                       <div className={`absolute p-2 text-center w-full pointer-events-none transition-all duration-300
                         ${state.surahPosition.includes('top') ? 'top-4' : state.surahPosition.includes('bottom') ? 'bottom-4' : 'top-1/2 -translate-y-1/2'}
                         ${state.surahPosition.includes('left') ? 'text-left pl-8' : state.surahPosition.includes('right') ? 'text-right pr-8' : 'text-center'}
                       `}>
                          <span className="font-rakkas text-2xl font-bold text-white drop-shadow-lg block">{state.surahName || "اسم السورة"}</span>
                       </div>

                       <div className={`absolute p-2 text-center w-full pointer-events-none transition-all duration-300
                         ${state.readerPosition.includes('top') ? 'top-4' : state.readerPosition.includes('bottom') ? 'bottom-8' : 'top-1/2 -translate-y-1/2'}
                         ${state.readerPosition.includes('left') ? 'text-left pl-8' : state.readerPosition.includes('right') ? 'text-right pr-8' : 'text-center'}
                       `}>
                          <span className="font-serif text-sm text-white/90 drop-shadow-md block">{state.readerName || "اسم القارئ"}</span>
                       </div>
                    </div>
                  </div>
               </div>
             </div>
          )}

          {/* STEP 5: Export */}
          {state.step === 5 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] animate-in fade-in zoom-in duration-500">
               
               {/* State 1: Ready */}
               {!isExporting && !generatedVideoUrl && (
                 <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                      <Settings className="w-10 h-10 text-emerald-500 animate-slow-spin" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2 font-rakkas">جاهز لإنشاء الفيديو</h2>
                      <p className="text-slate-400 max-w-sm mx-auto text-sm">
                        سيتم إنشاء الفيديو بجودة {state.resolution}. 
                        ملاحظة: الخادم يعالج فيديو واحد في كل مرة.
                      </p>
                    </div>
                    <button 
                      onClick={handleGenerate}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-emerald-900/40 transition-all hover:scale-105 active:scale-95 flex items-center mx-auto"
                    >
                      <Loader2 className="ml-2 w-5 h-5 animate-spin hidden" /> 
                      بدء المعالجة
                    </button>
                 </div>
               )}

               {/* State 2: Processing (Queue + Render) */}
               {isExporting && (
                 <div className="w-full max-w-md space-y-6 text-center">
                    <h3 className="text-xl font-bold text-emerald-400 animate-pulse font-rakkas">
                      {exportProgress < 20 ? "في قائمة الانتظار..." : "جاري إنشاء الفيديو..."}
                    </h3>
                    
                    {/* Progress Bar */}
                    <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative" dir="ltr">
                       <div 
                         className="h-full bg-gradient-to-l from-emerald-600 to-emerald-400 transition-all duration-300 relative"
                         style={{ width: `${exportProgress}%` }}
                       >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                       </div>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      {exportProgress < 20 ? "مكانك في الطابور: 1" : `${Math.round(exportProgress)}% مكتمل`}
                    </p>
                    
                    <div className="p-4 bg-emerald-900/10 border border-emerald-900/30 rounded-lg text-xs text-emerald-200/70">
                       <p>يرجى عدم إغلاق الصفحة أثناء المعالجة.</p>
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
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                      <a 
                        href={generatedVideoUrl} 
                        download={`quran-recitation-${Date.now()}.webm`}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-emerald-900/40 transition-all hover:scale-105 flex items-center justify-center"
                      >
                        <Download className="ml-2 w-5 h-5" />
                        تحميل الفيديو
                      </a>
                      <button 
                        onClick={() => {
                          setGeneratedVideoUrl(null);
                          setState(s => ({ ...s, step: 1 }));
                        }}
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
          )}

          {/* Navigation Buttons - Mobile Fixed Bottom or inline */}
          {!isExporting && !generatedVideoUrl && (
            <div className="md:absolute md:bottom-6 md:left-0 md:w-full md:px-8 flex justify-between items-center mt-auto pt-6 md:pt-0">
              <button 
                onClick={handleBack}
                disabled={state.step === 1}
                className="flex items-center text-slate-500 hover:text-white disabled:opacity-0 transition-all px-4 py-2"
              >
                <ChevronRight size={20} className="ml-1" /> السابق
              </button>
              
              {state.step < 5 && (
                <button 
                  onClick={handleNext}
                  disabled={
                    (state.step === 1 && (!state.surahName || !state.readerName)) ||
                    (state.step === 2 && !state.backgroundImage) ||
                    (state.step === 3 && !state.audioFile)
                  }
                  className="flex items-center bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed shadow-lg"
                >
                  التالي <ChevronLeft size={20} className="mr-1" />
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}