
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
        <div className="bg-black/40 p-5 rounded-[2rem] border border-white/10 text-center animate-in zoom-in-95 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <div className="flex justify-between items-center mb-4 px-2 relative z-10">
                <h4 className="text-white font-black text-xs flex items-center gap-2 uppercase tracking-tight">
                    <Wand2 size={16} className="text-purple-400 animate-pulse"/> تحدي الذاكرة
                </h4>
                <div className="text-[10px] font-black flex gap-3">
                    <span className="text-slate-500">Moves: {moves}</span>
                    <span className="text-purple-400">Wins: {wins}</span>
                </div>
            </div>
            
            <div className="grid grid-cols-6 gap-2 max-w-[350px] mx-auto mb-2 relative z-10">
                {cards.map((card, i) => {
                    const isFlipped = flipped.includes(i) || solved.includes(i);
                    const Icon = card.Icon;
                    return (
                        <div 
                            key={i}
                            onClick={() => handleClick(i)}
                            className={`aspect-square rounded-xl cursor-pointer transition-all duration-500 transform shadow-lg ${isFlipped ? 'bg-white rotate-0 scale-90' : 'bg-white/5 border border-white/10 rotate-180 hover:bg-white/10 hover:border-white/20' } flex items-center justify-center`}
                        >
                            {isFlipped && <Icon className="text-black animate-in zoom-in duration-500" size={20} strokeWidth={2.5} />}
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
          <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-8 animate-in fade-in zoom-in-95 relative">
              <div className="absolute top-0 right-0 p-4">
                 <span className="bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-md">
                    <Beaker size={14} className="text-purple-400" /> ميزة تجريبية
                 </span>
              </div>
              <div className="w-24 h-24 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center text-white/20 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent"></div>
                  <Type size={48} strokeWidth={2.5} className="relative z-10" />
              </div>
              <div>
                <h2 className="text-3xl font-black font-rakkas text-white mb-3">إضافة النص القرآني</h2>
                <p className="text-slate-500 max-w-md font-medium text-sm">إظهار الآيات متزامنة مع التلاوة باستخدام أقوى نماذج الذكاء الاصطناعي (Gemini 2.0).</p>
              </div>
              <button onClick={() => updateConfig({ isEnabled: true })} className="liquid-button shiny-reflection text-white px-10 py-4 rounded-[1.5rem] font-black shadow-2xl transition-all hover:scale-110 active:scale-95 text-lg">
                  تفعيل الآيات والذكاء الاصطناعي
              </button>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full space-y-8 animate-in slide-in-from-bottom-8 duration-700">
        
        {/* Header with Disable Button */}
        <div className="flex justify-between items-center bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg">
            <div className="flex gap-2 p-1 bg-black/20 rounded-xl border border-white/5">
                <button onClick={() => setActiveTab('setup')} className={`px-6 py-2 rounded-lg text-xs font-black transition-all duration-300 ${activeTab === 'setup' ? 'bg-white text-black shadow-lg scale-105' : 'text-slate-400 hover:text-slate-200'}`}>1. اختيار الآيات</button>
                <button onClick={() => setActiveTab('sync')} disabled={config.verses.length === 0} className={`px-6 py-2 rounded-lg text-xs font-black transition-all duration-300 ${activeTab === 'sync' ? 'bg-white text-black shadow-lg scale-105' : 'text-slate-400 hover:text-slate-200 disabled:opacity-20'}`}>2. الذكاء الاصطناعي</button>
            </div>
            <button 
                onClick={() => updateConfig({ isEnabled: false })}
                className="text-red-400 hover:text-red-300 text-[10px] font-black flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 transition-all active:scale-95"
            >
                <Power size={14} strokeWidth={3} /> تعطيل
            </button>
        </div>

        {activeTab === 'setup' && (
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full flex-1 overflow-hidden">
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 space-y-6 shadow-2xl backdrop-blur-xl h-full flex flex-col justify-center">
                    <h3 className="text-xl font-black text-white flex items-center gap-3"><Search size={22} strokeWidth={2.5}/> تحديد المقطع</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 mr-1">السورة</label>
                            <select className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-white/30 transition-all custom-scrollbar appearance-none shadow-inner" value={config.surahNumber} onChange={(e) => updateConfig({ surahNumber: parseInt(e.target.value), fromAyah: 1, toAyah: 1 })}>
                                {SURAH_NAMES.map((name, i) => (<option key={i} value={i + 1} className="bg-slate-900 text-white">{i + 1}. {name}</option>))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 mr-1">من آية</label><input type="number" min="1" max={VERSE_COUNTS[config.surahNumber]} value={config.fromAyah} onChange={(e) => updateConfig({ fromAyah: parseInt(e.target.value) })} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-center font-bold outline-none focus:border-white/30 transition-all shadow-inner"/></div>
                            <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 mr-1">إلى آية</label><input type="number" min={config.fromAyah} max={VERSE_COUNTS[config.surahNumber]} value={config.toAyah} onChange={(e) => updateConfig({ toAyah: parseInt(e.target.value) })} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-center font-bold outline-none focus:border-white/30 transition-all shadow-inner"/></div>
                        </div>
                    </div>
                    <button onClick={handleFetchVerses} disabled={loading} className="liquid-button shiny-reflection w-full text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all mt-4 shadow-2xl scale-100 hover:scale-[1.02] active:scale-95">
                        {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={22} strokeWidth={2.5} />} جلب النص القرآني
                    </button>
                    {error && <p className="text-red-400 text-[10px] font-bold text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</p>}
                </div>
                <div className="bg-black/20 p-6 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center text-center shadow-inner h-full overflow-hidden">
                    {config.verses.length > 0 ? (
                        <div className="space-y-2 w-full max-h-[300px] overflow-y-auto custom-scrollbar">
                            {config.verses.map((v, i) => (<div key={i} className="bg-slate-950 p-3 rounded border border-slate-800 text-emerald-100 font-amiri text-lg">{v.text} <span className="text-emerald-500 text-sm">({v.numberInSurah})</span></div>))}
                        </div>
                    ) : (
                        <div className="text-slate-500"><Type size={40} className="mx-auto mb-2 opacity-20" /><p>ستظهر الآيات هنا</p></div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'sync' && (
            <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row gap-6 h-full min-h-[500px]">
                <div className="w-full md:w-1/3 flex flex-col gap-6 overflow-y-auto no-scrollbar">
                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 shadow-2xl backdrop-blur-md">
                        <h3 className="text-xs font-black text-white mb-4 flex items-center gap-3 uppercase tracking-widest"><Key size={18} className="text-yellow-500"/> API Vault</h3>
                        <div className="space-y-3 mb-4 max-h-40 overflow-y-auto no-scrollbar">
                            {config.apiKeys.map((k, i) => (<div key={i} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5 text-[10px] font-black"><span className="font-mono text-slate-400 truncate w-32">••••{k.slice(-4)}</span><button onClick={() => removeKey(i)} className="text-red-400 hover:text-red-300 transition-all active:scale-90"><Trash2 size={14}/></button></div>))}
                        </div>
                        <div className="flex gap-2">
                            <input type="password" placeholder="Gemini API Key..." value={newKey} onChange={(e) => setNewKey(e.target.value)} className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-[10px] text-white font-bold outline-none focus:border-white/20 transition-all shadow-inner"/>
                            <button onClick={addKey} className="bg-white text-black w-10 h-10 rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all flex-shrink-0"><Plus size={18} strokeWidth={3}/></button>
                        </div>
                    </div>

                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex-1 flex flex-col justify-center gap-6 shadow-2xl backdrop-blur-md">
                        {!syncing ? (
                            <>
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-white border border-white/10 shadow-xl">
                                        <ShieldCheck size={32} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="font-black text-white text-lg tracking-tight">Smart AI Sync</h3>
                                    
                                    {/* Mode Selector */}
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['fast', 'medium', 'heavy'] as SyncMode[]).map(mode => (
                                            <button
                                                key={mode}
                                                onClick={() => setSelectedMode(mode)}
                                                className={`p-3 rounded-xl border transition-all duration-300 flex flex-col items-center gap-1 ${selectedMode === mode ? 'bg-white text-black border-white shadow-xl scale-105' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                                            >
                                                <span className="text-[10px] font-black uppercase">{mode === 'fast' ? 'سريع' : mode === 'medium' ? 'متوسط' : 'ثقيل'}</span>
                                                <span className="text-[8px] font-bold opacity-50 tracking-tighter">{mode === 'fast' ? '~20s' : mode === 'medium' ? '~40s' : '~90s'}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <button onClick={handleGeminiSync} disabled={config.apiKeys.length === 0} className="liquid-button shiny-reflection w-full text-white py-4 rounded-[1.2rem] font-black shadow-2xl transition-all disabled:opacity-30 disabled:scale-100 text-sm active:scale-95">
                                        بدء المعالجة الذكية
                                    </button>
                                    {error && <p className="text-red-400 text-[10px] font-black bg-red-500/10 p-2 rounded-lg">{error}</p>}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col gap-6">
                                <div className="text-center space-y-3">
                                    <p className="text-xs font-black text-white animate-pulse tracking-wide">{syncMessage}</p>
                                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-700 shadow-[0_0_10px_rgba(167,139,250,0.5)]" style={{ width: `${syncProgress}%` }}></div></div>
                                </div>
                                <MemoryGame />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 bg-black/20 rounded-[2rem] border border-white/5 p-4 flex flex-col h-full overflow-hidden shadow-inner relative">
                    <div className="flex justify-between items-center px-4 py-4 border-b border-white/5 mb-4 shrink-0 relative z-10">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><PlayCircle size={16} className="text-white"/> Timeline Editor</h4>
                        <button onClick={addSegment} className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-black flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 transition-all"><Plus size={14} strokeWidth={3}/> إضافة</button>
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 p-2 relative z-10 pb-20">
                        {config.timings.map((t, i) => (
                            <div key={i} className="flex flex-col gap-4 bg-white/5 p-5 rounded-[1.5rem] border border-white/10 hover:border-white/30 transition-all group shadow-xl">
                                <div className="flex items-start gap-4">
                                    <span className="w-8 h-8 bg-white text-black rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 shadow-lg">{i+1}</span>
                                    <textarea value={t.text} onChange={(e) => updateTiming(i, { text: e.target.value })} className="flex-1 bg-transparent text-white font-amiri text-2xl outline-none resize-none border-b border-transparent focus:border-white/20 transition-all leading-relaxed pt-1" rows={1} dir="rtl"/>
                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => splitSegment(i)} className="p-2 bg-white/5 text-blue-400 rounded-xl border border-white/5 hover:bg-white/10"><Split size={14} /></button>
                                        <button onClick={() => deleteSegment(i)} className="p-2 bg-red-500/10 text-red-400 rounded-xl border border-red-500/10 hover:bg-red-500/20"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-black/40 p-2 rounded-xl self-end border border-white/5 shadow-inner">
                                    <input type="number" step="0.1" value={t.startTime} onChange={(e) => updateTiming(i, { startTime: parseFloat(e.target.value) })} className="w-16 bg-transparent text-white text-center text-[10px] font-black outline-none focus:text-purple-400 transition-all"/><span className="text-slate-600 text-[10px] font-black uppercase">➜</span><input type="number" step="0.1" value={t.endTime} onChange={(e) => updateTiming(i, { endTime: parseFloat(e.target.value) })} className="w-16 bg-transparent text-white text-center text-[10px] font-black outline-none focus:text-purple-400 transition-all"/>
                                </div>
                            </div>
                        ))}
                         {config.timings.length === 0 && <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-700 gap-4 opacity-30"><Wand2 size={48} strokeWidth={1} /><p className="font-black text-sm uppercase tracking-widest">Segments will appear here</p></div>}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
