
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
  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
    
    {/* Section 1: Video Ratio */}
    <div className="space-y-6">
        <div className="text-center md:text-right">
            <h2 className="text-2xl font-bold font-rakkas text-white">أبعاد الفيديو</h2>
            <p className="text-slate-400 text-sm mt-1">اختر المنصة المناسبة لضبط المقاسات تلقائياً.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ASPECT_RATIO_OPTIONS.map((option) => {
                const isSelected = aspectRatio === option.id;
                const Icon = option.icon;
                return (
                    <div 
                        key={option.id}
                        onClick={() => updateState({ aspectRatio: option.id })}
                        className={`relative cursor-pointer rounded-2xl border transition-all duration-500 p-5 flex flex-col items-center justify-center text-center gap-3 group backdrop-blur-md
                            ${isSelected ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-[1.02]' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}
                        `}
                    >
                        {isSelected && <div className="absolute top-3 right-3 text-emerald-400"><CheckCircle2 size={18} /></div>}
                        
                        <div className={`p-3 rounded-2xl transition-all duration-500 ${isSelected ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-white/5 text-slate-400 group-hover:bg-white/10'}`}>
                            <Icon size={24} />
                        </div>
                        
                        <div>
                            <h3 className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{option.label}</h3>
                            <p className="text-[10px] text-slate-500 mt-1 leading-tight font-medium">{option.platforms.join(' • ')}</p>
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
            <h2 className="text-2xl font-bold font-rakkas text-white">بيانات التلاوة</h2>
            <p className="text-slate-400 text-sm mt-1">أدخل التفاصيل التي ستظهر كنصوص في الفيديو.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
                <label className="text-sm font-bold text-slate-300 mr-1">اسم السورة</label>
                <input
                    type="text"
                    dir="auto"
                    placeholder="سورة الفاتحة"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all font-rakkas text-xl placeholder:text-slate-600 backdrop-blur-md"
                    value={surahName}
                    onChange={(e) => updateState({ surahName: e.target.value })}
                />
            </div>
            <div className="space-y-3">
                <label className="text-sm font-bold text-slate-300 mr-1">اسم القارئ</label>
                <input
                    type="text"
                    dir="auto"
                    placeholder="مشاري راشد العفاسي"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all text-lg placeholder:text-slate-600 backdrop-blur-md"
                    value={readerName}
                    onChange={(e) => updateState({ readerName: e.target.value })}
                />
            </div>
        </div>
    </div>
  </div>
);
