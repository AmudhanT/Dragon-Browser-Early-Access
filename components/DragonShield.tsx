
import React from 'react';
import { 
  Shield, ShieldOff, Activity, 
  Fingerprint, Globe, AlertTriangle, Trash2,
  EyeOff, Zap, CheckCircle, Network
} from 'lucide-react';
import { AppSettings } from '../types';
import { useDragon } from '../DragonContext';

interface DragonShieldProps {
  active: boolean; 
  settings: AppSettings;
  onToggleSetting: (key: keyof AppSettings) => void;
  currentUrl?: string;
}

export const DragonShield: React.FC<DragonShieldProps> = ({ settings, onToggleSetting, currentUrl }) => {
  const { purgeAllData, updateSettings } = useDragon();

  const isSuspicious = currentUrl?.includes('suspicious-site') || 
                       currentUrl?.includes('malware') || 
                       currentUrl?.includes('phishing');

  const handleClearData = () => {
    if (window.confirm('Delete all history and site data? This action cannot be undone.')) {
      purgeAllData();
    }
  };

  const toggleMasterShield = () => {
    const newState = !settings.adBlockEnabled;
    updateSettings({ 
      adBlockEnabled: newState,
      safeBrowsing: newState, 
      dragonBreath: newState,
      stealthFlight: newState
    });
  };

  return (
    <div className={`
      relative overflow-hidden rounded-[2.5rem] border transition-all duration-500 shadow-2xl w-full max-w-md mx-auto
      ${settings.adBlockEnabled 
        ? 'bg-[#0f0f0f] border-dragon-ember/30 shadow-[0_0_60px_rgba(249,115,22,0.15)]' 
        : 'bg-[#0a0a0a] border-white/5 opacity-90'}
    `}>
      {/* Background Effects */}
      {settings.adBlockEnabled && (
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.03)_0%,transparent_50%)] animate-[spin_10s_linear_infinite]" />
        </div>
      )}

      <div className="p-6 relative z-10">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
               {settings.adBlockEnabled && (
                 <>
                   <div className="absolute inset-0 bg-dragon-ember/20 rounded-full animate-ping opacity-50" />
                   <div className="absolute -inset-2 border border-dragon-ember/20 rounded-full animate-[spin_3s_linear_infinite]" style={{ borderTopColor: 'transparent', borderLeftColor: 'transparent' }} />
                 </>
               )}
               <div className={`relative p-3.5 rounded-full transition-all duration-500 ${settings.adBlockEnabled ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30' : 'bg-slate-800 text-slate-500'}`}>
                  {settings.adBlockEnabled ? <Shield className="w-7 h-7" /> : <ShieldOff className="w-7 h-7" />}
               </div>
            </div>
            <div>
              <h2 className="text-lg font-black text-white italic tracking-tighter uppercase leading-none">Dragon Shield</h2>
              <div className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1.5 ${settings.adBlockEnabled ? 'text-dragon-ember' : 'text-slate-500'}`}>
                {settings.adBlockEnabled ? (
                    <><Activity size={10} className="animate-pulse" /> Protection Active</>
                ) : 'Protection Disabled'}
              </div>
            </div>
          </div>

          <button 
            onClick={toggleMasterShield}
            className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner ${settings.adBlockEnabled ? 'bg-dragon-ember' : 'bg-slate-800'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md ${settings.adBlockEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Stats Grid - Single Big Card now */}
        <div className="mb-8">
           <div className="p-6 bg-white/5 rounded-[1.5rem] border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-dragon-ember/5 scale-0 group-hover:scale-100 transition-transform rounded-[1.5rem]" />
              <span className="text-4xl font-black text-white tabular-nums tracking-tighter relative z-10 animate-fade-in">
                 {settings.trackersBlockedTotal.toLocaleString()}
              </span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-2 relative z-10 flex items-center gap-2">
                {settings.trackersBlockedTotal === 0 ? <Shield className="w-3 h-3" /> : <Zap className="w-3 h-3 text-dragon-ember" />}
                Ads & Trackers Blocked
              </span>
           </div>
        </div>

        {isSuspicious && settings.adBlockEnabled && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 animate-pulse">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <div className="flex-1 text-left">
              <span className="text-xs font-black text-red-500 uppercase tracking-wide block">Unsafe Site Detected</span>
              <span className="text-[9px] text-red-400/80 font-bold uppercase tracking-wider">Site flagged as unsafe</span>
            </div>
          </div>
        )}

        {/* Toggles */}
        <div className="space-y-2 mb-8">
          {[
              { id: 'secureDns', label: 'Secure DNS', sub: 'Encrypted Lookups', icon: <Globe size={16} /> },
              { id: 'dragonBreath', label: 'Script Blocker', sub: 'Blocks harmful scripts', icon: <Fingerprint size={16} /> },
              { id: 'stealthFlight', label: 'Anti-Tracking', sub: 'Hides your digital fingerprint', icon: <EyeOff size={16} /> },
          ].map((item) => (
              <button 
              key={item.id}
              onClick={() => onToggleSetting(item.id as keyof AppSettings)}
              className={`flex items-center justify-between w-full p-4 rounded-2xl transition-all border group ${
                  settings[item.id as keyof AppSettings]
                  ? 'bg-white/5 border-dragon-ember/20 shadow-lg shadow-black/20' 
                  : 'bg-transparent border-transparent opacity-60 hover:bg-white/5'
              }`}
              >
              <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl transition-all ${settings[item.id as keyof AppSettings] ? 'bg-dragon-ember/20 text-dragon-ember' : 'bg-slate-800 text-slate-500'}`}>
                  {item.icon}
                  </div>
                  <div className="text-left">
                  <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wide">{item.label}</div>
                  <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{item.sub}</div>
                  </div>
              </div>
              <div className={`w-2 h-2 rounded-full transition-all ${settings[item.id as keyof AppSettings] ? 'bg-dragon-ember shadow-[0_0_8px_orange]' : 'bg-slate-700'}`} />
              </button>
          ))}
        </div>

        <button 
          onClick={handleClearData}
          className="w-full flex items-center justify-center gap-2 py-4 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-red-500/10 hover:border-red-500/30 active:scale-95 group"
        >
          <Trash2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          Clear Browsing Data
        </button>
      </div>
    </div>
  );
};
