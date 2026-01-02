
import React, { useState } from 'react';
import { X, Calculator, Palette, Sparkles, Monitor, Search, Globe } from 'lucide-react';
import { ThemeColor, AppSettings, SearchEngine, BrowserViewMode } from '../types';
import { useDragon } from '../DragonContext';

interface TheLairProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeColor;
  onThemeChange: (theme: ThemeColor) => void;
  settings: AppSettings;
  onToggleSetting: (key: keyof AppSettings) => void;
  onEngineChange: (engine: SearchEngine) => void;
  shieldStats: number;
}

export const TheLair: React.FC<TheLairProps> = ({ 
  isOpen, onClose, currentTheme, onThemeChange, settings, onToggleSetting, onEngineChange, shieldStats
}) => {
  const { setViewMode } = useDragon();
  const [activeTab, setActiveTab] = useState<'calc' | 'theme'>('theme');
  const [calcDisplay, setCalcDisplay] = useState("0");

  const themes: { id: ThemeColor; name: string; color: string }[] = [
    { id: 'ember', name: 'Ember', color: '#f97316' },
    { id: 'frost', name: 'Frost', color: '#06b6d4' },
    { id: 'midas', name: 'Midas', color: '#eab308' },
    { id: 'venom', name: 'Venom', color: '#22c55e' },
  ];

  const handleCalc = (val: string) => {
    if (val === 'C') {
      setCalcDisplay("0");
    } else if (val === '=') {
      try {
        const result = new Function(`return ${calcDisplay}`)();
        setCalcDisplay(String(result));
      } catch {
        setCalcDisplay("Error");
      }
    } else {
      setCalcDisplay(prev => (prev === "0" || prev === "Error") ? val : prev + val);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70]" onClick={onClose} />
      )}

      <div className={`
        fixed top-0 right-0 h-full w-85 max-w-[85vw] bg-dragon-dark/95 border-l border-white/10 shadow-2xl z-[80] transform transition-transform duration-500 ease-out flex flex-col backdrop-blur-2xl
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40">
          <div>
             <h2 className="text-xl font-black text-white tracking-tight italic text-dragon-ember uppercase">The Lair</h2>
             <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Architect: Amudhan T</p>
          </div>
          <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex p-3 gap-2 bg-black/20 overflow-x-auto no-scrollbar">
          {[
            { id: 'theme', icon: <Palette className="w-4 h-4" />, label: 'Style' },
            { id: 'calc', icon: <Calculator className="w-4 h-4" />, label: 'Matrix' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl text-[9px] font-black transition-all whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-gradient-to-br from-[var(--theme-color)] to-dragon-dark text-white shadow-xl scale-105 ring-1 ring-white/20' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
              `}
            >
              {tab.icon}
              {tab.label.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-24">
          
          {activeTab === 'theme' && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-l-2 border-dragon-ember pl-3">Essence Sync</h3>
                <div className="grid grid-cols-2 gap-4">
                  {themes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => onThemeChange(t.id)}
                      className={`
                        relative p-4 rounded-2xl border transition-all flex flex-col gap-3 overflow-hidden group
                        ${currentTheme === t.id ? 'border-[var(--theme-color)] bg-[var(--theme-color)]/10 shadow-lg shadow-[var(--theme-color)]/10' : 'border-white/5 bg-white/5 hover:border-white/20'}
                      `}
                    >
                      <div className="w-10 h-10 rounded-full shadow-2xl border-4 border-black/20" style={{ backgroundColor: t.color }} />
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-l-2 border-dragon-cyan pl-3">The Search Engines</h3>
                <div className="flex flex-col gap-2 p-3 bg-black/40 rounded-[2rem] border border-white/5">
                  {[
                    { id: 'dragon', name: 'Dragon Engine', icon: <Sparkles className="w-4 h-4" />, color: 'text-dragon-ember' },
                    { id: 'google', name: 'Google Global', icon: <Globe className="w-4 h-4" />, color: 'text-blue-500' },
                    { id: 'bing', name: 'Microsoft Bing', icon: <Search className="w-4 h-4" />, color: 'text-cyan-500' },
                  ].map(engine => (
                    <button
                      key={engine.id}
                      onClick={() => onEngineChange(engine.id as SearchEngine)}
                      className={`
                        flex items-center justify-between p-4 rounded-xl transition-all border
                        ${settings.searchEngine === engine.id 
                          ? 'bg-white/10 border-white/20 text-white shadow-lg' 
                          : 'border-transparent text-slate-500 hover:bg-white/5'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={engine.color}>{engine.icon}</div>
                        <span className="text-xs font-black uppercase tracking-tight">{engine.name}</span>
                      </div>
                      {settings.searchEngine === engine.id && (
                        <div className="w-2 h-2 rounded-full bg-[var(--theme-color)] shadow-[0_0_8px_var(--theme-color)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calc' && (
            <div className="space-y-6 animate-fade-in">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-l-2 border-dragon-cyan pl-3">Neural Matrix</h3>
               <div className="bg-gradient-to-br from-dragon-navy to-black p-4 rounded-[2rem] border border-white/10 shadow-2xl">
                <div className="bg-black/50 p-6 rounded-2xl mb-4 text-right text-3xl font-mono text-dragon-cyan tracking-widest overflow-hidden h-20 flex items-center justify-end border border-white/5 shadow-inner">
                  {calcDisplay}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'].map(btn => (
                    <button
                      key={btn}
                      onClick={() => handleCalc(btn)}
                      className={`
                        h-14 rounded-xl font-black text-lg transition-all shadow-lg active:scale-90
                        ${btn === '=' 
                          ? 'bg-dragon-cyan text-white shadow-dragon-cyan/30' 
                          : btn === 'C' 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'}
                      `}
                    >
                      {btn}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
