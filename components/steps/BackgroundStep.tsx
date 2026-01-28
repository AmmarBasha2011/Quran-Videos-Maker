import React from 'react';
import { RefreshCw, Loader2, Upload, Trash2, ArrowRight, ArrowLeft, Plus, Clock, Image as ImageIcon } from 'lucide-react';
import { UnsplashImage, AppState, BackgroundAsset } from '../../types';

interface Props {
  selectedAssets: BackgroundAsset[];
  images: UnsplashImage[]; 
  loading: boolean;
  onRefresh: () => void;
  updateState: (updates: Partial<AppState>) => void;
}

export const BackgroundStep: React.FC<Props> = ({ 
  selectedAssets,
  images, 
  loading, 
  onRefresh, 
  updateState 
}) => {
  
  // Note: Video logic removed as per request. focusing only on Images.

  const addAsset = (type: 'image' | 'video', url: string, thumb: string) => {
    const newAsset: BackgroundAsset = {
        id: `${type}-${Date.now()}-${Math.random()}`,
        type,
        url,
        thumbnail: thumb,
        duration: 5, // Default 5 seconds
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image') => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const url = URL.createObjectURL(file);
        addAsset(type, url, url); 
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full min-h-[600px]">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50 p-2 rounded-xl">
        <h2 className="text-xl font-bold font-rakkas px-2">مكتبة الخلفيات</h2>
        {/* Videos Disabled text */}
        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">قسم الفيديوهات غير متاح حالياً</span>
      </div>

      {/* --- LIBRARY GRID (IMAGES ONLY) --- */}
      <div className="flex-1 overflow-y-auto max-h-[400px] min-h-[300px] custom-scrollbar bg-slate-950/30 rounded-xl border border-slate-800 p-4">
        
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                    <ImageIcon className="text-emerald-500" size={18} />
                    <span className="text-sm font-bold text-slate-300">صور إيمانية (Unsplash)</span>
                 </div>
                 
                 <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-xs transition-colors border border-slate-700">
                    <Upload size={14} /> رفع صورة خاصة
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
                 </label>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {images.map((img) => (
                    <div 
                        key={img.id} 
                        onClick={() => addAsset('image', img.urls.regular, img.urls.small)}
                        className="aspect-video relative group cursor-pointer rounded-lg overflow-hidden border border-slate-800 hover:border-emerald-500 transition-all"
                    >
                        <img src={img.urls.small} className="w-full h-full object-cover transition-transform group-hover:scale-110" loading="lazy" />
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
                تحديث الصور
            </button>
        </div>

      </div>

      {/* --- TIMELINE SECTION --- */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center text-xs text-slate-400">
            <span>شريط الأحداث (Timeline) - {selectedAssets.length} صور</span>
            <span>المدة التقريبية: {selectedAssets.reduce((acc, curr) => acc + curr.duration, 0)} ثانية</span>
        </div>
        
        {selectedAssets.length === 0 ? (
            <div className="h-24 border-2 border-dashed border-slate-800 rounded-lg flex items-center justify-center text-slate-600 text-sm">
                اختر صوراً من المكتبة أعلاه لإضافتها هنا
            </div>
        ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 pt-2 custom-scrollbar items-end">
                {selectedAssets.map((asset, idx) => (
                    <div key={asset.id} className="flex-shrink-0 w-32 bg-slate-950 rounded-lg border border-slate-700 overflow-hidden group relative flex flex-col">
                        {/* Thumbnail */}
                        <div className="h-16 relative bg-black">
                            <img src={asset.thumbnail} className="w-full h-full object-cover" />
                            
                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button onClick={() => moveAsset(idx, 'right')} className="p-1 hover:text-emerald-400 text-slate-300"><ArrowRight size={14}/></button>
                                <button onClick={() => removeAsset(asset.id)} className="p-1 hover:text-red-400 text-slate-300"><Trash2 size={14}/></button>
                                <button onClick={() => moveAsset(idx, 'left')} className="p-1 hover:text-emerald-400 text-slate-300"><ArrowLeft size={14}/></button>
                            </div>
                            
                            {/* Index Badge */}
                            <div className="absolute top-1 left-1 bg-black/50 px-1.5 rounded text-[10px] text-white">
                                {idx + 1}
                            </div>
                        </div>

                        {/* Duration Input */}
                        <div className="p-2 flex items-center gap-1 border-t border-slate-800 bg-slate-900">
                             <Clock size={10} className="text-slate-500" />
                             <input 
                                type="number" 
                                min="1" 
                                max="60"
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