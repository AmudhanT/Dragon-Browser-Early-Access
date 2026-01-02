
import React, { useState } from 'react';
import { useDragon } from '../DragonContext';
import DragonHeader from '../components/DragonHeader';
import { 
  Trash2, Search, Copy, Share2, Calendar, FileText, 
  RotateCcw, Flame, Archive, Library, ChevronLeft
} from 'lucide-react';
import { BrowserViewMode } from '../types';

export const NotesLibrary: React.FC = () => {
  const { notes, deletedNotes, removeNote, recoverNote, permanentlyDeleteNote, setViewMode, notesEntrySource, architect } = useDragon();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active');

  const filteredNotes = notes.filter(n => 
    n.text.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTrash = deletedNotes.filter(n => 
    n.text.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Note copied.");
  };

  const handleMassPurge = () => {
    if (window.confirm("Move all notes to trash?")) {
      notes.forEach(n => removeNote(n.id));
    }
  };

  const handleEmptyTrash = () => {
    if (window.confirm("Permanently delete all notes?")) {
      deletedNotes.forEach(n => permanentlyDeleteNote(n.id));
    }
  };

  const handleBack = () => {
    if (notesEntrySource === 'pencil') {
      setViewMode(BrowserViewMode.BROWSER);
    } else {
      setViewMode(BrowserViewMode.MAIN_MENU);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] text-slate-100 animate-fade-in pb-safe-bottom overflow-hidden">
      <DragonHeader 
        title="NOTES" 
        subtitle="SAVED NOTES" 
        onBack={handleBack}
        rightElement={
          activeTab === 'active' ? (
            notes.length > 0 && (
              <button 
                onClick={handleMassPurge}
                className="p-3 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl flex items-center gap-2 text-[9px] font-black uppercase tracking-widest active:scale-95"
              >
                <Archive size={14} /> Delete All
              </button>
            )
          ) : (
            deletedNotes.length > 0 && (
               <button 
                onClick={handleEmptyTrash}
                className="p-3 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl flex items-center gap-2 text-[9px] font-black uppercase tracking-widest active:scale-95"
              >
                <Flame size={14} /> Empty Trash
              </button>
            )
          )
        }
      />

      {/* Mode Switcher */}
      <div className="flex p-4 gap-2 shrink-0 bg-black/40">
        <button 
          onClick={() => setActiveTab('active')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-[#E11D48] text-white shadow-xl shadow-red-900/20' : 'bg-white/5 text-slate-500'}`}
        >
          <Library size={14} /> Saved ({notes.length})
        </button>
        <button 
          onClick={() => setActiveTab('trash')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'trash' ? 'bg-slate-800 text-white shadow-xl' : 'bg-white/5 text-slate-500'}`}
        >
          <RotateCcw size={14} /> Trash ({deletedNotes.length})
        </button>
      </div>

      <div className="px-6 space-y-6 flex-1 overflow-y-auto no-scrollbar pb-10">
        {/* Search */}
        <div className="relative group mt-4">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700" />
          <input 
            type="text"
            placeholder={activeTab === 'active' ? "Search notes..." : "Search trash..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm text-white placeholder-slate-800 focus:outline-none focus:border-red-500/30 shadow-inner"
          />
        </div>

        {/* Notes Grid */}
        <div className="space-y-4">
          {(activeTab === 'active' ? filteredNotes : filteredTrash).length === 0 ? (
            <div className="py-32 text-center opacity-10">
              <FileText className="w-16 h-16 mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">Grid Empty</p>
            </div>
          ) : (
            (activeTab === 'active' ? filteredNotes : filteredTrash).map((note) => (
              <div 
                key={note.id} 
                className={`p-6 rounded-[2rem] border transition-all ${activeTab === 'active' ? 'bg-[#0a0a0a] border-white/5 hover:border-red-500/20' : 'bg-[#0a0a0a] border-white/5 opacity-60'}`}
              >
                <p className="text-sm text-slate-300 italic leading-relaxed mb-6 whitespace-pre-wrap">"{note.text}"</p>
                
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2 text-[8px] font-black text-slate-600 uppercase tracking-widest">
                    <Calendar size={10} /> {note.date}
                  </div>
                  
                  <div className="flex gap-2">
                    {activeTab === 'active' ? (
                      <>
                        <button onClick={() => handleCopy(note.text)} className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-dragon-cyan transition-colors" title="Copy"><Copy size={14} /></button>
                        <button onClick={() => removeNote(note.id)} className="p-3 bg-red-600/10 rounded-xl text-red-500 hover:bg-red-600 hover:text-white transition-all" title="Delete"><Trash2 size={14} /></button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => recoverNote(note.id)} 
                          className="flex items-center gap-2 px-4 py-2.5 bg-green-600/20 text-green-500 border border-green-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all"
                        >
                          <RotateCcw size={12} /> Restore
                        </button>
                        <button 
                          onClick={() => { if(confirm("Delete permanently?")) permanentlyDeleteNote(note.id); }} 
                          className="p-3 bg-red-600/20 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                          title="Delete Forever"
                        >
                          <Flame size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-6 opacity-20 text-center pointer-events-none shrink-0 bg-black">
        <p className="text-[7px] font-black text-slate-600 tracking-[0.5em] uppercase italic">Dragon Browser • Architect: {architect}</p>
      </div>
    </div>
  );
};
