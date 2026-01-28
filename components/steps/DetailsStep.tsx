import React from 'react';
import { AppState } from '../../types';

interface Props {
  surahName: string;
  readerName: string;
  updateState: (updates: Partial<AppState>) => void;
}

export const DetailsStep: React.FC<Props> = ({ surahName, readerName, updateState }) => (
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
);