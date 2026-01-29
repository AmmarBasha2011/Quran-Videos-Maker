
import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileAudio, Play, Pause, Plus, Trash2, Mic, Square, Loader2 } from 'lucide-react';
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
  const [showSave, setShowSave] = useState(false);
  const [presetName, setPresetName] = useState('');
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      updateState({ audioFile: file, audioUrl: url });
    }
  };

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
            const url = URL.createObjectURL(file);
            updateState({ audioFile: file, audioUrl: url });
            
            // Stop all tracks to release mic
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current = recorder;
        recorder.start();
        setIsRecording(true);
        setRecordingTime(0);

        timerRef.current = window.setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);

    } catch (err) {
        alert("لا يمكن الوصول للميكروفون. يرجى التأكد من السماح بالأذونات.");
        console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
      <div className="text-center">
        <h2 className="text-2xl font-bold font-rakkas mb-6 text-white">إضافة الصوت</h2>
        
        {!state.audioFile && !isRecording ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Upload Option */}
              <div className="border border-white/10 bg-white/5 rounded-3xl p-10 hover:border-emerald-500/30 hover:bg-white/10 transition-all duration-500 cursor-pointer relative group flex flex-col items-center justify-center gap-5 h-60 backdrop-blur-md shadow-xl">
                <input type="file" accept="audio/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-all duration-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                    <Upload size={32} />
                </div>
                <div className="text-center">
                    <p className="text-white font-bold text-lg">رفع ملف صوتي</p>
                    <p className="text-slate-500 text-xs mt-1 font-medium">MP3, WAV, M4A</p>
                </div>
              </div>

              {/* Record Option */}
              <button 
                onClick={startRecording}
                className="border border-white/10 bg-white/5 rounded-3xl p-10 hover:border-red-500/30 hover:bg-white/10 transition-all duration-500 cursor-pointer flex flex-col items-center justify-center gap-5 h-60 group backdrop-blur-md shadow-xl"
              >
                <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400 group-hover:scale-110 transition-all duration-500 border border-red-500/20 shadow-lg shadow-red-500/10">
                    <Mic size={32} />
                </div>
                <div className="text-center">
                    <p className="text-white font-bold text-lg">تسجيل مباشر</p>
                    <p className="text-slate-500 text-xs mt-1 font-medium">استخدام الميكروفون</p>
                </div>
              </button>
          </div>
        ) : isRecording ? (
            <div className="bg-white/5 border border-red-500/30 rounded-[2.5rem] p-12 max-w-md mx-auto text-center space-y-8 animate-pulse backdrop-blur-xl shadow-2xl">
                <div className="w-24 h-24 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto text-red-500 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                    <Mic size={40} className="animate-bounce" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white mb-2">جاري التسجيل...</h3>
                    <p className="text-5xl font-mono text-red-400 tracking-tighter">{formatTime(recordingTime)}</p>
                </div>
                <button 
                    onClick={stopRecording}
                    className="bg-red-500 hover:bg-red-400 text-white px-10 py-4 rounded-2xl font-bold shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto border border-red-400/50 shadow-red-500/20"
                >
                    <Square size={20} fill="currentColor" /> إيقاف وحفظ
                </button>
            </div>
        ) : (
          <div className="bg-white/5 rounded-3xl p-6 md:p-8 border border-white/10 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between mb-8 bg-black/20 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-5 max-w-[70%] text-right">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex flex-shrink-0 items-center justify-center border border-emerald-500/20 shadow-inner">
                  <FileAudio size={28} />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-white truncate text-lg" dir="ltr">{state.audioFile?.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                      <p className="text-xs font-bold text-emerald-400/70 uppercase tracking-wider">
                        {audioProps.isPlaying ? "Playing..." : "Ready"}
                      </p>
                      <button 
                        onClick={() => updateState({ audioFile: null, audioUrl: null })}
                        className="text-[10px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1.5 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20 transition-all hover:bg-red-500/20"
                      >
                          <Trash2 size={12} /> حذف
                      </button>
                  </div>
                </div>
              </div>
              <button 
                onClick={audioProps.togglePlay}
                disabled={!audioProps.isReady}
                className="w-16 h-16 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 hover:scale-105 active:scale-95 border border-emerald-400/50"
              >
                 {audioProps.isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} className="mr-1" fill="currentColor" />}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-10 border border-white/5 shadow-inner" dir="ltr">
              <div 
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                style={{ width: `${audioProps.duration ? (audioProps.currentTime / audioProps.duration) * 100 : 0}%` }}
              />
            </div>

            {/* Controls */}
            <div className="grid md:grid-cols-2 gap-10">
               <div className="space-y-4">
                 <div className="flex justify-between items-center mb-1 px-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">الإعدادات المسبقة</label>
                    <button 
                        onClick={() => setShowSave(!showSave)}
                        className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center transition-colors bg-emerald-500/10 px-2 py-1 rounded-md"
                    >
                        <Plus size={12} className="ml-1"/> حفظ الحالي
                    </button>
                 </div>
                 
                 {showSave && (
                    <div className="flex gap-2 mb-4 animate-in fade-in slide-in-from-top-2 p-3 bg-white/5 rounded-xl border border-white/5">
                        <input 
                            type="text" 
                            placeholder="اسم الإعداد الجديد..."
                            className="bg-black/20 text-xs p-2 rounded-lg border border-white/10 flex-1 outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                            value={presetName}
                            onChange={(e) => setPresetName(e.target.value)}
                        />
                        <button 
                          onClick={() => { savePreset(presetName); setPresetName(''); setShowSave(false); }} 
                          className="bg-emerald-500 text-white px-4 rounded-lg text-xs font-bold shadow-md hover:bg-emerald-400 transition-all"
                        >
                          حفظ
                        </button>
                    </div>
                 )}

                 <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto no-scrollbar p-1">
                   {AUDIO_PRESETS.map(preset => (
                     <button
                       key={preset.id}
                       onClick={() => applyPreset(preset)}
                       className={`text-xs px-4 py-2 rounded-xl border font-bold transition-all duration-300 ${state.selectedPresetId === preset.id ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)] text-emerald-400' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-400'}`}
                     >
                       {preset.name}
                     </button>
                   ))}
                   {state.customPresets.map(preset => (
                     <div key={preset.id} className="relative group">
                        <button
                            onClick={() => applyPreset(preset)}
                            className={`text-xs px-4 py-2 rounded-xl border font-bold transition-all duration-300 pr-8 ${state.selectedPresetId === preset.id ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)] text-emerald-400' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-400'}`}
                        >
                            {preset.name}
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); deletePreset(preset.id); }}
                            className="absolute top-1/2 -translate-y-1/2 right-2 text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Trash2 size={12} />
                        </button>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="space-y-6">
                 <div>
                   <div className="flex justify-between text-xs font-bold text-slate-400 mb-3 px-1">
                     <span className="uppercase tracking-widest">الصدى (Reverb)</span>
                     <span className="text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">{Math.round(state.reverbAmount * 100)}%</span>
                   </div>
                   <input 
                     type="range" min="0" max="1" step="0.05"
                     value={state.reverbAmount}
                     onChange={(e) => updateState({ reverbAmount: parseFloat(e.target.value), selectedPresetId: 'custom' })}
                     className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-emerald-500 border border-white/5"
                     dir="ltr"
                   />
                 </div>
                 <div>
                   <div className="flex justify-between text-xs font-bold text-slate-400 mb-3 px-1">
                     <span className="uppercase tracking-widest">التكرار (Echo)</span>
                     <span className="text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">{Math.round(state.echoAmount * 100)}%</span>
                   </div>
                   <input 
                     type="range" min="0" max="1" step="0.05"
                     value={state.echoAmount}
                     onChange={(e) => updateState({ echoAmount: parseFloat(e.target.value), selectedPresetId: 'custom' })}
                     className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-emerald-500 border border-white/5"
                     dir="ltr"
                   />
                 </div>
                 
                 <div
                    onClick={() => updateState({ isNormalized: !state.isNormalized, selectedPresetId: 'custom' })}
                    className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-black/30 transition-all group"
                 >
                     <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">موازنة الصوت الذكية (Normalize)</span>
                     <div 
                        className={`w-12 h-6 rounded-full relative transition-all duration-500 ${state.isNormalized ? 'bg-emerald-500' : 'bg-white/10'}`}
                     >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 shadow-md ${state.isNormalized ? 'left-7' : 'left-1'}`} />
                     </div>
                 </div>
               </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
