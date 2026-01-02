
import React, { useState, useRef } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download, Maximize, Share2 } from 'lucide-react';
import { ActiveMedia } from '../types';
import { useDragon } from '../DragonContext';

interface ImageViewerProps {
  media: ActiveMedia;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ media, onClose }) => {
  const { openImageContextMenu } = useDragon();
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const longPressTimer = useRef<number | null>(null);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.5, 4));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.5, 0.5));
  const handleRotate = () => setRotation(r => (r + 90) % 360);
  const handleReset = () => { setScale(1); setRotation(0); };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = media.url;
    link.download = media.filename;
    link.click();
  };

  const handleTouchStart = () => {
    longPressTimer.current = window.setTimeout(() => {
      openImageContextMenu(media.url);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col animate-fade-in">
      {/* Top Header Controls */}
      <div className="p-6 flex items-center justify-between bg-gradient-to-b from-black to-transparent z-10">
        <div className="flex items-center gap-4">
           <img src="https://i.ibb.co/CKVTVSbg/IMG-20251221-WA0021.jpg" className="w-8 h-8 rounded-full" alt="" />
           <div className="text-left">
             <h2 className="text-sm font-black text-white italic tracking-tighter uppercase">{media.filename}</h2>
             <p className="text-dragon-cyan text-[8px] font-black uppercase tracking-[0.3em]">Image Viewer</p>
           </div>
        </div>
        
        <div className="flex items-center gap-2">
           <button onClick={handleDownload} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-300 transition-all active:scale-90 border border-white/5">
             <Download size={20} />
           </button>
           <button onClick={onClose} className="p-3 bg-white/5 hover:bg-red-500/20 rounded-2xl text-slate-300 hover:text-red-500 transition-all active:scale-90 border border-white/5">
             <X size={20} />
           </button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
        <img 
          src={media.url}
          alt={media.filename}
          className="max-w-full max-h-full transition-transform duration-300 ease-out shadow-2xl rounded-sm"
          style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }}
          onDoubleClick={handleReset}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onContextMenu={(e) => { e.preventDefault(); openImageContextMenu(media.url); }}
        />
      </div>

      {/* Bottom Floating Controls */}
      <div className="p-8 flex justify-center z-10">
        <div className="bg-dragon-navy/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-3 flex items-center gap-2 shadow-2xl ring-1 ring-white/5">
           <button onClick={handleZoomOut} className="p-4 bg-white/5 hover:bg-white/10 rounded-[2rem] text-slate-300 transition-all active:scale-90"><ZoomOut size={22} /></button>
           <div className="h-8 w-px bg-white/10 mx-2" />
           <button onClick={handleRotate} className="p-4 bg-white/5 hover:bg-white/10 rounded-[2rem] text-slate-300 transition-all active:scale-90"><RotateCw size={22} /></button>
           <div className="h-8 w-px bg-white/10 mx-2" />
           <button onClick={handleZoomIn} className="p-4 bg-dragon-ember text-white rounded-[2rem] shadow-xl shadow-dragon-ember/20 transition-all active:scale-90"><ZoomIn size={22} /></button>
        </div>
      </div>

      {/* Gesture Tip Overlay */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
        <p className="text-[8px] font-black text-white uppercase tracking-[0.5em] italic">Long Press for Options • Double Tap to Reset</p>
      </div>
    </div>
  );
};
