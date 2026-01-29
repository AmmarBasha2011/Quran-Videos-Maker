
import React from 'react';
import { AppState, AspectRatio } from '../../types';
import { ASPECT_RATIO_OPTIONS } from '../../constants';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  surahName: string;
  readerName: string;
  aspectRatio: AspectRatio;
  updateState: (updates: Partial<AppState>) => void;
}

export const DetailsStep: React.FC<Props> = ({ surahName, readerName, aspectRatio, updateState }) => (
  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 flex-1">
    
    {/* Section 1: Video Ratio */}
    <div className="space-y-6">
        <div className="text-center md:text-right">
            <h2 className="text-2xl font-black font-rakkas text-white">أبعاد الفيديو</h2>
            <p className="text-slate-400 text-sm mt-1">اختر المنصة المناسبة لمقطعك.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ASPECT_RATIO_OPTIONS.map((option) => {
                const isSelected = aspectRatio === option.id;
                const Icon = option.icon;
                return (
                    <div 
                        key={option.id}
                        onClick={() => updateState({ aspectRatio: option.id })}
                        className={`relative cursor-pointer rounded-[1.5rem] border p-5 transition-all duration-500 flex flex-col items-center justify-center text-center gap-3 group overflow-hidden
                            ${isSelected ? 'bg-white/15 border-white/30 shadow-2xl scale-105 z-10' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'}
                        `}
                    >
                        {isSelected && <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none animate-pulse"></div>}
                        
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isSelected ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-white/10 text-slate-300 group-hover:bg-white/20'}`}>
                            <Icon size={24} strokeWidth={2.5} />
                        </div>
                        
                        <div>
                            <h3 className={`text-sm font-black tracking-tight ${isSelected ? 'text-white' : 'text-slate-400'}`}>{option.label}</h3>
                            <p className="text-[10px] text-slate-500 mt-1 font-bold">{option.platforms[0]}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    </div>

    <div className="w-full h-px bg-white/5" />

    {/* Section 2: Text Details */}
    <div className="space-y-6">
        <div className="text-center md:text-right">
            <h2 className="text-2xl font-black font-rakkas text-white">بيانات التلاوة</h2>
            <p className="text-slate-400 text-sm mt-1">المعلومات التي ستظهر على الفيديو.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">اسم السورة</label>
            <input 
            type="text" 
            dir="auto"
            placeholder="مثلاً: سورة الكهف"
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:bg-white/10 focus:border-white/30 focus:ring-4 focus:ring-white/5 outline-none transition-all font-rakkas text-xl text-white placeholder:text-slate-600 shadow-inner"
            value={surahName}
            onChange={(e) => updateState({ surahName: e.target.value })}
            />
        </div>
        <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">اسم القارئ</label>
            <input 
            type="text"
            dir="auto" 
            placeholder="مثلاً: رعد الكردي"
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:bg-white/10 focus:border-white/30 focus:ring-4 focus:ring-white/5 outline-none transition-all font-bold text-white placeholder:text-slate-600 shadow-inner"
            value={readerName}
            onChange={(e) => updateState({ readerName: e.target.value })}
            />
        </div>
        </div>
    </div>
  </div>
);
