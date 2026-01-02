
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Globe, Lock, Sparkles, Loader2, X, Clock, Star } from 'lucide-react';
import { useDragon } from '../DragonContext';
import { useDragonAI } from '../hooks/useDragonAI';
import { Tab, SearchEngine } from '../types';

interface AddressBarProps {
  activeTab: Tab;
  urlInputValue: string;
  onUrlChange: (val: string) => void;
  onUrlSubmit: () => void;
  onReload: () => void;
  accentColor: string;
  onSiteSettingsClick?: () => void;
  onFocus?: () => void;
}

export const AddressBar: React.FC<AddressBarProps> = ({
  activeTab,
  urlInputValue,
  onUrlChange,
  onUrlSubmit,
  onReload,
  accentColor,
  onSiteSettingsClick,
  onFocus
}) => {
  const { suggestions: aiSuggestions, fetchSuggestions, setSuggestions } = useDragonAI();
  const { history, bookmarks, settings } = useDragon();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (urlInputValue && 
          document.activeElement === inputRef.current && 
          !urlInputValue.startsWith('http') && 
          !urlInputValue.includes('.')) {
        fetchSuggestions(urlInputValue);
      } else {
        setSuggestions([]);
      }
    }, 150); 
    return () => clearTimeout(timer);
  }, [urlInputValue, fetchSuggestions, setSuggestions]);

  // Enhanced Suggestion Merging for Address Bar (Compact View)
  const mergedSuggestions = useMemo(() => {
    if (!urlInputValue || urlInputValue.length < 1) return [];
    const query = urlInputValue.toLowerCase().trim();
    
    const scoredItems: { type: 'bookmark' | 'history' | 'web', label: string, value: string, score: number }[] = [];
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
        scoredItems.push({ type: 'bookmark', label: b.title || b.url, value: b.url, score });
        seenValues.add(b.url);
      }
    });

    // 2. History (Medium Priority + Recency)
    history.forEach(h => {
      if (seenValues.has(h.url)) return;
      const score = Math.max(calculateScore(h.title, 30), calculateScore(h.url, 20));
      if (score > 0) {
        // Boost slightly if extremely recent (last 24h)
        const recencyBonus = (Date.now() - h.timestamp) < 86400000 ? 5 : 0;
        scoredItems.push({ type: 'history', label: h.title || h.url, value: h.url, score: score + recencyBonus });
        seenValues.add(h.url);
      }
    });

    // 3. Web Suggestions (Lower Priority but Filler)
    aiSuggestions.forEach(s => {
      if (seenValues.has(s)) return;
      scoredItems.push({ type: 'web', label: s, value: s, score: 15 });
      seenValues.add(s);
    });

    // Sort descending by score, limit to 6 items for the smaller address bar dropdown
    return scoredItems.sort((a, b) => b.score - a.score).slice(0, 6);
  }, [urlInputValue, bookmarks, history, aiSuggestions]);

  const handleFocusInternal = () => {
    if (onFocus) {
      onFocus();
    } else {
      setShowSuggestions(true);
      inputRef.current?.select();
    }
  };

  const handleBlurInternal = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const getSearchEngineLogo = (engine: SearchEngine) => {
    switch (engine) {
      case 'dragon':
        return <img src="https://i.ibb.co/CKVTVSbg/IMG-20251221-WA0021.jpg" className="w-4 h-4 rounded-full object-cover border border-white/10" alt="Dragon" />;
      case 'google':
        return (
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        );
      case 'bing':
        return (
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <path fill="#008373" d="M15.44 2.1L8.5 4.54V17.08L5.56 15.42V5.5L2 6.75V19.75L8.5 22.5L18.44 16.9V13.8L15.44 12.35V2.1H15.44Z" />
          </svg>
        );
      default: return <Search className="w-4 h-4 text-orange-500" />;
    }
  };

  const getSiteIcon = () => {
    if (activeTab.isPrivate) return <Lock className="w-4 h-4 text-purple-500 animate-pulse" />;
    
    const isInternal = activeTab.url.startsWith('dragon://');
    let domain = '';
    try {
      domain = isInternal ? 'dragon' : new URL(activeTab.url).hostname;
    } catch (e) {
      return <Globe className="w-4 h-4 text-slate-400" />;
    }
    
    if (isInternal) {
      return (
        <img 
          src="https://i.ibb.co/CKVTVSbg/IMG-20251221-WA0021.jpg"
          className="w-4 h-4 rounded-full object-cover"
          alt="D"
        />
      );
    }

    const isGoogle = domain.includes('google');
    const isBing = domain.includes('bing');
    
    if (settings.searchEngine === 'dragon' && isGoogle && activeTab.url.includes('/search')) {
       return getSearchEngineLogo('dragon');
    }
    if (settings.searchEngine === 'google' && isGoogle && activeTab.url.includes('/search')) {
       return getSearchEngineLogo('google');
    }
    if (settings.searchEngine === 'bing' && isBing) {
       return getSearchEngineLogo('bing');
    }

    return (
      <img 
        src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
        className="w-4 h-4 rounded-sm object-contain"
        onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOTQ5OThmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48bGluZSB4MT0iMiIgeTE9IjEyIiB4Mj0iMjIiIHkyPSIxMiIvPjxwYXRoIGQ9Ik0xMiAyYzIuODU1IDAgNSAxMCA1IDEwcy0yLjE0NSA0LTUgNHMtNS0xMC01LTEwczIuMTQ1LTQgNS00eiIvPjwvc3ZnPg=='; }}
        alt=""
