
import React, { useState } from 'react';
import { useDragon } from '../DragonContext';
import DragonHeader from '../components/DragonHeader';
import { DragonShield } from '../components/DragonShield';
import { BrowserViewMode } from '../types';
import { Info, Zap, Shield, MousePointerClick, CheckCircle, Lock, Eye, Fingerprint } from 'lucide-react';

export const ShieldPage: React.FC = () => {
  const { settings, updateSettings, setViewMode } = useDragon();
  const [activeTab, setActiveTab] = useState<'how-to' | 'benefits'>('how-to');

  const handleToggleSetting = (key: any) => {
    updateSettings({ [key]: !settings[key as keyof typeof settings] });
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] text-slate-100 animate-fade-in pb-safe-bottom transition-colors duration-300">
      <DragonHeader 
        title="DRAGON SHIELD" 
        subtitle="SECURITY SETTINGS" 
        onBack={() => setViewMode(BrowserViewMode.MAIN_MENU)} 
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
        {/* Main Component */}
        <div className="max-w-md mx-auto">
            <DragonShield 
                settings={settings} 
                active={settings.adBlockEnabled}
                onToggleSetting={handleToggleSetting}
                currentUrl={""} 
            />
        </div>

        {/* Info Section */}
        <div className="max-w-md mx-auto">
          {/* Custom Tabs */}
          <div className="flex p-1 bg-white/5 rounded-2xl mb-6 border border-white/5 relative">
            <div 
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#1a1a1a] rounded-xl shadow-lg transition-all duration-300 ease-out"
                style={{ left: activeTab === 'how-to' ? '4px' : 'calc(50%)' }}
            />
            <button 
              onClick={() => setActiveTab('how-to')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative z-10 ${activeTab === 'how-to' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Guide
            </button>
            <button 
              onClick={() => setActiveTab('benefits')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative z-10 ${activeTab === 'benefits' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Benefits
            </button>
          </div>

          <div className="bg-[#0f0f0f] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden min-h-[300px]">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                <Shield size={120} />
            </div>

            {activeTab === 'how-to' ? (
              <div className="space-y-8 animate-fade-in relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 border border-blue-500/20">
                    <MousePointerClick size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">Guide</h3>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">How it works</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {[
                    { title: "Master Switch", desc: "Toggle the top right switch to instantly arm all defensive layers. The icon glows orange when active." },
                    { title: "Granular Control", desc: "Use the toggle list to enable specific modules like 'Anti-Tracking' for privacy masking." },
                    { title: "Emergency Purge", desc: "Tap 'Clear Browsing Data' to instantly remove cookies, cache, and history from the current session." }
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-5 items-start group">
                      <div className="w-6 h-6 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 transition-all shrink-0 mt-0.5 shadow-inner">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wide group-hover:text-blue-400 transition-colors">{step.title}</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed mt-1.5 font-medium">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-dragon-ember/10 rounded-2xl text-dragon-ember border border-dragon-ember/20">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">Core Advantages</h3>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Why enable defense?</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {[
                    { title: "Ad Blocking", desc: "Blocks ads and popups.", icon: <Zap size={16} /> },
                    { title: "Anti-Fingerprinting", desc: "Masks device identity to prevent cross-site profiling.", icon: <Fingerprint size={16} /> },
                    { title: "Encrypted DNS", desc: "Prevents ISP snooping by encrypting domain requests.", icon: <Lock size={16} /> }
                  ].map((benefit, idx) => (
                    <div key={idx} className="p-5 bg-white/5 rounded-[1.5rem] border border-white/5 hover:border-dragon-ember/30 hover:bg-white/10 transition-all group">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-slate-400 group-hover:text-dragon-ember transition-colors">{benefit.icon}</div>
                        <h4 className="text-[10px] font-black text-slate-200 uppercase tracking-wide group-hover:text-white">{benefit.title}</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-medium pl-7">{benefit.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
