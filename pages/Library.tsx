
import React from 'react';
import { useDragon } from '../DragonContext';
import DragonHeader from '../components/DragonHeader';
import { Star, FileText, ChevronRight, History } from 'lucide-react';
import { BrowserViewMode } from '../types';

export const Library: React.FC = () => {
  const { setViewMode } = useDragon();

  const items = [
    { 
      id: 'bookmarks', 
      label: 'Bookmarks', 
      icon: <Star className="w-6 h-6 text-orange-500" />, 
      desc: 'Saved web pages',
      action: () => setViewMode(BrowserViewMode.BOOKMARKS)
    },
    { 
      id: 'notes', 
      label: 'Notes', 
      icon: <FileText className="w-6 h-6 text-pink-500" />, 
      desc: 'Saved notes',
      action: () => setViewMode(BrowserViewMode.NOTES_LIBRARY)
    },
    { 
      id: 'history', 
      label: 'History', 
      icon: <History className="w-6 h-6 text-blue-500" />, 
      desc: 'Browsing timeline',
      action: () => setViewMode(BrowserViewMode.HISTORY)
    }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-dragon-dark text-slate-900 dark:text-slate-100 animate-fade-in pb-safe-bottom transition-colors duration-300">
      <DragonHeader 
        title="LIBRARY" 
        subtitle="BROWSER DATA" 
        onBack={() => setViewMode(BrowserViewMode.MAIN_MENU)} 
      />

      <div className="p-6 space-y-4">
        {items.map(item => (
          <button 
            key={item.id}
            onClick={item.action}
            className="w-full bg-white dark:bg-dragon-navy/40 border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 flex items-center gap-5 group hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm active:scale-[0.98]"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-black/40 flex items-center justify-center shadow-inner border border-slate-200 dark:border-white/5 group-hover:scale-105 transition-transform shrink-0">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">{item.label}</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-widest mt-1.5">{item.desc}</p>
            </div>
            <div className="p-2.5 rounded-full bg-slate-100 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-white/10 transition-colors">
               <ChevronRight size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-dragon-cyan transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
