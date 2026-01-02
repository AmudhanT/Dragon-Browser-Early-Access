
import React, { useState } from 'react';
import { useDragon } from '../DragonContext';
import { X, Search, Clock, Trash2, Globe, ChevronLeft } from 'lucide-react';
import { BrowserViewMode } from '../types';

export const History: React.FC = () => {
  const { history, clearHistory, setViewMode } = useDragon();
  const [search, setSearch] = useState('');

  const filteredHistory = history.filter(h => 
    h.title.toLowerCase().includes(search.toLowerCase()) || 
    h.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-dragon-dark text-slate-100 animate-fade-in">
      <div className="p-6 pt-safe-top bg-dragon-navy/50 backdrop-blur-xl sticky top-0 z-10 border-b border-white/5 flex items-center gap-4">
        <button onClick={() => setViewMode(BrowserViewMode.BROWSER)} className="p-2 -ml-2 rounded-full hover:bg-white/5">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold flex-1">History</h2>
        {history.length > 0 && (
          <button 
            onClick={() => { if(window.confirm('Clear all history?')) clearHistory(); }}
            className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dragon-navy border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-dragon-cyan"
          />
        </div>

        <div className="space-y-1">
          {filteredHistory.length === 0 ? (
            <div className="py-20 text-center space-y-4 opacity-30">
              <Clock className="w-16 h-16 mx-auto" />
              <p className="text-sm font-medium">No history found</p>
            </div>
          ) : (
            filteredHistory.map((h, i) => (
              <div key={h.id} className="p-4 hover:bg-white/5 transition-colors rounded-xl flex items-center gap-4 group">
                <Globe className="w-5 h-5 text-slate-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-200 truncate">{h.title}</h4>
                  <p className="text-xs text-slate-500 truncate">{h.url}</p>
                </div>
                <span className="text-[10px] text-slate-600 font-mono whitespace-nowrap">
                  {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
