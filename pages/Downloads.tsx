
import React, { useState, useMemo, useRef } from 'react';
import { useDragon } from '../DragonContext';
import DragonHeader from '../components/DragonHeader';
import { 
  File, FileText, Video, Music, Image as ImageIcon, 
  Trash2, Download, Search, MoreVertical, Calendar, Sparkles, Filter, ExternalLink, X, LayoutGrid,
  Share2, PlayCircle, Eye, FolderOpen, Box, Archive
} from 'lucide-react';
import { DownloadItem, BrowserViewMode } from '../types';

interface DownloadsProps {
  onNavigate: (url: string) => void;
}

export const Downloads: React.FC<DownloadsProps> = ({ onNavigate }) => {
  const { downloads, removeDownload, setViewMode, settings, architect, playMedia, updateSettings } = useDragon();
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Categories exactly as requested by Architect Amudhan T
  const categories = ['ALL', 'IMAGES', 'VIDEOS', 'AUDIOS', 'DOCUMENTS', 'PDF', 'APKS', 'ARCHIVES', 'OTHERS'];

  // Category Mapping Logic for the Dragon Engine - as per Architect instructions
  const categorizeFile = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const map: Record<string, string[]> = {
      'IMAGES': ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp'],
      'VIDEOS': ['mp4', 'mkv', 'webm', 'mov', 'avi', 'flv', '3gp'],
      'AUDIOS': ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'],
      'PDF': ['pdf'],
      'DOCUMENTS': ['doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx', 'csv'],
      'APKS': ['apk', 'xapk', 'apkm'],
      'ARCHIVES': ['zip', 'rar', '7z', 'tar', 'gz', 'bz2']
    };
    
    for (const [category, extensions] of Object.entries(map)) {
      if (extensions.includes(ext)) return category;
    }
    return 'OTHERS';
  };

  const filteredDownloads = useMemo(() => {
    return downloads.filter(file => {
      const cat = categorizeFile(file.filename);
      // SEARCH REFINEMENT: First filter by category, then search within it
      const matchesFilter = filter === 'ALL' || cat === filter;
      if (!matchesFilter) return false;
      
      const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [downloads, searchQuery, filter]);

  const getIcon = (filename: string) => {
    const cat = categorizeFile(filename);
    switch (cat) {
      case 'IMAGES': return <ImageIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
      case 'VIDEOS': return <Video className="w-6 h-6 text-red-600 dark:text-red-400" />;
      case 'AUDIOS': return <Music className="w-6 h-6 text-green-600 dark:text-green-400" />;
      case 'PDF': return <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />;
      case 'DOCUMENTS': return <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
      case 'APKS': return <Box className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      case 'ARCHIVES': return <Archive className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />;
      default: return <File className="w-6 h-6 text-slate-500 dark:text-slate-400" />;
    }
  };

  const handleOpenFile = (d: DownloadItem) => {
    if (d.status !== 'completed') return;

    const cat = categorizeFile(d.filename);
    if (cat === 'VIDEOS') {
      playMedia(d.url, d.filename, 'video');
    } else if (cat === 'AUDIOS') {
      playMedia(d.url, d.filename, 'audio');
    } else if (cat === 'IMAGES') {
      playMedia(d.url, d.filename, 'image');
    } else {
      if (confirm(`Open ${d.filename} in browser?`)) {
        onNavigate(d.url);
      }
    }
  };

  const handleShare = async (d: DownloadItem) => {
    if (d.status !== 'completed') return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: d.filename,
          text: `Extracted neural fragment from Dragon Browser: ${d.filename}`,
          url: d.url
        });
      } catch (err) {
        console.warn('Dragon Share Protocol Interrupted:', err);
      }
    } else {
      alert("System Share Interface not detected on this node.");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const path = `/Internal Storage/Downloads/${e.target.files[0].name.split('/')[0] || 'Custom'}`; 
      updateSettings({ downloadLocation: path });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-dragon-dark text-slate-900 dark:text-slate-100 animate-fade-in pb-safe-bottom transition-colors duration-300">
      <DragonHeader 
        title="MY DOWNLOADS" 
        subtitle="SYNCED FRAGMENTS ARCHIVE"
        onBack={() => setViewMode(BrowserViewMode.MAIN_MENU)} 
      />
      
      <input 
        type="file" 
        ref={folderInputRef}
        className="hidden" 
        {...({ webkitdirectory: "", directory: "" } as any)}
        onChange={handleFolderSelect}
      />

      <div className="p-6 space-y-6 flex-1 overflow-y-auto no-scrollbar">
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-dragon-ember transition-colors" />
          </div>
          <input 
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-dragon-navy/50 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-dragon-ember shadow-sm dark:shadow-inner transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 rounded-xl text-[9px] font-black transition-all whitespace-nowrap border ${
                filter === cat 
                ? 'bg-dragon-ember border-dragon-ember text-white shadow-lg shadow-dragon-ember/20' 
                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredDownloads.length === 0 ? (
            <div className="py-24 text-center space-y-4 opacity-40">
              <Download className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-800" />
              <div className="space-y-1">
                <p className="text-sm font-black text-slate-600 dark:text-slate-700 uppercase tracking-widest">No Downloads</p>
                <p className="text-[9px] text-slate-500 dark:text-slate-800 uppercase font-bold tracking-tighter">No files match "{searchQuery}" in {filter}</p>
              </div>
            </div>
          ) : (
            filteredDownloads.map(d => (
              <div key={d.id} className="bg-white dark:bg-dragon-navy/30 rounded-[1.5rem] p-4 border border-slate-200 dark:border-white/5 flex flex-col gap-3 group hover:border-slate-300 dark:hover:bg-white/5 transition-all shadow-sm dark:shadow-lg hover:shadow-md dark:hover:border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-black/40 flex items-center justify-center shadow-inner border border-slate-200 dark:border-white/5 group-hover:scale-105 transition-transform shrink-0">
                    {getIcon(d.filename)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black truncate text-slate-800 dark:text-white tracking-tight">{d.filename}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[8px] text-slate-500 font-bold uppercase">{d.size}</span>
                      <span className="text-[8px] opacity-30 text-slate-500">•</span>
                      <span className="text-[8px] text-slate-500 font-bold uppercase">{formatDate(d.timestamp)}</span>
                    </div>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-[7px] font-black tracking-widest ${d.status === 'completed' ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-500 border border-green-200 dark:border-green-500/20' : 'bg-orange-100 dark:bg-dragon-ember/10 text-orange-600 dark:text-dragon-ember animate-pulse border border-orange-200 dark:border-dragon-ember/20'}`}>
                    {d.status.toUpperCase()}
                  </div>
                </div>

                {d.status === 'downloading' && (
                  <div className="w-full h-1 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-dragon-ember transition-all duration-500" 
                      style={{ width: `${d.progress}%` }} 
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenFile(d)}
                    disabled={d.status !== 'completed'}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-dragon-ember/50 hover:text-dragon-ember text-slate-500 dark:text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
                  >
                    {categorizeFile(d.filename) === 'VIDEOS' || categorizeFile(d.filename) === 'AUDIOS' ? (
                      <><PlayCircle size={14} /> Play Now</>
                    ) : categorizeFile(d.filename) === 'IMAGES' ? (
                      <><Eye size={14} /> View Matrix</>
                    ) : 'Open File'}
                  </button>
                  <button 
                    onClick={() => handleShare(d)}
                    disabled={d.status !== 'completed'}
                    className="px-4 flex items-center justify-center py-2.5 bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-dragon-cyan hover:bg-cyan-50 dark:hover:bg-dragon-cyan/10 rounded-xl border border-slate-200 dark:border-white/10 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Share File"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => removeDownload(d.id)}
                    className="px-4 flex items-center justify-center py-2.5 bg-red-50 dark:bg-red-500/5 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/10 active:scale-95 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="px-6 py-4 opacity-40 dark:opacity-20 text-center pointer-events-none shrink-0">
        <p className="text-[7px] font-black text-slate-500 dark:text-slate-600 tracking-[0.3em] uppercase italic">Dragon Engine v1.0.8A • Architect: {architect}</p>
      </div>
    </div>
  );
};
