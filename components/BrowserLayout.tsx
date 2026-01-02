
import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Tab, ThemeColor, AppSettings, SearchEngine, BrowserViewMode } from '../types';
import { LairSidebar } from './LairSidebar';
import { TabStrip } from './TabStrip';

interface BrowserLayoutProps {
  activeTab: Tab;
  tabs: Tab[];
  theme: ThemeColor;
  settings: AppSettings;
  onThemeChange: (t: ThemeColor) => void;
  onToggleSetting: (k: keyof AppSettings) => void;
  onEngineChange: (e: SearchEngine) => void;
  onNavigateTo: (mode: BrowserViewMode) => void;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onCreateTab: () => void;
  pageContentForAI: string;
  children: React.ReactNode;
}

export const BrowserLayout: React.FC<BrowserLayoutProps> = ({
  activeTab, tabs, theme, settings,
  onThemeChange, onToggleSetting, onEngineChange, onNavigateTo, onSelectTab, onCloseTab, onCreateTab,
  pageContentForAI, children
}) => {
  const [showLair, setShowLair] = useState(false);
  
  const getThemeColors = () => {
    switch(theme) {
      case 'frost': return { main: '#06b6d4', glow: 'rgba(6, 182, 212, 0.5)' };
      case 'midas': return { main: '#eab308', glow: 'rgba(234, 179, 8, 0.5)' };
      case 'venom': return { main: '#22c55e', glow: 'rgba(34, 197, 94, 0.5)' };
      case 'ember': default: return { main: '#f97316', glow: 'rgba(249, 115, 22, 0.5)' };
    }
  };
  const themeColors = getThemeColors();

  return (
    <div 
      className="flex flex-col h-full w-full bg-dragon-dark text-slate-100 overflow-hidden relative"
      style={{ 
        '--theme-color': themeColors.main, 
        '--theme-color-glow': themeColors.glow 
      } as React.CSSProperties}
    >
      {/* Secondary Top Control (Tabs & AI) */}
      <div className="flex flex-col z-40 bg-dragon-navy/50 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2 px-3 py-1 bg-black/20">
          <div className="flex-1 overflow-hidden">
            <TabStrip 
              tabs={tabs} 
              activeTabId={activeTab.id} 
              onSelectTab={onSelectTab} 
              onCloseTab={onCloseTab} 
              onCreateTab={onCreateTab}
              accentColor={themeColors.main}
            />
          </div>

          <button 
            onClick={() => setShowLair(true)}
            className="p-2 text-slate-500 hover:text-white rounded-xl"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>

      <LairSidebar 
        isOpen={showLair} 
        onClose={() => setShowLair(false)} 
        currentTheme={theme}
        onThemeChange={onThemeChange}
        settings={settings}
        onToggleSetting={onToggleSetting}
        onEngineChange={onEngineChange}
        shieldStats={settings.trackersBlockedTotal} 
      />

      {/* Page Content */}
      <div className="flex-1 relative overflow-hidden bg-dragon-dark">
        {children}
      </div>
    </div>
  );
};
