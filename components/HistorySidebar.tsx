import React from 'react';
import { X, Video, Calendar, User, FileText } from 'lucide-react';
import { HistoryItem } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
}

export const HistorySidebar: React.FC<Props> = ({ isOpen, onClose, history }) => (
  <>
    {/* Overlay */}
    {isOpen && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
    )}
    
    {/* Sidebar */}
    <div className={`fixed inset-y-0 right-0 w-full max-w-sm bg-slate-950 border-r border-slate-800 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#020617]">
        <h2 className="text-xl font-bold font-rakkas text-emerald-400">سجل الفيديوهات</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-900 rounded-full transition-colors text-slate-400">
          <X size={20} />
        </button>
      </div>
      
      <div className="p-4 overflow-y-auto h-[calc(100vh-80px)] space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Video size={48} className="mx-auto mb-4 opacity-20" />
            <p>لا يوجد فيديوهات سابقة</p>
          </div>
        ) : (
          history.map(item => (
            <div key={item.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl hover:border-emerald-500/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded">{item.resolution}</span>
                <span className="text-[10px] text-slate-600 flex items-center gap-1">
                  <Calendar size={10} />
                  {new Date(item.timestamp).toLocaleDateString('ar-EG')}
                </span>
              </div>
              <h3 className="font-bold text-emerald-100 font-rakkas text-lg mb-1 flex items-center gap-2">
                 <FileText size={14} className="text-emerald-600" />
                 {item.surahName}
              </h3>
              <p className="text-sm text-slate-400 flex items-center gap-2 mb-3">
                 <User size={14} className="text-slate-600" />
                 {item.readerName}
              </p>
              {/* Note: We can't re-download expired blob URLs from localStorage, but in a real app this would link to storage. 
                  For this demo, we just show the record. */}
              <div className="text-[10px] text-yellow-600/70 italic bg-yellow-900/10 p-2 rounded">
                 تنبيه: روابط الفيديو مؤقتة (Blob) ولا يمكن استعادتها بعد تحديث الصفحة.
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </>
);