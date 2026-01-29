
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full min-h-[600px]">
      
      {/* --- HEADER & TABS --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5 p-2 rounded-2xl backdrop-blur-md border border-white/5">
        <h2 className="text-xl font-bold font-rakkas px-4 text-white">مكتبة الخلفيات</h2>
        
        <div className="flex bg-black/20 p-1.5 rounded-xl border border-white/5">
            <button 
                onClick={() => setActiveTab('images')}
                className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-300 ${activeTab === 'images' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-slate-400 hover:text-white'}`}
            >
                <ImageIcon size={18} /> صور
            </button>
            <button 
                onClick={() => setActiveTab('videos')}
                className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-300 ${activeTab === 'videos' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-slate-400 hover:text-white'}`}
            >
                <Video size={18} /> فيديو
            </button>
        </div>
      </div>

      {/* --- LIBRARY GRID --- */}
      <div className="flex-1 overflow-y-auto max-h-[450px] min-h-[350px] no-scrollbar bg-black/20 rounded-2xl border border-white/5 p-5 relative backdrop-blur-sm">
        
        {/* IMAGES TAB */}
        {activeTab === 'images' && (
             <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-4">
                     <span className="text-xs font-bold text-slate-400">Pexels Gallery (50+ Images)</span>
                     <label className="cursor-pointer bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border border-white/10 shadow-sm">
                        <Upload size={14} /> رفع صورة
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
                     </label>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {images.map((img) => (
                        <div 
                            key={img.id} 
                            onClick={() => addAsset('image', img.urls.regular, img.urls.small)}
                            className="aspect-[16/9] relative group cursor-pointer rounded-xl overflow-hidden border border-white/5 hover:border-emerald-500/50 transition-all shadow-md"
                        >
                            <img 
                                src={img.urls.small} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                loading="lazy" 
                                alt="background"
                            />
                            <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-[2px]">
                                <div className="bg-white/20 p-2 rounded-full backdrop-blur-md border border-white/30">
                                    <Plus className="text-white" size={24} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <button 
                    onClick={onRefresh} 
                    disabled={loading}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all border border-white/5 mt-4"
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                    تحديث القائمة (بحث جديد)
                </button>
            </div>
        )}

        {/* VIDEOS TAB (UNAVAILABLE) */}
        {activeTab === 'videos' && (
             <div className="flex flex-col items-center justify-center h-[300px] animate-in fade-in">
                 <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-inner backdrop-blur-md">
                     <AlertCircle className="text-slate-400" size={36} />
                 </div>
                 <h3 className="text-xl font-bold text-white">قسم الفيديو غير متاح حالياً</h3>
                 <p className="text-sm text-slate-500 mt-2 max-w-xs text-center font-medium">
                     نعمل على تحسين خوادم الفيديو. يرجى استخدام الصور أو رفع فيديو خاص بك.
                 </p>
                 <label className="mt-8 cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95">
                    <Upload size={18} /> رفع فيديو من جهازي
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} />
                 </label>
            </div>
        )}

      </div>

      {/* --- TIMELINE SECTION --- */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 backdrop-blur-md">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400 px-1 uppercase tracking-wider">
            <span>شريط الأحداث (Timeline) • {selectedAssets.length} عناصر</span>
            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">المدة: {selectedAssets.reduce((acc, curr) => acc + curr.duration, 0)} ث</span>
        </div>
        
        {selectedAssets.length === 0 ? (
            <div className="h-28 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-500 text-sm gap-2 bg-black/10">
                <ImageIcon size={24} className="opacity-20" />
                <span>اختر صوراً من المكتبة أعلاه</span>
            </div>
        ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 pt-2 no-scrollbar items-end">
                {selectedAssets.map((asset, idx) => (
                    <div key={asset.id} className="flex-shrink-0 w-36 bg-white/5 rounded-2xl border border-white/10 overflow-hidden group relative flex flex-col transition-all hover:border-white/20 shadow-lg">
                        <div className="h-20 relative bg-black/20">
                            {asset.type === 'video' ? (
                                <video src={asset.url} className="w-full h-full object-cover opacity-80" />
                            ) : (
                                <img src={asset.thumbnail} className="w-full h-full object-cover" />
                            )}
                            
                            <div className="absolute top-2 right-2 bg-black/60 p-1 rounded-lg backdrop-blur-md border border-white/10">
                                {asset.type === 'video' ? <Video size={12} className="text-white"/> : <ImageIcon size={12} className="text-white"/>}
                            </div>

                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 z-20 backdrop-blur-[1px]">
                                <button onClick={() => moveAsset(idx, 'right')} className="p-1.5 hover:text-emerald-400 text-white bg-white/10 rounded-full transition-colors"><ArrowRight size={16}/></button>
                                <button onClick={() => removeAsset(asset.id)} className="p-1.5 hover:text-red-400 text-white bg-white/10 rounded-full transition-colors"><Trash2 size={16}/></button>
                                <button onClick={() => moveAsset(idx, 'left')} className="p-1.5 hover:text-emerald-400 text-white bg-white/10 rounded-full transition-colors"><ArrowLeft size={16}/></button>
                            </div>
                            
                            <div className="absolute bottom-2 left-2 bg-emerald-500/80 px-2 rounded-lg text-[10px] text-white font-bold backdrop-blur-md">
                                {idx + 1}
                            </div>
                        </div>

                        <div className="p-2 flex items-center gap-2 border-t border-white/5 bg-white/5">
                             <Clock size={12} className="text-slate-500" />
                             <input 
                                type="number" 
                                min="1" 
                                max="300"
                                value={asset.duration}
                                onChange={(e) => updateDuration(asset.id, parseInt(e.target.value))}
                                className="w-full bg-transparent text-sm font-bold text-center text-emerald-400 outline-none border-b border-transparent focus:border-emerald-500 transition-all"
                             />
                             <span className="text-[10px] font-bold text-slate-500">ث</span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

    </div>
  );
};
