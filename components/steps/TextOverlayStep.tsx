
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
          <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-6 animate-in fade-in relative">
              <div className="absolute top-0 right-0 p-2">
                 <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                    <Beaker size={12} /> ميزة تجريبية
                 </span>
              </div>
              <Type size={64} className="text-slate-600 mb-4" />
              <h2 className="text-2xl font-bold font-rakkas text-white">إضافة النص القرآني</h2>
              <p className="text-slate-400 max-w-md">إظهار الآيات متزامنة مع التلاوة باستخدام Gemini 3.</p>
              <button onClick={() => updateConfig({ isEnabled: true })} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all transform hover:scale-105 mt-4">
                  تفعيل الآيات (تجريبي)
              </button>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full space-y-6 animate-in slide-in-from-bottom-4">
        
        {/* Header with Disable Button */}
        <div className="flex justify-between items-center bg-slate-900 p-2 rounded-lg">
            <div className="flex gap-2">
                <button onClick={() => setActiveTab('setup')} className={`px-4 py-2 rounded text-sm font-bold transition-all ${activeTab === 'setup' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>1. اختيار الآيات</button>
                <button onClick={() => setActiveTab('sync')} disabled={config.verses.length === 0} className={`px-4 py-2 rounded text-sm font-bold transition-all ${activeTab === 'sync' ? 'bg-emerald-600 text-white' : 'text-slate-400 disabled:opacity-30'}`}>2. الذكاء الاصطناعي</button>
            </div>
            <button 
                onClick={() => updateConfig({ isEnabled: false })}
                className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 px-3 py-1.5 rounded hover:bg-red-900/20 border border-transparent hover:border-red-900/30 transition-all"
            >
                <Power size={14} /> تعطيل الميزة
            </button>
        </div>

        {activeTab === 'setup' && (
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
                <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800 space-y-4">
                    <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2"><Search size={18}/> تحديد المقطع</h3>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">السورة</label>
                        <select className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white outline-none focus:border-emerald-500 custom-scrollbar" value={config.surahNumber} onChange={(e) => updateConfig({ surahNumber: parseInt(e.target.value), fromAyah: 1, toAyah: 1 })}>
                            {SURAH_NAMES.map((name, i) => (<option key={i} value={i + 1}>{i + 1}. {name}</option>))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs text-slate-400 mb-1">من آية</label><input type="number" min="1" max={VERSE_COUNTS[config.surahNumber]} value={config.fromAyah} onChange={(e) => updateConfig({ fromAyah: parseInt(e.target.value) })} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-center outline-none focus:border-emerald-500"/></div>
                        <div><label className="block text-xs text-slate-400 mb-1">إلى آية</label><input type="number" min={config.fromAyah} max={VERSE_COUNTS[config.surahNumber]} value={config.toAyah} onChange={(e) => updateConfig({ toAyah: parseInt(e.target.value) })} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-center outline-none focus:border-emerald-500"/></div>
                    </div>
                    <button onClick={handleFetchVerses} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all mt-4">
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={18} />} جلب النص
                    </button>
                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                </div>
                <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
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
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Key size={14} className="text-yellow-500"/> API Vault</h3>
                        <div className="space-y-2 mb-3 max-h-32 overflow-y-auto custom-scrollbar">
                            {config.apiKeys.map((k, i) => (<div key={i} className="flex items-center justify-between bg-slate-900 p-2 rounded text-xs"><span className="font-mono text-slate-400 truncate w-32">••••{k.slice(-4)}</span><button onClick={() => removeKey(i)} className="text-red-500 hover:text-red-400"><Trash2 size={12}/></button></div>))}
                        </div>
                        <div className="flex gap-2">
                            <input type="password" placeholder="Gemini API Key..." value={newKey} onChange={(e) => setNewKey(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white outline-none focus:border-emerald-500"/>
                            <button onClick={addKey} className="bg-slate-800 hover:bg-slate-700 text-white p-1.5 rounded"><Plus size={14}/></button>
                        </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex-1 flex flex-col justify-center gap-4">
                        {!syncing ? (
                            <>
                                <div className="text-center space-y-3">
                                    <ShieldCheck className="mx-auto text-emerald-500" size={32} />
                                    <h3 className="font-bold text-white">V3 Smart Sync</h3>
                                    
                                    {/* Mode Selector */}
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <button 
                                            onClick={() => setSelectedMode('fast')}
                                            className={`p-2 rounded border transition-all ${selectedMode === 'fast' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                                        >
                                            سريع
                                            <span className="block text-[8px] opacity-70">~20 ثانية</span>
                                        </button>
                                        <button 
                                            onClick={() => setSelectedMode('medium')}
                                            className={`p-2 rounded border transition-all ${selectedMode === 'medium' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                                        >
                                            متوسط
                                            <span className="block text-[8px] opacity-70">~40 ثانية</span>
                                        </button>
                                        <button 
                                            onClick={() => setSelectedMode('heavy')}
                                            className={`p-2 rounded border transition-all ${selectedMode === 'heavy' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                                        >
                                            ثقيل
                                            <span className="block text-[8px] opacity-70">~90 ثانية</span>
                                        </button>
                                    </div>

                                    <button onClick={handleGeminiSync} disabled={config.apiKeys.length === 0} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-2.5 rounded-lg font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                                        بدء المعالجة ({selectedMode})
                                    </button>
                                    {error && <p className="text-red-400 text-xs">{error}</p>}
                                </div>
                                <div className="border-t border-slate-800 pt-3">
                                    <div className="flex items-center gap-2 mb-2"><CopyPlus size={16} className="text-emerald-400"/><span className="text-sm font-bold">إنشاء نسختين؟</span></div>
                                    <label className="flex items-center gap-2 cursor-pointer bg-slate-900 p-2 rounded border border-slate-800 hover:border-emerald-500/50 transition-colors">
                                        <input type="checkbox" className="accent-emerald-500 w-4 h-4" checked={config.generateNoTextVariant} onChange={(e) => updateConfig({ generateNoTextVariant: e.target.checked })}/>
                                        <span className="text-xs text-slate-300">نسخة بالآيات + نسخة خام</span>
                                    </label>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="text-center space-y-2">
                                    <p className="text-sm font-bold text-emerald-400 animate-pulse">{syncMessage}</p>
                                    <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${syncProgress}%` }}></div></div>
                                </div>
                                <MemoryGame />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 bg-slate-900/30 rounded-xl border border-slate-800 p-2 flex flex-col h-full overflow-hidden">
                    <div className="flex justify-between items-center px-2 py-2 border-b border-slate-800 mb-2 shrink-0">
                        <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1"><PlayCircle size={14}/> المحرر الزمني</h4>
                        <button onClick={addSegment} className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1"><Plus size={12}/> إضافة</button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 p-1">
                        {config.timings.map((t, i) => (
                            <div key={i} className="flex flex-col gap-2 bg-slate-950 p-3 rounded border border-slate-800 hover:border-emerald-500/30 transition-colors">
                                <div className="flex items-start gap-2">
                                    <span className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-xs text-slate-400 shrink-0 mt-1">{i+1}</span>
                                    <textarea value={t.text} onChange={(e) => updateTiming(i, { text: e.target.value })} className="flex-1 bg-transparent text-emerald-100 font-amiri text-lg outline-none resize-none border-b border-transparent focus:border-slate-700 leading-loose" rows={1} dir="rtl"/>
                                    <div className="flex flex-col gap-1"><button onClick={() => splitSegment(i)} className="p-1.5 bg-slate-900 text-blue-400 rounded hover:bg-slate-800"><Split size={14} /></button><button onClick={() => deleteSegment(i)} className="p-1.5 bg-slate-900 text-red-400 rounded hover:bg-slate-800"><Trash2 size={14} /></button></div>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded self-end">
                                    <input type="number" step="0.1" value={t.startTime} onChange={(e) => updateTiming(i, { startTime: parseFloat(e.target.value) })} className="w-14 bg-slate-950 text-white text-center text-xs p-1 rounded border border-slate-700 outline-none focus:border-emerald-500"/><span className="text-slate-500 text-xs">➜</span><input type="number" step="0.1" value={t.endTime} onChange={(e) => updateTiming(i, { endTime: parseFloat(e.target.value) })} className="w-14 bg-slate-950 text-white text-center text-xs p-1 rounded border border-slate-700 outline-none focus:border-emerald-500"/>
                                </div>
                            </div>
                        ))}
                         {config.timings.length === 0 && <div className="text-center py-10 text-slate-500"><Wand2 size={32} className="mx-auto mb-2 opacity-20"/><p>المقاطع ستظهر هنا</p></div>}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
