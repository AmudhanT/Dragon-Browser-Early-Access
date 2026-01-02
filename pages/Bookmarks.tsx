
import React, { useState } from 'react';
import { useDragon } from '../DragonContext';
import DragonHeader from '../components/DragonHeader';
import { Search, Star, Trash2, Globe, ExternalLink, X, Bookmark as BookmarkIcon } from 'lucide-react';
import { BrowserViewMode } from '../types';

interface BookmarksProps {
  onNavigate: (url: string) => void;
}

export const Bookmarks: React.FC<BookmarksProps> = ({ onNavigate }) => {
  const { bookmarks, toggleBookmark, setViewMode } = useDragon();
  const [search, setSearch] = useState('');

  const filteredBookmarks = bookmarks.filter(b => 
    (b.title?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (b.url?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const handleOpenBookmark = (url: string) => {
    onNavigate(url);
    setViewMode(BrowserViewMode.BROWSER);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-dragon-dark text-slate-900 dark:text-slate-100 animate-fade-in pb-safe-bottom">
      <DragonHeader 
        title="BOOKMARKS" 
        subtitle="SAVED PAGES & SITES" 
        onBack={() => setViewMode(BrowserViewMode.MAIN_MENU)}
      />

      <div className="p-6 space-y-6 flex-1 overflow-y-auto no-scrollbar">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-dragon-ember transition-colors" />
          <input 
            type="text"
            placeholder="Search your bookmarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-dragon-navy/50 border border-slate-200 dark:border-white/10 rounded-[1.5rem] py-5 pl-14 pr-6 text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-dragon-ember/50 shadow-inner"
          />
        </div>

        <div className="space-y-4">
          {filteredBookmarks.length === 0 ? (
            <div className="py-32 text-center space-y-6 opacity-30">
              <Star className="w-20 h-20 mx-auto text-slate-300 dark:text-slate-800" />
              <div className="space-y-2">
                <p className="text-sm font-black text-slate-400 dark:text-slate-700 uppercase tracking-widest italic">NO BOOKMARKS YET</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-800 uppercase font-bold tracking-widest">Save your favorite pages to access them later.</p>
              </div>
            </div>
          ) : (
            filteredBookmarks.map((b) => (
              <div 
                key={b.id} 
                onClick={() => handleOpenBookmark(b.url)}
                className="bg-white dark:bg-dragon-navy/40 rounded-[2.5rem] p-5 border border-slate-200 dark:border-white/5 flex items-center gap-5 group hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-xl hover:border-dragon-ember/30 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-black/40 flex items-center justify-center shadow-inner border border-slate-200 dark:border-white/5 group-hover:scale-105 transition-transform shrink-0">
                  <img 
                    src={`https://www.google.com/s2/favicons?sz=64&domain=${new URL(b.url).hostname}`}
                    className="w-7 h-7 object-contain"
                    alt=""
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) parent.innerHTML = '<div class="text-slate-500"><Globe size={24} /></div>';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black truncate text-slate-900 dark:text-white tracking-tight uppercase leading-none">{b.title || b.url}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate uppercase font-bold tracking-tighter opacity-60 mt-1">{b.url}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(b.url, b.title);
                    }}
                    className="p-3 bg-red-500/5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all shadow-lg"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
