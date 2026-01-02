
import React, { useEffect, useState } from 'react';
import { X, Info, File, HardDrive, Maximize, Globe, Film, Music, Image as ImageIcon } from 'lucide-react';

interface MediaInfoSheetProps {
  url: string | null;
  type: 'image' | 'video' | 'audio' | null;
  onClose: () => void;
}

export const MediaInfoSheet: React.FC<MediaInfoSheetProps> = ({ url, type, onClose }) => {
  const [metadata, setMetadata] = useState<{ size: number | null, mime: string | null, resolution: string | null }>({ size: null, mime: null, resolution: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    setMetadata({ size: null, mime: null, resolution: null });

    const fetchInfo = async () => {
      try {
        // Fetch Headers for Size/Type
        const response = await fetch(url, { method: 'HEAD' });
        const size = response.headers.get('content-length');
        const mime = response.headers.get('content-type');
        
        let resolution = null;

        if (type === 'image') {
           const img = new Image();
           img.src = url;
           await img.decode();
           resolution = `${img.naturalWidth} x ${img.naturalHeight}`;
        } else if (type === 'video') {
           const video = document.createElement('video');
           video.src = url;
           await new Promise((resolve) => {
             video.onloadedmetadata = () => {
               resolution = `${video.videoWidth} x ${video.videoHeight}`;
               resolve(true);
             };
             video.onerror = () => resolve(false);
           });
        }

        setMetadata((prev) => ({
          size: size ? parseInt(size) : prev.size,
          mime: mime || prev.mime,
          resolution: resolution || prev.resolution
        }));
      } catch (e) {
        console.error("Failed to fetch media info", e);
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [url, type]);

  const formatBytes = (bytes: number | null) => {
    if (bytes === null) return 'Unknown Size';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getIcon = () => {
    if (type === 'video') return <Film size={32} className="text-red-500" />;
    if (type === 'audio') return <Music size={32} className="text-green-500" />;
    return <ImageIcon size={32} className="text-purple-500" />;
  };

  if (!url) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center sm:items-center animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      <div 
        className="relative w-full max-w-sm bg-[#1a1a1a] rounded-t-[2rem] sm:rounded-[2rem] border border-white/10 shadow-2xl p-6 space-y-6 ring-1 ring-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
              {getIcon()}
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Media Info</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{type?.toUpperCase() || 'FILE'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="bg-black/40 rounded-2xl p-1 border border-white/5">
           <div className="grid grid-cols-2 divide-x divide-white/5">
              <div className="p-4 flex flex-col gap-1 items-center text-center">
                 <HardDrive size={16} className="text-slate-500 mb-1" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Size</span>
                 <span className="text-sm font-bold text-white">{loading ? '...' : formatBytes(metadata.size)}</span>
              </div>
              <div className="p-4 flex flex-col gap-1 items-center text-center">
                 <Maximize size={16} className="text-slate-500 mb-1" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resolution</span>
                 <span className="text-sm font-bold text-white">{loading ? '...' : (metadata.resolution || 'N/A')}</span>
              </div>
           </div>
        </div>

        <div className="space-y-4">
           <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
              <Globe size={18} className="text-slate-500 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Source URL</p>
                 <p className="text-xs text-slate-300 font-mono break-all leading-relaxed">{url}</p>
              </div>
           </div>

           <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
              <File size={18} className="text-slate-500 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Type</p>
                 <p className="text-xs text-slate-300 font-medium break-all">{loading ? 'Loading...' : (metadata.mime || 'Unknown')}</p>
              </div>
           </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-dragon-ember text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-dragon-ember/20 active:scale-95 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
};
