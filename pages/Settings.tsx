import React, { useRef, useState } from 'react';
import { useDragon } from '../DragonContext';
import DragonHeader from '../components/DragonHeader';
import {
  Palette,
  ChevronRight,
  ShieldCheck,
  Clock,
  Trash2,
  LayoutGrid,
  Sun,
  Moon,
  Info,
  Globe,
  Database,
  Ghost,
  Settings as SettingsIcon,
  Languages,
  Volume2,
  Clipboard,
  ChevronDown,
  CheckCircle,
  Shield,
  Radar,
} from 'lucide-react';

import {
  AppSettings,
  ThemeMode,
  ToolbarConfig,
  PermissionState,
  BrowserViewMode,
} from '../types';

import { LANGUAGE_OPTIONS } from '../utils/i18n';

/* =========================
   SETTINGS PAGE
========================= */

const Settings: React.FC = () => {
  const {
    settings,
    updateSettings,
    viewMode,
    setViewMode,
    navigateBack,
    t,
    purgeAllData,
  } = useDragon();

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  /* =========================
     UI
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
      <button
        onClick={onToggle}
        className={`w-12 h-7 rounded-full relative ${
          value ? 'bg-dragon-ember' : 'bg-slate-300'
        }`}
      >
        <div
          className={`absolute top-1 w-5 h-5 bg-white rounded-full transition ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
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
        { id: BrowserViewMode.LANGUAGES, label: t('languages'), icon: <Languages size={18} /> },
        { id: BrowserViewMode.ABOUT, label: t('about'), icon: <Info size={18} /> },
      ].map(item => (
        <button
          key={item.id}
          onClick={() => setViewMode(item.id)}
          className="w-full flex items-center gap-4 p-5 bg-white dark:bg-dragon-navy/50 rounded-2xl border"
        >
          {item.icon}
          <span className="flex-1 text-left text-xs font-bold uppercase">
            {item.label}
          </span>
          <ChevronRight size={18} />
        </button>
      ))}
    </div>
  );

  /* =========================
     PRIVACY PAGE
  ========================= */

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      {renderToggle(
        'Ad Blocker',
        settings.adBlockEnabled,
        () => handleToggle('adBlockEnabled'),
        <Shield />
      )}
      {renderToggle(
        'Do Not Track',
        settings.doNotTrack,
        () => handleToggle('doNotTrack'),
        <Radar />
      )}

      <button
        onClick={() => {
          if (confirm('Delete all data?')) purgeAllData();
        }}
        className="w-full p-4 bg-red-500/10 text-red-500 rounded-xl font-bold"
      >
        <Trash2 size={16} /> Clear All Data
      </button>
    </div>
  );

  /* =========================
     VIEW SWITCH
  ========================= */

  const renderContent = () => {
    switch (viewMode) {
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
