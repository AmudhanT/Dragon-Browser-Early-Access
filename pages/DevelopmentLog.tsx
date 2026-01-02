
import React from 'react';
import { useDragon } from '../DragonContext';
import DragonHeader from '../components/DragonHeader';
// Fix: Added missing Download and Mic icon imports from lucide-react
import { ScrollText, Sparkles, Zap, Shield, Rocket, Palette, Globe, Lock, Cpu, Layout, Globe2, Download, Mic } from 'lucide-react';
import { BrowserViewMode } from '../types';

export const DevelopmentLog: React.FC = () => {
  const { setViewMode, architect } = useDragon();

  const logs = [
    {
      version: 'v1.1.0',
      status: 'Latest',
      icon: <Rocket className="w-4 h-4 text-dragon-ember" />,
      content: 'Major Rebrand: Transitioned from Dragon Search to Dragon Browser. Enhanced Feedback channel with direct email sync to architect. Refined Privacy Policy with brief, actionable notes. Optimized Bottom Navigation bar for rapid site actions.'
    },
    {
      version: 'v1.0.8A',
      status: 'Stable',
      icon: <Download className="w-4 h-4 text-purple-400" />,
      content: 'Integrated the Downloads module with multi-category filters (APKs, Archives, Media). Added native sharing protocols and high-fidelity media playback for downloaded fragments.'
    },
    {
      version: 'v1.0.7',
      status: 'Legacy',
      icon: <Palette className="w-4 h-4 text-dragon-cyan" />,
      content: 'Design Overhaul: Finalized circular Speed Dial logic and custom wallpaper engine. Introduced the "The Lair" sidebar for quick access to style and security toggles.'
    },
    {
      version: 'v1.0.5',
      status: 'Legacy',
      icon: <Shield className="w-4 h-4 text-green-500" />,
      content: 'Security Matrix: Implemented Dragon Shield. Added ad-blocking heuristics, tracker incineration, and the Incognito Vault PIN lock system.'
    },
    {
      version: 'v1.0.3',
      status: 'Legacy',
      icon: <Cpu className="w-4 h-4 text-orange-400" />,
      content: 'Neural Integration: First deployment of the AI Search Core using Gemini. Added smart suggestions and web-grounded results for complex queries.'
    },
    {
      version: 'v1.0.2',
      status: 'Legacy',
      icon: <Mic className="w-4 h-4 text-blue-400" />,
      content: 'Interface Sync: Added Voice Search functionality and Google Lens visual search integration. Refined gestures for tab switching.'
    },
    {
      version: 'v1.0.0',
      status: 'Foundation',
      icon: <Globe2 className="w-4 h-4 text-slate-500" />,
      content: 'Initial Release: Core browser engine established. Multi-tab management system and basic history/bookmarks synchronization implemented.'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-dragon-dark text-slate-100 animate-fade-in pb-safe-bottom">
      <DragonHeader 
        title="DEVELOPMENT LOG" 
        subtitle="ARCHITECTURAL CHRONICLES" 
        onBack={() => setViewMode(BrowserViewMode.SETTINGS)}
        rightElement={
          <div className="p-2 bg-dragon-ember/10 rounded-xl border border-dragon-ember/20">
            <ScrollText size={18} className="text-dragon-ember" />
          </div>
        }
      />

      <div className="p-6 space-y-8 flex-1 overflow-y-auto no-scrollbar">
        {logs.map((log, idx) => (
          <div key={log.version} className="relative group">
            {idx !== logs.length - 1 && (
              <div className="absolute top-10 left-[21px] bottom-[-24px] w-0.5 bg-gradient-to-b from-dragon-ember/30 to-transparent" />
            )}
            <div className="flex gap-6 items-start">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border transition-all ${idx === 0 ? 'bg-dragon-ember/20 border-dragon-ember/30' : 'bg-black/40 border-white/5'}`}>
                {log.icon}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-lg font-black tracking-tighter text-white">
                    {log.version}
                  </h3>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${idx === 0 ? 'bg-dragon-ember text-white' : 'bg-white/5 text-slate-500'}`}>
                    {log.status}
                  </span>
                </div>
                <div className="bg-dragon-navy/40 p-5 rounded-[1.5rem] border border-white/5 shadow-xl group-hover:bg-white/5 transition-all">
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    {log.content}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-12 text-center space-y-6">
          <div className="flex flex-col items-center">
            <h4 className="text-dragon-ember text-[10px] font-black tracking-[0.5em] uppercase">Fast • Secure • Private</h4>
            <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/5 inline-block opacity-40">
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Architect: {architect}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
