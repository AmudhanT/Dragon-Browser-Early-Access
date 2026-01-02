
import React, { useState } from 'react';
import { useDragon } from '../DragonContext';
import { 
  X, Shield, Video, Mic, MapPin, 
  Code, Cookie, Square, RotateCcw, ShieldCheck, 
  Image as ImageIcon, Volume2, Clipboard, Bell, ChevronDown, Check, PlayCircle,
  Database, Trash2, Eraser, Moon
} from 'lucide-react';
import { SitePermissions, PermissionState } from '../types';

interface SiteSettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export const SiteSettingsPopup: React.FC<SiteSettingsPopupProps> = ({ isOpen, onClose, url }) => {
  const { getSitePermissions, updateSitePermissions, resetSitePermissions, clearSiteData } = useDragon();
  
  // Track open dropdowns
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [clearingState, setClearingState] = useState<string | null>(null);

  if (!isOpen) return null;

  let domain = "Local Fragment";
  try { domain = new URL(url).hostname; } catch (e) {}
  
  const permissions = getSitePermissions(url);

  // For booleans (JS, Cookies, Images, Autoplay, Force Dark)
  const toggleBoolean = (key: keyof SitePermissions) => {
  updateSitePermissions(url, { [key]: Boolean(!permissions[key]) });
};

  // For tri-state
  const setPermissionState = (key: keyof SitePermissions, state: PermissionState) => {
    updateSitePermissions(url, { [key]: state });
    setOpenDropdown(null);
  };

  const handleClearData = async (type: 'cookies' | 'cache') => {
    setClearingState(type);
    await clearSiteData(url, type);
    setTimeout(() => setClearingState(null), 1000);
  };

  const getStatusColor = (state: PermissionState | boolean) => {
    if (state === true || state === 'allow') return 'text-green-500';
    if (state === false || state === 'block') return 'text-red-500';
    return 'text-blue-400';
  };

  const getStatusText = (state: PermissionState | boolean) => {
    if (state === true || state === 'allow') return 'Allowed';
    if (state === false || state === 'block') return 'Blocked';
    return 'Ask Every Time';
  };

  const PermissionRow = ({ 
    itemKey, 
    label, 
    icon,
    inverseLabel = false
  }: { 
    itemKey: keyof SitePermissions, 
    label: string, 
    icon: React.ReactNode,
    inverseLabel?: boolean
  }) => {
    const rawState = permissions[itemKey];
const isBoolean = typeof rawState === 'boolean' || typeof rawState === 'number';
const currentState = isBoolean ? Boolean(rawState) : rawState;
    const isOpen = openDropdown === itemKey;

    const displayStateText = () => {
      if (!isBoolean) return getStatusText(currentState as PermissionState);
      if (inverseLabel) {
        return currentState ? 'Enabled' : 'Disabled'; // For Force Dark Mode
      }
      return getStatusText(currentState as PermissionState | boolean);
    };

    const displayStateColor = () => {
      if (inverseLabel && isBoolean) {
        return currentState ? 'text-green-500' : 'text-slate-500';
      }
      return getStatusColor(currentState as PermissionState | boolean);
    };

    return (
      <div className="flex flex-col border-b border-white/5 last:border-0">
        <button
          onClick={() => {
            if (isBoolean) toggleBoolean(itemKey);
            else setOpenDropdown(isOpen ? null : (itemKey as string));
          }}
          className="flex items-center justify-between p-4 hover:bg-white/5 transition-all group w-full"
        >
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-xl bg-white/5 text-slate-400 group-hover:text-white transition-colors`}>
              {icon}
            </div>
            <span className="text-sm font-bold text-slate-200 uppercase tracking-tight">{label}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-widest ${displayStateColor()}`}>
              {displayStateText()}
            </span>
            {!isBoolean && (
              <ChevronDown size={14} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            )}
          </div>
        </button>

        {!isBoolean && isOpen && (
          <div className="px-4 pb-4 grid grid-cols-3 gap-2 animate-fade-in bg-black/20 pt-2">
            {(['allow', 'ask', 'block'] as PermissionState[]).map((state) => (
              <button
                key={state}
                onClick={() => setPermissionState(itemKey, state)}
                className={`
                  py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-1
                  ${currentState === state 
                    ? (state === 'allow' ? 'bg-green-500/10 border-green-500/30 text-green-500' : state === 'block' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-blue-500/10 border-blue-500/30 text-blue-400')
                    : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'
                  }
                `}
              >
                {state === currentState && <Check size={10} strokeWidth={4} />}
                {state === 'ask' ? 'Ask' : state}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-[#0a0a0a] rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ring-1 ring-white/5">
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-black/40">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-dragon-ember/10 flex items-center justify-center border border-dragon-ember/20 shadow-lg shadow-dragon-ember/10 shrink-0">
              <ShieldCheck size={20} className="text-dragon-ember" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-black text-white uppercase tracking-tight">Site Settings</h3>
              <p className="text-[9px] font-bold text-dragon-cyan uppercase tracking-widest truncate">{domain}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-all active:scale-90">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Permissions List */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-[#0f0f0f]">
          <PermissionRow itemKey="forceDarkMode" label="Force Dark Mode" icon={<Moon size={16} />} inverseLabel={true} />
          <PermissionRow itemKey="images" label="Images" icon={<ImageIcon size={16} />} />
          <PermissionRow itemKey="autoplay" label="Autoplay Video" icon={<PlayCircle size={16} />} />
          <PermissionRow itemKey="camera" label="Camera" icon={<Video size={16} />} />
          <PermissionRow itemKey="microphone" label="Microphone" icon={<Mic size={16} />} />
          <PermissionRow itemKey="location" label="Location" icon={<MapPin size={16} />} />
          <PermissionRow itemKey="media" label="Photos & Videos" icon={<ImageIcon size={16} />} />
          <PermissionRow itemKey="sound" label="Sound" icon={<Volume2 size={16} />} />
          <PermissionRow itemKey="clipboard" label="Clipboard" icon={<Clipboard size={16} />} />
          <PermissionRow itemKey="notifications" label="Notifications" icon={<Bell size={16} />} />
          <PermissionRow itemKey="popups" label="Pop-ups" icon={<Square size={16} />} />
          <PermissionRow itemKey="javascript" label="JavaScript" icon={<Code size={16} />} />
          <PermissionRow itemKey="cookies" label="Cookies" icon={<Cookie size={16} />} />

          {/* Storage & Data Section */}
          <div className="mt-4 mb-2">
             <div className="px-4 py-2 bg-white/5 flex items-center gap-2 border-y border-white/5">
                <Database size={12} className="text-dragon-ember" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Storage & Data</span>
             </div>
             
             <div className="p-4 grid grid-cols-2 gap-3">
               <button 
                 onClick={() => handleClearData('cookies')}
                 className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all active:scale-95 ${clearingState === 'cookies' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-white/5 border-white/5 text-slate-400 hover:text-red-400 hover:bg-white/10'}`}
               >
                 {clearingState === 'cookies' ? <Check size={18} /> : <Trash2 size={18} />}
                 <span className="text-[9px] font-bold uppercase tracking-wide">{clearingState === 'cookies' ? 'Cleared' : 'Clear Cookies'}</span>
               </button>

               <button 
                 onClick={() => handleClearData('cache')}
                 className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all active:scale-95 ${clearingState === 'cache' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-white/5 border-white/5 text-slate-400 hover:text-orange-400 hover:bg-white/10'}`}
               >
                 {clearingState === 'cache' ? <Check size={18} /> : <Eraser size={18} />}
                 <span className="text-[9px] font-bold uppercase tracking-wide">{clearingState === 'cache' ? 'Cleared' : 'Clear Cache'}</span>
               </button>
             </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-black/60 border-t border-white/5 flex gap-3">
          <button 
            onClick={() => { resetSitePermissions(url); onClose(); }}
            className="flex-1 py-3.5 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 hover:text-red-500 bg-white/5 rounded-xl transition-all uppercase tracking-widest border border-white/5 active:scale-95"
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-3.5 flex items-center justify-center gap-2 text-[10px] font-black text-white bg-dragon-ember rounded-xl transition-all uppercase tracking-widest shadow-xl shadow-dragon-ember/20 active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
