
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 flex-1">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black font-rakkas text-white">الجودة والإنتاج</h2>
        <p className="text-slate-500 text-sm mt-1">اضبط دقة الفيديو، السلاسة، والصيغة النهائية.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* Resolution */}
        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 block relative z-10">دقة الفيديو (Resolution)</label>
          <div className="space-y-2 relative z-10">
            {['360p', '480p', '720p', '1080p', '2K', '4K', '8K'].map((res) => (
              <label key={res} className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 group border ${resolution === res ? 'bg-white border-white shadow-xl' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}>
                <div className="flex items-center gap-3">
                    <span className={`text-sm font-black font-mono transition-colors ${resolution === res ? 'text-black' : 'text-slate-400 group-hover:text-white'}`}>{res}</span>
                    {res === '1080p' && <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${resolution === res ? 'bg-black/10 text-black' : 'bg-white/10 text-slate-500'}`}>Recommended</span>}
                    {res === '8K' && <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${resolution === res ? 'bg-purple-500 text-white' : 'bg-purple-500/20 text-purple-400'}`}>Extreme</span>}
                </div>
                <input 
                  type="radio" 
                  name="resolution"
                  value={res}
                  checked={resolution === res}
                  onChange={() => updateState({ resolution: res as Resolution })}
                  className="hidden"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${resolution === res ? 'border-black' : 'border-white/10'}`}>
                    {resolution === res && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-8">
            {/* FPS */}
            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 block relative z-10">معدل الإطارات (FPS)</label>
                <div className="text-center mb-6 relative z-10">
                    <span className="text-6xl font-black font-mono text-white tracking-tighter">{fps}</span>
                    <span className="text-[10px] text-slate-500 block mt-2 font-black uppercase tracking-widest">Frames Per Second</span>
                </div>
                <input
                    type="range" min="15" max="120" step="5"
                    className="w-full accent-white h-2 bg-white/10 rounded-full appearance-none cursor-pointer relative z-10"
                    value={fps}
                    onChange={(e) => updateState({ fps: parseInt(e.target.value) })}
                    dir="ltr"
                />
            </div>

            {/* Video Format */}
            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent"></div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 block relative z-10">صيغة الفيديو</label>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <label className={`cursor-pointer p-5 rounded-2xl border flex flex-col items-center gap-3 transition-all duration-300 ${format === 'mp4' ? 'bg-white border-white text-black shadow-xl scale-105' : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5'}`}>
                        <input type="radio" name="format" value="mp4" checked={format === 'mp4'} onChange={() => updateState({ format: 'mp4' })} className="hidden" />
                        <FileVideo size={24} strokeWidth={2.5} />
                        <div className="text-center">
                            <span className="block text-sm font-black">MP4</span>
                            <span className="text-[8px] font-bold uppercase opacity-50">Universal</span>
                        </div>
                    </label>
                    <label className={`cursor-pointer p-5 rounded-2xl border flex flex-col items-center gap-3 transition-all duration-300 ${format === 'webm' ? 'bg-white border-white text-black shadow-xl scale-105' : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5'}`}>
                        <input type="radio" name="format" value="webm" checked={format === 'webm'} onChange={() => updateState({ format: 'webm' })} className="hidden" />
                        <Film size={24} strokeWidth={2.5} />
                        <div className="text-center">
                            <span className="block text-sm font-black">WebM</span>
                            <span className="text-[8px] font-bold uppercase opacity-50">Optimized</span>
                        </div>
                    </label>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
