
import React, { useState, useMemo, useRef } from 'react';
import { useDragon } from '../DragonContext';
import { 
  Search, Clock, Trash2, Globe, X, Calendar, 
  ChevronLeft, MoreVertical, Copy, Layers, Share2, CheckCircle, ArrowUpRight 
} from 'lucide-react';
import { BrowserViewMode, HistoryItem } from '../types';
import { Share } from '@capacitor/share';

interface HistoryProps {
  onNavigate: (url: string) => void;
  onOpenInNewTab: (url: string) => void;
  onOpenInBackgroundTab?: (url: string) => void;
}

export const History: React.FC<HistoryProps> = ({ onNavigate, onOpenInNewTab, onOpenInBackgroundTab }) => {
  const { history, clearHistory, removeHistoryItem, removeHistoryItems, setViewMode, settings } = useDragon();
  const [search, setSearch] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  // Grouping Logic
  const groupedHistory = useMemo(() => {
    const groups: Record<string, HistoryItem[]> = {
      'Today': [],
      'Yesterday': [],
      'Last 7 Days': [],
      'Older': []
    };

    const filtered = history.filter(h => 
      (h.title?.toLowerCase() || '').includes(search.toLowerCase()) || 
      (h.url?.toLowerCase() || '').includes(search.toLowerCase())
    );

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const weekStart = todayStart - (86400000 * 7);

    filtered.forEach(item => {
      if (item.timestamp >= todayStart) {
        groups['Today'].push(item);
      } else if (item.timestamp >= yesterdayStart) {
        groups['Yesterday'].push(item);
      } else if (item.timestamp >= weekStart) {
        groups['Last 7 Days'].push(item);
      } else {
        groups['Older'].push(item);
      }
    });

    return groups;
  }, [history, search]);

  const groupOrder = ['Today', 'Yesterday', 'Last 7 Days', 'Older'];

  // Handlers
  const handleItemClick = (item: HistoryItem) => {
    if (isSelectionMode) {
      toggleSelection(item.id);
    } else {
      onNavigate(item.url);
    }
  };

  const handleLongPress = (item: HistoryItem) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      toggleSelection(item.id);
      // Haptic feedback could be added here
      if (navigator.vibrate) navigator.vibrate(50);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      
      if (newSet.size === 0 && isSelectionMode) {
        // Optional: Exit mode if all deselected? Maybe not immediately for better UX
      }
      return newSet;
    });
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Delete ${selectedIds.size} items?`)) {
      removeHistoryItems(Array.from(selectedIds));
      exitSelectionMode();
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Clear entire browsing history? This cannot be undone.")) {
      clearHistory();
    }
  };

  // Context Menu Actions
  const openMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setActiveMenuId(null);
  };

  const handleShareLink = async (title: string, url: string) => {
    try {
      await Share.share({ title, url });
    } catch {}
    setActiveMenuId(null);
  };

  const handleDeleteItem = (id: string) => {
    removeHistoryItem(id);
    setActiveMenuId(null);
  };

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
    } catch { return ''; }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] text-slate-100 animate-fade-in pb-safe-bottom" onClick={() => setActiveMenuId(null)}>
      
      {/* Header */}
      <div className={`px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] sticky top-0 z-20 border-b transition-colors duration-300 flex items-center gap-4 ${isSelectionMode ? 'bg-dragon-navy border-dragon-cyan/30' : 'bg-[#050505]/95 backdrop-blur-xl border-white/5'}`}>
        {isSelectionMode ? (
          <>
            <button onClick={exitSelectionMode} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-slate-400">
              <X size={24} />
            </button>
            <div className="flex-1">
              <h2 className="text-lg font-black uppercase text-white">{selectedIds.size} Selected</h2>
            </div>
            {selectedIds.size > 0 && (
              <button 
                onClick={handleDeleteSelected}
                className="p-2.5 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500/30 transition-all active:scale-95"
              >
                <Trash2 size={20} />
              </button>
            )}
          </>
        ) : (
          <>
            <button onClick={() => setViewMode(BrowserViewMode.MAIN_MENU)} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-slate-400">
              <ChevronLeft size={24} />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-black uppercase italic tracking-tight leading-none text-white">History</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">Timeline</p>
            </div>
            {history.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="p-2.5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                title="Clear All"
              >
                <Trash2 size={20} />
              </button>
            )}
          </>
        )}
      </div>

      {/* Search Bar */}
      {!isSelectionMode && (
        <div className="px-6 py-4 bg-[#050505] sticky top-[70px] z-10">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-dragon-ember transition-colors" />
            <input 
              type="text"
              placeholder="Search timeline..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-dragon-ember/50 shadow-inner transition-all"
            />
          </div>
        </div>
      )}

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-20">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 mt-20 opacity-30 space-y-6">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
               <Clock className="w-10 h-10 text-slate-500" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">No History</p>
              <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">No browsing records found</p>
            </div>
          </div>
        ) : (
          <div className="pt-2">
            {groupOrder.map((group, index) => {
              const items = groupedHistory[group];
              if (items.length === 0) return null;

              return (
                <div key={group} className="relative pl-6 pb-8 border-l border-white/10 last:border-0 last:pb-0 ml-2 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  {/* Timeline Marker */}
                  <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-dragon-ember ring-4 ring-[#050505] z-10" />
                  
                  {/* Group Header */}
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 -mt-1.5 flex items-center gap-2">
                    {group} <span className="text-[9px] opacity-50 px-2 py-0.5 bg-white/5 rounded-full">{items.length}</span>
                  </h3>

                  {/* Items Grid */}
                  <div className="space-y-3">
                    {items.map((item) => {
                      const isSelected = selectedIds.has(item.id);
                      
                      return (
                        <div 
                          key={item.id}
                          className={`
                            relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 group
                            ${isSelectionMode 
                               ? (isSelected ? 'bg-dragon-cyan/10 border-dragon-cyan/30' : 'bg-[#111] border-white/5 opacity-60')
                               : 'bg-[#111] border-white/5 hover:bg-white/10 hover:border-white/10 active:scale-[0.99]'}
                          `}
                          onClick={() => handleItemClick(item)}
                          onContextMenu={(e) => { e.preventDefault(); handleLongPress(item); }}
                        >
                          {/* Selection Checkbox */}
                          {isSelectionMode && (
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${isSelected ? 'bg-dragon-cyan border-dragon-cyan' : 'border-slate-600'}`}>
                              {isSelected && <CheckCircle size={12} className="text-black" strokeWidth={3} />}
                            </div>
                          )}

                          {/* Favicon */}
                          {!isSelectionMode && (
                            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0 border border-white/5 shadow-inner text-slate-600">
                               <img 
                                 src={getFavicon(item.url)} 
                                 className="w-5 h-5 rounded-sm object-contain opacity-80"
                                 onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                               />
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-[13px] font-bold truncate leading-tight mb-1 ${isSelected ? 'text-dragon-cyan' : 'text-slate-200 group-hover:text-white'}`}>
                              {item.title || 'Untitled Page'}
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate font-mono opacity-70 group-hover:opacity-100 transition-opacity">{item.url}</p>
                          </div>

                          {/* Time / Actions */}
                          <div className="flex items-center gap-2">
                             {!isSelectionMode && (
                               <span className="text-[9px] font-bold text-slate-600 tabular-nums">
                                 {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                               </span>
                             )}
                             
                             {!isSelectionMode && (
                               <button 
                                 onClick={(e) => openMenu(e, item.id)}
                                 className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors relative"
                               >
                                 <MoreVertical size={16} />
                               </button>
                             )}
                          </div>

                          {/* Context Menu Dropdown */}
                          {activeMenuId === item.id && !isSelectionMode && (
                            <div className="absolute right-4 top-10 w-52 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in ring-1 ring-black/50 origin-top-right">
                               <button onClick={(e) => { e.stopPropagation(); onOpenInNewTab(item.url); setActiveMenuId(null); }} className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                                 <ArrowUpRight size={14} /> Open New Tab
                               </button>
                               {onOpenInBackgroundTab && (
                                 <button onClick={(e) => { e.stopPropagation(); onOpenInBackgroundTab(item.url); setActiveMenuId(null); }} className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                                   <Layers size={14} /> Open in Background
                                 </button>
                               )}
                               <button onClick={(e) => { e.stopPropagation(); handleCopyLink(item.url); }} className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                                 <Copy size={14} /> Copy Link
                               </button>
                               <button onClick={(e) => { e.stopPropagation(); handleShareLink(item.title, item.url); }} className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                                 <Share2 size={14} /> Share
                               </button>
                               <button onClick={(e) => { e.stopPropagation(); handleLongPress(item); setActiveMenuId(null); }} className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-dragon-cyan">
                                 <CheckCircle size={14} /> Select
                               </button>
                               <div className="h-px bg-white/5 mx-2" />
                               <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }} className="w-full text-left px-4 py-3 hover:bg-red-500/10 flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-red-500">
                                 <Trash2 size={14} /> Delete
                               </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
