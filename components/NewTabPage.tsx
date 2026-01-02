
import React, { useState, useMemo } from 'react';
import { useDragon, Shortcut } from '../DragonContext';
import { Mic, Clock, Trash2, Layers, Search, Edit2, Plus, ArrowRight, X, Globe, ExternalLink, Palette } from 'lucide-react';
import { normalizeUrl } from '../utils/urlUtils';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { VoiceOverlay } from './VoiceOverlay';
import { BrowserViewMode } from '../types';

interface NewTabPageProps {
  onNavigate: (url: string) => void;
  onOpenInNewTab: (url: string) => void;
  onTriggerSearch: () => void;
}

const presets = [
  { id: 'default', name: 'Dragon', url: 'https://i.ibb.co/CKVTVSbg/IMG-20251221-WA0021.jpg' },
  { id: 'void', name: 'Void', url: '' },
  { id: 'neon_tokyo', name: 'Neon City', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1920&auto=format&fit=crop' },
  { id: 'deep_space', name: 'Cosmos', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1920&auto=format&fit=crop' },
  { id: 'northern_lights', name: 'Aurora', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1920&auto=format&fit=crop' },
  { id: 'crimson_flow', name: 'Inferno', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop' },
  { id: 'rainy_glass', name: 'Rain', url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1920&auto=format&fit=crop' },
  { id: 'cyber_grid', name: 'Matrix', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1920&auto=format&fit=crop' },
];

export const NewTabPage: React.FC<NewTabPageProps> = ({ onNavigate, onOpenInNewTab, onTriggerSearch }) => {
  const { speedDial, settings, history, clearHistory, updateSpeedDial, addShortcut, removeShortcut, navigateTo } = useDragon();
  
  // Replaced contextMenu (x,y) with simple selected shortcut state for the centered modal
  const [selectedShortcut, setSelectedShortcut] = useState<Shortcut | null>(null);
  
  const [modalConfig, setModalConfig] = useState<{ mode: 'add' | 'edit'; data?: Shortcut } | null>(null);
  const [formData, setFormData] = useState({ name: '', url: '' });

  const { 
    voiceState, 
    interimTranscript, 
    startListening, 
    reset: resetVoice,
    error: voiceError
  } = useVoiceSearch((transcript) => {
    const targetUrl = normalizeUrl(transcript, settings.searchEngine);
    onNavigate(targetUrl);
  });

  const handleSearchPlaceholderClick = () => {
    onTriggerSearch();
  };

  const getCleanDomain = (url: string) => {
    try {
      const u = url.startsWith('http') ? url : `https://${url}`;
      return new URL(u).hostname.replace('www.', '');
    } catch {
      return url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
    }
  };

  const MAX_SLOTS = 8;
  const shortcuts = speedDial.slice(0, MAX_SLOTS);
  const recentHistory = history.slice(0, 5);

  const getSearchPlaceholder = () => {
    const engine = settings.searchEngine;
    const name = engine.charAt(0).toUpperCase() + engine.slice(1);
    return `Search on ${name}...`;
  };

  const getEngineLogo = () => {
    switch (settings.searchEngine) {
      case 'dragon':
        return <img src="https://i.ibb.co/CKVTVSbg/IMG-20251221-WA0021.jpg" className="w-5 h-5 rounded-full object-cover shadow-sm" alt="Dragon" />;
      case 'google':
        return (
          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm p-0.5">
             <svg viewBox="0 0 24 24" className="w-full h-full">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </div>
        );
      case 'bing':
        return (
          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm p-1">
             <svg viewBox="0 0 24 24" className="w-full h-full">
              <path fill="#008373" d="M15.44 2.1L8.5 4.54V17.08L5.56 15.42V5.5L2 6.75V19.75L8.5 22.5L18.44 16.9V13.8L15.44 12.35V2.1H15.44Z" />
            </svg>
          </div>
        );
      default:
        return <Search size={20} className="text-orange-500" />;
    }
  };

  const wallpaperUrl = useMemo(() => {
    if (settings.wallpaper?.startsWith('data:')) return settings.wallpaper;
    const preset = presets.find(p => p.id === settings.wallpaper);
    if (preset?.id === 'void') return null;
    return preset ? preset.url : null;
  }, [settings.wallpaper]);

  const handleEditClick = () => {
    if (selectedShortcut) {
      setFormData({ name: selectedShortcut.name, url: selectedShortcut.url });
      setModalConfig({ mode: 'edit', data: selectedShortcut });
      setSelectedShortcut(null);
    }
  };

  const handleAddClick = () => {
    setFormData({ name: '', url: '' });
    setModalConfig({ mode: 'add' });
  };

  const handleDeleteClick = () => {
    if (selectedShortcut) {
      removeShortcut(selectedShortcut.id);
      setSelectedShortcut(null);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.url) return;
    let finalUrl = formData.url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = 'https://' + finalUrl;

    if (modalConfig?.mode === 'edit' && modalConfig.data) {
      const updated = speedDial.map(s => 
        s.id === modalConfig.data!.id ? { ...s, name: formData.name, url: finalUrl } : s
      );
      updateSpeedDial(updated);
    } else if (modalConfig?.mode === 'add') {
      addShortcut(formData.name, finalUrl);
    }
    
    setModalConfig(null);
  };

  const isClearMode = settings.wallpaperBlur === 0;

  return (
    <div 
      className="flex flex-col h-full bg-black overflow-y-auto no-scrollbar pb-32 relative"
      onClick={() => setSelectedShortcut(null)}
    >
      {/* Dynamic Background */}
      {wallpaperUrl && (
        <>
           <div 
             className={`fixed inset-0 z-0 bg-cover bg-center transition-all duration-700 animate-fade-in ${isClearMode ? 'opacity-100' : 'opacity-60'}`}
             style={{ 
               backgroundImage: `url(${wallpaperUrl})`,
               filter: `blur(${settings.wallpaperBlur || 0}px)`
             }}
           />
           <div 
             className={`fixed inset-0 z-0 bg-gradient-to-b transition-all duration-700 ${isClearMode ? 'from-black/70 via-transparent to-black/90' : 'from-black/40 via-black/20 to-black/80'}`} 
           />
        </>
      )}

      {/* Top Right Appearance Button */}
      <div className="absolute top-safe-top right-6 z-30 pt-6">
        <button 
          onClick={() => {
            navigateTo(BrowserViewMode.APPEARANCE);
          }}
          className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-slate-300 hover:text-white transition-all active:scale-90 shadow-lg hover:bg-white/20"
        >
          <Palette size={20} />
        </button>
      </div>

      <VoiceOverlay 
        isOpen={voiceState !== 'idle'} 
        onClose={resetVoice} 
        voiceState={voiceState} 
        transcript={interimTranscript} 
        error={voiceError}
        onRetry={startListening}
      />

      {/* Edit/Add Modal */}
      {modalConfig && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-md p-6" onClick={(e) => e.stopPropagation()}>
          <div className="w-full max-w-sm bg-[#111] border border-white/10 rounded-[2rem] p-8 shadow-2xl ring-1 ring-white/5 animate-fade-in">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6 text-center">
              {modalConfig.mode === 'add' ? 'New Link' : 'Edit Link'}
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-2">Name</span>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-dragon-ember/50 placeholder-slate-600" placeholder="e.g. YouTube" />
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-2">Address</span>
                <input value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-dragon-ember/50 placeholder-slate-600" placeholder="e.g. youtube.com" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setModalConfig(null)} className="flex-1 py-4 bg-white/5 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">Cancel</button>
                <button onClick={handleSave} className="flex-1 py-4 bg-dragon-ember text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-dragon-ember/20 active:scale-95 transition-all">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center pt-safe-top px-6 relative z-10 w-full max-w-md mx-auto">
        <div className="flex-1 min-h-[10vh]" />
        
        {/* Hero Section */}
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="relative mb-6 group cursor-default">
            <div className="absolute -inset-6 bg-orange-600/20 blur-[40px] rounded-full group-hover:bg-orange-600/30 transition-all duration-700" />
            <img 
              src="https://i.ibb.co/CKVTVSbg/IMG-20251221-WA0021.jpg" 
              alt="Logo" 
              className="w-24 h-24 rounded-[2rem] object-cover shadow-2xl relative z-10 border border-white/10 group-hover:scale-105 transition-transform duration-500" 
            />
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none mb-2 drop-shadow-lg">
            Dragon Browser
          </h1>
          <p className="text-orange-500 text-[9px] tracking-[0.4em] font-black uppercase opacity-90">
            Make Some Difference
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full mb-12 relative z-20">
          <div 
            onClick={handleSearchPlaceholderClick} 
            className="relative bg-white/10 backdrop-blur-md border border-white/10 rounded-[2rem] pl-5 pr-2 py-2 shadow-2xl flex items-center h-[64px] group hover:bg-white/15 transition-all z-20 cursor-text"
          >
            <div className="mr-4 shrink-0 transition-transform group-hover:scale-110 duration-300">
              {getEngineLogo()}
            </div>
            <span className="flex-1 text-sm text-slate-300 font-medium select-none truncate opacity-80 group-hover:opacity-100 transition-opacity">
              {getSearchPlaceholder()}
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); startListening(); }} 
              className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-all active:scale-90"
            >
              <Mic size={20} />
            </button>
          </div>
        </div>

        {/* Speed Dial */}
        {settings.showSpeedDial && (
          <div className="w-full mb-14 relative z-0">
            <div className="grid grid-cols-4 gap-y-6 gap-x-2">
              {shortcuts.map((site) => (
                <div key={site.id} className="relative flex flex-col items-center gap-2 group">
                  <div className="relative">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation();
                        // Open centered menu on click
                        setSelectedShortcut(site);
                      }}
                      onContextMenu={(e) => e.preventDefault()}
                      className="w-[3.8rem] h-[3.8rem] bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-sm rounded-[1.2rem] flex items-center justify-center shadow-lg transition-all active:scale-90 group-hover:-translate-y-1 group-hover:shadow-2xl border border-white/10"
                    >
                      <img 
                        src={`https://www.google.com/s2/favicons?sz=64&domain=${getCleanDomain(site.url)}`} 
                        alt={site.name} 
                        className="w-7 h-7 rounded-md" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </button>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 truncate w-16 text-center opacity-80 group-hover:opacity-100 group-hover:text-white transition-all">
                    {site.name}
                  </span>
                </div>
              ))}
              {shortcuts.length < MAX_SLOTS && (
                  <div className="flex flex-col items-center gap-2 group">
                      <button 
                        onClick={handleAddClick} 
                        className="w-[3.8rem] h-[3.8rem] bg-white/5 border border-dashed border-white/20 rounded-[1.2rem] flex items-center justify-center shadow-sm transition-all active:scale-95 hover:bg-white/10 hover:border-white/40"
                      >
                        <Plus size={24} className="text-slate-400 group-hover:text-white" />
                      </button>
                      <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-300">Add</span>
                  </div>
              )}
            </div>
          </div>
        )}

        {/* Recent History Stream */}
        {recentHistory.length > 0 && (
          <div className="w-full relative z-0">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Recent History</h3>
              <button 
                onClick={clearHistory} 
                className="p-2 -mr-2 text-slate-500 hover:text-red-400 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-[1.8rem] border border-white/5 overflow-hidden shadow-xl divide-y divide-white/5">
              {recentHistory.map((h) => (
                <button 
                  key={h.id} 
                  onClick={() => onNavigate(h.url)} 
                  className="w-full flex items-center gap-4 p-4 hover:bg-white/5 text-left transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-black/40 flex items-center justify-center border border-white/5 shrink-0 text-slate-500 group-hover:text-dragon-ember transition-colors">
                    <Clock size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[12px] font-bold text-slate-200 truncate group-hover:text-white transition-colors">{h.title || 'Untitled Site'}</h4>
                    <span className="text-[9px] text-slate-500 truncate block mt-0.5">{getCleanDomain(h.url)}</span>
                  </div>
                  <ArrowRight size={14} className="text-slate-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex-1 min-h-[5vh]" />
      </div>

      {/* Centered Popup Menu (Notes Style) */}
      {selectedShortcut && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedShortcut(null)} />
          
          <div className="relative w-full max-w-sm bg-[#111] rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col ring-1 ring-white/5 animate-slide-up transform transition-all">
            
            {/* Menu Header */}
            <div className="p-5 border-b border-white/5 bg-black/40 flex items-center justify-between">
               <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
                     <img 
                       src={`https://www.google.com/s2/favicons?sz=64&domain=${getCleanDomain(selectedShortcut.url)}`}
                       className="w-5 h-5 rounded-sm"
                       onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                     />
                  </div>
                  <div className="min-w-0">
                     <h3 className="text-sm font-bold text-white truncate">{selectedShortcut.name}</h3>
                     <p className="text-[10px] text-slate-500 truncate font-mono">{getCleanDomain(selectedShortcut.url)}</p>
                  </div>
               </div>
               <button onClick={() => setSelectedShortcut(null)} className="p-2 text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                 <X size={18} />
               </button>
            </div>

            {/* Menu Actions */}
            <div className="p-2 flex flex-col gap-1">
               <button 
                 onClick={() => { onNavigate(normalizeUrl(selectedShortcut.url)); setSelectedShortcut(null); }} 
                 className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 rounded-2xl w-full text-left text-slate-300 hover:text-white transition-all group"
               >
                 <Globe size={18} className="text-slate-500 group-hover:text-dragon-cyan" />
                 <span className="text-xs font-bold uppercase tracking-widest">Open</span>
               </button>

               <button 
                 onClick={() => { onOpenInNewTab(selectedShortcut.url); setSelectedShortcut(null); }} 
                 className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 rounded-2xl w-full text-left text-slate-300 hover:text-white transition-all group"
               >
                 <Layers size={18} className="text-slate-500 group-hover:text-dragon-ember" />
                 <span className="text-xs font-bold uppercase tracking-widest">Open New Tab</span>
               </button>

               <button 
                 onClick={handleEditClick} 
                 className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 rounded-2xl w-full text-left text-slate-300 hover:text-white transition-all group"
               >
                 <Edit2 size={18} className="text-slate-500 group-hover:text-blue-400" />
                 <span className="text-xs font-bold uppercase tracking-widest">Edit Shortcut</span>
               </button>

               <div className="h-px bg-white/5 mx-4 my-1" />

               <button 
                 onClick={handleDeleteClick} 
                 className="flex items-center gap-4 px-5 py-4 hover:bg-red-500/10 rounded-2xl w-full text-left text-red-400 hover:text-red-500 transition-all group"
               >
                 <Trash2 size={18} />
                 <span className="text-xs font-bold uppercase tracking-widest">Delete</span>
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
