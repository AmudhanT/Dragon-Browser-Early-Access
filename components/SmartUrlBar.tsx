
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Globe, RotateCw, Download, Lock, Mic, AlertCircle, Star, Clock, ArrowUpRight } from 'lucide-react';
import { useDragonAI } from '../hooks/useDragonAI';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { useDragon } from '../DragonContext';
import { Tab } from '../types';

interface SmartUrlBarProps {
  activeTab: Tab;
  urlInputValue: string;
  onUrlChange: (val: string) => void;
  onUrlSubmit: () => void;
  onReload: () => void;
  accentColor: string;
}

// Highlighting Component
const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
  if (!query || !text) return <span className="text-slate-200">{text}</span>;
  
  try {
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <span className="text-slate-200">
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="text-dragon-ember font-bold">{part}</span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  } catch (e) {
    return <span className="text-slate-200">{text}</span>;
  }
};

export const SmartUrlBar: React.FC<SmartUrlBarProps> = ({
  activeTab,
  urlInputValue,
  onUrlChange,
  onUrlSubmit,
  onReload,
  accentColor
}) => {
  const { suggestions: aiSuggestions, fetchSuggestions, setSuggestions } = useDragonAI();
  const { history, bookmarks } = useDragon();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isListening, voiceState, error: voiceError, startListening } = useVoiceSearch((text) => {
    onUrlChange(text);
    onUrlSubmit();
  });

  // Fetch AI suggestions with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (urlInputValue && document.activeElement === inputRef.current && !urlInputValue.startsWith('http') && !urlInputValue.includes('://')) {
        fetchSuggestions(urlInputValue);
      } else {
        setSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [urlInputValue, fetchSuggestions, setSuggestions]);

  // Unified Suggestion Logic
  const filteredSuggestions = useMemo(() => {
    if (!urlInputValue || urlInputValue.trim() === '') return [];

    const query = urlInputValue.toLowerCase().trim();
    const results = new Map<string, {
      id: string;
      url: string;
      title: string;
      type: 'bookmark' | 'history' | 'search';
      score: number;
    }>();

    // Scoring Helper
    const calculateScore = (text: string, url: string, baseScore: number, timestamp?: number) => {
      let score = baseScore;
      const textLower = text.toLowerCase();
      const urlLower = url.toLowerCase();

      // Text Match Bonus
      if (textLower === query || urlLower === query) score += 50;
      else if (textLower.startsWith(query) || urlLower.startsWith(query)) score += 20;
      else if (textLower.includes(query) || urlLower.includes(query)) score += 10;
      else return 0; // No match

      // Recency Bonus (max 20 points for last 24h)
      if (timestamp) {
        const age = Date.now() - timestamp;
        const oneDay = 24 * 60 * 60 * 1000;
        if (age < oneDay) score += 20;
        else if (age < 7 * oneDay) score += 10;
      }

      return score;
    };

    // 1. Process Bookmarks (High Base Score)
    bookmarks.forEach(b => {
      const score = calculateScore(b.title, b.url, 100, b.timestamp);
      if (score > 0) {
        results.set(b.url, {
          id: `bm-${b.id}`,
          url: b.url,
          title: b.title,
          type: 'bookmark',
          score
        });
      }
    });

    // 2. Process History (Medium Base Score)
    history.forEach(h => {
      const score = calculateScore(h.title, h.url, 60, h.timestamp);
      if (score > 0) {
        if (results.has(h.url)) {
          // If already in bookmarks, boost score significantly
          const existing = results.get(h.url)!;
          existing.score += 30; // Frequency boost proxy
        } else {
          results.set(h.url, {
            id: `hist-${h.id}`,
            url: h.url,
            title: h.title,
            type: 'history',
            score
          });
        }
      }
    });

    // 3. Process AI Suggestions (Filler)
    aiSuggestions.forEach(s => {
      // Avoid duplicates if URL already exists
      let isDuplicate = false;
      for (const existing of results.values()) {
        if (existing.title.toLowerCase() === s.toLowerCase()) {
          isDuplicate = true;
          break;
        }
      }
      
      if (!isDuplicate) {
        // AI suggestions are just text usually, assume they are searches or URLs
        results.set(`search-${s}`, {
          id: `ai-${s}`,
          url: s,
          title: s,
          type: 'search',
          score: 40 // Lower priority than direct matches
        });
      }
    });

    // Convert to array and sort
    return Array.from(results.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 8); // Top 8 suggestions

  }, [urlInputValue, bookmarks, history, aiSuggestions]);

  const isSearch = !urlInputValue.includes('.') || urlInputValue.includes(' ');

  const getPlaceholder = () => {
     if (voiceState === 'error') return voiceError || "Error";
     if (voiceState === 'listening') return "Listening...";
     if (voiceState === 'processing') return "Processing...";
     return "Search or enter address";
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'bookmark': return <Star size={14} className="text-orange-500" fill="currentColor" />;
      case 'history': return <Clock size={14} className="text-slate-400" />;
      case 'search': default: return <Search size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="flex-1 relative group">
      <form 
        onSubmit={(e) => { 
          e.preventDefault(); 
          setShowSuggestions(false);
          inputRef.current?.blur();
          onUrlSubmit(); 
        }}
        className={`relative flex items-center bg-black/40 border rounded-full px-4 py-2.5 shadow-inner transition-all focus-within:bg-black/60 ${isListening ? 'border-dragon-cyan ring-2 ring-dragon-cyan/20' : 'border-white/10'} ${voiceState === 'error' ? 'border-red-500' : ''}`}
      >
        {activeTab.isPrivate ? (
          <Lock className="w-4 h-4 mr-2 animate-pulse" style={{ color: accentColor }} />
        ) : isSearch ? (
           <img 
             src="https://i.ibb.co/CKVTVSbg/IMG-20251221-WA0021.jpg" 
             alt="" 
             className="w-5 h-5 rounded-full object-cover mr-2 border border-white/10 shrink-0"
             onError={(e) => {
               (e.target as HTMLImageElement).style.display = 'none';
             }}
           />
        ) : (
           <Globe className="w-4 h-4 mr-2 text-slate-400" />
        )}

        <input
          ref={inputRef}
          className={`flex-1 bg-transparent border-none outline-none text-sm placeholder-slate-500 min-w-0 ${voiceState === 'error' ? 'text-red-400 placeholder-red-400' : 'text-white'}`}
          value={urlInputValue}
          onChange={(e) => {
            onUrlChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={getPlaceholder()}
          autoCapitalize="off"
          autoComplete="off"
        />
        
        <div className="flex items-center gap-1">
          <button 
            type="button" 
            onClick={startListening}
            className={`p-1 transition-colors ${isListening ? 'text-dragon-cyan' : voiceState === 'error' ? 'text-red-500' : 'text-slate-500 hover:text-white'}`}
          >
            {voiceState === 'error' ? <AlertCircle className="w-4 h-4" /> : <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />}
          </button>

          {activeTab.isLoading && (
            <RotateCw className="w-4 h-4 text-[var(--theme-color)] animate-spin ml-1" />
          )}
        </div>
      </form>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in ring-1 ring-white/5">
          <div className="flex flex-col">
            {filteredSuggestions.map((item, idx) => (
              <button
                key={`${item.type}-${item.id}-${idx}`}
                className="w-full text-left px-4 py-3 hover:bg-white/10 flex items-center gap-3 transition-colors group border-b border-white/5 last:border-0"
                onClick={() => {
                  onUrlChange(item.url);
                  onUrlSubmit();
                  setSuggestions([]);
                }}
                onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
              >
                <div className="shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    <HighlightMatch text={item.title} query={urlInputValue} />
                  </div>
                  {item.type !== 'search' && (
                    <div className="text-[10px] text-slate-500 truncate font-mono mt-0.5 opacity-70 group-hover:opacity-100">
                      <HighlightMatch text={item.url} query={urlInputValue} />
                    </div>
                  )}
                </div>
                {item.type === 'history' || item.type === 'bookmark' ? (
                   <ArrowUpRight size={12} className="text-slate-600 group-hover:text-dragon-ember transition-colors" />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
