import React from 'react';
import { Upload, FileAudio, Play, Pause, Plus, Trash2 } from 'lucide-react';
import { AppState, AudioPreset } from '../../types';
import { AUDIO_PRESETS } from '../../constants';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  audioProps: {
    isPlaying: boolean;
    duration: number;
    currentTime: number;
    isReady: boolean;
    togglePlay: () => void;
  };
  applyPreset: (preset: AudioPreset) => void;
  savePreset: (name: string) => void;
  deletePreset: (id: string) => void;
}

export const AudioStep: React.FC<Props> = ({ state, updateState, audioProps, applyPreset, savePreset, deletePreset }) => {
  const [showSave, setShowSave] = React.useState(false);
  const [presetName, setPresetName] = React.useState('');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      updateState({ audioFile: file, audioUrl: url });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
      <div className="text-center">
        <h2 className="text-xl font-bold font-rakkas mb-2">رفع التلاوة</h2>
        {!state.audioFile ? (
          <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 md:p-12 hover:border-emerald-500/50 hover:bg-slate-800/30 transition-all cursor-pointer relative group">
            {/* Accepted all audio types */}
            <input type="file" accept="audio/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4 group-hover:text-emerald-400 transition-colors" />
            <p className="text-slate-400 group-hover:text-slate-300">اضغط للرفع أو اسحب الملف هنا (جميع الصيغ مدعومة)</p>
          </div>
        ) : (
          <div className="bg-slate-950/50 rounded-xl p-4 md:p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4 max-w-[70%]">
                <div className="w-12 h-12 rounded-full bg-emerald-900/20 text-emerald-500 flex flex-shrink-0 items-center justify-center">
                  <FileAudio />
                </div>
                <div className="text-right overflow-hidden">
                  <p className="font-medium text-slate-200 truncate" dir="ltr">{state.audioFile.name}</p>
                  <p className="text-xs text-slate-500">
                     {audioProps.isPlaying ? "جاري التشغيل..." : "جاهز"}
                  </p>
                </div>
              </div>
              <button 
                onClick={audioProps.togglePlay}
                disabled={!audioProps.isReady}
                className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all shadow-lg shadow-emerald-900/50 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                 {audioProps.isPlaying ? <Pause /> : <Play className="mr-1" />}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden mb-6" dir="ltr">
              <div 
                className="h-full bg-emerald-500 transition-all duration-100 ease-linear"
                style={{ width: `${audioProps.duration ? (audioProps.currentTime / audioProps.duration) * 100 : 0}%` }}
              />
            </div>

            {/* Controls */}
            <div className="grid md:grid-cols-2 gap-8">
               <div>
                 <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-medium text-slate-400 block">الإعدادات (Presets)</label>
                    <button 
                        onClick={() => setShowSave(!showSave)}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center"
                    >
                        <Plus size={12} className="ml-1"/> حفظ الإعداد الحالي
                    </button>
                 </div>
                 
                 {showSave && (
                    <div className="flex gap-2 mb-3 animate-in fade-in slide-in-from-top-2">
                        <input 
                            type="text" 
                            placeholder="اسم الإعداد..." 
                            className="bg-slate-900 text-xs p-1.5 rounded border border-slate-700 flex-1 outline-none focus:border-emerald-500"
                            value={presetName}
                            onChange={(e) => setPresetName(e.target.value)}
                        />
                        <button 
                          onClick={() => { savePreset(presetName); setPresetName(''); setShowSave(false); }} 
                          className="bg-emerald-600 text-white px-3 rounded text-xs"
                        >
                          حفظ
                        </button>
                    </div>
                 )}

                 <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                   {AUDIO_PRESETS.map(preset => (
                     <button
                       key={preset.id}
                       onClick={() => applyPreset(preset)}
                       className={`text-xs px-3 py-1.5 rounded-md border transition-all ${state.selectedPresetId === preset.id ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'border-slate-700 hover:border-slate-500 text-slate-400'}`}
                     >
                       {preset.name}
                     </button>
                   ))}
                   {state.customPresets.map(preset => (
                     <div key={preset.id} className="relative group">
                        <button
                            onClick={() => applyPreset(preset)}
                            className={`text-xs px-3 py-1.5 rounded-md border transition-all pr-6 ${state.selectedPresetId === preset.id ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'border-slate-700 hover:border-slate-500 text-slate-400'}`}
                        >
                            {preset.name}
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); deletePreset(preset.id); }}
                            className="absolute top-1 right-1 text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={10} />
                        </button>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="space-y-4">
                 <div>
                   <div className="flex justify-between text-xs text-slate-400 mb-1">
                     <span>الصدى (Reverb)</span>
                     <span>{Math.round(state.reverbAmount * 100)}%</span>
                   </div>
                   <input 
                     type="range" min="0" max="1" step="0.05"
                     value={state.reverbAmount}
                     onChange={(e) => updateState({ reverbAmount: parseFloat(e.target.value), selectedPresetId: 'custom' })}
                     className="w-full accent-emerald-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                     dir="ltr"
                   />
                 </div>
                 <div>
                   <div className="flex justify-between text-xs text-slate-400 mb-1">
                     <span>التكرار (Echo)</span>
                     <span>{Math.round(state.echoAmount * 100)}%</span>
                   </div>
                   <input 
                     type="range" min="0" max="1" step="0.05"
                     value={state.echoAmount}
                     onChange={(e) => updateState({ echoAmount: parseFloat(e.target.value), selectedPresetId: 'custom' })}
                     className="w-full accent-emerald-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                     dir="ltr"
                   />
                 </div>
                 
                 <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                     <div 
                        onClick={() => updateState({ isNormalized: !state.isNormalized, selectedPresetId: 'custom' })}
                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${state.isNormalized ? 'bg-emerald-600' : 'bg-slate-700'}`}
                     >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${state.isNormalized ? 'left-1' : 'left-6'}`} />
                     </div>
                     <span className="text-xs text-slate-300">موازنة الصوت (Normalize)</span>
                 </div>
               </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};