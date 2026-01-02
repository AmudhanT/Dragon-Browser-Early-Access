
import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface DragonHeaderProps {
  title: string;
  subtitle?: string | React.ReactNode;
  onBack: () => void;
  rightElement?: React.ReactNode;
}

const DragonHeader: React.FC<DragonHeaderProps> = ({ title, subtitle, onBack, rightElement }) => {
  return (
    <div className="px-6 pb-6 pt-[calc(1.5rem+env(safe-area-inset-top))] bg-white/90 dark:bg-dragon-navy/60 backdrop-blur-2xl sticky top-0 z-50 border-b border-slate-200 dark:border-white/5 flex items-center gap-6 shadow-sm dark:shadow-2xl transition-colors duration-300">
      <button 
        onClick={onBack}
        className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 text-dragon-ember transition-all active:scale-90 shadow-sm dark:shadow-lg border border-slate-200 dark:border-white/5"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      <div className="flex-1">
        <h1 className="text-xl font-black uppercase tracking-tight italic text-slate-900 dark:text-white leading-none transition-colors">
          {title}
        </h1>
        {subtitle && (
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
            {subtitle}
          </div>
        )}
      </div>
      {rightElement && (
        <div className="flex items-center">
          {rightElement}
        </div>
      )}
    </div>
  );
};

export default DragonHeader;
