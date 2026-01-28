
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
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50 p-2 rounded-xl">
        <h2 className="text-xl font-bold font-rakkas px-2">مكتبة الخلفيات</h2>
        
        <div className="flex bg-slate-950 p-1 rounded-lg">
            <button 
                onClick={() => setActiveTab('images')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'images' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
                <ImageIcon size={16} /> صور
            </button>
            <button 
                onClick={() => setActiveTab('videos')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'videos' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
                <Video size={16} /> فيديو
            </button>
        </div>
      </div>

      {/* --- LIBRARY GRID --- */}
      <div className="flex-1 overflow-y-auto max-h-[400px] min-h-[300px] custom-scrollbar bg-slate-950/30 rounded-xl border border-slate-800 p-4 relative">
        
        {/* IMAGES TAB */}
        {activeTab === 'images' && (
             <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-4">
                     <span className="text-xs font-bold text-slate-400">Pexels Gallery (50+ Images)</span>
                     <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded text-xs flex items-center gap-2 transition-colors border border-slate-700">
                        <Upload size={14} /> رفع صورة
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
                     </label>
                </div>
                
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {images.map((img) => (
                        <div 
                            key={img.id} 
                            onClick={() => addAsset('image', img.urls.regular, img.urls.small)}
                            className="aspect-[16/9] relative group cursor-pointer rounded-lg overflow-hidden border border-slate-800 hover:border-emerald-500 transition-all"
                        >
                            <img 
                                src={img.urls.small} 
                                className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                                loading="lazy" 
                                alt="background"
                            />
                            <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Plus className="text-white" size={24} />
                            </div>
                        </div>
                    ))}
                </div>
                
                <button 
                    onClick={onRefresh} 
                    disabled={loading}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors mt-4"
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                    تحديث القائمة (بحث جديد)
                </button>
            </div>
        )}

        {/* VIDEOS TAB (UNAVAILABLE) */}
        {activeTab === 'videos' && (
             <div className="flex flex-col items-center justify-center h-[300px] animate-in fade-in">
                 <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                     <AlertCircle className="text-slate-500" size={32} />
                 </div>
                 <h3 className="text-lg font-bold text-slate-300">قسم الفيديو غير متاح حالياً</h3>
                 <p className="text-sm text-slate-500 mt-2 max-w-xs text-center">
                     نعمل على تحسين خوادم الفيديو. يرجى استخدام الصور أو رفع فيديو خاص بك.
                 </p>
                 <label className="mt-6 cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors shadow-lg">
                    <Upload size={16} /> رفع فيديو من جهازي
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} />
                 </label>
            </div>
        )}

      </div>

      {/* --- TIMELINE SECTION --- */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center text-xs text-slate-400">
            <span>شريط الأحداث (Timeline) - {selectedAssets.length} عناصر</span>
            <span>المدة التقريبية: {selectedAssets.reduce((acc, curr) => acc + curr.duration, 0)} ثانية</span>
        </div>
        
        {selectedAssets.length === 0 ? (
            <div className="h-24 border-2 border-dashed border-slate-800 rounded-lg flex items-center justify-center text-slate-600 text-sm">
                اختر صوراً من المكتبة أعلاه
            </div>
        ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 pt-2 custom-scrollbar items-end">
                {selectedAssets.map((asset, idx) => (
                    <div key={asset.id} className="flex-shrink-0 w-32 bg-slate-950 rounded-lg border border-slate-700 overflow-hidden group relative flex flex-col">
                        <div className="h-16 relative bg-black">
                            {asset.type === 'video' ? (
                                <video src={asset.url} className="w-full h-full object-cover opacity-80" />
                            ) : (
                                <img src={asset.thumbnail} className="w-full h-full object-cover" />
                            )}
                            
                            <div className="absolute top-1 right-1 bg-black/50 p-0.5 rounded">
                                {asset.type === 'video' ? <Video size={10} className="text-white"/> : <ImageIcon size={10} className="text-white"/>}
                            </div>

                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                                <button onClick={() => moveAsset(idx, 'right')} className="p-1 hover:text-emerald-400 text-slate-300"><ArrowRight size={14}/></button>
                                <button onClick={() => removeAsset(asset.id)} className="p-1 hover:text-red-400 text-slate-300"><Trash2 size={14}/></button>
                                <button onClick={() => moveAsset(idx, 'left')} className="p-1 hover:text-emerald-400 text-slate-300"><ArrowLeft size={14}/></button>
                            </div>
                            
                            <div className="absolute top-1 left-1 bg-black/50 px-1.5 rounded text-[10px] text-white">
                                {idx + 1}
                            </div>
                        </div>

                        <div className="p-2 flex items-center gap-1 border-t border-slate-800 bg-slate-900">
                             <Clock size={10} className="text-slate-500" />
                             <input 
                                type="number" 
                                min="1" 
                                max="300"
                                value={asset.duration}
                                onChange={(e) => updateDuration(asset.id, parseInt(e.target.value))}
                                className="w-full bg-transparent text-xs text-center text-emerald-400 outline-none border-b border-transparent focus:border-emerald-500"
                             />
                             <span className="text-[10px] text-slate-500">ث</span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

    </div>
  );
};
