import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  AppSettings,
  HistoryItem,
  Bookmark,
  DownloadItem,
  BrowserViewMode,
  ActiveMedia,
  NoteItem,
  SitePermissions,
  DownloadPriority,
  ImageContextData,
  SavedPage,
  MediaInfoData   // ✅ ADD THIS ONLY
} from './types';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { translations, LANGUAGE_OPTIONS } from './utils/i18n';

/* =========================
   CONTEXT TYPES
========================= */

interface DragonContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;

  history: HistoryItem[];
  addHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;

  bookmarks: Bookmark[];
  toggleBookmark: (url: string, title: string) => void;

  downloads: DownloadItem[];
  addDownload: (url: string, filename: string) => void;
  removeDownload: (id: string) => void;
  removeDownloads: (ids: string[]) => void;

  pauseDownload: (id: string) => void;
  resumeDownload: (id: string) => void;
  cancelDownload: (id: string) => void;
  updateDownloadPriority: (id: string, priority: DownloadPriority) => void;
  moveDownloadOrder: (id: string, direction: 'up' | 'down') => void;

  viewMode: BrowserViewMode;
  setViewMode: (mode: BrowserViewMode) => void;
  navigateTo: (mode: BrowserViewMode) => void;
  navigateBack: () => void;

  notes: NoteItem[];
  addNote: (content: string) => void;
  removeNote: (id: string) => void;
  notesEntrySource: 'menu' | 'pencil';
  setNotesEntrySource: (source: 'menu' | 'pencil') => void;

  sitePermissionRegistry: Record<string, SitePermissions>;
  getSitePermissions: (url: string) => SitePermissions;
  updateSitePermissions: (url: string, updates: Partial<SitePermissions>) => void;
  resetSitePermissions: (url: string) => void;

  savedPages: SavedPage[];
  savePageOffline: (url: string, title: string) => Promise<boolean>;
  deleteSavedPage: (id: string) => Promise<void>;
  getOfflineContent: (url: string) => Promise<string | null>;

  imageContextMenuData: ImageContextData | null;
  openImageContextMenu: (url: string) => void;
  closeImageContextMenu: () => void;

  activeMedia: ActiveMedia | null;
  playMedia: (url: string, filename: string, type: 'video' | 'audio' | 'image') => void;
  closeMedia: () => void;

  mediaInfoData: MediaInfoData | null;
  openMediaInfo: (url: string, type: 'image' | 'video' | 'audio') => void;
  closeMediaInfo: () => void;

  incrementTrackers: (count: number) => void;
  incrementDataSaved: (bytes: number) => void;

  purgeAllData: () => void;

  architect: string;
  t: (key: string) => string;
}

/* =========================
   CONTEXT SETUP
========================= */

const DragonContext = createContext<DragonContextType | undefined>(undefined);

export const useDragon = () => {
  const ctx = useContext(DragonContext);
  if (!ctx) throw new Error('useDragon must be used within DragonProvider');
  return ctx;
};

/* =========================
   PROVIDER
========================= */

export const DragonProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  /* ---------- SETTINGS ---------- */

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('dragon_settings');
    if (!saved) {
      return {
        adBlockEnabled: true,
        javaScriptEnabled: true,
        imagesEnabled: true,
        autoplayEnabled: true,
        popupsEnabled: false,
        language: 'en',
        preferredLanguages: ['en'],
        dataSaved: 0,
        notificationsEnabled: false,
        muteDownloadNotifications: false,
        trackersBlockedTotal: 0,
      } as AppSettings;
    }
    return JSON.parse(saved);
  });

  useEffect(() => {
    localStorage.setItem('dragon_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<AppSettings>) =>
    setSettings(prev => ({ ...prev, ...updates }));

  /* ---------- HISTORY ---------- */

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('dragon_history') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('dragon_history', JSON.stringify(history));
  }, [history]);

  const addHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    setHistory(prev => [
      { ...item, id: crypto.randomUUID(), timestamp: Date.now() },
      ...prev,
    ]);
  };

  const clearHistory = () => setHistory([]);

  /* ---------- BOOKMARKS ---------- */

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const toggleBookmark = (url: string, title: string) => {
    setBookmarks(prev =>
      prev.some(b => b.url === url)
        ? prev.filter(b => b.url !== url)
        : [...prev, { id: crypto.randomUUID(), url, title }]
    );
  };

  /* ---------- DOWNLOADS (SAFE, NO SIMULATION) ---------- */

  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  const addDownload = (url: string, filename: string) => {
    const item: DownloadItem = {
      id: crypto.randomUUID(),
      url,
      filename,
      status: 'queued',
      progress: 0,
      receivedBytes: 0,
      speed: '',
      totalBytes: 0,
      timestamp: Date.now(),
      resumable: false,
      priority: 'normal' as DownloadPriority,
      queueIndex: downloads.length,
      type: 'other',
    };
    setDownloads(prev => [...prev, item]);
  };

  const removeDownload = (id: string) =>
    setDownloads(prev => prev.filter(d => d.id !== id));

  /* ---------- SITE PERMISSIONS ---------- */

  const [sitePermissionRegistry, setSitePermissionRegistry] = useState<
    Record<string, SitePermissions>
  >({});

  const getSitePermissions = (url: string): SitePermissions => {
    try {
      const domain = new URL(url).hostname;
      return sitePermissionRegistry[domain] || {
        javascript: true,
        cookies: true,
        images: true,
        autoplay: true,
        forceDarkMode: false,
        location: 'ask',
        camera: 'ask',
        microphone: 'ask',
        notifications: 'ask',
        media: 'ask',
        sound: 'allow',
        clipboard: 'ask',
        popups: 'block',
        lastModified: 0,
      };
    } catch {
      return {} as SitePermissions;
    }
  };

  const updateSitePermissions = (url: string, updates: Partial<SitePermissions>) => {
    const domain = new URL(url).hostname;
    setSitePermissionRegistry(prev => ({
      ...prev,
      [domain]: { ...prev[domain], ...updates, lastModified: Date.now() },
    }));
  };

  const resetSitePermissions = (url: string) => {
    const domain = new URL(url).hostname;
    setSitePermissionRegistry(prev => {
      const { [domain]: _, ...rest } = prev;
      return rest;
    });
  };

  /* ---------- NOTES ---------- */

  const [notes, setNotes] = useState<NoteItem[]>([]);

  const addNote = (content: string) =>
    setNotes(prev => [
      { id: crypto.randomUUID(), text: content, date: new Date().toDateString() },
      ...prev,
    ]);

  const removeNote = (id: string) =>
    setNotes(prev => prev.filter(n => n.id !== id));

  /* ---------- OFFLINE PAGES ---------- */

  const [savedPages, setSavedPages] = useState<SavedPage[]>([]);

  const savePageOffline = async (url: string, title: string) => {
    try {
      const res = await fetch(url);
      const html = await res.text();
      const filename = `page_${Date.now()}.html`;
      await Filesystem.writeFile({
        path: filename,
        data: html,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
      setSavedPages(p => [
        { id: crypto.randomUUID(), url, title, filename, timestamp: Date.now(), size: html.length },
        ...p,
      ]);
      return true;
    } catch {
      return false;
    }
  };

  const deleteSavedPage = async (id: string) =>
    setSavedPages(p => p.filter(pg => pg.id !== id));

  const getOfflineContent = async (url: string) => {
    const page = savedPages.find(p => p.url === url);
    if (!page) return null;
    const res = await Filesystem.readFile({
      path: page.filename,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
    return res.data as string;
  };

  /* ---------- TRANSLATION ---------- */

  const t = (key: string) =>
    translations[settings.language]?.[key] || key;

  /* ---------- CONTEXT VALUE ---------- */

  return (
  <DragonContext.Provider
    value={{
      settings,
      updateSettings,
      history,
      addHistory,
      clearHistory,
      bookmarks,
      toggleBookmark,
      downloads,
      addDownload,
      removeDownload,

      viewMode: BrowserViewMode.BROWSER,
      setViewMode: () => {},

      notes,
      addNote,
      removeNote,

      sitePermissionRegistry,
      getSitePermissions,
      updateSitePermissions,
      resetSitePermissions,

      savedPages,
      savePageOffline,
      deleteSavedPage,
      getOfflineContent,

      imageContextMenuData: null,
      openImageContextMenu: () => {},
      closeImageContextMenu: () => {},

      cancelDownload,
      purgeAllData,
      openMediaInfo,
      navigateTo,

      t,
    }}
  >
    {children}
  </DragonContext.Provider>
);
