
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
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center md:text-right">
        <h2 className="text-2xl font-bold font-rakkas text-white">الشكل العام</h2>
        <p className="text-slate-400 text-sm mt-1">تحكم في الانتقالات، حركة النصوص، والتلوين التلقائي.</p>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* 1. Transitions */}
        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-lg">
            <label className="text-sm font-bold text-emerald-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
                <Layers size={18} /> انتقالات الخلفية
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
                <button 
                    onClick={() => updateGlobalStyle({ transitionType: 'fade' })}
                    className={`flex-1 p-5 rounded-2xl border text-sm font-bold transition-all duration-300 active:scale-95 ${globalStyle.transitionType === 'fade' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border-emerald-400' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'}`}
                >
                    تلاشي (Cross Fade)
                </button>
                <button 
                    onClick={() => updateGlobalStyle({ transitionType: 'cut' })}
                    className={`flex-1 p-5 rounded-2xl border text-sm font-bold transition-all duration-300 active:scale-95 ${globalStyle.transitionType === 'cut' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border-emerald-400' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'}`}
                >
                    قطع مباشر (Cut)
                </button>
            </div>
        </div>

        {/* 2. Text Animation */}
        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-lg">
            <label className="text-sm font-bold text-emerald-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
                <MoveUp size={18} /> حركة ظهور الآيات
            </label>
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => updateGlobalStyle({ textAnimation: 'fade' })}
                    className={`p-5 rounded-2xl border text-sm font-bold transition-all duration-300 active:scale-95 ${globalStyle.textAnimation === 'fade' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border-emerald-400' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'}`}
                >
                    ظهور تدريجي
                </button>
                <button 
                    onClick={() => updateGlobalStyle({ textAnimation: 'slideUp' })}
                    className={`p-5 rounded-2xl border text-sm font-bold transition-all duration-300 active:scale-95 ${globalStyle.textAnimation === 'slideUp' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border-emerald-400' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'}`}
                >
                    صعود للأعلى
                </button>
                <button 
                    onClick={() => updateGlobalStyle({ textAnimation: 'scale' })}
                    className={`p-5 rounded-2xl border text-sm font-bold transition-all duration-300 active:scale-95 ${globalStyle.textAnimation === 'scale' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border-emerald-400' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'}`}
                >
                    تكبير
                </button>
                <button 
                    onClick={() => updateGlobalStyle({ textAnimation: 'none' })}
                    className={`p-5 rounded-2xl border text-sm font-bold transition-all duration-300 active:scale-95 ${globalStyle.textAnimation === 'none' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border-emerald-400' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'}`}
                >
                    ثابت
                </button>
            </div>
        </div>

        {/* 3. Auto Highlighting */}
        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-lg flex flex-col">
            <label className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2 uppercase tracking-[0.2em]">
                <Wand2 size={18} /> التلوين التلقائي
            </label>
            <p className="text-xs text-slate-500 mb-6 font-medium">
                أضف كلمات محددة ليتم تلوينها تلقائياً عند ظهورها (مثل: الله، الجنة).
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input 
                    type="text" 
                    placeholder="الكلمة (مثلاً: الله)" 
                    value={highlightWord}
                    onChange={(e) => setHighlightWord(e.target.value)}
                    className="flex-1 bg-black/20 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600 font-bold"
                />
                <div className="flex gap-2">
                    <input 
                        type="color" 
                        value={highlightColor}
                        onChange={(e) => setHighlightColor(e.target.value)}
                        className="w-14 h-14 rounded-2xl cursor-pointer bg-black/20 border border-white/10 p-1.5"
                    />
                    <button 
                        onClick={addHighlight}
                        className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-400 text-white px-8 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center border border-emerald-400/50"
                    >
                        <Plus size={28} />
                    </button>
                </div>
            </div>

            <div className="bg-black/20 rounded-2xl p-4 border border-white/5 min-h-[120px] max-h-[220px] overflow-y-auto no-scrollbar space-y-3 shadow-inner">
                {globalStyle.autoHighlights.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-600 opacity-40 gap-2">
                        <Wand2 size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">لا توجد كلمات مضافة</span>
                    </div>
                ) : (
                    globalStyle.autoHighlights.map((h, i) => (
                        <div key={i} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 shadow-sm transition-all hover:bg-white/10">
                            <div className="flex items-center gap-4">
                                <div className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: h.color }}></div>
                                <span className="text-white font-bold text-lg">{h.word}</span>
                            </div>
                            <button onClick={() => removeHighlight(i)} className="text-slate-500 hover:text-red-400 p-2 transition-colors">
                                <Trash2 size={18} />
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
