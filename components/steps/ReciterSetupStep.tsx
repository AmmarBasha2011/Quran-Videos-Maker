
import React, { useEffect, useState } from 'react';
import { AppState, AspectRatio } from '../../types';
import { RECITERS_MAP, SURAH_NAMES, VERSE_COUNTS, ASPECT_RATIO_OPTIONS } from '../../constants';
import { fetchQuranVerses } from '../../services/quranService';
import { CheckCircle2, Search, User, FileText, Loader2, Eye, EyeOff } from 'lucide-react';

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

export const ReciterSetupStep: React.FC<Props> = ({ state, updateState }) => {
  const [loadingVerses, setLoadingVerses] = useState(false);
  const { quranConfig } = state;

  // Auto-fetch verses when selection changes in Reciter Mode
  useEffect(() => {
    const fetchText = async () => {
        setLoadingVerses(true);
        try {
            const verses = await fetchQuranVerses(quranConfig.surahNumber, quranConfig.fromAyah, quranConfig.toAyah);
            updateState({ 
                quranConfig: { 
                    ...quranConfig, 
                    verses, 
                    // We default to enabled when fetching new verses, but user can toggle off later
                    isEnabled: true 
                }, 
                surahName: `سورة ${SURAH_NAMES[quranConfig.surahNumber - 1]}` // Auto set surah name title
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingVerses(false);
        }
    };
    
    // Debounce slightly to avoid rapid API calls
    const t = setTimeout(fetchText, 500);
    return () => clearTimeout(t);
  }, [quranConfig.surahNumber, quranConfig.fromAyah, quranConfig.toAyah]);

  const toggleTextVisibility = () => {
      updateState({
          quranConfig: {
              ...quranConfig,
              isEnabled: !quranConfig.isEnabled
          }
      });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 h-full overflow-y-auto custom-scrollbar p-1">
        
        {/* 1. Reciter Selection */}
        <div className="space-y-4">
            <h2 className="text-xl font-bold font-rakkas text-emerald-100 flex items-center gap-2">
                <User className="text-blue-400" size={24}/> اختر القارئ
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
                {Object.keys(RECITERS_MAP).map((name) => {
                    const isSelected = state.selectedReciterId === RECITERS_MAP[name];
                    return (
                        <button
                            key={name}
                            onClick={() => updateState({ 
                                selectedReciterId: RECITERS_MAP[name],
                                readerName: name.split(' (')[0] // Auto set reader name (remove brackets if any)
                            })}
                            className={`p-3 rounded-xl border text-right transition-all font-bold text-sm ${isSelected ? 'bg-blue-900/30 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                        >
                            {name}
                        </button>
                    );
                })}
            </div>
        </div>

        <div className="w-full h-px bg-slate-800/50" />

        {/* 2. Surah & Range */}
        <div className="space-y-4">
             <h2 className="text-xl font-bold font-rakkas text-emerald-100 flex items-center gap-2">
                <FileText className="text-emerald-400" size={24}/> تحديد الآيات
            </h2>
            <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800 space-y-4">
                <div>
                    <label className="block text-xs text-slate-400 mb-1">السورة</label>
                    <select 
                        className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white outline-none focus:border-blue-500 custom-scrollbar font-amiri text-lg" 
                        value={quranConfig.surahNumber} 
                        onChange={(e) => updateState({ quranConfig: { ...quranConfig, surahNumber: parseInt(e.target.value), fromAyah: 1, toAyah: 1 } })}
                    >
                        {SURAH_NAMES.map((name, i) => (<option key={i} value={i + 1}>{i + 1}. {name}</option>))}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">من آية</label>
                        <input 
                            type="number" 
                            min="1" 
                            max={VERSE_COUNTS[quranConfig.surahNumber]} 
                            value={quranConfig.fromAyah} 
                            onChange={(e) => updateState({ quranConfig: { ...quranConfig, fromAyah: parseInt(e.target.value) } })} 
                            className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white text-center outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">إلى آية</label>
                        <input 
                            type="number" 
                            min={quranConfig.fromAyah} 
                            max={VERSE_COUNTS[quranConfig.surahNumber]} 
                            value={quranConfig.toAyah} 
                            onChange={(e) => updateState({ quranConfig: { ...quranConfig, toAyah: parseInt(e.target.value) } })} 
                            className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white text-center outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* VISIBILITY TOGGLE */}
                <div 
                    onClick={toggleTextVisibility}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer select-none
                    ${quranConfig.isEnabled ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-slate-900 border-slate-700 opacity-75'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${quranConfig.isEnabled ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                            {quranConfig.isEnabled ? <Eye size={20}/> : <EyeOff size={20}/>}
                        </div>
                        <div>
                            <h4 className={`font-bold text-sm ${quranConfig.isEnabled ? 'text-emerald-100' : 'text-slate-400'}`}>
                                {quranConfig.isEnabled ? 'إظهار الآيات في الفيديو' : 'إخفاء الآيات (فيديو صوتي فقط)'}
                            </h4>
                            <p className="text-[10px] text-slate-500">
                                {quranConfig.isEnabled ? 'سيتم عرض النص القرآني متزامناً مع التلاوة.' : 'سيتم إنشاء فيديو بخلفية ومؤثرات صوتية دون كتابة الآيات.'}
                            </p>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${quranConfig.isEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${quranConfig.isEnabled ? 'left-1' : 'left-7'}`} />
                    </div>
                </div>

                {/* Preview Verses */}
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/50 min-h-[100px] flex items-center justify-center relative">
                    {!quranConfig.isEnabled && (
                        <div className="absolute inset-0 bg-slate-950/80 z-10 flex items-center justify-center flex-col text-slate-400">
                             <EyeOff size={24} className="mb-2 opacity-50"/>
                             <span className="text-xs">تم إخفاء النص</span>
                        </div>
                    )}
                    {loadingVerses ? (
                        <div className="flex items-center gap-2 text-blue-400 text-sm">
                            <Loader2 className="animate-spin" size={16}/> جاري تحميل النص...
                        </div>
                    ) : (
                         <div className="text-center w-full">
                            <p className="text-xs text-slate-500 mb-2">عدد الآيات: {quranConfig.verses.length}</p>
                            <div className="max-h-[150px] overflow-y-auto custom-scrollbar space-y-1">
                                {quranConfig.verses.map((v, i) => (
                                    <p key={i} className="text-emerald-100/70 text-sm truncate px-2">{v.text}</p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="w-full h-px bg-slate-800/50" />

        {/* 3. Aspect Ratio */}
        <div className="space-y-4 pb-4">
             <h2 className="text-xl font-bold font-rakkas text-emerald-100">أبعاد الفيديو</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ASPECT_RATIO_OPTIONS.map((option) => {
                    const isSelected = state.aspectRatio === option.id;
                    const Icon = option.icon;
                    return (
                        <div 
                            key={option.id}
                            onClick={() => updateState({ aspectRatio: option.id })}
                            className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 flex flex-col items-center justify-center text-center gap-2 group
                                ${isSelected ? 'bg-blue-900/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'bg-slate-950/50 border-slate-800 hover:border-slate-600 hover:bg-slate-900'}
                            `}
                        >
                            {isSelected && <div className="absolute top-2 right-2 text-blue-500"><CheckCircle2 size={16} /></div>}
                            <div className={`p-2 rounded-full ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'}`}>
                                <Icon size={20} />
                            </div>
                            <div>
                                <h3 className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{option.label}</h3>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>

    </div>
  );
};
