
import React from 'react';
import { Lock, Fingerprint, ShieldAlert, Sparkles } from 'lucide-react';
import { useDragon } from '../DragonContext';

export const IncognitoLockScreen: React.FC = () => {
  const { authenticateTabLock, architect } = useDragon();

  return (
    <div className="absolute inset-0 z-[110] flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      {/* Background Blur Effect */}
      <div className="absolute inset-0 bg-dragon-dark/80 backdrop-blur-[40px]" />
      
      <div className="relative z-10 max-w-sm w-full space-y-10">
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
          <div className="absolute -inset-8 bg-dragon-cyan/10 blur-[60px] rounded-full animate-pulse-slow" />
          <div className="relative p-8 bg-dragon-navy/60 rounded-[3rem] border border-dragon-cyan/30 shadow-2xl ring-1 ring-white/5">
            <Lock className="w-16 h-16 text-dragon-cyan animate-float" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Locked</h2>
          <p className="text-slate-400 text-sm font-bold tracking-tight px-4 leading-relaxed">
            Authentication required for Private Tabs.
          </p>
        </div>

        <div className="pt-6">
          <button 
            onClick={authenticateTabLock}
            className="w-full flex items-center justify-center gap-4 py-5 bg-gradient-to-r from-dragon-cyan to-blue-600 text-white rounded-[2.5rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-dragon-cyan/20 active:scale-95 transition-all group"
          >
            <Fingerprint className="w-6 h-6 group-hover:scale-110 transition-transform" />
            Unlock
          </button>
        </div>

        <div className="pt-12 flex flex-col items-center gap-2 opacity-40">
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} className="text-dragon-cyan" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Secure Mode</span>
          </div>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.15em]">
            Lead Architect: {architect}
          </p>
        </div>
      </div>

      <div className="absolute top-10 left-10 opacity-5 pointer-events-none">
        <Sparkles size={120} className="text-white" />
      </div>
    </div>
  );
};
