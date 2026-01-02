
import React, { useState } from 'react';
import { Plus, Shield, X, Globe, Lock, Ghost, Trash2, Layers, FolderPlus, Folder, Edit3, Palette, Check, Copy, Pin, RotateCcw } from 'lucide-react';
import { Tab, TabGroup } from '../types';

interface TabSwitcherProps {
  tabs: Tab[];
  tabGroups: TabGroup[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onDuplicateTab: (id: string) => void;
  onCreateTab: (isPrivate?: boolean, groupId?: string) => void;
  onCreateGroup: (title: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onUpdateGroup: (groupId: string, updates: Partial<TabGroup>) => void;
  onMoveTabToGroup: (tabId: string, groupId?: string) => void;
  onClose: () => void;
  onCloseIncognito: () => void;
  onCloseAll: () => void;
  onTogglePin: (id: string) => void;
  onRestoreClosedTab?: () => void;
  canRestoreTab?: boolean;
}

export const TabSwitcher: React.FC<TabSwitcherProps> = ({
  tabs,
  tabGroups,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onDuplicateTab,
  onCreateTab,
  onCreateGroup,
  onDeleteGroup,
  onUpdateGroup,
  onMoveTabToGroup,
  onClose,
  onCloseAll,
  onTogglePin,
  onRestoreClosedTab,
  canRestoreTab
}) => {
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  
  // Drag and Drop State
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);

  // Editing Group State
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const GROUP_COLORS = ['#f97316', '#06b6d4', '#eab308', '#22c55e', '#ef4444', '#a855f7'];

  const handleCreateGroup = () => {
    if (newGroupTitle.trim()) {
      onCreateGroup(newGroupTitle);
      setNewGroupTitle('');
      setIsCreatingGroup(false);
    }
  };

  const startEditingGroup = (group: TabGroup) => {
    setEditingGroupId(group.id);
    setEditTitle(group.title);
  };

  const saveEditingGroup = (groupId: string) => {
    onUpdateGroup(groupId, { title: editTitle });
    setEditingGroupId(null);
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTabId(tabId);
    e.dataTransfer.setData('text/plain', tabId);
    e.dataTransfer.effectAllowed = 'move';
    // Add a ghost image or styling if needed
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetGroupId?: string) => {
    e.preventDefault();
    const tabId = e.dataTransfer.getData('text/plain');
    if (tabId && tabId !== 'undefined') {
      onMoveTabToGroup(tabId, targetGroupId);
    }
    setDraggedTabId(null);
  };

  const groupedTabs = tabGroups.map(group => ({
    group,
    tabs: tabs.filter(t => t.groupId === group.id)
  }));

  const ungroupedTabs = tabs.filter(t => !t.groupId);

  const renderTabCard = (tab: Tab) => (
    <div 
      key={tab.id}
      draggable={!tab.isPrivate} // Only normal tabs are draggable for grouping logic usually
      onDragStart={(e) => handleDragStart(e, tab.id)}
      onClick={() => onSelectTab(tab.id)}
      className={`
        relative group flex flex-col rounded-[1.5rem] border-2 transition-all duration-300 overflow-hidden shadow-xl h-40 cursor-grab active:cursor-grabbing
        ${tab.isPrivate ? 'bg-slate-950 shadow-[0_0_20px_rgba(147,51,234,0.15)]' : 'bg-dragon-navy/40'}
        ${activeTabId === tab.id 
          ? (tab.isPrivate ? 'border-purple-500 ring-4 ring-purple-500/20 scale-[1.02]' : 'border-dragon-ember ring-4 ring-dragon-ember/10 scale-[1.02]')
          : (tab.isPrivate ? 'border-purple-500/20 hover:border-purple-500/40' : 'border-white/5 hover:border-white/20')
        }
        ${draggedTabId === tab.id ? 'opacity-50 scale-95 border-dashed' : ''}
      `}
    >
      <div className={`p-3 flex items-center gap-2 border-b shrink-0 ${tab.isPrivate ? 'bg-purple-900/10 border-purple-500/10' : 'bg-black/40 border-white/5'}`}>
        {tab.isPrivate ? (
          <Ghost size={12} className="text-purple-400 shrink-0" />
        ) : (
          <Globe size={12} className="text-dragon-cyan shrink-0" />
        )}
        <span className={`text-[10px] font-black truncate flex-1 uppercase tracking-tighter ${tab.isPrivate ? 'text-purple-100' : 'text-slate-300'}`}>
          {tab.isPrivate && (tab.title === 'Dragon Search' || !tab.title) ? 'Private Tab' : (tab.title || 'Untitled Tab')}
        </span>
        {tab.pinned && (
           <Pin size={10} className="text-dragon-ember rotate-45" fill="currentColor" />
        )}
      </div>

      <div className="flex-1 flex items-center justify-center bg-black/20 p-2 relative">
         <div className={`w-10 h-10 rounded-xl flex items-center justify-center opacity-20 ${tab.isPrivate ? 'bg-purple-500' : 'bg-dragon-cyan'}`}>
            {tab.isPrivate ? <Ghost className="w-5 h-5 text-white" /> : <Globe className="w-5 h-5 text-white" />}
         </div>
      </div>

      <div className="absolute top-2 right-2 flex gap-2">
         <button 
            onClick={(e) => { e.stopPropagation(); onTogglePin(tab.id); }}
            className={`
              w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center transition-colors shadow-lg border
              ${tab.pinned 
                ? 'bg-dragon-ember text-white border-dragon-ember' 
                : 'bg-black/60 border-white/5 text-slate-400 hover:text-dragon-ember'}
            `}
            title={tab.pinned ? "Unpin Tab" : "Pin Tab"}
          >
            <Pin size={12} className={tab.pinned ? 'fill-current' : ''} />
          </button>

         <button 
            onClick={(e) => { e.stopPropagation(); onDuplicateTab(tab.id); }}
            className={`
              w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center transition-colors shadow-lg border
              ${tab.isPrivate 
                ? 'bg-purple-900/40 border-purple-500/20 text-purple-300 hover:text-white hover:bg-purple-600' 
                : 'bg-black/60 border-white/5 text-slate-400 hover:text-dragon-cyan'}
            `}
            title="Duplicate Tab"
          >
            <Copy size={12} />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id); }}
            className={`
              w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center transition-colors shadow-lg border
              ${tab.isPrivate 
                ? 'bg-purple-900/40 border-purple-500/20 text-purple-300 hover:text-white hover:bg-purple-600' 
                : 'bg-black/60 border-white/5 text-slate-400 hover:text-red-400'}
            `}
          >
            <X size={14} />
          </button>
      </div>
    </div>
  );

  const showDeleteAll = tabs.length > 1 || (tabs.length === 1 && tabs[0].url !== 'dragon://home');

  return (
    <div className="flex flex-col h-full bg-dragon-dark text-slate-100 animate-fade-in overflow-hidden relative">
      {/* Safe Zone Header */}
      <div className="flex flex-col bg-dragon-navy/80 border-b border-white/5 backdrop-blur-xl shrink-0 pt-safe-top pb-4 px-6 gap-4 z-10">
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Tabs</h2>
          </div>
          
          <div className="flex gap-2 items-center">
            {canRestoreTab && onRestoreClosedTab && (
              <button 
                onClick={onRestoreClosedTab}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 text-slate-300 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all border border-white/10 hover:bg-white/10"
              >
                <RotateCcw size={12} /> Reopen Tab
              </button>
            )}

            <button 
              onClick={() => setIsCreatingGroup(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 text-dragon-cyan rounded-lg text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all border border-white/10 hover:bg-white/10"
            >
              <FolderPlus size={12} /> New Group
            </button>
            
            {showDeleteAll && (
              confirmDeleteAll ? (
                <div className="flex items-center gap-1 animate-fade-in bg-red-500/10 rounded-lg p-0.5 border border-red-500/20">
                   <button 
                     onClick={() => onCloseAll()}
                     className="px-2 py-1 bg-red-500 text-white rounded-md text-[9px] font-bold uppercase tracking-wide hover:bg-red-600"
                   >
                     Confirm
                   </button>
                   <button 
                     onClick={() => setConfirmDeleteAll(false)}
                     className="px-2 py-1 hover:bg-white/10 text-slate-400 rounded-md"
                   >
                     <X size={12} />
                   </button>
                </div>
              ) : (
                <button 
                  onClick={() => setConfirmDeleteAll(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all border border-red-500/20 hover:bg-red-500/20"
                >
                  <Trash2 size={12} /> Delete All
                </button>
              )
            )}
          </div>
        </div>

        {isCreatingGroup && (
          <div className="flex gap-2 animate-fade-in">
            <input 
              autoFocus
              value={newGroupTitle}
              onChange={(e) => setNewGroupTitle(e.target.value)}
              placeholder="Group Name..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-dragon-ember"
            />
            <button onClick={handleCreateGroup} className="px-4 py-2 bg-dragon-ember text-white rounded-xl text-xs font-bold">Create</button>
            <button onClick={() => setIsCreatingGroup(false)} className="px-3 py-2 bg-white/5 text-slate-400 rounded-xl"><X size={16} /></button>
          </div>
        )}

        <div className="flex gap-3">
          <button 
            onClick={() => onCreateTab(false)}
            className="flex-1 flex items-center justify-center gap-2 p-4 bg-dragon-ember rounded-2xl text-white font-black uppercase text-[10px] tracking-widest transition-transform active:scale-95 shadow-lg shadow-dragon-ember/20"
          >
            <Plus size={16} /> New Tab
          </button>
          
          <button 
            onClick={() => onCreateTab(true)}
            className="flex-1 flex items-center justify-center gap-2 p-4 bg-purple-600 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest transition-transform active:scale-95 shadow-lg shadow-purple-900/20"
          >
            <Shield size={16} /> New Private Tab
          </button>
        </div>
      </div>

      {/* Tab Grid with Groups */}
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar pb-32 space-y-8">
        
        {/* UNGROUPED TABS - Drop Zone */}
        <div 
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, undefined)}
          className={`space-y-3 p-4 rounded-3xl transition-all border-2 border-dashed ${draggedTabId ? 'border-white/10 bg-white/5' : 'border-transparent'}`}
        >
          {ungroupedTabs.length > 0 && (
            <div className="px-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Ungrouped Tabs</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {ungroupedTabs.map(renderTabCard)}
          </div>
          {ungroupedTabs.length === 0 && draggedTabId && (
            <div className="h-20 flex items-center justify-center text-slate-500 text-xs uppercase font-bold">Drop to Ungroup</div>
          )}
        </div>

        {/* TAB GROUPS */}
        {groupedTabs.map(({ group, tabs }) => (
          <div 
            key={group.id} 
            className={`space-y-3 p-4 rounded-3xl transition-all border-2 ${draggedTabId ? 'border-dragon-ember/30 bg-dragon-ember/5' : 'border-white/5 bg-black/20'}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, group.id)}
            style={{ borderColor: draggedTabId ? group.color : undefined }}
          >
            {/* Group Header */}
            <div className="flex items-center justify-between px-1">
              {editingGroupId === group.id ? (
                <div className="flex-1 flex items-center gap-2">
                   <input 
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="bg-black/40 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                   />
                   <div className="flex gap-1">
                     {GROUP_COLORS.map(c => (
                       <button 
                         key={c}
                         onClick={() => onUpdateGroup(group.id, { color: c })}
                         className={`w-4 h-4 rounded-full border ${group.color === c ? 'border-white' : 'border-transparent'}`}
                         style={{ backgroundColor: c }}
                       />
                     ))}
                   </div>
                   <button onClick={() => saveEditingGroup(group.id)} className="p-1 bg-green-500/20 text-green-500 rounded"><Check size={14} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2" style={{ color: group.color }}>
                  <Folder size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">{group.title}</span>
                  <span className="text-[10px] text-slate-500 font-bold">({tabs.length})</span>
                </div>
              )}
              
              <div className="flex gap-2">
                 {editingGroupId !== group.id && (
                    <button onClick={() => startEditingGroup(group)} className="p-1.5 text-slate-400 hover:text-white bg-white/5 rounded-lg">
                      <Edit3 size={12} />
                    </button>
                 )}
                 <button 
                   onClick={() => onCreateTab(false, group.id)} 
                   className="p-1.5 text-slate-400 hover:text-white bg-white/5 rounded-lg" title="Add Tab"
                 >
                   <Plus size={12} />
                 </button>
                 <button 
                   onClick={() => onDeleteGroup(group.id)} 
                   className="p-1.5 text-slate-400 hover:text-red-500 bg-white/5 rounded-lg" title="Delete Group"
                 >
                   <Trash2 size={12} />
                 </button>
              </div>
            </div>
            
            {/* Tabs Grid */}
            {tabs.length === 0 ? (
              <div className="p-6 rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 text-center">
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Drop Tabs Here</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 mt-2">
                {tabs.map(renderTabCard)}
              </div>
            )}
          </div>
        ))}

      </div>

      <div className="p-4 pb-safe-bottom shrink-0 bg-dragon-navy/40 border-t border-white/5 z-40 backdrop-blur-md">
         <button 
           onClick={onClose}
           className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all active:scale-95"
         >
           Close
         </button>
      </div>
    </div>
  );
};
