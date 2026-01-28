import React from 'react';
import { Music, History } from 'lucide-react';

interface HeaderProps {
  onToggleHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleHistory }) => (
  <header className="p-4 md:p-6 border-b border-slate-800/50 bg-[#020617]/90 backdrop-blur sticky top-0 z-50">
    <div className="max-w-5xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-900 to-slate-900 flex items-center justify-center border border-emerald-800/30 shadow-lg shadow-emerald-900/20">
          <Music className="text-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold font-rakkas tracking-wide text-transparent bg-clip-text bg-gradient-to-l from-emerald-100 to-emerald-400">
              صانع فيديوهات القرآن
            </h1>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/30 font-bold">V2.1</span>
          </div>
          <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest font-mono">Video Studio</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
         <button 
           onClick={onToggleHistory}
           className="text-xs flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors"
         >
           <History size={16} />
           <span className="hidden md:inline">السجل</span>
         </button>
         <div className="hidden md:block text-xs font-mono text-slate-600 border border-slate-800 rounded px-2 py-1">v2.1.0</div>
      </div>
    </div>
  </header>
);