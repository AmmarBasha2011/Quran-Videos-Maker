
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 overflow-y-auto no-scrollbar p-1">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold font-rakkas text-white">الجودة والإعدادات</h2>
        <p className="text-slate-400 text-sm mt-1">اضبط دقة الفيديو، السلاسة، والصيغة النهائية.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* Resolution */}
        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-lg h-fit">
          <label className="text-[10px] font-bold text-emerald-400 block mb-6 uppercase tracking-widest px-1">دقة الفيديو (Resolution)</label>
          <div className="space-y-3">
            {['360p', '480p', '720p', '1080p', '2K', '4K', '8K'].map((res) => (
              <label key={res} className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${resolution === res ? 'bg-emerald-500/20 border-emerald-500 shadow-md' : 'bg-black/20 border-white/5 hover:border-white/10'} group`}>
                <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold font-mono ${resolution === res ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'} transition-colors`}>{res}</span>
                    {res === '1080p' && <span className="text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded-lg text-slate-500 uppercase">Standard</span>}
                    {res === '8K' && <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-lg border border-emerald-500/20 uppercase tracking-tighter">Ultra High</span>}
                </div>
                <input 
                  type="radio" 
                  name="resolution"
                  value={res}
                  checked={resolution === res}
                  onChange={() => updateState({ resolution: res as Resolution })}
                  className="accent-emerald-500 w-5 h-5 cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-8">
            {/* FPS */}
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-lg">
                <label className="text-[10px] font-bold text-emerald-400 block mb-6 uppercase tracking-widest px-1">معدل الإطارات (FPS)</label>
                <div className="text-center mb-6">
                    <span className={`text-5xl font-black font-mono transition-all duration-500 ${fps > 60 ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'text-white'}`}>{fps}</span>
                    <span className="text-[10px] font-bold text-slate-500 block mt-2 uppercase tracking-[0.2em]">Frames Per Second</span>
                </div>
                <input
                    type="range" min="15" max="120" step="5"
                    className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-emerald-500 border border-white/5"
                    value={fps}
                    onChange={(e) => updateState({ fps: parseInt(e.target.value) })}
                    dir="ltr"
                />
                <div className="flex justify-between text-[10px] text-slate-600 mt-4 font-bold font-mono">
                    <span>15</span>
                    <span>60</span>
                    <span className="text-emerald-500">120</span>
                </div>
            </div>

            {/* Video Format */}
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-lg">
                <label className="text-[10px] font-bold text-emerald-400 block mb-6 uppercase tracking-widest px-1">صيغة التصدير</label>
                <div className="grid grid-cols-2 gap-4">
                    <label className={`cursor-pointer p-5 rounded-2xl border flex flex-col items-center gap-3 transition-all duration-300 ${format === 'mp4' ? 'bg-emerald-500/20 border-emerald-500 shadow-md text-white' : 'bg-black/20 border-white/5 text-slate-400 hover:border-white/10'}`}>
                        <input type="radio" name="format" value="mp4" checked={format === 'mp4'} onChange={() => updateState({ format: 'mp4' })} className="hidden" />
                        <div className={`p-2.5 rounded-xl ${format === 'mp4' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-500'}`}><FileVideo size={24} /></div>
                        <div className="text-center">
                            <span className="block text-sm font-bold">MP4</span>
                            <span className="text-[10px] font-medium opacity-50 uppercase tracking-tighter">High Comp.</span>
                        </div>
                    </label>
                    <label className={`cursor-pointer p-5 rounded-2xl border flex flex-col items-center gap-3 transition-all duration-300 ${format === 'webm' ? 'bg-emerald-500/20 border-emerald-500 shadow-md text-white' : 'bg-black/20 border-white/5 text-slate-400 hover:border-white/10'}`}>
                        <input type="radio" name="format" value="webm" checked={format === 'webm'} onChange={() => updateState({ format: 'webm' })} className="hidden" />
                        <div className={`p-2.5 rounded-xl ${format === 'webm' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-500'}`}><Film size={24} /></div>
                        <div className="text-center">
                            <span className="block text-sm font-bold">WebM</span>
                            <span className="text-[10px] font-medium opacity-50 uppercase tracking-tighter">Fast Render</span>
                        </div>
                    </label>
                </div>
                <div className="mt-6 flex gap-3 p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                    <span className="text-emerald-500 font-bold text-xs uppercase tracking-tighter mt-0.5">Note:</span>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                        اختر MP4 للتوافق مع آيفون وواتساب. WebM يوفر أداءً أسرع في المتصفح وحجماً أصغر.
                    </p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
