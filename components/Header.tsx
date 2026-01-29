
import React from 'react';
import { Music, History, BookOpenText } from 'lucide-react';

interface HeaderProps {
  onToggleHistory: () => void;
  onToggleDocs: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleHistory, onToggleDocs }) => (
  <header className="p-4 md:p-6 border-b border-white/5 bg-white/5 backdrop-blur-xl sticky top-0 z-50">
    <div className="max-w-5xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 flex items-center justify-center border border-white/10 shadow-lg shadow-emerald-500/10">
          <Music className="text-emerald-400" size={24} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold font-rakkas tracking-wide text-transparent bg-clip-text bg-gradient-to-l from-emerald-100 to-emerald-400">
              صانع فيديوهات القرآن
            </h1>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold backdrop-blur-md">V3.0</span>
          </div>
          <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-[0.2em] font-mono font-medium">Video Studio Pro</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
         <button 
           onClick={onToggleDocs}
           className="text-xs flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-all bg-white/5 hover:bg-white/10 p-2.5 rounded-xl border border-white/5 hover:border-white/10 shadow-sm"
           title="التوثيق والشرح"
         >
           <BookOpenText size={18} />
           <span className="hidden md:inline font-medium">الشرح</span>
         </button>
         <button 
           onClick={onToggleHistory}
           className="text-xs flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-all bg-white/5 hover:bg-white/10 p-2.5 rounded-xl border border-white/5 hover:border-white/10 shadow-sm"
         >
           <History size={18} />
           <span className="hidden md:inline font-medium">السجل</span>
         </button>
      </div>
    </div>
  </header>
);
