import React from 'react';
import { CheckCircle } from 'lucide-react';
import { STEPS } from '../constants';

interface StepWizardProps {
  currentStep: number;
}

export const StepWizard: React.FC<StepWizardProps> = ({ currentStep }) => (
  <div className="flex justify-between items-center mb-10 px-4 md:px-8 max-w-3xl mx-auto overflow-x-auto pb-6 no-scrollbar">
    {STEPS.map((step) => {
      const isActive = currentStep === step.id;
      const isDone = currentStep > step.id;
      return (
        <div key={step.id} className="flex flex-col items-center z-10 min-w-[80px]">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 border backdrop-blur-md
            ${isActive ? 'bg-emerald-500 border-emerald-400 text-white scale-110 shadow-[0_0_20px_rgba(16,185,129,0.4)] rotate-3' :
              isDone ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
              'bg-white/5 border-white/10 text-slate-500'}`}>
            {isDone ? <CheckCircle size={20} strokeWidth={2.5} /> : <span className="text-sm font-bold">{step.id}</span>}
          </div>
          <span className={`text-[10px] md:text-xs mt-3 font-bold transition-colors duration-300 uppercase tracking-tighter ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>{step.label}</span>
        </div>
      )
    })}
  </div>
);