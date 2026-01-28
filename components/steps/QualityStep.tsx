
import React from 'react';
import { AppState, Resolution, VideoFormat } from '../../types';
import { FileVideo, Film } from 'lucide-react';

interface Props {
  resolution: Resolution;
  fps: number;
  format?: VideoFormat; // Make optional to prevent breaking if not passed yet
  updateState: (updates: Partial<AppState>) => void;
}

export const QualityStep: React.FC<Props> = ({ resolution, fps, format = 'mp4', updateState }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 overflow-y-auto max-h-[60vh] custom-scrollbar p-1">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold font-rakkas text-emerald-100">الجودة والإعدادات</h2>
        <p className="text-slate-400 text-sm">اضبط دقة الفيديو، السلاسة، والصيغة النهائية.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        
        {/* Resolution */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all">
          <label className="text-sm text-emerald-400 block font-bold mb-4">دقة الفيديو (Resolution)</label>
          <div className="space-y-2">
            {['360p', '480p', '720p', '1080p', '2K', '4K', '8K'].map((res) => (
              <label key={res} className="flex items-center justify-between p-2.5 rounded-lg cursor-pointer bg-slate-900/50 hover:bg-slate-900 transition-colors group">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-300 font-mono group-hover:text-white transition-colors">{res}</span>
                    {res === '1080p' && <span className="text-[10px] bg-slate-800 px-1.5 rounded text-slate-500">متوسط</span>}
                    {res === '8K' && <span className="text-[10px] bg-emerald-900/50 text-emerald-400 px-1.5 rounded border border-emerald-500/20">فائق</span>}
                </div>
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

        <div className="space-y-6">
            {/* FPS */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all">
            <label className="text-sm text-emerald-400 block font-bold mb-4">معدل الإطارات (FPS)</label>
            <div className="text-center mb-4">
                <span className={`text-4xl font-bold font-mono transition-colors ${fps > 60 ? 'text-emerald-400' : 'text-white'}`}>{fps}</span>
                <span className="text-xs text-slate-500 block mt-1">إطار في الثانية</span>
            </div>
            <input 
                type="range" min="15" max="120" step="5"
                className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                value={fps}
                onChange={(e) => updateState({ fps: parseInt(e.target.value) })}
                dir="rtl"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-2 font-mono">
                <span>15</span>
                <span>60</span>
                <span className="text-emerald-500">120</span>
            </div>
            </div>

            {/* Video Format */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all">
                <label className="text-sm text-emerald-400 block font-bold mb-4">صيغة الفيديو</label>
                <div className="grid grid-cols-2 gap-3">
                    <label className={`cursor-pointer p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${format === 'mp4' ? 'bg-emerald-900/20 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                        <input type="radio" name="format" value="mp4" checked={format === 'mp4'} onChange={() => updateState({ format: 'mp4' })} className="hidden" />
                        <FileVideo size={20} />
                        <div className="text-center">
                            <span className="block text-sm font-bold">MP4</span>
                            <span className="text-[10px] opacity-70">توافق عالي</span>
                        </div>
                    </label>
                    <label className={`cursor-pointer p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${format === 'webm' ? 'bg-emerald-900/20 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                        <input type="radio" name="format" value="webm" checked={format === 'webm'} onChange={() => updateState({ format: 'webm' })} className="hidden" />
                        <Film size={20} />
                        <div className="text-center">
                            <span className="block text-sm font-bold">WebM</span>
                            <span className="text-[10px] opacity-70">حجم أصغر</span>
                        </div>
                    </label>
                </div>
                <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
                    <span className="text-emerald-500">نصيحة:</span> اختر MP4 للعمل على الآيفون والواتساب مباشرة. إذا لم يدعمه متصفحك، سيتم التحويل إلى WebM تلقائياً.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};
