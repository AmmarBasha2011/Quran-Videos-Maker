import React from 'react';
import { CheckCircle } from 'lucide-react';
import { STEPS } from '../constants';

interface StepWizardProps {
  currentStep: number;
}

import { motion } from 'framer-motion';

export const StepWizard: React.FC<StepWizardProps> = ({ currentStep }) => (
  <div className="flex justify-between items-center mb-10 px-2 md:px-4 max-w-2xl mx-auto overflow-x-auto pb-4 md:pb-0 relative">
    {STEPS.map((step) => {
      const isActive = currentStep === step.id;
      const isDone = currentStep > step.id;
      return (
        <div key={step.id} className="flex flex-col items-center z-10 min-w-[70px]">
          <motion.div
            initial={false}
            animate={{
              scale: isActive ? 1.2 : 1,
              backgroundColor: isActive ? 'rgba(16, 185, 129, 0.2)' : isDone ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)'
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 border backdrop-blur-md
            ${isActive ? 'border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
              isDone ? 'border-emerald-900 text-emerald-600' :
              'border-white/10 text-slate-600'}`}>
            {isDone ? <CheckCircle size={18} /> : <span className="text-sm font-rakkas">{step.id}</span>}
          </motion.div>
          <span className={`text-[10px] mt-3 font-bold uppercase tracking-tighter ${isActive ? 'text-emerald-400' : 'text-slate-600'}`}>{step.label}</span>
        </div>
      )
    })}
    <div className="hidden md:block absolute top-[20px] left-0 right-0 h-[1px] bg-white/5 -z-0" />
  </div>
);