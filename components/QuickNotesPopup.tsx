
import React, { useState, useEffect } from 'react';
import { X, Trash2, Copy, FileText, Library, CheckCircle, Save } from 'lucide-react';
import { useDragon } from '../DragonContext';
import { BrowserViewMode } from '../types';

interface QuickNotesPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickNotesPopup: React.FC<QuickNotesPopupProps> = ({ isOpen, onClose }) => {
  const [noteContent, setNoteContent] = useState('');
  const [showToast, setShowToast] = useState(false);
  const { addNote, setViewMode, setNotesEntrySource } = useDragon();

  useEffect(() => {
    const saved = localStorage.getItem('dragon_quick_scratchpad');
    if (saved) setNoteContent(saved);
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNoteContent(val);
    localStorage.setItem('dragon_quick_scratchpad', val);
  };

  const handleClear = () => {
    setNoteContent('');
    localStorage.removeItem('dragon_quick_scratchpad');
  };

  const handleCopy = async () => {
    try {
      if (!noteContent.trim()) return;
      await navigator.clipboard.writeText(noteContent);
      triggerToast();
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleSaveToLibrary = () => {
    if (!noteContent.trim()) return;
    addNote(noteContent);
    handleClear(); 
    triggerToast();
  };

  const openLibrary = () => {
    setNotesEntrySource('pencil');
    setViewMode(BrowserViewMode.NOTES_LIBRARY);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-[#0a0a0a] rounded-2xl border border-red-900/30 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col ring-1 ring-red-500/10 transition-all">
        {showToast && (
          <div className="absolute top-0 inset-x-0 z-50 flex justify-center animate-slide-down pointer-events-none pt-4">
            <div className="bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-xl shadow-red-900/40 text-[10px] font-black uppercase tracking-widest border border-white/20">
              <CheckCircle size={14} /> Note Saved
            </div>
          </div>
        )}

        <div className="h-[2px] w-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600 shadow-[0_0_15px_rgba(225,29,72,0.6)]" />
        
        <div className="flex items-center justify-between p-4 bg-black/40 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-red-600 rounded-sm shadow-[0_0_10px_rgba(220,38,38,0.6)] flex items-center justify-center">
               <FileText size={12} className="text-white" strokeWidth={3} />
            </div>
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest leading-none">Quick Notes</h3>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-5 flex-1 min-h-[200px]">
          <textarea
            value={noteContent}
            onChange={handleContentChange}
            placeholder="Type your quick note here..."
            className="w-full h-full bg-transparent border-none outline-none text-slate-300 text-sm font-mono leading-relaxed resize-none placeholder-slate-800"
            autoFocus
          />
        </div>

        <div className="flex items-center gap-2 px-4 pb-4">
            <button 
              onClick={handleSaveToLibrary}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#1a1a1a] border border-white/5 text-slate-400 hover:text-dragon-cyan hover:border-dragon-cyan/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg"
            >
              <Save size={14} /> SAVE TO LIBRARY
            </button>
            <button 
              onClick={openLibrary}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#1a1a1a] border border-white/5 text-slate-400 hover:text-dragon-cyan hover:border-dragon-cyan/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg"
            >
              <Library size={14} /> VIEW ALL
            </button>
        </div>

        <div className="px-5 py-4 flex items-center justify-between bg-black/50 border-t border-white/5">
          <button 
            onClick={handleClear}
            className="flex items-center gap-2.5 text-[10px] font-black text-slate-500 hover:text-red-400 uppercase tracking-widest transition-colors group"
          >
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-red-600/10 transition-colors">
              <Trash2 size={16} />
            </div>
            CLEAR
          </button>

          <button 
            onClick={handleCopy}
            className="flex items-center gap-2.5 px-9 py-3.5 bg-[#e11d48] hover:bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-red-900/40 active:scale-95 transition-all"
          >
            <Copy size={16} />
            COPY
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down {
          animation: slideDown 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};
