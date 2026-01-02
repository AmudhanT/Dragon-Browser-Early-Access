
import React from 'react';
import { ArrowLeft, ArrowRight, Search, Menu } from 'lucide-react';

interface BottomBarProps {
  onBack: () => void;
  onForward: () => void;
  onSearch: () => void;
  onTabs: () => void;
  onMenu: () => void;
  tabCount: number;
  canGoBack: boolean;
  canGoForward: boolean;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  onBack,
  onForward,
  onSearch,
  onTabs,
  onMenu,
  tabCount,
  canGoBack,
  canGoForward
}) => {
  return (
    <div className="h-[64px] pb-safe-bottom bg-white/95 dark:bg-[#050505]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 flex items-center justify-between px-6 z-50 shrink-0 shadow-2xl transition-all duration-300">
      
      {/* BACK */}
      <button 
        onClick={onBack}
        disabled={!canGoBack}
        className={`p-3 rounded-2xl transition-all duration-300 flex items-center justify-center group ${
          canGoBack 
            ? 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 hover:scale-105 active:scale-95 shadow-sm' 
            : 'bg-transparent text-slate-300 dark:text-slate-800 opacity-50 cursor-not-allowed'
        }`}
      >
        <ArrowLeft size={22} strokeWidth={2.5} className={canGoBack ? "group-hover:-translate-x-0.5 transition-transform" : ""} />
      </button>

      {/* FORWARD */}
      <button 
        onClick={onForward}
        disabled={!canGoForward}
        className={`p-3 rounded-2xl transition-all duration-300 flex items-center justify-center group ${
          canGoForward 
            ? 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 hover:scale-105 active:scale-95 shadow-sm' 
            : 'bg-transparent text-slate-300 dark:text-slate-800 opacity-50 cursor-not-allowed'
        }`}
      >
        <ArrowRight size={22} strokeWidth={2.5} className={canGoForward ? "group-hover:translate-x-0.5 transition-transform" : ""} />
      </button>

      {/* SEARCH - Hero Button */}
      <button 
        onClick={onSearch}
        className="p-3.5 bg-gradient-to-tr from-slate-100 to-white dark:from-white/10 dark:to-white/5 rounded-full text-slate-700 dark:text-white shadow-lg shadow-slate-200/50 dark:shadow-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:scale-105 active:scale-95 transition-all duration-300 group"
      >
        <Search size={22} strokeWidth={2.5} className="group-hover:text-dragon-cyan transition-colors" />
      </button>

      {/* TABS */}
      <button 
        onClick={onTabs}
        className="group p-2.5 rounded-full transition-all duration-200 active:scale-90 hover:bg-slate-100 dark:hover:bg-white/5"
      >
        <div className="w-6 h-6 flex items-center justify-center rounded-[6px] border-2 border-slate-400 dark:border-slate-300 group-hover:border-black dark:group-hover:border-white text-slate-500 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white transition-colors">
          <span className="text-[10px] font-bold">{tabCount}</span>
        </div>
      </button>

      {/* MENU - Hamburger */}
      <button 
        onClick={onMenu}
        className="p-2.5 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all duration-200 active:scale-90"
      >
        <Menu size={24} strokeWidth={2} />
      </button>

    </div>
  );
};
