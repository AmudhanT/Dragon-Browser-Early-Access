import React, { useState } from 'react';
import { ChevronUp, Plus, X, Globe } from 'lucide-react';
import { Tab } from '../types';

interface TabGroupBarProps {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onAddTab: () => void;
  onExpandSwitcher: () => void;
}

const TabIcon = ({ url }: { url: string }) => {
  const [error, setError] = useState(false);
  const domain = url.startsWith('dragon://') ? 'dragon' : new URL(url).hostname.replace('www.', '');

  if (error || url === 'dragon://home') {
    return <Globe size={16} className="text-slate-400" />;
  }

  return (
    <img 
      src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
      alt=""
      className="w-5 h-5 object-contain"
      onError={() => setError(true)}
    />
  );
};

export const TabGroupBar: React.FC<TabGroupBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onAddTab,
  onExpandSwitcher
}) => {
  return (
    <div className="w-full h-[54px] bg-[#0c0d0e] border-t border-white/5 flex items-center px-4 z-[45] animate-fade-in shrink-0">
      {/* Expand Switcher Button */}
      <button 
        onClick={onExpandSwitcher}
        className="p-2 text-slate-500 hover:text-white transition-colors active:scale-90"
      >
        <ChevronUp size={20} />
      </button>

      {/* Tabs Strip */}
      <div className="flex-1 flex items-center gap-4 overflow-x-auto no-scrollbar px-4 h-full">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          
          return (
            <div key={tab.id} className="relative shrink-0 flex items-center justify-center">
              <button
                onClick={() => onSelectTab(tab.id)}
                className={`
                  w-9 h-9 rounded-full bg-white flex items-center justify-center overflow-hidden transition-all
                  ${isActive ? 'ring-[3px] ring-purple-500/80 scale-105' : 'opacity-60 grayscale-[40%]'}
                `}
              >
                <TabIcon url={tab.url} />
              </button>
              
              {/* Close button for active tab */}
              {isActive && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-purple-200 text-black rounded-full flex items-center justify-center shadow-lg border border-black/10 active:scale-90"
                >
                  <X size={10} strokeWidth={4} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Tab to Group Button */}
      <button 
        onClick={onAddTab}
        className="p-2 text-slate-300 hover:text-white transition-colors active:scale-90"
      >
        <Plus size={22} />
      </button>
    </div>
  );
};