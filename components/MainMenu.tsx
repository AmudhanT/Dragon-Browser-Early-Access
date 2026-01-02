
import React, { useState, useRef } from 'react';
import { 
  Shield, Moon, Sun, 
  Bookmark, Download, History, Palette, 
  X, ChevronRight, Settings, ChevronLeft, Image as ImageIcon, Layout,
  Camera, Mic, Monitor, Globe, Star, Plus, Check, Upload, ShieldCheck, FileText,
  Smartphone, Pencil, SlidersHorizontal, ToggleLeft, ToggleRight, LayoutGrid, Languages, RotateCcw,
  Zap, Fingerprint, AlertCircle
} from 'lucide-react';
import { useDragon } from '../DragonContext';
import { BrowserViewMode, ThemeMode, ToolbarConfig, Tab } from '../types';
import { getTranslateUrl, isTranslatedUrl, getOriginalUrl } from '../utils/urlUtils';

interface MainMenuProps {
  activeTab?: Tab;
  onNavigate?: (url: string, options?: { isTranslation?: boolean, originalUrl?: string }) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ activeTab, onNavigate }) => {
  const { settings, updateSettings, setViewMode, setNotesEntrySource, bookmarks, history, downloads, notes, navigateTo, t } = useDragon();

  const handleToggleNightMode = () => {
    let nextMode: ThemeMode = 'dark';
    if (settings.themeMode === 'dark') nextMode = 'system';
    else if (settings.themeMode === 'system') nextMode = 'light';
    else if (settings.themeMode === 'light') nextMode = 'dark';
    updateSettings({ themeMode: nextMode });
  };

  const handleToggleAdBlock = () => {
    updateSettings({ adBlockEnabled: !settings.adBlockEnabled });
  };

  const handleToggleTrackerBlocker = () => {
    updateSettings({ trackerBlockingEnabled: !settings.trackerBlockingEnabled });
  };

  const handleToggleDataSaver = () => {
    updateSettings({ dataSaverEnabled: !settings.dataSaverEnabled });
  };

  const handleNavigateTo = (mode: BrowserViewMode) => {
    if (mode === BrowserViewMode.NOTES_LIBRARY) {
      setNotesEntrySource('menu');
    }
    navigateTo(mode);
  };

  const openSettings = () => {
    navigateTo(BrowserViewMode.SETTINGS);
  };

  const openAppearance = () => {
    navigateTo(BrowserViewMode.APPEARANCE);
  };

  const handleTranslate = () => {
    if (!activeTab || !onNavigate) return;
    
    // Logic: If already translated (detected by tab state or URL), revert.
    // If not, translate.
    
    const isTranslated = activeTab.isTranslated || isTranslatedUrl(activeTab.url);

    if (isTranslated) {
      // Revert to original
      const originalUrl = activeTab.originalUrl || getOriginalUrl(activeTab.url);
      onNavigate(originalUrl, { isTranslation: false });
    } else {
      // Translate
      
      // Check if URL is valid for translation (must be http/https)
      if (!activeTab.url.startsWith('http')) {
        alert("Cannot translate this page. Only web pages can be translated.");
        return;
      }

      // Priority: 1. First Preferred Language, 2. App Language, 3. English
      const targetLang = settings.preferredLanguages?.[0] || settings.language || 'en';
      // Google Translate uses 2-letter codes mostly (e.g. 'ta' not 'ta-IN')
      const langCode = targetLang.split('-')[0];
      const encodedUrl = encodeURIComponent(activeTab.url);
      
      const targetUrl = `https://translate.google.com/translate?sl=auto&tl=${langCode}&u=${encodedUrl}`;
      
      // Store original URL in tab state so we can revert later
      onNavigate(targetUrl, { isTranslation: true, originalUrl: activeTab.url });
    }
    // Close menu to show result
    setViewMode(BrowserViewMode.BROWSER);
  };

  const getThemeLabel = () => {
    if (settings.themeMode === 'dark') return t('dark');
    if (settings.themeMode === 'light') return t('light');
    return t('auto');
  };

  const isPageTranslatable = activeTab && activeTab.url && !activeTab.url.startsWith('dragon://');
  const isCurrentlyTranslated = activeTab && (activeTab.isTranslated || isTranslatedUrl(activeTab.url));

  // Check if we should offer translation (optional logic, but here we just show the button)
  const shouldShowTranslate = settings.translationSettings?.offerTranslate ?? true;

  // Resolve target language label for display
  const targetLangCode = settings.preferredLanguages?.[0] || settings.language || 'en';
  // Attempt to find label in LANGUAGE_OPTIONS via i18n import if possible, or just show code
  // For simplicity, we just use the code logic here or rely on the fact user knows their pref.

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 animate-fade-in overflow-y-auto no-scrollbar transition-colors duration-300">
      {/* Top Bar */}
      <div className="px-6 pt-safe-top flex justify-between items-center h-16 shrink-0">
        <button 
          onClick={() => setViewMode(BrowserViewMode.BROWSER)}
          className="p-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-2xl text-slate-400 hover:text-dragon-ember transition-all active:scale-90 shadow-sm"
        >
          <X size={22} />
        </button>

        <button 
          onClick={openSettings}
          className="p-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-2xl text-slate-400 hover:text-dragon-ember transition-all active:scale-90 shadow-sm"
        >
          <Settings size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
        
        {/* Quick Toggles */}
        <div className="grid grid-cols-2 gap-4">
          {/* Theme Mode */}
          <button 
            onClick={handleToggleNightMode}
            className="p-5 rounded-[2rem] border bg-white dark:bg-[#151515] border-slate-200 dark:border-white/5 flex flex-col gap-4 relative overflow-hidden transition-all active:scale-[0.98] hover:border-slate-300 dark:hover:border-white/10 shadow-sm text-left"
          >
            <div className="flex justify-between items-start w-full">
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                {settings.themeMode === 'light' ? <Sun size={20} /> : settings.themeMode === 'dark' ? <Moon size={20} /> : <Smartphone size={20} />}
              </div>
            </div>
            <div>
              <span className="text-[13px] font-black uppercase tracking-tight block text-slate-800 dark:text-slate-200">{t('system_mode')}</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{getThemeLabel()}</span>
            </div>
          </button>

          {/* Adblock */}
          <button 
            onClick={handleToggleAdBlock}
            className={`p-5 rounded-[2rem] border flex flex-col gap-4 relative overflow-hidden transition-all active:scale-[0.98] text-left ${settings.adBlockEnabled ? 'bg-dragon-navy border-dragon-ember/30 shadow-lg shadow-dragon-ember/10' : 'bg-white dark:bg-[#151515] border-slate-200 dark:border-white/5'}`}
          >
            <div className="flex justify-between items-start w-full relative z-10">
              <div className={`p-3 rounded-2xl ${settings.adBlockEnabled ? 'bg-dragon-ember/20 text-dragon-ember' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                <Shield size={20} />
              </div>
              <div className={`w-2 h-2 rounded-full ${settings.adBlockEnabled ? 'bg-dragon-ember animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
            </div>
            <div className="relative z-10">
              <span className={`text-[13px] font-black uppercase tracking-tight block ${settings.adBlockEnabled ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>Adblock</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{settings.adBlockEnabled ? 'On' : 'Off'}</span>
            </div>
            {settings.adBlockEnabled && <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-dragon-ember/5 rounded-full blur-2xl" />}
          </button>

          {/* Tracker Blocker */}
          <button 
            onClick={handleToggleTrackerBlocker}
            className={`p-5 rounded-[2rem] border flex flex-col gap-4 relative overflow-hidden transition-all active:scale-[0.98] text-left ${settings.trackerBlockingEnabled ? 'bg-dragon-navy border-purple-500/30 shadow-lg shadow-purple-500/10' : 'bg-white dark:bg-[#151515] border-slate-200 dark:border-white/5'}`}
          >
            <div className="flex justify-between items-start w-full relative z-10">
              <div className={`p-3 rounded-2xl ${settings.trackerBlockingEnabled ? 'bg-purple-500/20 text-purple-500' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                <Fingerprint size={20} />
              </div>
              <div className={`w-2 h-2 rounded-full ${settings.trackerBlockingEnabled ? 'bg-purple-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
            </div>
            <div className="relative z-10">
              <span className={`text-[13px] font-black uppercase tracking-tight block ${settings.trackerBlockingEnabled ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>Anti-Track</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{settings.trackerBlockingEnabled ? 'Active' : 'Off'}</span>
            </div>
            {settings.trackerBlockingEnabled && <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />}
          </button>

          {/* Data Saver */}
          <button 
            onClick={handleToggleDataSaver}
            className={`p-5 rounded-[2rem] border flex flex-col gap-4 relative overflow-hidden transition-all active:scale-[0.98] text-left ${settings.dataSaverEnabled ? 'bg-dragon-navy border-green-500/30 shadow-lg shadow-green-500/10' : 'bg-white dark:bg-[#151515] border-slate-200 dark:border-white/5'}`}
          >
            <div className="flex justify-between items-start w-full relative z-10">
              <div className={`p-3 rounded-2xl ${settings.dataSaverEnabled ? 'bg-green-500/20 text-green-500' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                <Zap size={20} />
              </div>
              <div className={`w-2 h-2 rounded-full ${settings.dataSaverEnabled ? 'bg-green-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
            </div>
            <div className="relative z-10">
              <span className={`text-[13px] font-black uppercase tracking-tight block ${settings.dataSaverEnabled ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>Data Saver</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{settings.dataSaverEnabled ? 'On' : 'Off'}</span>
            </div>
            {settings.dataSaverEnabled && <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-green-500/5 rounded-full blur-2xl" />}
          </button>
        </div>

        {/* Page Actions */}
        {isPageTranslatable && shouldShowTranslate && (
          <div className="w-full">
            <button 
              onClick={handleTranslate}
              className={`w-full p-5 rounded-[2rem] border flex items-center justify-between transition-all active:scale-[0.98] shadow-sm group ${
                isCurrentlyTranslated 
                  ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30' 
                  : 'bg-white dark:bg-[#151515] border-slate-200 dark:border-white/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${isCurrentlyTranslated ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}>
                  {isCurrentlyTranslated ? <RotateCcw size={20} /> : <Languages size={20} />}
                </div>
                <div className="text-left">
                  <span className={`text-[13px] font-black uppercase tracking-tight block ${isCurrentlyTranslated ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {isCurrentlyTranslated ? 'Show Original' : 'Translate Page'}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    {isCurrentlyTranslated ? 'Revert Translation' : `To ${targetLangCode.split('-')[0].toUpperCase()}`}
                  </span>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
            </button>
          </div>
        )}

        {/* Feature Grid */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">{t('essentials')}</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'bookmarks', label: t('bookmarks'), icon: <Bookmark size={20} />, color: 'text-orange-500', bg: 'bg-orange-500/10', count: bookmarks.length, action: () => handleNavigateTo(BrowserViewMode.BOOKMARKS) },
              { id: 'downloads', label: t('downloads'), icon: <Download size={20} />, color: 'text-green-500', bg: 'bg-green-500/10', count: downloads.length, action: () => handleNavigateTo(BrowserViewMode.DOWNLOADS) },
              { id: 'history', label: t('history'), icon: <History size={20} />, color: 'text-blue-500', bg: 'bg-blue-500/10', count: history.length, action: () => handleNavigateTo(BrowserViewMode.HISTORY) },
              { id: 'notes', label: t('notes'), icon: <FileText size={20} />, color: 'text-pink-500', bg: 'bg-pink-500/10', count: notes.length, action: () => handleNavigateTo(BrowserViewMode.NOTES_LIBRARY) },
            ].map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className="flex flex-col gap-3 p-5 bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/5 rounded-[2rem] hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-all text-left shadow-sm active:scale-95"
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.bg} ${item.color}`}>
                  {item.icon}
                </div>
                <div>
                  <span className="text-[12px] font-black uppercase text-slate-800 dark:text-slate-200 block tracking-tight">{item.label}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.count} {t('items')}</span>
                </div>
              </button>
            ))}
            
            {/* Appearance Button */}
            <button
              onClick={openAppearance}
              className="flex flex-col gap-3 p-5 bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/5 rounded-[2rem] hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-all text-left shadow-sm active:scale-95 col-span-2"
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-purple-500/10 text-purple-500">
                <Palette size={20} />
              </div>
              <div>
                <span className="text-[12px] font-black uppercase text-slate-800 dark:text-slate-200 block tracking-tight">{t('appearance')}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('customize_look')}</span>
              </div>
            </button>
          </div>
        </div>
        
        <div className="h-6" />
      </div>
    </div>
  );
};
