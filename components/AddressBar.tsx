import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Globe, Lock } from 'lucide-react';
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

const AddressBar: React.FC<AddressBarProps> = ({
  activeTab,
  urlInputValue,
  onUrlChange,
  onUrlSubmit,
  onReload,
  accentColor,
  onSiteSettingsClick,
  onFocus,
}) => {
  const { suggestions: aiSuggestions, fetchSuggestions, setSuggestions } =
    useDragonAI();
  const { history, bookmarks, settings } = useDragon();

  const [showSuggestions, setShowSuggestions] = useState(false);
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
    const items: any[] = [];
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

  const getSearchEngineLogo = (engine: SearchEngine) => {
    if (engine === 'google') {
      return (
        <img
          src="https://www.google.com/favicon.ico"
          className="w-4 h-4"
          alt="Google"
        />
      );
    }
    return <Search className="w-4 h-4 text-orange-500" />;
  };

  const getSiteIcon = () => {
    if (activeTab.isPrivate) {
      return <Lock className="w-4 h-4 text-purple-500" />;
    }

    let domain = '';
    try {
      domain = new URL(activeTab.url).hostname;
    } catch {
      return <Globe className="w-4 h-4 text-slate-400" />;
    }

    return (
      <img
        src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
        className="w-4 h-4 rounded-sm"
        onError={e => {
          (e.target as HTMLImageElement).src =
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOTQ5OThmIiBzdHJva2Utd2lkdGg9IjIiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PC9zdmc+';
        }}
        alt=""
      />
    );
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-black/60 rounded-xl">
      {getSiteIcon()}
      <input
        ref={inputRef}
        value={urlInputValue}
        onChange={e => onUrlChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onUrlSubmit()}
        onFocus={() => {
          setShowSuggestions(true);
          onFocus?.();
        }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        className="flex-1 bg-transparent outline-none text-white"
        placeholder="Search or enter address"
      />
    </div>
  );
};

export default AddressBar;
