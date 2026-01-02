
import React, { useMemo } from 'react';
import { Download, Globe, X, File, Video, Music, Image as ImageIcon, Box, FileText } from 'lucide-react';

interface ShareIntentDialogProps {
  url: string;
  onClose: () => void;
  onOpen: () => void;
  onDownload: () => void;
}

export const ShareIntentDialog: React.FC<ShareIntentDialogProps> = ({ url, onClose, onOpen, onDownload }) => {
  const getFileType = (urlString: string) => {
    const ext = urlString.split('.').pop()?.toLowerCase() || '';
    if (['mp4', 'mkv', 'webm', 'mov', 'avi'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'audio';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return 'image';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['zip', 'rar', '7z', 'apk'].includes(ext)) return 'archive';
    return 'web';
  };

  const fileType = useMemo(() => getFileType(url), [url]);
  const isFile = fileType !== 'web';

  const getIcon = () => {
    switch (fileType) {
      case 'video': return <Video className="w-8 h-8 text-red-500" />;
      case 'audio': return <Music className="w-8 h-8 text-green-500" />;
      case 'image': return <ImageIcon className="w-8 h-8 text-purple-500" />;
      case 'pdf': return <FileText className="w-8 h-8 text-orange-500" />;
      case 'archive': return <Box className="w-8 h-8 text-yellow-500" />;
      default: return <Globe className="w-8 h-8 text-blue-500" />;
    }
  };

  const getTitle = () => {
    switch (fileType) {
      case 'video': return 'Video Detected';
      case 'audio': return 'Audio File Detected';
      case 'image': return 'Image Detected';
      case 'pdf': return 'PDF Document';
      case 'archive': return 'Archive File';
      default: return 'Shared Link';
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-[#0f0f0f] rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col p-6 space-y-6 ring-1 ring-white/5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
              {getIcon()}
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">{getTitle()}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Incoming Transmission</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* URL Preview */}
        <div className="bg-black/40 p-4 rounded-xl border border-white/5">
          <p className="text-xs text-slate-300 font-mono break-all line-clamp-3 leading-relaxed opacity-80">
            {url}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {isFile && (
            <button 
              onClick={onDownload}
              className="w-full py-4 bg-dragon-ember hover:bg-orange-600 text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest shadow-lg shadow-dragon-ember/20 active:scale-95 transition-all"
            >
              <Download size={16} /> Download File
            </button>
          )}
          
          <button 
            onClick={onOpen}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest active:scale-95 transition-all border ${isFile ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-dragon-cyan hover:bg-cyan-600 text-black shadow-lg shadow-cyan-500/20 border-transparent'}`}
          >
            <Globe size={16} /> {isFile ? 'Open in Browser' : 'Open Link'}
          </button>
        </div>

      </div>
    </div>
  );
};
