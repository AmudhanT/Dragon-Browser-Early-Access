
import React from 'react';
import { X, ShieldCheck, ShieldAlert, Lock, Zap, EyeOff, Settings } from 'lucide-react';
import { calculatePrivacyScore } from '../utils/privacyUtils';
import { useDragon } from '../DragonContext';

interface PrivacyScoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  onOpenSiteSettings: () => void;
}

export const PrivacyScoreSheet: React.FC<PrivacyScoreSheetProps> = ({ 
  isOpen, onClose, url, onOpenSiteSettings 
}) => {
  const { settings } = useDragon();
  
  if (!isOpen) return null;

  const { grade, color, label, bg, borderColor, details } = calculatePrivacyScore(url, settings);
  const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;

  const factors = [
    { 
      label: 'Connection Security', 
      status: details.https ? 'Secure (HTTPS)' : 'Insecure (HTTP)', 
      active: details.https,
      icon: <Lock size={16} /> 
    },
    { 
      label: 'Tracker Blocking', 
      status: details.trackerBlocking ? 'Active' : 'Disabled', 
      active: details.trackerBlocking,
      icon: <EyeOff size={16} /> 
    },
    { 
      label: 'Ad Blocking', 
      status: details.adBlocking ? 'Active' : 'Disabled', 
      active: details.adBlocking,
      icon: <Zap size={16} /> 
    },
    { 
      label: 'Safe Browsing', 
      status: details.safeBrowsing ? 'Enabled' : 'Disabled', 
      active: details.safeBrowsing,
      icon: <ShieldCheck size={16} /> 
    }
  ];

  return (
    <div className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-[#0a0a0a] rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/5">
        
        {/* Header */}
        <div className="p-6 pb-2 flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Privacy Report</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate mt-1 max-w-[200px]">{domain}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Score Card */}
        <div className="px-6 py-6 flex flex-col items-center">
          <div className={`w-24 h-24 rounded-full border-4 ${borderColor} ${bg} flex items-center justify-center relative mb-4 shadow-[0_0_30px_rgba(0,0,0,0.5)]`}>
            <div className={`absolute inset-0 rounded-full border-4 border-transparent border-t-white/20 animate-spin-slow`} />
            <span className={`text-5xl font-black ${color} tracking-tighter`}>{grade}</span>
            <div className={`absolute -bottom-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#0a0a0a] border border-white/10 text-white shadow-lg`}>
              {label}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 text-center max-w-[80%] leading-relaxed">
            {grade === 'A' ? 'This site is secure and trackers are being blocked.' : 
             grade === 'B' ? 'Good protection, but some features are disabled.' :
             grade === 'C' ? 'Basic security only. Consider enabling more protections.' :
             'Connection insecure or protections disabled. Proceed with caution.'}
          </p>
        </div>

        {/* Factors List */}
        <div className="px-4 pb-6 space-y-2">
          {factors.map((f, i) => (
            <div key={i} className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${f.active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {f.icon}
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-200">{f.label}</div>
                  <div className={`text-[9px] font-bold uppercase tracking-wide ${f.active ? 'text-green-500' : 'text-red-500'}`}>{f.status}</div>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${f.active ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="p-4 bg-black/40 border-t border-white/5">
          <button 
            onClick={onOpenSiteSettings}
            className="w-full py-4 bg-dragon-ember text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-dragon-ember/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Settings size={14} /> Improve Privacy
          </button>
        </div>

      </div>
    </div>
  );
};
