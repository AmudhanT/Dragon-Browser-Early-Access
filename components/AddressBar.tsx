import React, { useEffect, useRef } from "react";
import { Search, Globe, Lock } from "lucide-react";
import { useDragon } from "../DragonContext";
import { useDragonAI } from "../hooks/useDragonAI";
import { Tab } from "../types";

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
  const { fetchSuggestions, setSuggestions } = useDragonAI();
  const { history, bookmarks } = useDragon();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        urlInputValue &&
        document.activeElement === inputRef.current &&
        !urlInputValue.startsWith("http") &&
        !urlInputValue.includes(".")
      ) {
        fetchSuggestions(urlInputValue);
      } else {
        setSuggestions([]);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [urlInputValue, fetchSuggestions, setSuggestions]);

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
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
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
        onChange={(e) => onUrlChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onUrlSubmit()}
        onFocus={() => onFocus?.()}
        className="flex-1 bg-transparent outline-none text-white text-sm"
        placeholder="Search or enter address"
        autoComplete="off"
        spellCheck={false}
      />

      <Search className="w-4 h-4 text-orange-500 opacity-70" />
    </div>
  );
};

export default AddressBar;
