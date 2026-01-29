
import React, { useState, useEffect } from 'react';
import { AppState, QuranConfig, VerseTiming } from '../../types';
import { SURAH_NAMES, VERSE_COUNTS } from '../../constants';
import { fetchQuranVerses } from '../../services/quranService';
import { syncAudioWithVersesPipeline, SyncMode } from '../../services/geminiService';
import { Wand2, Download, Search, Type, Trash2, Split, Plus, Key, ShieldCheck, PlayCircle, CopyPlus, Moon, Star, BookOpen, Heart, Cloud, Sun, Flower, Flame, Droplet, Snowflake, Zap, Anchor, Beaker, Power } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  audioDuration: number;
}

// --- ENHANCED MEMORY GAME ---
const MemoryGame = () => {
    // 12 Icons for 24 cards
    const ICONS = [Moon, Star, BookOpen, Heart, Cloud, Sun, Flower, Flame, Droplet, Snowflake, Zap, Anchor];
    const [cards, setCards] = useState<any[]>([]);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [solved, setSolved] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [wins, setWins] = useState(0);

    const initGame = () => {
        const deck = [...ICONS, ...ICONS]
            .sort(() => Math.random() - 0.5)
            .map((Icon, id) => ({ id, Icon }));
        setCards(deck);
        setFlipped([]);
        setSolved([]);
        setMoves(0);
    };

    useEffect(() => {
        initGame();
    }, [wins]); // Restart on win

    const handleClick = (index: number) => {
        if (flipped.length === 2 || flipped.includes(index) || solved.includes(index)) return;
        
        const newFlipped = [...flipped, index];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            const [first, second] = newFlipped;
            if (cards[first].Icon === cards[second].Icon) {
                const newSolved = [...solved, first, second];
                setSolved(newSolved);
                setFlipped([]);
                if (newSolved.length === cards.length) {
                    setTimeout(() => setWins(w => w + 1), 1000);
                }
            } else {
                setTimeout(() => setFlipped([]), 800);
            }
        }
    };

    return (
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center animate-in zoom-in">
            <div className="flex justify-between items-center mb-2 px-2">
                <h4 className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                    <Wand2 size={16} className="animate-pulse"/> العب لتنشيط الذاكرة
                </h4>
                <div className="text-[10px] text-slate-400 flex gap-2">
                    <span>محاولات: {moves}</span>
                    <span className="text-emerald-500">جولات: {wins}</span>
                </div>
            </div>
            
            <div className="grid grid-cols-6 gap-2 max-w-[350px] mx-auto mb-2">
                {cards.map((card, i) => {
                    const isFlipped = flipped.includes(i) || solved.includes(i);
                    const Icon = card.Icon;
                    return (
                        <div 
                            key={i}
                            onClick={() => handleClick(i)}
                            className={`aspect-square rounded cursor-pointer transition-all duration-300 transform shadow-sm ${isFlipped ? 'bg-emerald-600 rotate-0 scale-95' : 'bg-slate-800 rotate-180 hover:bg-slate-700' } flex items-center justify-center`}
                        >
                            {isFlipped && <Icon className="text-white animate-in zoom-in duration-300" size={16} />}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export const TextOverlayStep: React.FC<Props> = ({ state, updateState, audioDuration }) => {
  const config = state.quranConfig;
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncMessage, setSyncMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'setup' | 'sync'>('setup');
  const [newKey, setNewKey] = useState('');
  
  // New Sync Mode
  const [selectedMode, setSelectedMode] = useState<SyncMode>('fast');

  const updateConfig = (updates: Partial<QuranConfig>) => {
      updateState({ quranConfig: { ...config, ...updates } });
  };

  const handleFetchVerses = async () => {
      setLoading(true);
      setError(null);
      try {
          const verses = await fetchQuranVerses(config.surahNumber, config.fromAyah, config.toAyah);
          // Sort fetched verses by number to prevent any API weirdness
          verses.sort((a,b) => a.numberInSurah - b.numberInSurah);

          const avgDuration = audioDuration / verses.length;
          const initialTimings: VerseTiming[] = verses.map((v, i) => ({
              verseIndex: i,
              text: v.text,
              startTime: parseFloat((i * avgDuration).toFixed(2)),
              endTime: parseFloat(((i + 1) * avgDuration).toFixed(2))
          }));
          updateConfig({ verses, timings: initialTimings });
          setActiveTab('sync');
      } catch (e) {
          setError("فشل جلب الآيات. تأكد من الاتصال بالإنترنت.");
      } finally {
          setLoading(false);
      }
  };

  const handleGeminiSync = async () => {
      if (!state.audioFile) { setError("يرجى رفع ملف صوتي أولاً."); return; }
      if (config.apiKeys.length === 0) { setError("يرجى إضافة مفتاح API واحد على الأقل."); return; }

      setSyncing(true);
      setError(null);
      setSyncProgress(0);
      setSyncMessage("بدء خطة المعالجة...");

      try {
          const syncedTimings = await syncAudioWithVersesPipeline(
              state.audioFile, 
              config.verses, 
              config.apiKeys,
              selectedMode,
              (msg, prog) => {
                  setSyncMessage(msg);
                  setSyncProgress(prog);
              }
          );
          updateConfig({ timings: syncedTimings });
      } catch (e: any) {
          console.error(e);
          setError("فشلت المزامنة: " + (e.message || "Unknown error"));
          setSyncProgress(0);
      } finally {
          setSyncing(false);
      }
  };

  const addKey = () => { if (newKey.trim().length > 10) { const updatedKeys = [...config.apiKeys, newKey.trim()]; updateConfig({ apiKeys: updatedKeys }); localStorage.setItem('geminiApiKeys', JSON.stringify(updatedKeys)); setNewKey(''); } };
  const removeKey = (index: number) => { const updatedKeys = config.apiKeys.filter((_, i) => i !== index); updateConfig({ apiKeys: updatedKeys }); localStorage.setItem('geminiApiKeys', JSON.stringify(updatedKeys)); };
  
  const updateTiming = (index: number, updates: Partial<VerseTiming>) => { 
      const newTimings = [...config.timings]; 
      newTimings[index] = { ...newTimings[index], ...updates }; 
      updateConfig({ timings: newTimings }); 
  };
  const splitSegment = (index: number) => { const current = config.timings[index]; const duration = current.endTime - current.startTime; const midPoint = current.startTime + (duration / 2); const part1: VerseTiming = { ...current, text: current.text, endTime: parseFloat(midPoint.toFixed(2)) }; const part2: VerseTiming = { ...current, text: current.text, startTime: parseFloat(midPoint.toFixed(2)) }; const newTimings = [...config.timings]; newTimings.splice(index, 1, part1, part2); updateConfig({ timings: newTimings }); };
  const deleteSegment = (index: number) => { if (confirm("حذف المقطع؟")) { const newTimings = config.timings.filter((_, i) => i !== index); updateConfig({ timings: newTimings }); } };
  const addSegment = () => { const last = config.timings[config.timings.length - 1]; const newSegment: VerseTiming = { verseIndex: last ? last.verseIndex : 0, text: "نص جديد...", startTime: last ? last.endTime : 0, endTime: last ? last.endTime + 5 : 5 }; updateConfig({ timings: [...config.timings, newSegment] }); };

  if (!config.isEnabled) {
      return (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-8 animate-in fade-in relative">
              <div className="absolute top-0 right-0 p-4">
                 <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-2 backdrop-blur-md">
                    <Beaker size={14} /> ميزة متقدمة
                 </span>
              </div>
              <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center text-slate-500 border border-white/10 shadow-xl backdrop-blur-md">
                <Type size={48} />
              </div>
              <div>
                <h2 className="text-3xl font-bold font-rakkas text-white">إضافة النص القرآني</h2>
                <p className="text-slate-400 max-w-sm mt-3 font-medium">إظهار الآيات متزامنة مع التلاوة باستخدام الذكاء الاصطناعي.</p>
              </div>
              <button onClick={() => updateConfig({ isEnabled: true })} className="bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-4 rounded-2xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95 mt-4 border border-emerald-400/50">
                  تفعيل الآيات والترجمة
              </button>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full space-y-8 animate-in slide-in-from-bottom-4">
        
        {/* Header with Disable Button */}
        <div className="flex justify-between items-center bg-white/5 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
            <div className="flex bg-black/20 p-1 rounded-xl border border-white/5">
                <button onClick={() => setActiveTab('setup')} className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${activeTab === 'setup' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}>1. اختيار الآيات</button>
                <button onClick={() => setActiveTab('sync')} disabled={config.verses.length === 0} className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${activeTab === 'sync' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white disabled:opacity-20'}`}>2. المزامنة الذكية</button>
            </div>
            <button 
                onClick={() => updateConfig({ isEnabled: false })}
                className="text-red-400 hover:text-red-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
            >
                <Power size={14} /> تعطيل
            </button>
        </div>

        {activeTab === 'setup' && (
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6 backdrop-blur-md shadow-xl">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3"><Search size={22} className="text-emerald-400"/> تحديد المقطع</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest mr-1">السورة</label>
                            <select className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-emerald-500/50 custom-scrollbar transition-all font-medium" value={config.surahNumber} onChange={(e) => updateConfig({ surahNumber: parseInt(e.target.value), fromAyah: 1, toAyah: 1 })}>
                                {SURAH_NAMES.map((name, i) => (<option key={i} value={i + 1} className="bg-slate-900">{i + 1}. {name}</option>))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest mr-1">من آية</label><input type="number" min="1" max={VERSE_COUNTS[config.surahNumber]} value={config.fromAyah} onChange={(e) => updateConfig({ fromAyah: parseInt(e.target.value) })} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white text-center outline-none focus:border-emerald-500/50 transition-all font-bold"/></div>
                            <div><label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest mr-1">إلى آية</label><input type="number" min={config.fromAyah} max={VERSE_COUNTS[config.surahNumber]} value={config.toAyah} onChange={(e) => updateConfig({ toAyah: parseInt(e.target.value) })} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white text-center outline-none focus:border-emerald-500/50 transition-all font-bold"/></div>
                        </div>
                    </div>
                    <button onClick={handleFetchVerses} disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-500/20 mt-4 border border-emerald-400/50">
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={20} />} جلب النص
                    </button>
                    {error && <p className="text-red-400 text-xs text-center font-bold bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</p>}
                </div>
                <div className="bg-black/20 p-6 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center backdrop-blur-sm shadow-inner overflow-hidden">
                    {config.verses.length > 0 ? (
                        <div className="space-y-3 w-full max-h-[350px] overflow-y-auto no-scrollbar py-2">
                            {config.verses.map((v, i) => (<div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/10 text-emerald-50 font-amiri text-xl leading-relaxed shadow-sm hover:bg-white/10 transition-all">{v.text} <span className="text-emerald-400 text-sm font-bold opacity-60">({v.numberInSurah})</span></div>))}
                        </div>
                    ) : (
                        <div className="text-slate-600 group">
                            <Type size={50} className="mx-auto mb-4 opacity-10 group-hover:opacity-20 transition-opacity duration-700" />
                            <p className="font-bold text-sm uppercase tracking-[0.2em] opacity-30">ستظهر الآيات هنا</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'sync' && (
            <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row gap-6 h-full min-h-[500px]">
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Key size={16} className="text-yellow-400"/> API Vault</h3>
                        <div className="space-y-2 mb-4 max-h-32 overflow-y-auto no-scrollbar">
                            {config.apiKeys.map((k, i) => (<div key={i} className="flex items-center justify-between bg-black/20 p-2 rounded-xl text-xs border border-white/5"><span className="font-mono text-slate-400 truncate w-32">••••{k.slice(-4)}</span><button onClick={() => removeKey(i)} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 size={14}/></button></div>))}
                        </div>
                        <div className="flex gap-2 bg-black/20 p-1.5 rounded-xl border border-white/5">
                            <input type="password" placeholder="Gemini API Key..." value={newKey} onChange={(e) => setNewKey(e.target.value)} className="flex-1 bg-transparent p-1.5 text-xs text-white outline-none placeholder:text-slate-600"/>
                            <button onClick={addKey} className="bg-emerald-500 hover:bg-emerald-400 text-white p-2 rounded-lg transition-all shadow-md"><Plus size={16}/></button>
                        </div>
                    </div>

                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex-1 flex flex-col justify-center gap-6 backdrop-blur-md shadow-xl overflow-hidden">
                        {!syncing ? (
                            <>
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/20 shadow-lg mb-2">
                                        <ShieldCheck size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">Smart Sync V3</h3>
                                    
                                    {/* Mode Selector */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <button 
                                            onClick={() => setSelectedMode('fast')}
                                            className={`p-2 rounded-xl border font-bold transition-all duration-300 ${selectedMode === 'fast' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-black/20 border-white/5 text-slate-500'}`}
                                        >
                                            <span className="text-[10px]">سريع</span>
                                            <span className="block text-[8px] opacity-60">~20s</span>
                                        </button>
                                        <button 
                                            onClick={() => setSelectedMode('medium')}
                                            className={`p-2 rounded-xl border font-bold transition-all duration-300 ${selectedMode === 'medium' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-black/20 border-white/5 text-slate-500'}`}
                                        >
                                            <span className="text-[10px]">متوسط</span>
                                            <span className="block text-[8px] opacity-60">~40s</span>
                                        </button>
                                        <button 
                                            onClick={() => setSelectedMode('heavy')}
                                            className={`p-2 rounded-xl border font-bold transition-all duration-300 ${selectedMode === 'heavy' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-black/20 border-white/5 text-slate-500'}`}
                                        >
                                            <span className="text-[10px]">دقيق</span>
                                            <span className="block text-[8px] opacity-60">~90s</span>
                                        </button>
                                    </div>

                                    <button onClick={handleGeminiSync} disabled={config.apiKeys.length === 0} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-3.5 rounded-2xl font-bold shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm border border-emerald-400/50">
                                        بدء المعالجة الذكية
                                    </button>
                                    {error && <p className="text-red-400 text-[10px] font-bold bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</p>}
                                </div>
                                <div className="border-t border-white/5 pt-4 opacity-40 grayscale select-none cursor-not-allowed">
                                    <div className="flex items-center gap-2 mb-3"><CopyPlus size={16} className="text-slate-400"/><span className="text-xs font-bold text-slate-400 uppercase tracking-tight">إصدارات متعددة (Soon)</span></div>
                                    <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                                        <div className="w-8 h-4 bg-white/10 rounded-full relative"><div className="absolute top-1 left-1 w-2 h-2 bg-white/20 rounded-full"/></div>
                                        <span className="text-[10px] font-bold text-slate-500">نسخة بالآيات + نسخة خام</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col gap-6">
                                <div className="text-center space-y-3">
                                    <p className="text-sm font-bold text-emerald-400 animate-pulse uppercase tracking-widest">{syncMessage}</p>
                                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner"><div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700 shadow-[0_0_15px_rgba(16,185,129,0.5)]" style={{ width: `${syncProgress}%` }}></div></div>
                                </div>
                                <MemoryGame />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 bg-black/20 rounded-3xl border border-white/5 p-4 flex flex-col h-full overflow-hidden shadow-inner backdrop-blur-sm">
                    <div className="flex justify-between items-center px-2 pb-4 border-b border-white/5 mb-4 shrink-0">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><PlayCircle size={16} className="text-emerald-400"/> Timeline Editor</h4>
                        <button onClick={addSegment} className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all border border-emerald-500/20"><Plus size={12}/> إضافة مقطع</button>
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 p-1">
                        {config.timings.map((t, i) => (
                            <div key={i} className="flex flex-col gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all shadow-md group">
                                <div className="flex items-start gap-4">
                                    <span className="w-7 h-7 bg-black/40 rounded-lg flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0 border border-white/5 shadow-inner">{i+1}</span>
                                    <textarea value={t.text} onChange={(e) => updateTiming(i, { text: e.target.value })} className="flex-1 bg-transparent text-white font-amiri text-lg outline-none resize-none border-b border-transparent focus:border-white/10 transition-all leading-loose p-0" rows={1} dir="rtl"/>
                                    <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => splitSegment(i)} className="p-1.5 bg-white/5 text-blue-400 rounded-lg hover:bg-white/10 border border-white/5"><Split size={14} /></button><button onClick={() => deleteSegment(i)} className="p-1.5 bg-white/5 text-red-400 rounded-lg hover:bg-white/10 border border-white/5"><Trash2 size={14} /></button></div>
                                </div>
                                <div className="flex items-center gap-2 bg-black/30 p-2 rounded-xl self-end border border-white/5 shadow-inner">
                                    <input type="number" step="0.1" value={t.startTime} onChange={(e) => updateTiming(i, { startTime: parseFloat(e.target.value) })} className="w-16 bg-transparent text-white text-center text-xs font-bold outline-none"/><span className="text-slate-600 text-[10px] font-bold">TO</span><input type="number" step="0.1" value={t.endTime} onChange={(e) => updateTiming(i, { endTime: parseFloat(e.target.value) })} className="w-16 bg-transparent text-white text-center text-xs font-bold outline-none"/>
                                </div>
                            </div>
                        ))}
                         {config.timings.length === 0 && <div className="flex flex-col items-center justify-center py-20 text-slate-600 opacity-20"><Wand2 size={48} className="mb-4"/><p className="text-xs font-bold uppercase tracking-widest">المقاطع ستظهر هنا</p></div>}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
