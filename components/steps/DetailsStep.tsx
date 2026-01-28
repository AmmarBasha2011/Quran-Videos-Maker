
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
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
    
    {/* Section 1: Video Ratio */}
    <div className="space-y-4">
        <div className="text-center md:text-right">
            <h2 className="text-xl font-bold font-rakkas text-emerald-100">أبعاد الفيديو (المنصة)</h2>
            <p className="text-slate-400 text-xs">اختر المنصة التي ستنشر عليها الفيديو لضبط المقاسات تلقائياً.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ASPECT_RATIO_OPTIONS.map((option) => {
                const isSelected = aspectRatio === option.id;
                const Icon = option.icon;
                return (
                    <div 
                        key={option.id}
                        onClick={() => updateState({ aspectRatio: option.id })}
                        className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 flex flex-col items-center justify-center text-center gap-2 group
                            ${isSelected ? 'bg-emerald-900/30 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-slate-950/50 border-slate-800 hover:border-slate-600 hover:bg-slate-900'}
                        `}
                    >
                        {isSelected && <div className="absolute top-2 right-2 text-emerald-500"><CheckCircle2 size={16} /></div>}
                        
                        <div className={`p-2 rounded-full ${isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'}`}>
                            <Icon size={20} />
                        </div>
                        
                        <div>
                            <h3 className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{option.label}</h3>
                            <p className="text-[10px] text-slate-500 mt-1 leading-tight">{option.platforms.join(' • ')}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    </div>

    <div className="w-full h-px bg-slate-800/50" />

    {/* Section 2: Text Details */}
    <div className="space-y-4">
        <div className="text-center md:text-right">
            <h2 className="text-xl font-bold font-rakkas text-emerald-100">بيانات التلاوة</h2>
            <p className="text-slate-400 text-xs">أدخل التفاصيل التي ستظهر كنصوص في الفيديو.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">اسم السورة</label>
            <input 
            type="text" 
            dir="auto"
            placeholder="سورة الفاتحة"
            className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all font-rakkas text-lg"
            value={surahName}
            onChange={(e) => updateState({ surahName: e.target.value })}
            />
        </div>
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">اسم القارئ</label>
            <input 
            type="text"
            dir="auto" 
            placeholder="مشاري راشد العفاسي"
            className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
            value={readerName}
            onChange={(e) => updateState({ readerName: e.target.value })}
            />
        </div>
        </div>
    </div>
  </div>
);
