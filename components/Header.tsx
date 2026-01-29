
import React from 'react';
import { Music, History, BookOpenText } from 'lucide-react';

interface HeaderProps {
  onToggleHistory: () => void;
  onToggleDocs: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleHistory, onToggleDocs }) => (
  <header className="p-3 md:p-5 border-b border-white/10 bg-white/5 backdrop-blur-2xl z-[60] relative">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Music className="text-white relative z-10" size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold font-rakkas tracking-wide iridescent-text">
              صانع فيديوهات القرآن
            </h1>
            <span className="bg-white/10 text-white text-[10px] px-2 py-0.5 rounded-full border border-white/20 font-bold backdrop-blur-sm">V3.0</span>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-mono font-medium">Liquid Studio</p>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
         <button 
           onClick={onToggleDocs}
           className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 group"
           title="التوثيق والشرح"
         >
           <BookOpenText size={18} className="group-hover:scale-110 transition-transform" />
           <span className="hidden md:inline font-bold text-xs">الشرح</span>
         </button>
         <button 
           onClick={onToggleHistory}
           className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 group"
         >
           <History size={18} className="group-hover:scale-110 transition-transform" />
           <span className="hidden md:inline font-bold text-xs">السجل</span>
         </button>
      </div>
    </div>
  </header>
);
