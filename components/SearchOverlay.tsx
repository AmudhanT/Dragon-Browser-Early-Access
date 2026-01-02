
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Globe, Mic, X, Clock, ArrowUpRight, Sparkles, Loader2, Star, Camera, ChevronDown, TrendingUp, History, Trash2, Zap } from 'lucide-react';
import { useDragon } from '../DragonContext';
import { useDragonAI } from '../hooks/useDragonAI';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchEngine } from '../types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (url: string) => void;
  initialValue?: string;
  searchEngine: string;
  onVoiceSearch?: () => void;
  onLens?: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ 
  isOpen, onClose, onNavigate, initialValue = '', searchEngine, onVoiceSearch, onLens
}) => {
  const { history, bookmarks, settings, updateSettings, clearHistory } = useDragon();
  
  // Initialize input: use initialValue if present, otherwise try to load last search
  const [inputValue, setInputValue] = useState(() => {
    if (initialValue) return initialValue;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dragon_last_search') || '';
    }
    return '';
  });

  const [showEnginePicker, setShowEnginePicker] = useState(false);
  const { suggestions: aiSuggestions, trending, fetchSuggestions, isLoading } = useDragonAI();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus and Selection Logic
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure render and animation start
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Select all text for quick replacement
          inputRef.current.select();
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue && !inputValue.startsWith('http') && !inputValue.includes('.')) {
        fetchSuggestions(inputValue);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [inputValue, fetchSuggestions]);

  // Enhanced Merging Algorithm
  const mergedResults = useMemo(() => {
    const query = inputValue.toLowerCase().trim();
    if (!query) return [];

    const scoredItems: { type: 'bookmark' | 'history' | 'search', label: string, value: string, score: number, date?: number }[] = [];
    const seenValues = new Set<string>();

    const calculateScore = (text: string, baseScore: number) => {
      const lowerText = text.toLowerCase();
      if (lowerText === query) return baseScore + 20;
      if (lowerText.startsWith(query)) return baseScore + 10;
      if (lowerText.includes(query)) return baseScore;
      return 0;
    };

    // 1. Bookmarks (High Priority)
    bookmarks.forEach(b => {
      if (seenValues.has(b.url)) return;
      const score = Math.max(calculateScore(b.title, 50), calculateScore(b.url, 40));
      if (score > 0) {
        scoredItems.push({ type: 'bookmark', label: b.title, value: b.url, score });
        seenValues.add(b.url);
      }
    });

    // 2. History (Medium Priority, Recency Boost)
    history.forEach(h => {
      if (seenValues.has(h.url)) return;
      const score = Math.max(calculateScore(h.title, 30), calculateScore(h.url, 20));
      if (score > 0) {
        // Boost slightly if extremely recent (last 24h)
        const recencyBonus = (Date.now() - h.timestamp) < 86400000 ? 5 : 0;
        scoredItems.push({ type: 'history', label: h.title || h.url, value: h.url, score: score + recencyBonus, date: h.timestamp });
        seenValues.add(h.url);
      }
    });

    // 3. Web Suggestions (Contextual Fill)
    aiSuggestions.forEach(s => {
      if (seenValues.has(s)) return;
      scoredItems.push({ type: 'search', label: s, value: s, score: 15 });
      seenValues.add(s);
    });

    // Sort by score DESC
    return scoredItems.sort((a, b) => b.score - a.score).slice(0, 12);
  }, [inputValue, history, bookmarks, aiSuggestions]);

  const handleItemClick = (val: string) => {
    // Save search if it looks like a query (not a URL)
    if (!val.includes('.') || val.includes(' ')) {
      localStorage.setItem('dragon_last_search', val);
    }
    onNavigate(val);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleItemClick(inputValue.trim());
    }
  };

  const getEngineLogo = (engine: string) => {
    switch (engine) {
      case 'dragon':
        return <img src="https://i.ibb.co/CKVTVSbg/IMG-20251221-WA0021.jpg" className="w-5 h-5 rounded-full object-cover" alt="Dragon" />;
      case 'google':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        );
      case 'bing':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path fill="#008373" d="M15.44 2.1L8.5 4.54V17.08L5.56 15.42V5.5L2 6.75V19.75L8.5 22.5L18.44 16.9V13.8L15.44 12.35V2.1H15.44Z" />
          </svg>
        );
      default:
        return <Search size={18} className="text-orange-500" />;
    }
  };

  const getPlaceholder = () => {
    const engineName = settings.searchEngine.charAt(0).toUpperCase() + settings.searchEngine.slice(1);
    return `Search on ${engineName}`;
  };

  const handleSelectEngine = (engine: SearchEngine) => {
    updateSettings({ searchEngine: engine });
    setShowEnginePicker(false);
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ y: "100%", opacity: 0.5 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        mass: 0.8,
        duration: 0.25 
      }}
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col overflow-hidden"
    >
      {/* Search Header - Sticky */}
      <div className="pt-safe-top bg-[#1a1a1a]/90 backdrop-blur-md border-b border-white/5 shrink-0 z-50">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5 active:scale-95">
            <X size={22} />
          </button>
          
          <div className="flex-1 relative">
            <form onSubmit={handleSubmit} className="flex items-center bg-[#2a2a2a] rounded-[1.2rem] px-4 h-12 border border-white/10 focus-within:border-dragon-ember/50 focus-within:ring-2 focus-within:ring-dragon-ember/20 transition-all shadow-inner">
              <button 
                type="button"
                onClick={() => setShowEnginePicker(!showEnginePicker)}
                className="mr-2 shrink-0 flex items-center gap-1 p-1 hover:bg-white/5 rounded-lg transition-colors"
              >
                {getEngineLogo(settings.searchEngine)}
                <ChevronDown size={10} className={`text-slate-500 transition-transform duration-200 ${showEnginePicker ? 'rotate-180' : ''}`} />
              </button>
              
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={getPlaceholder()}
                className="flex-1 bg-transparent border-none outline-none text-[15px] text-white placeholder-slate-500 font-medium h-full"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              
              {inputValue ? (
                <button type="button" onClick={() => setInputValue('')} className="p-1.5 text-slate-500 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-all">
                  <X size={14} />
                </button>
              ) : (
                <div className="flex items-center gap-1 ml-1">
                  <button type="button" onClick={onVoiceSearch} className="p-2 text-slate-400 hover:text-dragon-ember transition-colors"><Mic size={18} /></button>
                  <button type="button" onClick={onLens} className="p-2 text-slate-400 hover:text-dragon-ember transition-colors"><Camera size={18} /></button>
                </div>
              )}
            </form>

            {/* Engine Picker Dropdown */}
            <AnimatePresence>
              {showEnginePicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowEnginePicker(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-3 bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 min-w-[200px] p-2 ring-1 ring-white/10"
                  >
                    <div className="px-3 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 mb-1">Select Engine</div>
                    {(['dragon', 'google', 'bing'] as SearchEngine[]).map((eng) => (
                      <button
                        key={eng}
                        onClick={() => handleSelectEngine(eng)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${settings.searchEngine === eng ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                      >
                        {getEngineLogo(eng)}
                        <span className="text-xs font-bold uppercase">{eng}</span>
                        {settings.searchEngine === eng && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-dragon-ember shadow-[0_0_8px_orange]" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-safe-bottom" onTouchStart={() => inputRef.current?.blur()}>
        {inputValue.length === 0 ? (
          <div className="p-6 space-y-8 animate-fade-in">
             {/* Trending Section */}
             <div className="space-y-4">
               <div className="flex items-center gap-2 px-1">
                  <TrendingUp size={16} className="text-dragon-ember" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-200">Trending Now</span>
               </div>
               <div className="flex flex-wrap gap-2">
                 {trending.map((trend, i) => (
                   <button 
                     key={i}
                     onClick={() => handleItemClick(trend)}
                     className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-dragon-ember/30 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all active:scale-95"
                   >
                     {trend}
                   </button>
                 ))}
               </div>
             </div>

             {/* Recent History */}
             {history.length > 0 && (
                <div className="space-y-3">
                   <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <History size={16} className="text-slate-400" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Recent</span>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => { 
                          e.stopPropagation();
                          e.preventDefault();
                          if(window.confirm('Clear all browsing history?')) {
                            clearHistory();
                          }
                        }}
                        className="text-[10px] font-bold text-red-500 hover:text-red-400 uppercase tracking-widest flex items-center gap-1 active:scale-95 transition-transform"
                      >
                        <Trash2 size={12} /> Clear All
                      </button>
                   </div>
                   <div className="bg-[#1a1a1a] rounded-[1.5rem] border border-white/5 overflow-hidden">
                     {history.slice(0, 5).map((h, i) => (
                        <button 
                          key={h.id}
                          onClick={() => handleItemClick(h.url)}
                          className={`w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group ${i !== history.slice(0, 5).length - 1 ? 'border-b border-white/5' : ''}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center border border-white/5 text-slate-500">
                              <Globe size={14} />
                            </div>
                            <div className="text-left min-w-0">
                              <p className="text-[13px] font-bold text-slate-300 truncate leading-tight group-hover:text-white transition-colors">{h.title || h.url}</p>
                              <p className="text-[10px] text-slate-600 truncate font-medium">{new URL(h.url).hostname.replace('www.', '')}</p>
                            </div>
                          </div>
                          <ArrowUpRight size={16} className="text-slate-700 group-hover:text-dragon-ember transition-colors -rotate-45 group-hover:rotate-0" />
                        </button>
                     ))}
                   </div>
                </div>
             )}
          </div>
        ) : (
          <div className="p-3 animate-fade-in space-y-1">
            {mergedResults.map((item, idx) => (
              <button
                key={`${item.type}-${idx}`}
                onClick={() => handleItemClick(item.value)}
                className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 rounded-2xl group transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`p-2.5 rounded-xl border transition-colors ${
                    item.type === 'history' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                    item.type === 'bookmark' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                    'bg-white/5 text-slate-400 border-white/5'
                  }`}>
                    {item.type === 'history' && <Clock size={18} />}
                    {item.type === 'bookmark' && <Star size={18} fill="currentColor" />}
                    {item.type === 'search' && <Search size={18} />}
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    {item.type === 'search' ? (
                      <p className="text-[14px] font-bold text-slate-200 truncate leading-snug group-hover:text-white">
                        {item.label}
                      </p>
                    ) : (
                      <>
                        <p className="text-[13px] font-bold text-slate-200 truncate leading-snug group-hover:text-white">
                          {item.label}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate font-medium">{item.value}</p>
                      </>
                    )}
                  </div>
                </div>
                <ArrowUpRight size={18} className="text-slate-700 shrink-0 ml-2 group-hover:text-dragon-ember transition-colors" />
              </button>
            ))}
            
            {mergedResults.length === 0 && !isLoading && (
               <div className="p-8 text-center opacity-40">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No suggestions found</p>
               </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center py-8 gap-2 opacity-50">
                <Loader2 size={20} className="animate-spin text-dragon-ember" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Processing...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
