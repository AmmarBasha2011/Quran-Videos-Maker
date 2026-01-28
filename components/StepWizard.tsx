import React from 'react';
import { CheckCircle } from 'lucide-react';
import { STEPS } from '../constants';

interface StepWizardProps {
  currentStep: number;
}

export const StepWizard: React.FC<StepWizardProps> = ({ currentStep }) => (
  <div className="flex justify-between items-center mb-8 px-2 md:px-4 max-w-2xl mx-auto overflow-x-auto pb-4 md:pb-0">
    {STEPS.map((step) => {
      const isActive = currentStep === step.id;
      const isDone = currentStep > step.id;
      return (
        <div key={step.id} className="flex flex-col items-center z-10 min-w-[70px]">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2 
            ${isActive ? 'bg-emerald-600 border-emerald-400 text-white scale-110' : 
              isDone ? 'bg-emerald-900 border-emerald-800 text-emerald-400' : 
              'bg-slate-900 border-slate-700 text-slate-500'}`}>
            {isDone ? <CheckCircle size={16} /> : step.id}
          </div>
          <span className={`text-xs mt-2 font-medium ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>{step.label}</span>
        </div>
      )
    })}
    <div className="hidden md:block absolute top-[88px] right-0 w-full h-0.5 bg-slate-800 -z-0" /> 
  </div>
);