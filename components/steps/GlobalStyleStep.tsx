
import React, { useState } from 'react';
import { AppState, GlobalStyleConfig, AutoHighlight } from '../../types';
import { Layers, MoveUp, Activity, Plus, Trash2, Wand2 } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

export const GlobalStyleStep: React.FC<Props> = ({ state, updateState }) => {
  const { globalStyle } = state;
  const [highlightWord, setHighlightWord] = useState('');
  const [highlightColor, setHighlightColor] = useState('#fbbf24'); // Default Amber

  const updateGlobalStyle = (updates: Partial<GlobalStyleConfig>) => {
    updateState({ globalStyle: { ...globalStyle, ...updates } });
  };

  const addHighlight = () => {
    if (highlightWord.trim()) {
        const newHighlight: AutoHighlight = { word: highlightWord.trim(), color: highlightColor };
        updateGlobalStyle({ autoHighlights: [...globalStyle.autoHighlights, newHighlight] });
        setHighlightWord('');
    }
  };

  const removeHighlight = (index: number) => {
    const newHighlights = [...globalStyle.autoHighlights];
    newHighlights.splice(index, 1);
    updateGlobalStyle({ autoHighlights: newHighlights });
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
      <div className="text-center md:text-right">
        <h2 className="text-3xl font-black font-rakkas text-white">إعدادات النمط</h2>
        <p className="text-slate-500 text-sm mt-1">تحكم في الانتقالات، حركة النصوص، والتلوين التلقائي.</p>
      </div>

      <div className="flex flex-col gap-8">
        
        {/* 1. Transitions */}
        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-3 relative z-10">
                <Layers size={20} className="text-white" strokeWidth={2.5} /> انتقالات الخلفية
            </label>
            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                <button 
                    onClick={() => updateGlobalStyle({ transitionType: 'fade' })}
                    className={`flex-1 p-5 rounded-2xl border text-sm font-black transition-all duration-300 ${globalStyle.transitionType === 'fade' ? 'bg-white text-black border-white shadow-2xl scale-105' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                    تلاشي (Cross Fade)
                </button>
                <button 
                    onClick={() => updateGlobalStyle({ transitionType: 'cut' })}
                    className={`flex-1 p-5 rounded-2xl border text-sm font-black transition-all duration-300 ${globalStyle.transitionType === 'cut' ? 'bg-white text-black border-white shadow-2xl scale-105' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                    قطع مباشر (Cut)
                </button>
            </div>
        </div>

        {/* 2. Text Animation */}
        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-3 relative z-10">
                <MoveUp size={20} className="text-white" strokeWidth={2.5} /> حركة ظهور الآيات
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                {[
                    { id: 'fade', label: 'ظهور تدريجي (Fade In)' },
                    { id: 'slideUp', label: 'صعود للأعلى (Slide Up)' },
                    { id: 'scale', label: 'تكبير (Scale Up)' },
                    { id: 'none', label: 'ثابت (None)' }
                ].map(anim => (
                    <button
                        key={anim.id}
                        onClick={() => updateGlobalStyle({ textAnimation: anim.id as any })}
                        className={`p-5 rounded-2xl border text-sm font-black transition-all duration-300 ${globalStyle.textAnimation === anim.id ? 'bg-white text-black border-white shadow-2xl scale-105' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                        {anim.label}
                    </button>
                ))}
            </div>
        </div>

        {/* 3. Auto Highlighting */}
        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent"></div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-3 relative z-10">
                <Wand2 size={20} className="text-white" strokeWidth={2.5} /> التلوين التلقائي للكلمات
            </label>
            <p className="text-[10px] font-bold text-slate-500 mb-6 relative z-10 uppercase tracking-wide">
                أضف كلمات محددة ليتم تلوينها تلقائياً عند ظهورها (مثلاً: الله، الجنة).
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-6 relative z-10">
                <input 
                    type="text" 
                    placeholder="الكلمة (مثلاً: الله)" 
                    value={highlightWord}
                    onChange={(e) => setHighlightWord(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-white/30 transition-all shadow-inner"
                />
                <div className="flex gap-3">
                    <input 
                        type="color" 
                        value={highlightColor}
                        onChange={(e) => setHighlightColor(e.target.value)}
                        className="w-14 h-14 rounded-2xl cursor-pointer bg-black/40 border border-white/10 p-2 shadow-inner"
                    />
                    <button 
                        onClick={addHighlight}
                        className="liquid-button shiny-reflection flex-1 sm:flex-none text-white px-8 rounded-2xl transition-all font-black flex items-center justify-center shadow-xl active:scale-90"
                    >
                        <Plus size={24} strokeWidth={3} />
                    </button>
                </div>
            </div>

            <div className="bg-black/20 rounded-2xl p-4 border border-white/5 min-h-[120px] max-h-[200px] overflow-y-auto no-scrollbar space-y-3 relative z-10 shadow-inner">
                {globalStyle.autoHighlights.length === 0 ? (
                    <div className="text-center py-10 text-slate-700 font-black text-xs uppercase tracking-widest opacity-30">
                        لا توجد كلمات مضافة
                    </div>
                ) : (
                    globalStyle.autoHighlights.map((h, i) => (
                        <div key={i} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm group hover:border-white/20 transition-all">
                            <div className="flex items-center gap-4">
                                <span className="w-6 h-6 rounded-lg border border-white/20 shadow-lg" style={{ backgroundColor: h.color }}></span>
                                <span className="text-white font-black text-xl font-rakkas tracking-tight">{h.word}</span>
                            </div>
                            <button onClick={() => removeHighlight(i)} className="text-slate-500 hover:text-red-400 p-2 transition-all active:scale-90">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
