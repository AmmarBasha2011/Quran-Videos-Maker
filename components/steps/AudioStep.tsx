
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
      <div className="text-center">
        <h2 className="text-xl font-bold font-rakkas mb-2">إضافة الصوت</h2>
        
        {!state.audioFile && !isRecording ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {/* Upload Option */}
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 hover:border-emerald-500/50 hover:bg-slate-800/30 transition-all cursor-pointer relative group flex flex-col items-center justify-center gap-4 h-48">
                <input type="file" accept="audio/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors">
                    <Upload size={28} />
                </div>
                <p className="text-slate-400 font-bold group-hover:text-slate-300">رفع ملف صوتي</p>
                <span className="text-[10px] text-slate-500">MP3, WAV, M4A</span>
              </div>

              {/* Record Option */}
              <button 
                onClick={startRecording}
                className="border-2 border-dashed border-slate-700 rounded-xl p-8 hover:border-red-500/50 hover:bg-slate-800/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 h-48 group"
              >
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 group-hover:text-red-400 transition-colors">
                    <Mic size={28} />
                </div>
                <p className="text-slate-400 font-bold group-hover:text-slate-300">تسجيل مباشر</p>
                <span className="text-[10px] text-slate-500">استخدام الميكروفون</span>
              </button>
          </div>
        ) : isRecording ? (
            <div className="bg-slate-900 border border-red-500/30 rounded-xl p-8 max-w-md mx-auto text-center space-y-6 animate-pulse">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-500/20">
                    <Mic size={32} className="animate-bounce" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">جاري التسجيل...</h3>
                    <p className="text-3xl font-mono text-red-400">{formatTime(recordingTime)}</p>
                </div>
                <button 
                    onClick={stopRecording}
                    className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
                >
                    <Square size={18} fill="currentColor" /> إيقاف وحفظ
                </button>
            </div>
        ) : (
          <div className="bg-slate-950/50 rounded-xl p-4 md:p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4 max-w-[70%]">
                <div className="w-12 h-12 rounded-full bg-emerald-900/20 text-emerald-500 flex flex-shrink-0 items-center justify-center">
                  <FileAudio />
                </div>
                <div className="text-right overflow-hidden">
                  <p className="font-medium text-slate-200 truncate" dir="ltr">{state.audioFile?.name}</p>
                  <div className="flex items-center gap-3">
                      <p className="text-xs text-slate-500">
                        {audioProps.isPlaying ? "جاري التشغيل..." : "جاهز"}
                      </p>
                      <button 
                        onClick={() => updateState({ audioFile: null, audioUrl: null })}
                        className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-900/10 px-2 py-0.5 rounded border border-red-900/20"
                      >
                          <Trash2 size={10} /> حذف
                      </button>
                  </div>
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
