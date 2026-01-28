
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
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center md:text-right">
        <h2 className="text-2xl font-bold font-rakkas text-emerald-100">الشكل العام</h2>
        <p className="text-slate-400 text-sm">تحكم في الانتقالات، حركة النصوص، والتلوين التلقائي.</p>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* 1. Transitions */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
            <label className="text-base font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <Layers size={20} /> انتقالات الخلفية
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
                <button 
                    onClick={() => updateGlobalStyle({ transitionType: 'fade' })}
                    className={`flex-1 p-4 rounded-xl border text-sm font-bold transition-all active:scale-95 ${globalStyle.transitionType === 'fade' ? 'bg-emerald-900/40 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                >
                    تلاشي (Cross Fade)
                </button>
                <button 
                    onClick={() => updateGlobalStyle({ transitionType: 'cut' })}
                    className={`flex-1 p-4 rounded-xl border text-sm font-bold transition-all active:scale-95 ${globalStyle.transitionType === 'cut' ? 'bg-emerald-900/40 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                >
                    قطع مباشر (Cut)
                </button>
            </div>
        </div>

        {/* 2. Text Animation */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
            <label className="text-base font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <MoveUp size={20} /> حركة ظهور الآيات
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                    onClick={() => updateGlobalStyle({ textAnimation: 'fade' })}
                    className={`p-4 rounded-xl border text-sm font-bold transition-all active:scale-95 ${globalStyle.textAnimation === 'fade' ? 'bg-emerald-900/40 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                >
                    ظهور تدريجي (Fade In)
                </button>
                <button 
                    onClick={() => updateGlobalStyle({ textAnimation: 'slideUp' })}
                    className={`p-4 rounded-xl border text-sm font-bold transition-all active:scale-95 ${globalStyle.textAnimation === 'slideUp' ? 'bg-emerald-900/40 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                >
                    صعود للأعلى (Slide Up)
                </button>
                <button 
                    onClick={() => updateGlobalStyle({ textAnimation: 'scale' })}
                    className={`p-4 rounded-xl border text-sm font-bold transition-all active:scale-95 ${globalStyle.textAnimation === 'scale' ? 'bg-emerald-900/40 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                >
                    تكبير (Scale Up)
                </button>
                <button 
                    onClick={() => updateGlobalStyle({ textAnimation: 'none' })}
                    className={`p-4 rounded-xl border text-sm font-bold transition-all active:scale-95 ${globalStyle.textAnimation === 'none' ? 'bg-emerald-900/40 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                >
                    ثابت (None)
                </button>
            </div>
        </div>

        {/* 3. Auto Highlighting */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col">
            <label className="text-base font-bold text-emerald-400 mb-2 flex items-center gap-2">
                <Wand2 size={20} /> التلوين التلقائي للكلمات
            </label>
            <p className="text-xs text-slate-500 mb-4">
                أضف كلمات محددة ليتم تلوينها تلقائياً عند ظهورها في أي آية (مثلاً: الله، الجنة، نور).
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input 
                    type="text" 
                    placeholder="الكلمة (مثلاً: الله)" 
                    value={highlightWord}
                    onChange={(e) => setHighlightWord(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white outline-none focus:border-emerald-500"
                />
                <div className="flex gap-2">
                    <input 
                        type="color" 
                        value={highlightColor}
                        onChange={(e) => setHighlightColor(e.target.value)}
                        className="w-12 h-12 rounded cursor-pointer bg-slate-900 border border-slate-700 p-1"
                    />
                    <button 
                        onClick={addHighlight}
                        className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-6 rounded-lg transition-colors flex items-center justify-center"
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 min-h-[100px] max-h-[200px] overflow-y-auto custom-scrollbar space-y-2">
                {globalStyle.autoHighlights.length === 0 ? (
                    <div className="text-center py-8 text-slate-600 text-sm">
                        لا توجد كلمات مضافة
                    </div>
                ) : (
                    globalStyle.autoHighlights.map((h, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
                            <div className="flex items-center gap-3">
                                <span className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: h.color }}></span>
                                <span className="text-emerald-100 font-bold text-lg">{h.word}</span>
                            </div>
                            <button onClick={() => removeHighlight(i)} className="text-slate-500 hover:text-red-400 p-2">
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
