
import React, { useState } from 'react';
import { 
  X, Calculator, Palette, Trash2, 
  ShieldCheck, Monitor, Search, Globe, Clock, 
  Download, Star, Sparkles, Plus, ExternalLink, Copy, Library, Printer, WifiOff
} from 'lucide-react';
import { ThemeColor, AppSettings, SearchEngine, BrowserViewMode } from '../types';
import { useDragon } from '../DragonContext';
import { useTabs } from '../hooks/useTabs';

interface LairSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeColor;
  onThemeChange: (theme: ThemeColor) => void;
  settings: AppSettings;
  onToggleSetting: (key: keyof AppSettings) => void;
  onEngineChange: (engine: SearchEngine) => void;
  shieldStats: number;
}

export const LairSidebar: React.FC<LairSidebarProps> = ({ 
  isOpen, onClose, currentTheme, onThemeChange, settings, onToggleSetting, onEngineChange, shieldStats
}) => {
  const { navigateTo, bookmarks, toggleBookmark, savePageOffline } = useDragon();
  const { activeTab } = useTabs(false); // We need active tab URL for saving
  const [activeTabSection, setActiveTabSection] = useState<'bookmarks' | 'theme' | 'shield'>('theme');

  const handlePrintPage = () => {
    onClose();
    const toast = document.createElement('div');
    toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0f0f0f]/95 text-white px-8 py-6 rounded-[2rem] z-[10000] flex flex-col items-center gap-4 font-black uppercase tracking-widest shadow-2xl animate-fade-in border border-white/10 backdrop-blur-md text-center';
    toast.innerHTML = `
      <div class="animate-spin w-8 h-8 border-4 border-dragon-ember border-t-transparent rounded-full mb-2"></div> 
      <div>
        <div class="text-xs text-dragon-ember mb-1">Dragon Printer</div>
        <div class="text-[10px] text-slate-400">Preparing PDF document...</div>
      </div>
    `;
    document.body.appendChild(toast);
    document.body.classList.add('printing-mode');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('printing-mode');
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 2000); 
    }, 800);
  };

  const themes: { id: ThemeColor; name: string; color: string }[] = [
    { id: 'ember', name: 'Orange', color: '#f97316' },
    { id: 'frost', name: 'Blue', color: '#06b6d4' },
    { id: 'midas', name: 'Gold', color: '#eab308' },
    { id: 'venom', name: 'Green', color: '#22c55e' },
  ];

  const handleNavigateTo = (mode: BrowserViewMode) => {
    navigateTo(mode);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[70]" onClick={onClose} />
      )}

      <div className={`
        fixed top-0 right-0 h-full w-85 max-w-[85vw] bg-dragon-dark/95 border-l border-white/10 shadow-2xl z-[80] transform transition-transform duration-500 ease-out flex flex-col backdrop-blur-3xl
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-4">
             <img src="https://i.ibb.co/CKVTVSbg/IMG-20251221-WA0021.jpg" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(249,115,22,0.3)] rounded-full" />
             <div>
                <h2 className="text-xl font-black text-white tracking-tight italic text-dragon-ember uppercase leading-none">Browser Tools</h2>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mt-1">Utility & Settings</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 transition-all active:scale-90">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex p-3 gap-2 bg-black/20 overflow-x-auto no-scrollbar">
          {[
            { id: 'theme', icon: <Palette className="w-4 h-4" />, label: 'Style' },
            { id: 'bookmarks', icon: <Star className="w-4 h-4" />, label: 'Bookmarks' },
            { id: 'shield', icon: <ShieldCheck className="w-4 h-4" />, label: 'Security' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTabSection(tab.id as any)}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1.5 py-4 px-3 rounded-2xl text-[9px] font-black transition-all whitespace-nowrap
                ${activeTabSection === tab.id 
                  ? 'bg-gradient-to-br from-[var(--theme-color)] to-dragon-dark text-white shadow-xl scale-105 ring-1 ring-white/20' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
              `}
            >
              {tab.icon}
              {tab.label.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          
          {activeTabSection === 'theme' && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-l-2 border-dragon-ember pl-3">Theme Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  {themes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => onThemeChange(t.id)}
                      className={`
                        relative p-5 rounded-[2rem] border transition-all flex flex-col gap-3 overflow-hidden group
                        ${currentTheme === t.id ? 'border-[var(--theme-color)] bg-[var(--theme-color)]/10 shadow-lg shadow-[var(--theme-color)]/10' : 'border-white/5 bg-white/5 hover:border-white/20'}
                      `}
                    >
                      <div className="w-10 h-10 rounded-2xl shadow-2xl border-4 border-black/30" style={{ backgroundColor: t.color }} />
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-l-2 border-dragon-cyan pl-3">Search Engines</h3>
                <div className="flex flex-col gap-2 p-3 bg-black/40 rounded-[2rem] border border-white/5">
                  {[
                    { id: 'dragon', name: 'Dragon Search', icon: <Sparkles className="w-4 h-4" />, color: 'text-dragon-ember' },
                    { id: 'google', name: 'Google', icon: <Globe className="w-4 h-4" />, color: 'text-blue-500' },
                    { id: 'bing', name: 'Bing', icon: <Search className="w-4 h-4" />, color: 'text-cyan-500' },
                  ].map(engine => (
                    <button
                      key={engine.id}
                      onClick={() => onEngineChange(engine.id as SearchEngine)}
                      className={`
                        flex items-center justify-between p-4 rounded-xl transition-all border
                        ${settings.searchEngine === engine.id 
                          ? 'bg-white/10 border-white/20 text-white shadow-lg' 
                          : 'border-transparent text-slate-500 hover:bg-white/5'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={engine.color}>{engine.icon}</div>
                        <span className="text-xs font-black uppercase tracking-tight">{engine.name}</span>
                      </div>
                      {settings.searchEngine === engine.id && (
                        <div className="w-2 h-2 rounded-full bg-[var(--theme-color)] shadow-[0_0_8px_var(--theme-color)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-l-2 border-green-500 pl-3">Browser Utilities</h3>
                
                <button 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('dragon:save-offline'));
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded-[2rem] group hover:border-dragon-ember/30 transition-all shadow-lg active:scale-95 mb-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-2xl text-slate-300 group-hover:text-dragon-ember transition-colors">
                      <WifiOff size={20} />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-black text-white uppercase tracking-tighter block">Save for Offline</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Snapshot Page</span>
                    </div>
                  </div>
                  <Download size={16} className="text-slate-500 group-hover:text-white transition-colors" />
                </button>

                <button 
                  onClick={handlePrintPage}
                  className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded-[2rem] group hover:border-dragon-ember/30 transition-all shadow-lg active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-2xl text-slate-300 group-hover:text-dragon-ember transition-colors">
                      <Printer size={20} />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-black text-white uppercase tracking-tighter block">Save Page as PDF</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Instant Document Export</span>
                    </div>
                  </div>
                  <Download size={16} className="text-slate-500 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>
          )}

          {activeTabSection === 'bookmarks' && (
            <div className="h-full flex flex-col gap-6 animate-fade-in">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-l-2 border-dragon-cyan pl-3">Saved Bookmarks</h3>
              <div className="space-y-4 pb-12">
                {bookmarks.length === 0 ? (
                  <p className="text-center text-slate-700 text-[9px] font-black uppercase tracking-[0.4em] pt-12">No bookmarks saved yet</p>
                ) : (
                  bookmarks.map((b) => (
                    <div key={b.id} className="group relative bg-white/5 border border-white/5 rounded-[1.5rem] p-5 flex items-center gap-4 hover:bg-white/10 transition-all shadow-lg">
                      <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center text-dragon-cyan border border-white/5 shadow-inner shrink-0">
                        <Globe className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-slate-100 truncate tracking-tight uppercase leading-none">{b.title}</h4>
                        <p className="text-[9px] text-slate-500 truncate uppercase font-bold tracking-tighter mt-1">{b.url}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleNavigateTo(BrowserViewMode.BROWSER)} className="p-2.5 text-slate-500 hover:text-dragon-cyan bg-white/5 rounded-xl"><ExternalLink className="w-4 h-4" /></button>
                         <button onClick={() => toggleBookmark(b.url, b.title)} className="p-2.5 text-slate-500 hover:text-red-500 bg-white/5 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTabSection === 'shield' && (
             <div className="space-y-8 animate-fade-in">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-l-2 border-dragon-cyan pl-3">Browser Security</h3>
                <div className="bg-gradient-to-br from-dragon-navy to-dragon-dark rounded-[2.5rem] p-10 border border-white/10 text-center shadow-2xl relative overflow-hidden group">
                  <div className="absolute -inset-10 bg-dragon-cyan/10 blur-[60px] rounded-full group-hover:bg-dragon-ember/10 transition-colors" />
                  <div className="relative">
                    <div className="text-6xl font-black text-white mb-2 tabular-nums tracking-tighter italic drop-shadow-2xl">
                      {settings.trackersBlockedTotal.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-dragon-cyan uppercase font-black tracking-[0.4em] mt-3">Trackers Blocked</div>
                  </div>
                </div>

                <div className="space-y-4">
                   {[
                     { label: 'Script Blocker', active: settings.dragonBreath, desc: 'Prevents harmful scripts' },
                     { label: 'Private Search', active: settings.stealthFlight, desc: 'Hides your searches' },
                     { label: 'Safe Browsing', active: settings.safeBrowsing, desc: 'Warns about risky sites' },
                   ].map(feat => (
                     <div key={feat.label} className="flex justify-between items-center p-6 bg-white/5 rounded-[2rem] border border-white/5 group hover:border-white/20 transition-all shadow-xl">
                        <div className="text-left">
                          <span className="text-xs font-black text-slate-100 block uppercase tracking-tight">{feat.label}</span>
                          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">{feat.desc}</span>
                        </div>
                        <div className={`text-[9px] font-black px-4 py-2 rounded-full shadow-lg border ${feat.active ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-slate-800 text-slate-600 border-white/5'}`}>
                           {feat.active ? 'ENABLED' : 'DISABLED'}
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          )}
        </div>
      </div>
    </>
  );
};
