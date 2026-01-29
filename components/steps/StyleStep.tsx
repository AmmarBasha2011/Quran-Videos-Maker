
import React, { useRef, useState, useEffect } from 'react';
import { AppState, FontType, TextStyle, QuranConfig } from '../../types';
import { FONTS } from '../../constants';
import { Move, Type, Palette, Type as TypeIcon, Maximize, Layers, LayoutTemplate, BookOpen } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

export const StyleStep: React.FC<Props> = ({ state, updateState }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'surah' | 'reader' | 'quran' | null>(null);
  
  // Tabs: Surah, Reader, and conditionally Quran
  const [activeTab, setActiveTab] = useState<'surah' | 'reader' | 'quran'>('surah');

  // Determine which style object we are editing
  const currentStyle = activeTab === 'surah' ? state.surahStyle : 
                       activeTab === 'reader' ? state.readerStyle : 
                       state.quranConfig.style;

  const updateCurrentStyle = (updates: Partial<TextStyle>) => {
    if (activeTab === 'surah') {
        updateState({ surahStyle: { ...state.surahStyle, ...updates } });
    } else if (activeTab === 'reader') {
        updateState({ readerStyle: { ...state.readerStyle, ...updates } });
    } else if (activeTab === 'quran') {
        updateState({ 
            quranConfig: { 
                ...state.quranConfig, 
                style: { ...state.quranConfig.style, ...updates } 
            } 
        });
    }
  };

  const updateQuranConfig = (updates: Partial<QuranConfig>) => {
      updateState({ quranConfig: { ...state.quranConfig, ...updates } });
  };

  // Helper to calculate percentage position from mouse/touch event
  const handleMove = (clientX: number, clientY: number) => {
    if (!containerRef.current || !dragging) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    if (dragging === 'surah') {
      updateState({ surahPosition: { x: clampedX, y: clampedY } });
    } else if (dragging === 'reader') {
      updateState({ readerPosition: { x: clampedX, y: clampedY } });
    } else if (dragging === 'quran') {
      updateQuranConfig({ position: { x: clampedX, y: clampedY } });
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (dragging) handleMove(e.clientX, e.clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (dragging) handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const stopDrag = () => setDragging(null);

  useEffect(() => {
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);
    return () => {
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchend', stopDrag);
    };
  }, []);

  // Handle word clicking for highlighting (Only for Quran)
  const handleWordClick = (verseIndex: number, wordIndex: number) => {
      if (activeTab !== 'quran') return;
      
      const config = state.quranConfig;
      const existingHighlight = config.highlights.find(h => h.verseIndex === verseIndex && h.wordIndex === wordIndex);
      let newHighlights;
      
      if (existingHighlight) {
          newHighlights = config.highlights.filter(h => !(h.verseIndex === verseIndex && h.wordIndex === wordIndex));
      } else {
          newHighlights = [...config.highlights, { verseIndex, wordIndex, color: config.highlightColor }];
      }
      updateQuranConfig({ highlights: newHighlights });
  };

  const previewAsset = state.selectedAssets.length > 0 ? state.selectedAssets[0] : null;

  const getAspectRatioClass = () => {
    switch(state.aspectRatio) {
        case '9:16': return 'aspect-[9/16] max-h-[500px] w-auto mx-auto';
        case '1:1': return 'aspect-square max-h-[500px] w-auto mx-auto';
        case '4:5': return 'aspect-[4/5] max-h-[500px] w-auto mx-auto';
        case '16:9': default: return 'aspect-video w-full';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 flex-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black font-rakkas text-white">تخصيص المظهر</h2>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white font-mono border border-white/20 backdrop-blur-sm">
                    {state.aspectRatio}
                </span>
           </div>
           <p className="text-sm text-slate-500 mt-1 font-medium">تحكم في الخطوط، الألوان، وأماكن ظهور النصوص.</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Settings Panel */}
        <div className="md:col-span-1 space-y-6 bg-white/5 p-6 rounded-[2rem] border border-white/10 h-fit flex flex-col order-2 md:order-1 shadow-2xl backdrop-blur-xl relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
           
           {/* Tabs */}
           <div className="flex bg-black/20 rounded-2xl p-1.5 border border-white/5 relative z-10 shadow-inner">
               <button 
                 onClick={() => setActiveTab('surah')}
                 className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all duration-300 ${activeTab === 'surah' ? 'bg-white text-black shadow-lg scale-105' : 'text-slate-400 hover:text-slate-200'}`}
               >
                 اسم السورة
               </button>
               <button 
                 onClick={() => setActiveTab('reader')}
                 className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all duration-300 ${activeTab === 'reader' ? 'bg-white text-black shadow-lg scale-105' : 'text-slate-400 hover:text-slate-200'}`}
               >
                 اسم القارئ
               </button>
               {state.quranConfig.isEnabled && (
                   <button 
                     onClick={() => setActiveTab('quran')}
                     className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all duration-300 ${activeTab === 'quran' ? 'bg-white text-black shadow-lg scale-105' : 'text-slate-400 hover:text-slate-200'}`}
                   >
                     الآيات
                   </button>
               )}
           </div>

           {/* Controls Container */}
           <div className="space-y-6 overflow-y-auto max-h-[450px] no-scrollbar pr-1 relative z-10">
               
               {/* Color */}
               <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                   <Palette size={16} strokeWidth={2.5} className="text-white" /> {activeTab === 'quran' ? 'لون النص الرئيسي' : 'لون النص'}
                 </label>
                 <div className="flex items-center gap-4 bg-black/20 p-2 rounded-2xl border border-white/5 shadow-inner">
                    <input 
                        type="color" 
                        value={currentStyle.color}
                        onChange={(e) => updateCurrentStyle({ color: e.target.value })}
                        className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none p-0 overflow-hidden shadow-lg"
                    />
                    <span className="text-xs font-black font-mono text-white uppercase">{currentStyle.color}</span>
                 </div>
               </div>

               {/* Quran Specific: Highlight Color */}
               {activeTab === 'quran' && (
                   <div className="space-y-3 pt-4 border-t border-white/5">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                       <BookOpen size={16} strokeWidth={2.5} className="text-purple-400" /> لون التمييز الذكي
                     </label>
                     <div className="flex items-center gap-4 bg-black/20 p-2 rounded-2xl border border-white/5 shadow-inner">
                        <input 
                            type="color" 
                            value={state.quranConfig.highlightColor}
                            onChange={(e) => updateQuranConfig({ highlightColor: e.target.value })}
                            className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none p-0 overflow-hidden shadow-lg"
                        />
                        <span className="text-[10px] font-bold text-slate-500 leading-tight">اضغط على الكلمة في المعاينة لتلوينها</span>
                     </div>
                   </div>
               )}

               {/* Size */}
               <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                   <Maximize size={16} strokeWidth={2.5} className="text-white" /> حجم الخط
                 </label>
                 <div className="bg-black/20 p-4 rounded-2xl border border-white/5 shadow-inner">
                    <input
                        type="range" min="0.5" max="3.0" step="0.1"
                        value={currentStyle.fontSizeScale}
                        onChange={(e) => updateCurrentStyle({ fontSizeScale: parseFloat(e.target.value) })}
                        className="w-full accent-white h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                 </div>
               </div>

               {/* Shadow Toggle */}
               <div
                    onClick={() => updateCurrentStyle({ hasShadow: !currentStyle.hasShadow })}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${currentStyle.hasShadow ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
               >
                    <div className="flex items-center gap-3 text-xs font-black text-white uppercase tracking-tight">
                        <Layers size={16} strokeWidth={2.5} /> ظل احترافي
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors p-1 ${currentStyle.hasShadow ? 'bg-purple-500' : 'bg-white/10'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-all shadow-lg ${currentStyle.hasShadow ? 'translate-x-0' : 'translate-x-6'}`} />
                    </div>
               </div>

               {/* Font Picker */}
               <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                   <TypeIcon size={16} strokeWidth={2.5} className="text-white" /> الخط العربي
                 </label>
                 <div className="grid grid-cols-1 gap-2">
                   {FONTS.map(font => (
                     <button
                       key={font.value}
                       onClick={() => updateCurrentStyle({ font: font.value })}
                       className={`text-sm py-4 px-5 rounded-2xl text-right transition-all duration-300 border flex justify-between items-center group ${currentStyle.font === font.value ? 'bg-white border-white text-black shadow-2xl scale-[1.02]' : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5'}`}
                       style={{ fontFamily: font.value === 'Scheherazade New' ? '"Scheherazade New", serif' : font.value }}
                     >
                       <span className="font-bold">{font.label}</span>
                       <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${currentStyle.font === font.value ? 'bg-black/10 text-black' : 'bg-white/5 text-slate-600 group-hover:text-slate-400'}`}>{font.category}</span>
                     </button>
                   ))}
                 </div>
               </div>

           </div>
        </div>

        {/* Preview & Drag Area */}
        <div className="md:col-span-2 space-y-4 flex flex-col justify-center order-1 md:order-2">
          <div 
            ref={containerRef}
            className={`${getAspectRatioClass()} bg-black rounded-[2.5rem] border border-white/10 relative overflow-hidden cursor-crosshair select-none shadow-[0_0_80px_rgba(0,0,0,0.5)] transition-all duration-700 group`}
            onMouseMove={onMouseMove}
            onTouchMove={onTouchMove}
            dir="ltr"
          >
              {previewAsset ? (
                 previewAsset.type === 'video' ? (
                    <video 
                      src={previewAsset.url} 
                      className="w-full h-full object-cover opacity-60" 
                      muted 
                      loop
                      autoPlay
                      playsInline
                    />
                 ) : (
                    <img 
                      src={previewAsset.url} 
                      className="w-full h-full object-cover opacity-60" 
                      alt="Preview" 
                      draggable={false}
                    />
                 )
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500 flex-col gap-2">
                    <LayoutTemplate size={32} />
                    <p>معاينة {state.aspectRatio}</p>
                </div>
              )}
              
              {/* Grid Lines */}
              <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="absolute top-1/2 left-0 w-full h-px bg-white"></div>
                <div className="absolute left-1/2 top-0 h-full w-px bg-white"></div>
              </div>

              {/* Element: Surah Name */}
              <div 
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move p-2 rounded border border-transparent hover:border-white/30 hover:bg-white/5 transition-colors z-20 group`}
                style={{ left: `${state.surahPosition.x}%`, top: `${state.surahPosition.y}%` }}
                onMouseDown={() => { setDragging('surah'); setActiveTab('surah'); }}
                onTouchStart={() => { setDragging('surah'); setActiveTab('surah'); }}
              >
                <Move size={12} className="absolute -top-3 left-1/2 -translate-x-1/2 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                <span 
                  style={{ 
                      fontFamily: state.surahStyle.font === 'Scheherazade New' ? '"Scheherazade New", serif' : state.surahStyle.font,
                      color: state.surahStyle.color,
                      textShadow: state.surahStyle.hasShadow ? '0px 2px 10px rgba(0,0,0,0.8)' : 'none',
                      fontSize: `${3 * state.surahStyle.fontSizeScale}rem`
                  }}
                  className="whitespace-nowrap font-bold"
                >
                  {state.surahName || "اسم السورة"}
                </span>
                {activeTab === 'surah' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />}
              </div>

              {/* Element: Reader Name */}
              <div 
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move p-2 rounded border border-transparent hover:border-white/30 hover:bg-white/5 transition-colors z-20 group`}
                style={{ left: `${state.readerPosition.x}%`, top: `${state.readerPosition.y}%` }}
                onMouseDown={() => { setDragging('reader'); setActiveTab('reader'); }}
                onTouchStart={() => { setDragging('reader'); setActiveTab('reader'); }}
              >
                <Move size={12} className="absolute -top-3 left-1/2 -translate-x-1/2 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                <span 
                  style={{ 
                      fontFamily: state.readerStyle.font === 'Scheherazade New' ? '"Scheherazade New", serif' : state.readerStyle.font,
                      color: state.readerStyle.color,
                      textShadow: state.readerStyle.hasShadow ? '0px 2px 8px rgba(0,0,0,0.8)' : 'none',
                      fontSize: `${1.5 * state.readerStyle.fontSizeScale}rem`
                  }}
                  className="whitespace-nowrap"
                >
                  {state.readerName || "اسم القارئ"}
                </span>
                {activeTab === 'reader' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />}
              </div>

              {/* Element: Quran Text (Preview Only First Verse) */}
              {state.quranConfig.isEnabled && state.quranConfig.timings.length > 0 && (
                  <div 
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move p-4 text-center z-10 w-full px-10 border border-transparent hover:border-white/30 hover:bg-white/5 rounded transition-colors`}
                    style={{ left: `${state.quranConfig.position.x}%`, top: `${state.quranConfig.position.y}%` }}
                    onMouseDown={() => { setDragging('quran'); setActiveTab('quran'); }}
                    onTouchStart={() => { setDragging('quran'); setActiveTab('quran'); }}
                  >
                     <Move size={12} className="absolute -top-3 left-1/2 -translate-x-1/2 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                     <p 
                        dir="rtl"
                        style={{ 
                            fontFamily: state.quranConfig.style.font === 'Scheherazade New' ? '"Scheherazade New", serif' : state.quranConfig.style.font,
                            fontSize: `${2 * state.quranConfig.style.fontSizeScale}rem`,
                            color: state.quranConfig.style.color,
                            textShadow: state.quranConfig.style.hasShadow ? '0 2px 4px rgba(0,0,0,0.8)' : 'none',
                            lineHeight: 1.6
                        }}
                     >
                        {state.quranConfig.timings[0].text.split(' ').map((word, wordIndex) => {
                            // Use index 0 for preview
                            const isHighlighted = state.quranConfig.highlights.some(h => h.verseIndex === 0 && h.wordIndex === wordIndex);
                            const highlightColor = state.quranConfig.highlights.find(h => h.verseIndex === 0 && h.wordIndex === wordIndex)?.color;
                            
                            return (
                                <span 
                                    key={wordIndex}
                                    onClick={(e) => { e.stopPropagation(); handleWordClick(0, wordIndex); }}
                                    className={`cursor-pointer hover:opacity-80 transition-opacity px-1 inline-block ${activeTab === 'quran' ? 'hover:scale-105' : ''}`}
                                    style={{ color: isHighlighted ? highlightColor : 'inherit' }}
                                >
                                    {word}
                                </span>
                            );
                        })}
                     </p>
                     {activeTab === 'quran' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />}
                  </div>
              )}

          </div>
          
          <div className="flex justify-between items-center bg-black/20 backdrop-blur-xl border border-white/5 px-6 py-3 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
             <span className="flex items-center gap-2"><Move size={12} strokeWidth={3}/> Drag elements to reposition</span>
             <span className="bg-white/5 px-3 py-1 rounded-full">{activeTab === 'quran' ? 'Click words to highlight' : 'Select tab to edit'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
