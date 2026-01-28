
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-rakkas">تخصيص المظهر</h2>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-emerald-400 font-mono border border-slate-700">
                    {state.aspectRatio}
                </span>
           </div>
           <p className="text-xs text-slate-400">تحكم في الخطوط، الألوان، وأماكن النصوص.</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Settings Panel */}
        <div className="md:col-span-1 space-y-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800 h-fit flex flex-col order-2 md:order-1">
           
           {/* Tabs */}
           <div className="flex bg-slate-900 rounded-lg p-1 mb-2">
               <button 
                 onClick={() => setActiveTab('surah')}
                 className={`flex-1 py-2 rounded text-[10px] md:text-xs font-bold transition-all ${activeTab === 'surah' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
               >
                 اسم السورة
               </button>
               <button 
                 onClick={() => setActiveTab('reader')}
                 className={`flex-1 py-2 rounded text-[10px] md:text-xs font-bold transition-all ${activeTab === 'reader' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
               >
                 اسم القارئ
               </button>
               {state.quranConfig.isEnabled && (
                   <button 
                     onClick={() => setActiveTab('quran')}
                     className={`flex-1 py-2 rounded text-[10px] md:text-xs font-bold transition-all ${activeTab === 'quran' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                   >
                     الآيات
                   </button>
               )}
           </div>

           {/* Controls Container */}
           <div className="space-y-4 overflow-y-auto max-h-[350px] custom-scrollbar pr-1">
               
               {/* Color */}
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                   <Palette size={14} /> {activeTab === 'quran' ? 'لون النص' : 'اللون'}
                 </label>
                 <div className="flex items-center gap-3">
                    <input 
                        type="color" 
                        value={currentStyle.color}
                        onChange={(e) => updateCurrentStyle({ color: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer bg-transparent border-none"
                    />
                    <span className="text-xs font-mono text-slate-500 uppercase">{currentStyle.color}</span>
                 </div>
               </div>

               {/* Quran Specific: Highlight Color */}
               {activeTab === 'quran' && (
                   <div className="space-y-2 pt-2 border-t border-slate-800">
                     <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                       <BookOpen size={14} /> لون التمييز (Highlight)
                     </label>
                     <div className="flex items-center gap-3">
                        <input 
                            type="color" 
                            value={state.quranConfig.highlightColor}
                            onChange={(e) => updateQuranConfig({ highlightColor: e.target.value })}
                            className="w-10 h-10 rounded cursor-pointer bg-transparent border-none"
                        />
                        <span className="text-[10px] text-slate-500">اضغط على الكلمة في المعاينة لتلوينها</span>
                     </div>
                   </div>
               )}

               {/* Size */}
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                   <Maximize size={14} /> الحجم
                 </label>
                 <input 
                    type="range" min="0.5" max="3.0" step="0.1"
                    value={currentStyle.fontSizeScale}
                    onChange={(e) => updateCurrentStyle({ fontSizeScale: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                 />
               </div>

               {/* Shadow Toggle */}
               <div className="flex items-center justify-between p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                        <Layers size={14} /> ظل للنص
                    </div>
                    <div 
                        onClick={() => updateCurrentStyle({ hasShadow: !currentStyle.hasShadow })}
                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${currentStyle.hasShadow ? 'bg-emerald-600' : 'bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${currentStyle.hasShadow ? 'left-1' : 'left-6'}`} />
                    </div>
               </div>

               {/* Font Picker */}
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                   <TypeIcon size={14} /> الخط العربي
                 </label>
                 <div className="grid grid-cols-1 gap-1">
                   {FONTS.map(font => (
                     <button
                       key={font.value}
                       onClick={() => updateCurrentStyle({ font: font.value })}
                       className={`text-sm py-2 px-3 rounded text-right transition-all border flex justify-between items-center ${currentStyle.font === font.value ? 'bg-emerald-900/40 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                       style={{ fontFamily: font.value === 'Scheherazade New' ? '"Scheherazade New", serif' : font.value }}
                     >
                       <span>{font.label}</span>
                       <span className="text-[10px] bg-slate-950 px-1 rounded text-slate-600">{font.category}</span>
                     </button>
                   ))}
                 </div>
               </div>

           </div>
        </div>

        {/* Preview & Drag Area */}
        <div className="md:col-span-2 space-y-2 flex flex-col justify-center order-1 md:order-2">
          <div 
            ref={containerRef}
            className={`${getAspectRatioClass()} bg-black rounded-lg border border-slate-700 relative overflow-hidden cursor-crosshair select-none shadow-2xl transition-all duration-500`}
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
          
          <div className="flex justify-between text-[10px] text-slate-500">
             <span>اضغط على العنصر لتفعيله | {activeTab === 'quran' ? 'اضغط على الكلمات لتلوينها' : 'اسحب لتغيير المكان'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
