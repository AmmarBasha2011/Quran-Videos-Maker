
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 flex-1">
      <div className="text-center">
        <h2 className="text-2xl font-black font-rakkas mb-6 text-white">إضافة الصوت</h2>
        
        {!state.audioFile && !isRecording ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Upload Option */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 hover:bg-white/10 hover:border-white/30 hover:scale-105 transition-all cursor-pointer relative group flex flex-col items-center justify-center gap-4 h-56 shadow-2xl backdrop-blur-md overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent"></div>
                <input type="file" accept="audio/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-white group-hover:bg-white/20 transition-all shadow-xl relative z-10">
                    <Upload size={32} strokeWidth={2.5} />
                </div>
                <div className="relative z-10">
                    <p className="text-white font-black text-lg">رفع ملف صوتي</p>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">MP3, WAV, M4A</span>
                </div>
              </div>

              {/* Record Option */}
              <button 
                onClick={startRecording}
                className="bg-white/5 border border-white/10 rounded-[2rem] p-8 hover:bg-red-500/5 hover:border-red-500/30 hover:scale-105 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 h-56 group shadow-2xl backdrop-blur-md relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent"></div>
                <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-white group-hover:bg-red-500 group-hover:text-white transition-all shadow-xl relative z-10">
                    <Mic size={32} strokeWidth={2.5} />
                </div>
                <div className="relative z-10">
                    <p className="text-white font-black text-lg">تسجيل مباشر</p>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">استخدام الميكروفون</span>
                </div>
              </button>
          </div>
        ) : isRecording ? (
            <div className="bg-black/40 border border-red-500/30 rounded-[2.5rem] p-10 max-w-md mx-auto text-center space-y-8 backdrop-blur-3xl shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-pulse">
                <div className="w-24 h-24 bg-red-500/20 rounded-[2rem] flex items-center justify-center mx-auto text-red-500 border border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                    <Mic size={40} className="animate-bounce" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">جاري التسجيل...</h3>
                    <p className="text-5xl font-black font-mono text-red-400 tracking-tighter">{formatTime(recordingTime)}</p>
                </div>
                <button 
                    onClick={stopRecording}
                    className="liquid-button shiny-reflection bg-red-600 px-10 py-4 rounded-2xl font-black text-white shadow-2xl transition-all hover:scale-105 flex items-center justify-center gap-3 mx-auto"
                >
                    <Square size={20} fill="currentColor" /> إيقاف وحفظ
                </button>
            </div>
        ) : (
          <div className="bg-white/5 rounded-[2.5rem] p-6 md:p-10 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 blur-[60px] rounded-full"></div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10 relative z-10">
              <div className="flex items-center gap-6 text-right w-full md:w-auto">
                <div className="w-16 h-16 rounded-3xl bg-white/10 text-white flex flex-shrink-0 items-center justify-center shadow-xl border border-white/20">
                  <FileAudio size={32} strokeWidth={2.5} />
                </div>
                <div className="overflow-hidden">
                  <p className="font-black text-xl text-white truncate max-w-xs" dir="ltr">{state.audioFile?.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {audioProps.isPlaying ? "Playing..." : "Audio Ready"}
                      </p>
                      <button 
                        onClick={() => updateState({ audioFile: null, audioUrl: null })}
                        className="text-[10px] font-black text-red-400 hover:text-red-300 flex items-center gap-1.5 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 transition-all hover:bg-red-500/20"
                      >
                          <Trash2 size={12} /> حذف الملف
                      </button>
                  </div>
                </div>
              </div>
              <button 
                onClick={audioProps.togglePlay}
                disabled={!audioProps.isReady}
                className="w-20 h-20 rounded-[2rem] liquid-button shiny-reflection text-white flex items-center justify-center transition-all shadow-2xl shadow-black/50 disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                 {audioProps.isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} className="ml-1" fill="currentColor" />}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-10 relative z-10" dir="ltr">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-100 ease-linear shadow-[0_0_15px_rgba(167,139,250,0.5)]"
                style={{ width: `${audioProps.duration ? (audioProps.currentTime / audioProps.duration) * 100 : 0}%` }}
              />
            </div>

            {/* Controls */}
            <div className="grid md:grid-cols-2 gap-12 relative z-10">
               <div>
                 <div className="flex justify-between items-center mb-5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">قوالب هندسة الصوت</label>
                    <button 
                        onClick={() => setShowSave(!showSave)}
                        className="text-[10px] font-black text-purple-400 hover:text-purple-300 flex items-center bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 transition-all"
                    >
                        <Plus size={12} className="ml-1" strokeWidth={3}/> حفظ الحالي
                    </button>
                 </div>
                 
                 {showSave && (
                    <div className="flex gap-2 mb-4 animate-in fade-in slide-in-from-top-2">
                        <input 
                            type="text" 
                            placeholder="اسم القالب الجديد..."
                            className="bg-black/40 text-xs px-4 py-2.5 rounded-xl border border-white/10 flex-1 outline-none focus:border-white/30 text-white font-bold"
                            value={presetName}
                            onChange={(e) => setPresetName(e.target.value)}
                        />
                        <button 
                          onClick={() => { savePreset(presetName); setPresetName(''); setShowSave(false); }} 
                          className="liquid-button shiny-reflection text-white px-5 rounded-xl text-xs font-black"
                        >
                          حفظ
                        </button>
                    </div>
                 )}

                 <div className="flex flex-wrap gap-2.5 max-h-40 overflow-y-auto no-scrollbar">
                   {AUDIO_PRESETS.map(preset => (
                     <button
                       key={preset.id}
                       onClick={() => applyPreset(preset)}
                       className={`text-[10px] font-black px-4 py-2.5 rounded-xl border transition-all duration-300 ${state.selectedPresetId === preset.id ? 'bg-white text-black border-white shadow-xl scale-105' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
                     >
                       {preset.name}
                     </button>
                   ))}
                   {state.customPresets.map(preset => (
                     <div key={preset.id} className="relative group">
                        <button
                            onClick={() => applyPreset(preset)}
                            className={`text-[10px] font-black px-4 py-2.5 rounded-xl border transition-all duration-300 pr-8 ${state.selectedPresetId === preset.id ? 'bg-white text-black border-white shadow-xl scale-105' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
                        >
                            {preset.name}
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); deletePreset(preset.id); }}
                            className="absolute top-1/2 -translate-y-1/2 right-2 text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        >
                            <Trash2 size={12} />
                        </button>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="space-y-6">
                 <div>
                   <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                     <span>الصدى (Reverb)</span>
                     <span className="text-white bg-white/10 px-2 py-0.5 rounded-md">{Math.round(state.reverbAmount * 100)}%</span>
                   </div>
                   <input 
                     type="range" min="0" max="1" step="0.05"
                     value={state.reverbAmount}
                     onChange={(e) => updateState({ reverbAmount: parseFloat(e.target.value), selectedPresetId: 'custom' })}
                     className="w-full accent-white h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer hover:bg-white/20 transition-all"
                     dir="ltr"
                   />
                 </div>
                 <div>
                   <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                     <span>التكرار (Echo)</span>
                     <span className="text-white bg-white/10 px-2 py-0.5 rounded-md">{Math.round(state.echoAmount * 100)}%</span>
                   </div>
                   <input 
                     type="range" min="0" max="1" step="0.05"
                     value={state.echoAmount}
                     onChange={(e) => updateState({ echoAmount: parseFloat(e.target.value), selectedPresetId: 'custom' })}
                     className="w-full accent-white h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer hover:bg-white/20 transition-all"
                     dir="ltr"
                   />
                 </div>
                 
                 <div
                    onClick={() => updateState({ isNormalized: !state.isNormalized, selectedPresetId: 'custom' })}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${state.isNormalized ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                 >
                     <span className="text-xs font-black text-white">موازنة الصوت (Normalize)</span>
                     <div className={`w-12 h-6 rounded-full relative transition-colors p-1 ${state.isNormalized ? 'bg-purple-500' : 'bg-white/10'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-all shadow-lg ${state.isNormalized ? 'translate-x-0' : 'translate-x-6'}`} />
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
