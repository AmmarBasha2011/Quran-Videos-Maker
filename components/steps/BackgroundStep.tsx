
import React, { useState } from 'react';
import { RefreshCw, Loader2, Upload, Trash2, ArrowRight, ArrowLeft, Plus, Clock, Image as ImageIcon, Video, Play, AlertCircle } from 'lucide-react';
import { UnsplashImage, AppState, BackgroundAsset } from '../../types';
import { StockVideo } from '../../services/unsplashService';

interface Props {
  selectedAssets: BackgroundAsset[];
  images: UnsplashImage[]; 
  videos: StockVideo[];
  loading: boolean;
  onRefresh: () => void;
  updateState: (updates: Partial<AppState>) => void;
}

export const BackgroundStep: React.FC<Props> = ({ 
  selectedAssets,
  images, 
  videos,
  loading, 
  onRefresh, 
  updateState 
}) => {
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');

  const addAsset = (type: 'image' | 'video', url: string, thumb: string, duration?: number) => {
    const newAsset: BackgroundAsset = {
        id: `${type}-${Date.now()}-${Math.random()}`,
        type,
        url,
        thumbnail: thumb,
        duration: duration || 5, 
    };
    updateState({ selectedAssets: [...selectedAssets, newAsset] });
  };

  const removeAsset = (id: string) => {
    updateState({ selectedAssets: selectedAssets.filter(a => a.id !== id) });
  };

  const moveAsset = (index: number, direction: 'left' | 'right') => {
    const newAssets = [...selectedAssets];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newAssets.length) {
        [newAssets[index], newAssets[targetIndex]] = [newAssets[targetIndex], newAssets[index]];
        updateState({ selectedAssets: newAssets });
    }
  };

  const updateDuration = (id: string, newDuration: number) => {
    const newAssets = selectedAssets.map(a => 
        a.id === id ? { ...a, duration: Math.max(1, newDuration) } : a
    );
    updateState({ selectedAssets: newAssets });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const url = URL.createObjectURL(file);
        addAsset(type, url, type === 'image' ? url : '', type === 'video' ? 10 : 5); 
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col h-full min-h-[600px]">
      
      {/* --- HEADER & TABS --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
        <h2 className="text-xl font-black font-rakkas px-3 text-white">مكتبة الخلفيات</h2>
        
        <div className="flex bg-black/20 p-1.5 rounded-xl border border-white/5 shadow-inner">
            <button 
                onClick={() => setActiveTab('images')}
                className={`px-6 py-2 rounded-lg text-xs font-black flex items-center gap-2 transition-all duration-300 ${activeTab === 'images' ? 'bg-white text-black shadow-lg scale-105' : 'text-slate-400 hover:text-slate-200'}`}
            >
                <ImageIcon size={16} strokeWidth={2.5} /> صور
            </button>
            <button 
                onClick={() => setActiveTab('videos')}
                className={`px-6 py-2 rounded-lg text-xs font-black flex items-center gap-2 transition-all duration-300 ${activeTab === 'videos' ? 'bg-white text-black shadow-lg scale-105' : 'text-slate-400 hover:text-slate-200'}`}
            >
                <Video size={16} strokeWidth={2.5} /> فيديو
            </button>
        </div>
      </div>

      {/* --- LIBRARY GRID --- */}
      <div className="flex-1 overflow-y-auto max-h-[450px] min-h-[350px] custom-scrollbar bg-black/20 rounded-[1.5rem] border border-white/5 p-5 relative shadow-inner">
        
        {/* IMAGES TAB */}
        {activeTab === 'images' && (
             <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-4">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pexels Gallery</span>
                     <label className="cursor-pointer liquid-button shiny-reflection text-white px-4 py-2 rounded-xl text-xs flex items-center gap-2 font-bold transition-all hover:scale-105">
                        <Upload size={14} strokeWidth={2.5} /> رفع صورة
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
                     </label>
                </div>
                
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {images.map((img) => (
                        <div 
                            key={img.id} 
                            onClick={() => addAsset('image', img.urls.regular, img.urls.small)}
                            className="aspect-[16/9] relative group cursor-pointer rounded-2xl overflow-hidden border border-white/5 hover:border-white/40 transition-all shadow-lg"
                        >
                            <img 
                                src={img.urls.small} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
                                loading="lazy" 
                                alt="background"
                            />
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                                <Plus className="text-white drop-shadow-lg" size={32} strokeWidth={3} />
                            </div>
                        </div>
                    ))}
                </div>
                
                <button 
                    onClick={onRefresh} 
                    disabled={loading}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl flex items-center justify-center gap-3 text-sm font-black transition-all mt-6 shadow-xl active:scale-95"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                    تحديث القائمة (بحث جديد)
                </button>
            </div>
        )}

        {/* VIDEOS TAB (UNAVAILABLE) */}
        {activeTab === 'videos' && (
             <div className="flex flex-col items-center justify-center h-[300px] animate-in fade-in zoom-in-95">
                 <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-2xl">
                     <AlertCircle className="text-white/40" size={40} />
                 </div>
                 <h3 className="text-xl font-black text-white">قسم الفيديو غير متاح حالياً</h3>
                 <p className="text-sm text-slate-500 mt-2 max-w-xs text-center font-medium">
                     نعمل على تحسين خوادم الفيديو. يرجى استخدام الصور أو رفع فيديو خاص بك.
                 </p>
                 <label className="mt-8 cursor-pointer liquid-button shiny-reflection text-white px-8 py-3 rounded-2xl text-sm font-black flex items-center gap-2 transition-all hover:scale-105 shadow-2xl">
                    <Upload size={18} strokeWidth={2.5} /> رفع فيديو من جهازي
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} />
                 </label>
            </div>
        )}

      </div>

      {/* --- TIMELINE SECTION --- */}
      <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-5 flex flex-col gap-4 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-wider relative z-10">
            <span className="bg-white/10 px-2 py-1 rounded-md">Timeline ({selectedAssets.length})</span>
            <span className="bg-purple-500/20 text-purple-200 px-2 py-1 rounded-md">Total: {selectedAssets.reduce((acc, curr) => acc + curr.duration, 0)}s</span>
        </div>
        
        {selectedAssets.length === 0 ? (
            <div className="h-28 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-600 text-sm gap-2 relative z-10">
                <ImageIcon size={24} className="opacity-20" />
                <span className="font-bold">اختر صوراً من المكتبة أعلاه</span>
            </div>
        ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 custom-scrollbar items-end relative z-10 no-scrollbar">
                {selectedAssets.map((asset, idx) => (
                    <div key={asset.id} className="flex-shrink-0 w-36 bg-black/40 rounded-[1.2rem] border border-white/10 overflow-hidden group relative flex flex-col shadow-2xl transition-all hover:border-white/30">
                        <div className="h-20 relative bg-black">
                            {asset.type === 'video' ? (
                                <video src={asset.url} className="w-full h-full object-cover opacity-80" />
                            ) : (
                                <img src={asset.thumbnail} className="w-full h-full object-cover" />
                            )}
                            
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1 rounded-lg">
                                {asset.type === 'video' ? <Video size={12} className="text-white"/> : <ImageIcon size={12} className="text-white"/>}
                            </div>

                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 z-20">
                                <button onClick={() => moveAsset(idx, 'right')} className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 text-white"><ArrowRight size={16}/></button>
                                <button onClick={() => removeAsset(asset.id)} className="p-1.5 bg-red-500/20 rounded-lg hover:bg-red-500/40 text-red-200"><Trash2 size={16}/></button>
                                <button onClick={() => moveAsset(idx, 'left')} className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 text-white"><ArrowLeft size={16}/></button>
                            </div>
                            
                            <div className="absolute top-2 left-2 bg-white text-black font-black px-2 py-0.5 rounded-lg text-[10px] shadow-lg">
                                {idx + 1}
                            </div>
                        </div>

                        <div className="p-2.5 flex items-center gap-2 border-t border-white/5 bg-white/5">
                             <Clock size={12} className="text-slate-500" />
                             <input 
                                type="number" 
                                min="1" 
                                max="300"
                                value={asset.duration}
                                onChange={(e) => updateDuration(asset.id, parseInt(e.target.value))}
                                className="w-full bg-black/20 rounded-md py-1 text-xs font-black text-center text-white outline-none border border-white/5 focus:border-white/20 transition-all"
                             />
                             <span className="text-[10px] font-black text-slate-500">s</span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

    </div>
  );
};
