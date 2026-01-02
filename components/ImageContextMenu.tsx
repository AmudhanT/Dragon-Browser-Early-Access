
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Layers, Shield, Download, Copy, Share2, Globe, Sparkles, Info, ArrowUpRight, Eye, Check } from 'lucide-react';
import { Share } from '@capacitor/share';
import { useDragon } from '../DragonContext';

interface ImageContextMenuProps {
  url: string;
  onClose: () => void;
  onOpenInNewTab?: (url: string) => void;
  onOpenInBackgroundTab?: (url: string) => void;
}

export const ImageContextMenu: React.FC<ImageContextMenuProps> = ({ url, onClose, onOpenInNewTab, onOpenInBackgroundTab }) => {
  const { addDownload, openMediaInfo, playMedia } = useDragon();
  const [copied, setCopied] = useState(false);

  const getFileType = (urlString: string) => {
    const ext = urlString.split('.').pop()?.toLowerCase() || '';
    if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return 'image';
    if (['mp4','webm','mkv','mov'].includes(ext)) return 'video';
    if (['mp3','wav','ogg','m4a'].includes(ext)) return 'audio';
    return 'unknown';
  };

  const fileType = getFileType(url);
  const isImage = fileType === 'image' || fileType === 'unknown'; // Default to image actions if unknown but context opened

  const handleLensSearch = () => {
    const lensUrl = `https://lens.google.com/upload?url=${encodeURIComponent(url)}`;
    window.open(lensUrl, '_blank');
    onClose();
  };

  const handleOpenNewTab = () => {
    if (onOpenInNewTab) {
      onOpenInNewTab(url);
    } else {
      window.open(url, '_blank');
    }
    onClose();
  };

  const handleOpenBackgroundTab = () => {
    if (onOpenInBackgroundTab) {
      onOpenInBackgroundTab(url);
    }
    onClose();
  };

  const handlePreview = () => {
    const filename = url.split('/').pop() || 'Preview';
    // Use 'image' type for preview as it supports zoom/pan
    playMedia(url, filename, fileType === 'unknown' ? 'image' : fileType as any);
    onClose();
  };

  const handleIncognito = () => {
    window.open(url, '_blank'); 
    onClose();
  };

  const handleSave = () => {
    const filename = url.split('/').pop()?.split('?')[0] || `${fileType}-${Date.now()}`;
    addDownload(url, filename);
    onClose();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1000);
    } catch (e) {
      console.error(e);
      onClose();
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'Share Media',
        url: url,
        dialogTitle: 'Share with...'
      });
    } catch (e) {
      console.warn('Share failed', e);
    }
    onClose();
  };

  const handleMediaInfo = () => {
    // Determine type strictly for the info sheet
    const type = fileType === 'unknown' ? 'image' : (fileType as 'image' | 'video' | 'audio');
    openMediaInfo(url, type);
    onClose();
  };

  const menuItems = [
    { icon: <Download size={22} />, label: "Download Image", action: handleSave },
    { icon: <Eye size={22} />, label: "Preview Image", action: handlePreview },
    { icon: <ArrowUpRight size={22} />, label: "Open Image in New Tab", action: handleOpenNewTab },
    { icon: <Layers size={22} />, label: "Open Image in Background Tab", action: handleOpenBackgroundTab },
    { icon: copied ? <Check size={22} className="text-green-500" /> : <Copy size={22} />, label: copied ? "Copied!" : "Copy Image", action: handleCopy, highlight: copied },
    { icon: <Share2 size={22} />, label: "Share Image", action: handleShare },
    { icon: <Shield size={22} />, label: "Open in Incognito", action: handleIncognito },
    { icon: <Info size={22} />, label: "Media Info", action: handleMediaInfo },
  ];

  return (
    <div className="fixed inset-0 z-[250] flex items-end justify-center sm:items-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-sm bg-slate-50 dark:bg-[#1C1C1C] rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden mb-0 sm:mb-4 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex justify-center pt-3 pb-2 shrink-0" onClick={onClose}>
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-white/20 rounded-full" />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="px-4 pb-4 pt-1">
             <div className="flex gap-4 p-4 bg-white dark:bg-white/5 rounded-[16px] border border-slate-200 dark:border-white/5 shadow-sm items-center">
                <div className="w-14 h-14 bg-slate-100 dark:bg-black/40 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-white/5 flex items-center justify-center relative">
                   {isImage ? (
                     <img 
                       src={url} 
                       alt="Preview" 
                       className="w-full h-full object-cover"
                       onError={(e) => {
                         (e.target as HTMLImageElement).style.display = 'none';
                       }} 
                     />
                   ) : (
                     <Globe className="text-slate-500" />
                   )}
                </div>
                <div className="flex-1 min-w-0">
                   <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                     {fileType === 'video' ? 'Video Options' : fileType === 'audio' ? 'Audio Options' : 'Image Tools'}
                   </h3>
                   <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">{new URL(url).hostname}</p>
                </div>
                <div className="p-2 bg-slate-100 dark:bg-white/10 rounded-full text-slate-500 dark:text-slate-400">
                   <Globe size={18} />
                </div>
             </div>
          </div>

          <div className="px-2 pb-6 space-y-1">
            {isImage && (
              <>
                <button 
                  onClick={handleLensSearch}
                  className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl transition-colors group mx-2 mb-2 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300"
                >
                  <div className="p-0.5">
                    <Camera size={24} />
                  </div>
                  <div className="flex-1 text-left">
                     <span className="text-sm font-bold block">Search with Google Lens</span>
                  </div>
                  <Sparkles size={18} className="opacity-70" />
                </button>
                <div className="h-px bg-slate-200 dark:bg-white/10 mx-4 my-2" />
              </>
            )}

            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className={`w-full flex items-center gap-4 px-6 py-3.5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors ${item.highlight ? 'text-green-500' : 'text-slate-700 dark:text-slate-200'}`}
              >
                <div className={`${item.highlight ? 'text-green-500' : 'text-slate-500 dark:text-slate-400'} group-hover:text-slate-900 dark:group-hover:text-white transition-colors`}>
                  {item.icon}
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
