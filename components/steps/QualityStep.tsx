import React from 'react';
import { AppState, Resolution } from '../../types';

interface Props {
  resolution: Resolution;
  fps: number;
  updateState: (updates: Partial<AppState>) => void;
}

export const QualityStep: React.FC<Props> = ({ resolution, fps, updateState }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold font-rakkas text-emerald-100">الجودة والإطارات</h2>
        <p className="text-slate-400 text-sm">تحكم في دقة الفيديو وسلاسة الحركة.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
        {/* Resolution */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all">
          <label className="text-sm text-emerald-400 block font-bold mb-4">دقة الفيديو (Resolution)</label>
          <div className="space-y-2">
            {['360p', '480p', '720p', '1080p', '2K', '4K'].map((res) => (
              <label key={res} className="flex items-center justify-between p-3 rounded-lg cursor-pointer bg-slate-900/50 hover:bg-slate-900 transition-colors">
                <span className="text-sm text-slate-300 font-mono">{res}</span>
                <input 
                  type="radio" 
                  name="resolution"
                  value={res}
                  checked={resolution === res}
                  onChange={() => updateState({ resolution: res as Resolution })}
                  className="accent-emerald-500 w-4 h-4"
                />
              </label>
            ))}
          </div>
        </div>

        {/* FPS */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all">
          <label className="text-sm text-emerald-400 block font-bold mb-4">معدل الإطارات (FPS)</label>
          <div className="text-center mb-6">
            <span className="text-4xl font-bold text-white font-mono">{fps}</span>
            <span className="text-xs text-slate-500 block mt-1">إطار في الثانية</span>
          </div>
          <input 
            type="range" min="1" max="60" step="1"
            className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            value={fps}
            onChange={(e) => updateState({ fps: parseInt(e.target.value) })}
            dir="rtl"
          />
          <div className="flex justify-between text-xs text-slate-600 mt-2 font-mono">
            <span>1 FPS</span>
            <span>30 FPS</span>
            <span>60 FPS</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">
            كلما زاد معدل الإطارات، زاد حجم الفيديو ووقت المعالجة. يُنصح بـ 30 FPS للاستخدام العام.
          </p>
        </div>
      </div>
    </div>
  );
};