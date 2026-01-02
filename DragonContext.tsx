import React, {
  createContext,
  useContext,
  useState,
  useEffect,
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
  MediaInfoData,
} from './types';

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { translations } from './utils/i18n';

/* =========================
   EXTRA TYPES
========================= */

export interface Shortcut {
  id: string;
  name: string;
  url: string;
}

/* =========================
   CONTEXT TYPES
========================= */

interface DragonContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;

  clearGlobalData: () => void;
  checkAndRequestNotificationPermission: () => Promise<boolean>;

  history: HistoryItem[];
  addHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  removeHistoryItem: (id: string) => void;
  removeHistoryItems: (ids: string[]) => void;

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
  deletedNotes: NoteItem[];
  addNote: (content: string) => void;
  removeNote: (id: string) => void;
  recoverNote: (id: string) => void;
  permanentlyDeleteNote: (id: string) => void;
  notesEntrySource: 'menu' | 'pencil';
  setNotesEntrySource: (s: 'menu' | 'pencil') => void;

  sitePermissionRegistry: Record<string, SitePermissions>;
  getSitePermissions: (url: string) => SitePermissions;
  updateSitePermissions: (url: string, updates: Partial<SitePermissions>) => void;
  resetSitePermissions: (url: string) => void;
  clearSiteData: (url: string, type: 'cookies' | 'cache') => Promise<void>;

  savedPages: SavedPage[];
  savePageOffline: (url: string, title: string) => Promise<boolean>;
  deleteSavedPage: (id: string) => Promise<void>;
  getOfflineContent: (url: string) => Promise<string | null>;

  imageContextMenuData: ImageContextData | null;
  openImageContextMenu: (url: string) => void;
  closeImageContextMenu: () => void;

  activeMedia: ActiveMedia | null;
  playMedia: (
    url: string,
    filename: string,
    type: 'video' | 'audio' | 'image'
  ) => void;
  closeMedia: () => void;

  mediaInfoData: MediaInfoData | null;
  openMediaInfo: (url: string, type: 'image' | 'video' | 'audio') => void;
  closeMediaInfo: () => void;

  speedDial: Shortcut[];
  addShortcut: (name: string, url: string) => void;
  removeShortcut: (id: string) => void;
  updateSpeedDial: (items: Shortcut[]) => void;

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
    return saved
      ? JSON.parse(saved)
      : {
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
        };
  });

  useEffect(() => {
    localStorage.setItem('dragon_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<AppSettings>) =>
    setSettings(prev => ({ ...prev, ...updates }));

  const clearGlobalData = () => {
    localStorage.clear();
    purgeAllData();
  };

  const checkAndRequestNotificationPermission = async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    return (await Notification.requestPermission()) === 'granted';
  };

  /* ---------- HISTORY ---------- */

  const [history, setHistory] = useState<HistoryItem[]>([]);

  const addHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) =>
    setHistory(prev => [
      { ...item, id: crypto.randomUUID(), timestamp: Date.now() },
      ...prev,
    ]);

  const clearHistory = () => setHistory([]);
  const removeHistoryItem = (id: string) =>
    setHistory(prev => prev.filter(h => h.id !== id));
  const removeHistoryItems = (ids: string[]) =>
    setHistory(prev => prev.filter(h => !ids.includes(h.id)));

  /* ---------- BOOKMARKS ---------- */

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const toggleBookmark = (url: string, title: string) =>
    setBookmarks(prev =>
      prev.some(b => b.url === url)
        ? prev.filter(b => b.url !== url)
        : [
            ...prev,
            { id: crypto.randomUUID(), url, title, timestamp: Date.now() },
          ]
    );

  /* ---------- DOWNLOADS ---------- */

  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

const addDownload = (url: string, filename: string) =>
  setDownloads(prev => [
    ...prev,
    {
      id: crypto.randomUUID(),
      url,
      filename,
      status: 'queued',
      progress: 0,
      receivedBytes: 0,
      speed: '',
      totalBytes: 0,
      size: 0, // REQUIRED by DownloadItem
      timestamp: Date.now(),
      resumable: false,
      priority: 'normal',
      queueIndex: prev.length,
      type: 'other',
    },
  ]);

const removeDownload = (id: string) =>
  setDownloads(prev => prev.filter(d => d.id !== id));

const removeDownloads = (ids: string[]) =>
  setDownloads(prev => prev.filter(d => !ids.includes(d.id)));

// ✅ FIXED: signatures now match DragonContextType
const pauseDownload = (_id: string) => {};
const resumeDownload = (_id: string) => {};
const cancelDownload = (_id: string) => {};
const updateDownloadPriority = (
  _id: string,
  _priority: DownloadPriority
) => {};
const moveDownloadOrder = (
  _id: string,
  _direction: 'up' | 'down'
) => {};

  /* ---------- VIEW ---------- */

  const [viewMode, setViewMode] = useState(BrowserViewMode.BROWSER);
  const navigateTo = (mode: BrowserViewMode) => setViewMode(mode);
  const navigateBack = () => setViewMode(BrowserViewMode.BROWSER);

  /* ---------- NOTES ---------- */

  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [deletedNotes, setDeletedNotes] = useState<NoteItem[]>([]);
  const [notesEntrySource, setNotesEntrySource] =
    useState<'menu' | 'pencil'>('menu');

  const addNote = (content: string) =>
    setNotes(prev => [
      { id: crypto.randomUUID(), text: content, date: new Date().toDateString() },
      ...prev,
    ]);

  const removeNote = (id: string) =>
    setNotes(prev => {
      const note = prev.find(n => n.id === id);
      if (note) setDeletedNotes(d => [note, ...d]);
      return prev.filter(n => n.id !== id);
    });

  const recoverNote = (id: string) => {
    const note = deletedNotes.find(n => n.id === id);
    if (!note) return;
    setDeletedNotes(d => d.filter(n => n.id !== id));
    setNotes(n => [note, ...n]);
  };

  const permanentlyDeleteNote = (id: string) =>
    setDeletedNotes(d => d.filter(n => n.id !== id));

  /* ---------- SPEED DIAL ---------- */

  const [speedDial, setSpeedDial] = useState<Shortcut[]>([]);

  const addShortcut = (name: string, url: string) =>
    setSpeedDial(p => [...p, { id: crypto.randomUUID(), name, url }]);

  const removeShortcut = (id: string) =>
    setSpeedDial(p => p.filter(s => s.id !== id));

  const updateSpeedDial = (items: Shortcut[]) => setSpeedDial(items);

  /* ---------- IMAGE / MEDIA ---------- */

  const [imageContextMenuData, setImageContextMenuData] =
    useState<ImageContextData | null>(null);

  const openImageContextMenu = (url: string) =>
    setImageContextMenuData({ url });

  const closeImageContextMenu = () => setImageContextMenuData(null);

  const [activeMedia, setActiveMedia] = useState<ActiveMedia | null>(null);
  const playMedia = (url: string, filename: string, type: any) =>
    setActiveMedia({ url, filename, type });
  const closeMedia = () => setActiveMedia(null);

  const [mediaInfoData, setMediaInfoData] =
    useState<MediaInfoData | null>(null);

  const openMediaInfo = (url: string, type: any) =>
    setMediaInfoData({ url, type });
  const closeMediaInfo = () => setMediaInfoData(null);

  /* ---------- SITE / OFFLINE ---------- */

  const [sitePermissionRegistry, setSitePermissionRegistry] =
    useState<Record<string, SitePermissions>>({});

  const getSitePermissions = (url: string) =>
    sitePermissionRegistry[new URL(url).hostname];

  const updateSitePermissions = (url: string, updates: Partial<SitePermissions>) =>
    setSitePermissionRegistry(prev => ({
      ...prev,
      [new URL(url).hostname]: {
        ...prev[new URL(url).hostname],
        ...updates,
        lastModified: Date.now(),
      },
    }));

  const resetSitePermissions = (url: string) =>
    setSitePermissionRegistry(prev => {
      const c = { ...prev };
      delete c[new URL(url).hostname];
      return c;
    });

  const clearSiteData = async () => {};

  const [savedPages, setSavedPages] = useState<SavedPage[]>([]);

  const savePageOffline = async (url: string, title: string) => {
    const html = await (await fetch(url)).text();
    const filename = `page_${Date.now()}.html`;
    await Filesystem.writeFile({
      path: filename,
      data: html,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
    setSavedPages(p => [
      {
        id: crypto.randomUUID(),
        url,
        title,
        filename,
        timestamp: Date.now(),
        size: html.length,
      },
      ...p,
    ]);
    return true;
  };

  const deleteSavedPage = async (id: string) =>
    setSavedPages(p => p.filter(pg => pg.id !== id));

  const getOfflineContent = async (url: string) => {
    const page = savedPages.find(p => p.url === url);
    if (!page) return null;
    return (
      await Filesystem.readFile({
        path: page.filename,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      })
    ).data as string;
  };

  /* ---------- ANALYTICS ---------- */

  const incrementTrackers = (count: number) =>
    setSettings(p => ({ ...p, trackersBlockedTotal: p.trackersBlockedTotal + count }));

  const incrementDataSaved = (bytes: number) =>
    setSettings(p => ({ ...p, dataSaved: p.dataSaved + bytes }));

  /* ---------- APP ---------- */

  const purgeAllData = () => {
    setHistory([]);
    setBookmarks([]);
    setDownloads([]);
    setNotes([]);
    setDeletedNotes([]);
    setSavedPages([]);
    setSpeedDial([]);
  };

  const architect = 'Amudhan T';
  const t = (key: string) => translations[settings.language]?.[key] || key;

  return (
    <DragonContext.Provider
      value={{
        settings,
        updateSettings,
        clearGlobalData,
        checkAndRequestNotificationPermission,
        history,
        addHistory,
        clearHistory,
        removeHistoryItem,
        removeHistoryItems,
        bookmarks,
        toggleBookmark,
        downloads,
        addDownload,
        removeDownload,
        removeDownloads,
        pauseDownload,
        resumeDownload,
        cancelDownload,
        updateDownloadPriority,
        moveDownloadOrder,
        viewMode,
        setViewMode,
        navigateTo,
        navigateBack,
        notes,
        deletedNotes,
        addNote,
        removeNote,
        recoverNote,
        permanentlyDeleteNote,
        notesEntrySource,
        setNotesEntrySource,
        sitePermissionRegistry,
        getSitePermissions,
        updateSitePermissions,
        resetSitePermissions,
        clearSiteData,
        savedPages,
        savePageOffline,
        deleteSavedPage,
        getOfflineContent,
        imageContextMenuData,
        openImageContextMenu,
        closeImageContextMenu,
        activeMedia,
        playMedia,
        closeMedia,
        mediaInfoData,
        openMediaInfo,
        closeMediaInfo,
        speedDial,
        addShortcut,
        removeShortcut,
        updateSpeedDial,
        incrementTrackers,
        incrementDataSaved,
        purgeAllData,
        architect,
        t,
      }}
    >
      {children}
    </DragonContext.Provider>
  );
};
