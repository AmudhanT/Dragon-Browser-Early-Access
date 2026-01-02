
import React from 'react';
import { Plus, X, Globe, Lock } from 'lucide-react';
import { Tab } from '../types';

interface TabStripProps {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onCreateTab: () => void;
  accentColor: string;
}

export const TabStrip: React.FC<TabStripProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCreateTab,
  accentColor
}) => {
  return (
    <div className="flex bg-dragon-dark p-2 gap-2 overflow-x-auto no-scrollbar border-b border-white/5 items-center">
      {tabs.map((tab) => (
        <div 
          key={tab.id}
          onClick={() => onSelectTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-all min-w-[130px] max-w-[180px] shrink-0 border group relative overflow-hidden ${
            activeTabId === tab.id 
              ? 'bg-dragon-navy border-white/10 shadow-lg' 
              : 'bg-black/30 border-transparent hover:bg-white/5 opacity-60'
          }`}
          style={activeTabId === tab.id ? { borderBottomColor: accentColor, borderBottomWidth: '2px' } : {}}
        >
          {tab.isPrivate ? (
            <Lock size={12} className="text-dragon-ember shrink-0" />
          ) : (
            <Globe size={12} className="text-dragon-cyan shrink-0" />
          )}
          <span className="text-[10px] font-black truncate flex-1 text-slate-200 uppercase tracking-tighter">
            {tab.title || 'New Fragment'}
          </span>
          <button 
            onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id); }} 
            className="p-1 hover:bg-red-500/20 hover:text-red-500 rounded-lg text-slate-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            <X size={12} />
          </button>
        </div>
      ))}
      <button 
        onClick={onCreateTab} 
        className="p-2.5 text-dragon-ember hover:bg-white/5 rounded-xl transition-all active:scale-90 shrink-0"
      >
        <Plus size={18} />
      </button>
    </div>
  );
};
