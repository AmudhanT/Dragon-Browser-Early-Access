
import React from 'react';
import { Camera as CameraIcon, Image as ImageIcon, X } from 'lucide-react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Share } from '@capacitor/share';

interface LensActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LensActionSheet: React.FC<LensActionSheetProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleCapture = async (source: CameraSource) => {
    let image;
    try {
      // 1. Capture/Pick Image
      image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: source
      });

      if (image.path) {
        // 2. Share using System Intent
        // This opens the Android/iOS share sheet. User selects "Lens" or "Search Image".
        await Share.share({
          title: 'Search with Lens',
          url: image.path, 
          dialogTitle: 'Search image with...'
        });
      }
      onClose();
    } catch (error: any) {
      // Ignore user cancellation errors (covers both "cancelled" and "canceled" spellings)
      const msg = (error.message || error.toString()).toLowerCase();
      if (msg.includes('cancelled') || msg.includes('canceled')) {
        onClose();
        return;
      }

      console.error("Lens Capture Error:", error);
      
      // Fallback for web or unexpected errors where image wasn't captured
      if (source === CameraSource.Prompt || !image?.path) {
         window.open('https://lens.google.com/', '_blank');
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-[#1a1a1a] rounded-t-[2rem] sm:rounded-[2rem] border-t sm:border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 via-red-500 to-yellow-500 p-[2px]">
               <div className="w-full h-full bg-[#1a1a1a] rounded-full flex items-center justify-center">
                 <div className="w-4 h-4 rounded-sm border-2 border-white/80" />
               </div>
             </div>
             <div>
               <h3 className="text-sm font-black text-white uppercase tracking-wider">Google Lens</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Visual Search</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 gap-3 flex flex-col">
          <button 
            onClick={() => handleCapture(CameraSource.Camera)}
            className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <CameraIcon size={24} />
            </div>
            <div className="text-left">
              <span className="block text-sm font-bold text-white">Take Photo</span>
              <span className="text-[10px] text-slate-500 font-medium">Take a photo to search</span>
            </div>
          </button>

          <button 
            onClick={() => handleCapture(CameraSource.Photos)}
            className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
              <ImageIcon size={24} />
            </div>
            <div className="text-left">
              <span className="block text-sm font-bold text-white">Select from Gallery</span>
              <span className="text-[10px] text-slate-500 font-medium">Select image from gallery</span>
            </div>
          </button>
        </div>
        
        <div className="p-4 bg-black/20 text-center">
           <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Powered by Google Vision</p>
        </div>
      </div>
    </div>
  );
};
