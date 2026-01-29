import React from 'react';
import { CheckCircle } from 'lucide-react';
import { STEPS } from '../constants';

interface StepWizardProps {
  currentStep: number;
}

export const StepWizard: React.FC<StepWizardProps> = ({ currentStep }) => (
  <div className="flex justify-between items-center px-1 md:px-4 max-w-3xl mx-auto overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
    {STEPS.map((step) => {
      const isActive = currentStep === step.id;
      const isDone = currentStep > step.id;
      return (
        <div key={step.id} className="flex flex-col items-center z-10 min-w-[65px] flex-shrink-0 transition-all duration-500">
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-500 border relative overflow-hidden
            ${isActive ? 'bg-white/20 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-110' :
              isDone ? 'bg-purple-500/20 border-purple-400/30 text-purple-200' :
              'bg-white/5 border-white/5 text-slate-500 opacity-60'}`}>

            {isActive && <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent animate-pulse"></div>}

            <span className={`relative z-10 text-xs font-black ${isActive ? 'text-white' : ''}`}>
                {isDone ? <CheckCircle size={18} strokeWidth={3} /> : step.id}
            </span>
          </div>
          <span className={`text-[10px] mt-2 font-bold transition-all duration-300 uppercase tracking-tighter ${isActive ? 'text-white' : 'text-slate-500'}`}>
            {step.label}
          </span>
        </div>
      )
    })}
  </div>
);