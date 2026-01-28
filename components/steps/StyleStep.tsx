import React, { useRef, useState, useEffect } from 'react';
import { AppState, FontType, TextStyle } from '../../types';
import { FONTS } from '../../constants';
import { Move, Type, Palette, Type as TypeIcon, Maximize, Layers } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

export const StyleStep: React.FC<Props> = ({ state, updateState }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'surah' | 'reader' | null>(null);
  const [activeTab, setActiveTab] = useState<'surah' | 'reader'>('surah');

  const currentStyle = activeTab === 'surah' ? state.surahStyle : state.readerStyle;

  const updateCurrentStyle = (updates: Partial<TextStyle>) => {
    if (activeTab === 'surah') {
        updateState({ surahStyle: { ...state.surahStyle, ...updates } });
    } else {
        updateState({ readerStyle: { ...state.readerStyle, ...updates } });
    }
  };

  // Helper to calculate percentage position from mouse/touch event
  const handleMove = (clientX: number, clientY: number) => {
    if (!containerRef.current || !dragging) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    // Clamp values 0-100
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    if (dragging === 'surah') {
      updateState({ surahPosition: { x: clampedX, y: clampedY } });
    } else {
      updateState({ readerPosition: { x: clampedX, y: clampedY } });
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

  const previewAsset = state.selectedAssets.length > 0 ? state.selectedAssets[0] : null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-xl font-bold font-rakkas">تخصيص المظهر</h2>
           <p className="text-xs text-slate-400">تحكم في الخطوط، الألوان، وأماكن النصوص.</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Settings Panel */}
        <div className="md:col-span-1 space-y-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800 h-fit flex flex-col">
           
           {/* Tabs */}
           <div className="flex bg-slate-900 rounded-lg p-1 mb-2">
               <button 
                 onClick={() => setActiveTab('surah')}
                 className={`flex-1 py-2 rounded text-sm font-bold transition-all ${activeTab === 'surah' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
               >
                 اسم السورة
               </button>
               <button 
                 onClick={() => setActiveTab('reader')}
                 className={`flex-1 py-2 rounded text-sm font-bold transition-all ${activeTab === 'reader' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
               >
                 اسم القارئ
               </button>
           </div>

           {/* Controls Container */}
           <div className="space-y-4 overflow-y-auto max-h-[350px] custom-scrollbar pr-1">
               
               {/* Color */}
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                   <Palette size={14} /> اللون
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

               {/* Size */}
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                   <Maximize size={14} /> الحجم
                 </label>
                 <input 
                    type="range" min="0.5" max="2.0" step="0.1"
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
        <div className="md:col-span-2 space-y-2">
          <div 
            ref={containerRef}
            className="aspect-video bg-black rounded-lg border border-slate-700 relative overflow-hidden cursor-crosshair select-none shadow-2xl"
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
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500">
                    اختر خلفية أولاً
                </div>
              )}
              
              {/* Grid Lines */}
              <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="absolute top-1/2 left-0 w-full h-px bg-white"></div>
                <div className="absolute left-1/2 top-0 h-full w-px bg-white"></div>
              </div>

              {/* Surah Element */}
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
                      fontSize: `${3 * state.surahStyle.fontSizeScale}rem` // Base size relative
                  }}
                  className="whitespace-nowrap font-bold"
                >
                  {state.surahName || "اسم السورة"}
                </span>
                {activeTab === 'surah' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />}
              </div>

              {/* Reader Element */}
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
          </div>
          
          <div className="flex justify-between text-[10px] text-slate-500">
             <span>اضغط على النص لتفعيله وتعديله</span>
             <span>X:{Math.round(state.surahPosition.x)}% Y:{Math.round(state.surahPosition.y)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};