
import React, { useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, X, Search } from 'lucide-react';

interface FindInPageProps {
  query: string;
  onQueryChange: (text: string) => void;
  currentMatch: number;
  totalMatches: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export const FindInPage: React.FC<FindInPageProps> = ({ 
  query, onQueryChange, onNext, onPrev, onClose 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto focus on mount
    if (inputRef.current) {
        inputRef.current.focus();
    }
  }, []);

  return (
    <div className="fixed top-[70px] right-4 z-[100] w-[280px] bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl animate-fade-in overflow-hidden ring-1 ring-white/5">
      <div className="flex items-center p-2 gap-2">
        <div className="flex-1 flex items-center bg-black/40 rounded-lg px-3 py-2 border border-white/5 focus-within:border-dragon-cyan/50 transition-colors">
            <Search size={14} className="text-slate-500 mr-2 shrink-0" />
            <input 
              ref={inputRef}
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-slate-600 font-medium min-w-0"
              placeholder="Find..."
              autoComplete="off"
              autoCapitalize="off"
              onKeyDown={(e) => {
                  if(e.key === 'Enter') {
                      e.preventDefault();
                      e.shiftKey ? onPrev() : onNext();
                  }
                  if(e.key === 'Escape') onClose();
              }}
            />
        </div>
        
        <div className="flex items-center shrink-0">
            <button onClick={onPrev} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" title="Previous">
                <ChevronUp size={16} />
            </button>
            <button onClick={onNext} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" title="Next">
                <ChevronDown size={16} />
            </button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button onClick={onClose} className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-500 transition-colors" title="Close">
                <X size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};
