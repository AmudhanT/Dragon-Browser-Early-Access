import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Globe, Lock } from 'lucide-react';
import { useDragon } from '../DragonContext';
import { useDragonAI } from '../hooks/useDragonAI';
import { Tab } from '../types';

interface AddressBarProps {
  activeTab: Tab;
  urlInputValue: string;
  onUrlChange: (val: string) => void;
  onUrlSubmit: () => void;
  onFocus?: () => void;
}

const AddressBar: React.FC<AddressBarProps> = ({
  activeTab,
  urlInputValue,
  onUrlChange,
  onUrlSubmit,
  onFocus,
}) => {
  const { suggestions: aiSuggestions, fetchSuggestions, setSuggestions } =
    useDragonAI();
  const { history, bookmarks } = useDragon();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        urlInputValue &&
        document.activeElement === inputRef.current &&
        !urlInputValue.startsWith('http') &&
        !urlInputValue.includes('.')
      ) {
        fetchSuggestions(urlInputValue);
      } else {
        setSuggestions([]);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [urlInputValue, fetchSuggestions, setSuggestions]);

  const mergedSuggestions = useMemo(() => {
    if (!urlInputValue) return [];

    const query = urlInputValue.toLowerCase().trim();
    const items: { label: string; value: string; score: number }[] = [];
    const seen = new Set<string>();

    const score = (text: string, base: number) => {
      const t = text.toLowerCase();
      if (t === query) return base + 20;
      if (t.startsWith(query)) return base + 10;
      if (t.includes(query)) return base;
      return 0;
    };

    bookmarks.forEach(b => {
      if (seen.has(b.url)) return;
      const s = Math.max(score(b.title, 50), score(b.url, 40));
      if (s > 0) {
        items.push({ label: b.title || b.url, value: b.url, score: s });
        seen.add(b.url);
      }
    });

    history.forEach(h => {
      if (seen.has(h.url)) return;
      const s = Math.max(score(h.title, 30), score(h.url, 20));
      if (s > 0) {
        items.push({ label: h.title || h.url, value: h.url, score: s });
        seen.add(h.url);
      }
    });

    aiSuggestions.forEach(s => {
      if (!seen.has(s)) {
        items.push({ label: s, value: s, score: 15 });
        seen.add(s);
      }
    });

    return items.sort((a, b) => b.score - a.score).slice(0, 6);
  }, [urlInputValue, bookmarks, history, aiSuggestions]);

  const getSiteIcon = () => {
    if (activeTab.isPrivate) {
      return <Lock className="w-4 h-4 text-purple-500" />;
    }

    try {
      const domain = new URL(activeTab.url).hostname;
      return (
        <img
          src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
          className="w-4 h-4 rounded-sm"
          alt=""
        />
      );
    } catch {
      return <Globe className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-black/60 rounded-xl">
      {getSiteIcon()}
      <input
        ref={inputRef}
        value={urlInputValue}
        onChange={e => onUrlChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onUrlSubmit()}
        onFocus={onFocus}
        className="flex-1 bg-transparent outline-none text-white"
        placeholder="Search or enter address"
      />
      <Search className="w-4 h-4 text-orange-500 opacity-70" />
    </div>
  );
};

export default AddressBar;
