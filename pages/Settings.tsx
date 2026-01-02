import React, { useRef, useState, useEffect } from 'react';
import { useDragon } from '../DragonContext';
import DragonHeader from '../components/DragonHeader';
import {
  Palette, Search, Check, Monitor,
  ChevronRight, Zap, ShieldCheck,
  Download, Upload,
  Clock, Trash2, LayoutGrid, Sun, Moon,
  Info, Mic, Globe, Sparkles, Plus, Image as ImageIcon, Code, BellOff,
  Camera, RefreshCcw,
  Smartphone, Bell, PlayCircle, Square, MapPin, Cookie, Database, Ghost, FileText,
  Settings as SettingsIcon, Languages,
  WifiOff, Volume2, Clipboard, ChevronDown, CheckCircle, Eraser, Shield, Radar
} from 'lucide-react';

import {
  SearchEngine,
  AppSettings,
  ThemeMode,
  ToolbarConfig,
  PermissionState,
  BrowserViewMode,
} from '../types';

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { LANGUAGE_OPTIONS } from '../utils/i18n';

/* =========================
   WALLPAPERS
========================= */

const WALLPAPER_PRESETS = [
  { id: 'default', name: 'Dragon', url: 'https://i.ibb.co/CKVTVSbg/IMG-20251221-WA0021.jpg' },
  { id: 'void', name: 'Void', url: '' },
  { id: 'neon_tokyo', name: 'Neon City', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1920&auto=format&fit=crop' },
  { id: 'deep_space', name: 'Cosmos', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1920&auto=format&fit=crop' },
];

/* =========================
   SETTINGS PAGE
========================= */

const Settings: React.FC = () => {
  const {
    settings,
    updateSettings,
    setViewMode,
    navigateTo,
    navigateBack,
    t,
    checkAndRequestNotificationPermission,
    purgeAllData,
    architect,
    clearGlobalData,
  } = useDragon();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [clearingState, setClearingState] = useState<string | null>(null);
  const [languageSearchQuery, setLanguageSearchQuery] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* =========================
     SAFETY GUARD
  ========================= */

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        Loading Settings…
      </div>
    );
  }

  /* =========================
     HELPERS
  ========================= */

  const handleToggle = (key: keyof AppSettings) => {
    updateSettings({ [key]: !settings[key] });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateSettings({ wallpaper: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleToolbarToggle = (key: keyof ToolbarConfig) => {
    updateSettings({
      toolbarConfig: {
        ...settings.toolbarConfig,
        [key]: !settings.toolbarConfig[key],
      },
    });
  };

  const handleClearGlobalData = async (type: 'cookies' | 'cache') => {
    setClearingState(type);
    await clearGlobalData(type);
    setTimeout(() => setClearingState(null), 1200);
  };

  /* =========================
     UI COMPONENTS
  ========================= */

  const renderToggle = (
    label: string,
    value: boolean,
    onToggle: () => void,
    icon?: React.ReactNode
  ) => (
    <div className="flex items-center justify-between p-5 bg-white dark:bg-dragon-navy/50 rounded-2xl border">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-xl">{icon}</div>
        <span className="text-xs font-bold uppercase">{label}</span>
      </div>
      <button onClick={onToggle} className="w-12 h-7 rounded-full bg-slate-300">
        <div className={`w-5 h-5 bg-white rounded-full transition ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  /* =========================
     MAIN MENU
  ========================= */

  const renderMainMenu = () => (
    <div className="space-y-4">
      {[
        { id: BrowserViewMode.GENERAL, label: t('general'), icon: <SettingsIcon size={18} /> },
        { id: BrowserViewMode.APPEARANCE, label: t('appearance'), icon: <Palette size={18} /> },
        { id: BrowserViewMode.PRIVACY, label: t('privacy'), icon: <ShieldCheck size={18} /> },
        { id: BrowserViewMode.SITE_SETTINGS, label: t('site_settings'), icon: <Globe size={18} /> },
        { id: BrowserViewMode.STORAGE, label: t('storage'), icon: <Database size={18} /> },
        { id: BrowserViewMode.LANGUAGES, label: t('languages'), icon: <Languages size={18} /> },
        { id: BrowserViewMode.ABOUT, label: t('about'), icon: <Info size={18} /> },
      ].map(item => (
        <button
          key={item.id}
          onClick={() => setViewMode(item.id)}
          className="w-full flex items-center gap-4 p-5 bg-white dark:bg-dragon-navy/50 rounded-2xl border"
        >
          {item.icon}
          <span className="flex-1 text-left text-xs font-bold uppercase">{item.label}</span>
          <ChevronRight size={18} />
        </button>
      ))}
    </div>
  );

  /* =========================
     PRIVACY PAGE (EXAMPLE)
  ========================= */

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      {renderToggle('Ad Blocker', settings.adBlockEnabled, () => handleToggle('adBlockEnabled'), <Shield />)}
      {renderToggle('Do Not Track', settings.doNotTrack, () => handleToggle('doNotTrack'), <Radar />)}

      <button
        onClick={() => {
          if (confirm('Delete all data?')) purgeAllData();
        }}
        className="w-full p-4 bg-red-500/10 text-red-500 rounded-xl font-bold"
      >
        Clear All Data
      </button>
    </div>
  );

  /* =========================
     RENDER SWITCH
  ========================= */

  const renderContent = () => {
    switch (settings.viewMode) {
      case BrowserViewMode.PRIVACY:
        return renderPrivacySettings();
      default:
        return renderMainMenu();
    }
  };

  /* =========================
     FINAL RENDER
  ========================= */

  return (
    <div className="h-full w-full flex flex-col">
      <DragonHeader title={t('settings')} onBack={navigateBack} />
      <div className="flex-1 overflow-y-auto p-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default Settings;
