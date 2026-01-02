
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppSettings, HistoryItem, Bookmark, DownloadItem, BrowserViewMode, ActiveMedia, NoteItem, ToolbarConfig, SitePermissions, DownloadPriority, ImageContextData, SettingsPage, SettingsSource, SavedPage } from './types';
import { App as CapacitorApp } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { translations, LANGUAGE_OPTIONS } from './utils/i18n';

export interface Shortcut {
  id: string;
  name: string;
  url: string;
  isProtected?: boolean;
}

export interface MediaInfoData {
  url: string;
  type: 'image' | 'video' | 'audio';
}

interface DragonContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  history: HistoryItem[];
  addHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  removeHistoryItem: (id: string) => void;
  removeHistoryItems: (ids: string[]) => void;
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
  speedDial: Shortcut[];
  addShortcut: (name: string, url: string) => void;
  removeShortcut: (id: string) => void;
  updateSpeedDial: (shortcuts: Shortcut[]) => void;
  notes: NoteItem[];
  deletedNotes: NoteItem[];
  addNote: (content: string) => void;
  removeNote: (id: string) => void;
  recoverNote: (id: string) => void;
  permanentlyDeleteNote: (id: string) => void;
  clearAllNotes: () => void;
  viewMode: BrowserViewMode;
  setViewMode: (mode: BrowserViewMode) => void; // Low-level setter
  navigateTo: (mode: BrowserViewMode) => void; // History-aware navigation
  navigateBack: () => void; // History-aware back
  notesEntrySource: 'menu' | 'pencil';
  setNotesEntrySource: (source: 'menu' | 'pencil') => void;
  architect: string;
  incrementTrackers: (count: number) => void;
  incrementDataSaved: (bytes: number) => void;
  purgeAllData: () => void;
  activeMedia: ActiveMedia | null;
  playMedia: (url: string, filename: string, type: 'video' | 'audio' | 'image') => void;
  closeMedia: () => void;
  getSitePermissions: (url: string) => SitePermissions;
  updateSitePermissions: (url: string, permissions: Partial<SitePermissions>) => void;
  resetSitePermissions: (url: string) => void;
  clearSiteData: (url: string, type: 'cookies' | 'cache') => Promise<void>;
  clearGlobalData: (type: 'cookies' | 'cache') => Promise<void>;
  sitePermissionRegistry: Record<string, SitePermissions>;
  imageContextMenuData: ImageContextData | null;
  openImageContextMenu: (url: string) => void;
  closeImageContextMenu: () => void;
  checkAndRequestNotificationPermission: () => Promise<boolean>;
  t: (key: string) => string;
  savedPages: SavedPage[];
  savePageOffline: (url: string, title: string) => Promise<boolean>;
  deleteSavedPage: (id: string) => Promise<void>;
  getOfflineContent: (url: string) => Promise<string | null>;
  mediaInfoData: MediaInfoData | null;
  openMediaInfo: (url: string, type: 'image' | 'video' | 'audio') => void;
  closeMediaInfo: () => void;
}

const DragonContext = createContext<DragonContextType | undefined>(undefined);

export const useDragon = () => {
  const context = useContext(DragonContext);
  if (!context) throw new Error('useDragon must be used within a DragonProvider');
  return context;
};

const DEFAULT_SHORTCUTS: Shortcut[] = [
  { id: 'sd-1', name: 'Google', url: 'google.com', isProtected: true },
  { id: 'sd-2', name: 'YouTube', url: 'youtube.com', isProtected: true },
  { id: 'sd-3', name: 'Facebook', url: 'facebook.com', isProtected: true },
  { id: 'sd-4', name: 'Gemini', url: 'gemini.google.com', isProtected: true },
  { id: 'sd-5', name: 'Instagram', url: 'instagram.com', isProtected: true },
  { id: 'sd-6', name: 'Amazon', url: 'amazon.com', isProtected: false },
  { id: 'sd-7', name: 'ChatGPT', url: 'chatgpt.com', isProtected: false },
  { id: 'sd-8', name: 'Netflix', url: 'netflix.com', isProtected: false }
];

interface DownloadSimulation {
  totalBytes: number;
  speedBytesPerMs: number;
  startTime: number;
  lastProgress: number;
  notificationId: number;
}

export const DragonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const architect = "Amudhan T";
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('dragon_settings');
    const defaultSettings: AppSettings = {
      adBlockEnabled: true, dragonBreath: true, stealthFlight: true, trackerBlockingEnabled: true, autoPurge: false,
      javaScriptEnabled: true, scaleCompression: false, isDesktopMode: false, searchEngine: 'dragon',
      themeMode: 'system', themeColor: 'ember', wallpaper: 'void', wallpaperBlur: 0, historyEnabled: true,
      doNotTrack: true, safeBrowsing: true, secureDns: true,
      downloadLocation: '/Internal Storage/Downloads/Dragon', 
      notificationsEnabled: false, 
      muteDownloadNotifications: false, 
      pullToRefreshEnabled: true,
      pipEnabled: true, floatingFeaturesEnabled: false,
      trackersBlockedTotal: 0, sovereigntyMode: false, showSpeedDial: true,
      toolbarConfig: { showLens: true, showTranslate: true, showMic: true, showNewTab: true, showNotes: true, showDesktopMode: true, showBookmark: true, showTabs: true },
      
      language: 'en',
      preferredLanguages: ['en'],
      translationSettings: { offerTranslate: true, targetLanguage: 'en', neverTranslate: [] },

      cookiePolicy: 'allow',
      siteDataEnabled: true,
      httpsOnlyMode: false,
      allowMixedContent: false,
      imagesEnabled: true,
      autoplayEnabled: true,
      popupsEnabled: false,
      locationPermission: 'ask',
      cameraPermission: 'ask',
      microphonePermission: 'ask',
      notificationsPermission: 'ask',
      mediaPermission: 'ask',
      soundPermission: 'allow',
      clipboardPermission: 'ask',
      forceDarkModeGlobal: false,
      dataSaverEnabled: false,
      dataSaved: 0
    };

    if (!saved) {
      // First Launch: Auto-Detect Language (India-Friendly)
      try {
        const hasInitialized = localStorage.getItem('dragon_lang_init');
        if (!hasInitialized) {
          const browserLangs = navigator.languages || [navigator.language || 'en'];
          const primaryLang = browserLangs[0] || 'en';
          const baseCode = primaryLang.split('-')[0].toLowerCase();
          
          // Targeted Indian Language Codes
          const targetCodes = ['ta', 'hi', 'te', 'ml', 'kn', 'bn', 'mr', 'gu', 'pa', 'ur'];
          
          if (targetCodes.includes(baseCode)) {
             const match = LANGUAGE_OPTIONS.find(l => l.code.startsWith(baseCode));
             if (match) {
                defaultSettings.language = match.code;
                defaultSettings.preferredLanguages = [match.code, 'en'];
             }
          }
          localStorage.setItem('dragon_lang_init', 'true');
        }
      } catch (e) {
        console.warn("Language auto-detect failed", e);
      }
      return defaultSettings;
    }

    try { 
      const parsed = JSON.parse(saved);
      // Migration for new fields
      if (!parsed.preferredLanguages) parsed.preferredLanguages = [parsed.language || 'en'];
      if (!parsed.translationSettings) parsed.translationSettings = { offerTranslate: true, targetLanguage: parsed.language || 'en', neverTranslate: [] };
      return { ...defaultSettings, ...parsed }; 
    } catch { return defaultSettings; }
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try { const saved = localStorage.getItem('dragon_history'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try { const saved = localStorage.getItem('dragon_bookmarks'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const [downloads, setDownloads] = useState<DownloadItem[]>(() => {
    try { const saved = localStorage.getItem('dragon_downloads'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const [speedDial, setSpeedDial] = useState<Shortcut[]>(() => {
    try { const saved = localStorage.getItem('dragon_speed_dial'); return saved ? JSON.parse(saved) : DEFAULT_SHORTCUTS; } catch { return DEFAULT_SHORTCUTS; }
  });

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try { const saved = localStorage.getItem('dragon_notes_library'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const [deletedNotes, setDeletedNotes] = useState<NoteItem[]>(() => {
    try { const saved = localStorage.getItem('dragon_deleted_notes'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const [sitePermissionRegistry, setSitePermissionRegistry] = useState<Record<string, SitePermissions>>(() => {
    try { const saved = localStorage.getItem('dragon_site_permissions'); return saved ? JSON.parse(saved) : {}; } catch { return {}; }
  });

  const [savedPages, setSavedPages] = useState<SavedPage[]>(() => {
    try { const saved = localStorage.getItem('dragon_saved_pages'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  // UI Navigation State
  const [viewMode, setViewMode] = useState<BrowserViewMode>(BrowserViewMode.BROWSER);
  const [historyStack, setHistoryStack] = useState<BrowserViewMode[]>([]);

  const [notesEntrySource, setNotesEntrySource] = useState<'menu' | 'pencil'>('menu');
  const [activeMedia, setActiveMedia] = useState<ActiveMedia | null>(null);
  const [imageContextMenuData, setImageContextMenuData] = useState<ImageContextData | null>(null);
  const [mediaInfoData, setMediaInfoData] = useState<MediaInfoData | null>(null);
  const downloadSims = useRef<Record<string, DownloadSimulation>>({});

  useEffect(() => { localStorage.setItem('dragon_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('dragon_history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('dragon_bookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);
  useEffect(() => { localStorage.setItem('dragon_downloads', JSON.stringify(downloads)); }, [downloads]);
  useEffect(() => { localStorage.setItem('dragon_site_permissions', JSON.stringify(sitePermissionRegistry)); }, [sitePermissionRegistry]);
  useEffect(() => { localStorage.setItem('dragon_notes_library', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('dragon_deleted_notes', JSON.stringify(deletedNotes)); }, [deletedNotes]);
  useEffect(() => { localStorage.setItem('dragon_saved_pages', JSON.stringify(savedPages)); }, [savedPages]);

  const navigateTo = useCallback((mode: BrowserViewMode) => {
    setHistoryStack(prev => [...prev, viewMode]);
    setViewMode(mode);
  }, [viewMode]);

  const navigateBack = useCallback(() => {
    if (historyStack.length > 0) {
      const prev = historyStack[historyStack.length - 1];
      setHistoryStack(curr => curr.slice(0, -1));
      setViewMode(prev);
    } else {
      setViewMode(BrowserViewMode.BROWSER);
    }
  }, [historyStack]);

  const checkAndRequestNotificationPermission = useCallback(async (): Promise<boolean> => {
    try {
      const check = await LocalNotifications.checkPermissions();
      if (check.display === 'granted') return true;
      const request = await LocalNotifications.requestPermissions();
      if (request.display === 'granted') return true;
      return false;
    } catch (e) {
      return false;
    }
  }, []);

  const getSitePermissions = useCallback((url: string): SitePermissions => {
    const defaults: SitePermissions = {
      javascript: settings.javaScriptEnabled ?? true,
      cookies: settings.cookiePolicy !== 'block',
      images: settings.imagesEnabled ?? true,
      autoplay: settings.autoplayEnabled ?? true,
      forceDarkMode: settings.forceDarkModeGlobal ?? false,
      location: settings.locationPermission || 'ask',
      camera: settings.cameraPermission || 'ask',
      microphone: settings.microphonePermission || 'ask',
      notifications: settings.notificationsPermission || 'ask',
      media: settings.mediaPermission || 'ask',
      sound: settings.soundPermission || 'allow',
      clipboard: settings.clipboardPermission || 'ask',
      popups: settings.popupsEnabled ? 'allow' : 'block',
      lastModified: 0
    };
    if (!url || url === 'dragon://home') return defaults;
    try {
      const domain = new URL(url).hostname;
      return sitePermissionRegistry[domain] || defaults;
    } catch { return defaults; }
  }, [sitePermissionRegistry, settings]);

  const updateSitePermissions = useCallback((url: string, updates: Partial<SitePermissions>) => {
    try {
      const domain = url.includes('://') ? new URL(url).hostname : url;
      const current = sitePermissionRegistry[domain] || getSitePermissions(url);
      setSitePermissionRegistry(prev => ({
        ...prev,
        [domain]: { ...current, ...updates, lastModified: Date.now() }
      }));
    } catch {}
  }, [getSitePermissions, sitePermissionRegistry]);

  const resetSitePermissions = useCallback((url: string) => {
    try {
      const domain = url.includes('://') ? new URL(url).hostname : url;
      setSitePermissionRegistry(prev => {
        const { [domain]: removed, ...rest } = prev;
        return rest;
      });
    } catch {}
  }, []);

  const clearSiteData = useCallback(async (url: string, type: 'cookies' | 'cache') => {
    try {
      const domain = url.includes('://') ? new URL(url).hostname : url;
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`[DragonEngine] Cleared ${type} for ${domain}`);
    } catch (e) {
      console.error('Failed to clear site data', e);
    }
  }, []);

  const clearGlobalData = useCallback(async (type: 'cookies' | 'cache') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log(`[DragonEngine] Global ${type} cleared`);
    } catch (e) {
      console.error('Failed to clear global data', e);
    }
  }, []);

  const addHistory = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    if (!settings.historyEnabled) return;
    setHistory(prev => [{ ...item, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() }, ...prev.filter(h => h.url !== item.url).slice(0, 99)]);
  }, [settings.historyEnabled]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => {
      const nextSettings = { ...prev, ...updates };
      if (updates.adBlockEnabled === false) {
        nextSettings.trackersBlockedTotal = 0;
      }
      return nextSettings;
    });
  };

  const incrementTrackers = useCallback((count: number) => {
    if (settings.adBlockEnabled) {
      setSettings(prev => ({ ...prev, trackersBlockedTotal: prev.trackersBlockedTotal + count }));
    }
  }, [settings.adBlockEnabled]);

  const incrementDataSaved = useCallback((bytes: number) => {
    if (settings.dataSaverEnabled) {
      setSettings(prev => ({ ...prev, dataSaved: prev.dataSaved + bytes }));
    }
  }, [settings.dataSaverEnabled]);

  const addNote = useCallback((content: string) => {
    const newNote: NoteItem = {
      id: Math.random().toString(36).substr(2, 9),
      text: content,
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setNotes(prev => [newNote, ...prev]);
  }, []);

  const removeNote = useCallback((id: string) => {
    setNotes(prev => {
      const noteToMove = prev.find(n => n.id === id);
      if (noteToMove) {
        setDeletedNotes(d => [noteToMove, ...d]);
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  const recoverNote = useCallback((id: string) => {
    setDeletedNotes(prev => {
      const noteToRecover = prev.find(n => n.id === id);
      if (noteToRecover) {
        setNotes(n => [noteToRecover, ...n]);
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  const permanentlyDeleteNote = useCallback((id: string) => {
    setDeletedNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  const t = useCallback((key: string) => {
    const lang = settings.language || 'en';
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  }, [settings.language]);

  const savePageOffline = useCallback(async (url: string, title: string): Promise<boolean> => {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const filename = `page_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.html`;
      await Filesystem.writeFile({
        path: `saved_pages/${filename}`,
        data: html,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
        recursive: true
      });
      const newPage: SavedPage = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        title: title || url,
        filename,
        timestamp: Date.now(),
        size: html.length
      };
      setSavedPages(prev => [newPage, ...prev]);
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  const deleteSavedPage = useCallback(async (id: string) => {
    const page = savedPages.find(p => p.id === id);
    if (!page) return;
    try {
      await Filesystem.deleteFile({
        path: `saved_pages/${page.filename}`,
        directory: Directory.Data
      });
    } catch (e) {}
    setSavedPages(prev => prev.filter(p => p.id !== id));
  }, [savedPages]);

  const getOfflineContent = useCallback(async (url: string): Promise<string | null> => {
    const page = savedPages.find(p => p.url === url);
    if (!page) return null;
    try {
      const result = await Filesystem.readFile({
        path: `saved_pages/${page.filename}`,
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });
      return result.data as string;
    } catch (e) {
      return null;
    }
  }, [savedPages]);

  const notifyProgress = async (id: number, title: string, progress: number) => {
    if (settings.muteDownloadNotifications || !settings.notificationsEnabled) return;
    await LocalNotifications.schedule({
      notifications: [{
        id,
        title: 'Downloading...',
        body: `${title} - ${progress}%`,
        schedule: { at: new Date(Date.now() + 100) },
        smallIcon: 'ic_stat_icon_config_sample',
        ongoing: true,
        autoCancel: false
      }]
    });
  };

  const notifyComplete = async (id: number, title: string) => {
    if (settings.muteDownloadNotifications || !settings.notificationsEnabled) return;
    await LocalNotifications.schedule({
      notifications: [{
        id,
        title: 'Download Complete',
        body: `${title} saved to Dragon Vault.`,
        schedule: { at: new Date(Date.now() + 100) },
      }]
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDownloads(prev => {
        let hasUpdates = false;
        const now = Date.now();
        const updated = prev.map(d => {
          if (d.status !== 'downloading') return d;
          const sim = downloadSims.current[d.id];
          if (!sim) {
             const defaultTotal = 50 * 1024 * 1024;
             downloadSims.current[d.id] = {
                totalBytes: defaultTotal,
                speedBytesPerMs: (2 * 1024 * 1024) / 1000,
                startTime: now - (d.progress / 100 * (defaultTotal / ((2 * 1024 * 1024) / 1000))),
                lastProgress: d.progress,
                notificationId: Math.floor(Math.random() * 100000)
             };
             return d;
          }
          const elapsedMs = now - sim.startTime;
          const calculatedReceived = Math.min(elapsedMs * sim.speedBytesPerMs, sim.totalBytes);
          const progress = Math.min((calculatedReceived / sim.totalBytes) * 100, 100);
          if (progress >= 100) {
             hasUpdates = true;
             delete downloadSims.current[d.id];
             notifyComplete(sim.notificationId, d.filename);
             return { ...d, status: 'completed', progress: 100, receivedBytes: sim.totalBytes, speed: 'Completed' };
          }
          if (progress - sim.lastProgress > 5) {
             sim.lastProgress = progress;
             notifyProgress(sim.notificationId, d.filename, Math.floor(progress));
          }
          hasUpdates = true;
          const mbReceived = (calculatedReceived / (1024 * 1024)).toFixed(1);
          const mbTotal = (sim.totalBytes / (1024 * 1024)).toFixed(1);
          const speedMb = (sim.speedBytesPerMs * 1000 / (1024 * 1024)).toFixed(1);
          return { ...d, progress, receivedBytes: calculatedReceived, size: `${mbReceived} / ${mbTotal} MB`, speed: `${speedMb} MB/s` };
        });
        return hasUpdates ? updated : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [settings.muteDownloadNotifications, settings.notificationsEnabled]);

  const addDownload = useCallback(async (url: string, filename: string) => {
    if (settings.notificationsEnabled) {
      const hasPermission = await checkAndRequestNotificationPermission();
      if (!hasPermission) updateSettings({ notificationsEnabled: false });
    }
    const newId = Math.random().toString(36).substr(2, 9);
    let type: DownloadItem['type'] = 'other';
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg','jpeg','png','gif','webp','svg'].includes(ext || '')) type = 'image';
    else if (['mp4','mkv','avi','mov','webm'].includes(ext || '')) type = 'video';
    else if (['mp3','wav','ogg','m4a'].includes(ext || '')) type = 'audio';
    else if (ext === 'pdf') type = 'pdf';
    else if (ext === 'apk') type = 'apk';
    else if (['zip','rar','7z','tar','gz'].includes(ext || '')) type = 'archive';
    else if (['doc','docx','txt'].includes(ext || '')) type = 'document';
    const totalSize = (Math.random() * 50 + 10) * 1024 * 1024;
    const speed = (Math.random() * 3 + 1) * 1024 * 1024 / 1000;
    const notifId = Math.floor(Math.random() * 100000);
    downloadSims.current[newId] = { totalBytes: totalSize, speedBytesPerMs: speed, startTime: Date.now(), lastProgress: 0, notificationId: notifId };
    const newItem: DownloadItem = {
      id: newId, filename, url, size: 'Starting...', totalBytes: totalSize, receivedBytes: 0, speed: 'Initializing...', type, timestamp: Date.now(),
      progress: 0, status: 'downloading', priority: 'normal', queueIndex: downloads.length
    };
    setDownloads(prev => [newItem, ...prev]);
    notifyProgress(notifId, filename, 0);
  }, [downloads.length, settings.notificationsEnabled, settings.muteDownloadNotifications, checkAndRequestNotificationPermission]);

  const removeDownload = useCallback((id: string) => {
    setDownloads(prev => prev.filter(d => d.id !== id));
    delete downloadSims.current[id];
  }, []);

  const removeDownloads = useCallback((ids: string[]) => {
    setDownloads(prev => prev.filter(d => !ids.includes(d.id)));
    ids.forEach(id => delete downloadSims.current[id]);
  }, []);

  const pauseDownload = useCallback((id: string) => {
    setDownloads(prev => prev.map(d => {
      if (d.id === id) {
        delete downloadSims.current[id];
        return { ...d, status: 'paused', speed: 'Paused' };
      }
      return d;
    }));
  }, []);

  const resumeDownload = useCallback((id: string) => {
    setDownloads(prev => {
      return prev.map(d => {
        if (d.id === id) {
           const totalSize = d.totalBytes || 50 * 1024 * 1024;
           const speed = (Math.random() * 3 + 1) * 1024 * 1024 / 1000;
           const currentBytes = d.receivedBytes;
           const msToDownloadCurrent = currentBytes / speed;
           const newStartTime = Date.now() - msToDownloadCurrent;
           const notifId = Math.floor(Math.random() * 100000);
           downloadSims.current[id] = { totalBytes: totalSize, speedBytesPerMs: speed, startTime: newStartTime, lastProgress: d.progress, notificationId: notifId };
           notifyProgress(notifId, d.filename, Math.floor(d.progress));
           return { ...d, status: 'downloading', speed: 'Resuming...' };
        }
        return d;
      });
    });
  }, []);

  const cancelDownload = useCallback((id: string) => {
    setDownloads(prev => prev.map(d => d.id === id ? { ...d, status: 'canceled', speed: 'Canceled', progress: 0 } : d));
    delete downloadSims.current[id];
  }, []);

  const updateDownloadPriority = useCallback((id: string, priority: DownloadPriority) => {
    setDownloads(prev => prev.map(d => d.id === id ? { ...d, priority } : d));
  }, []);

  const moveDownloadOrder = useCallback((id: string, direction: 'up' | 'down') => {
    setDownloads(prev => {
        const index = prev.findIndex(d => d.id === id);
        if (index === -1) return prev;
        const newArr = [...prev];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < newArr.length) {
            [newArr[index], newArr[targetIndex]] = [newArr[targetIndex], newArr[index]];
        }
        return newArr;
    });
  }, []);

  return (
    <DragonContext.Provider value={{
      settings, updateSettings, history, addHistory, removeHistoryItem: (id) => setHistory(prev => prev.filter(h => h.id !== id)),
      removeHistoryItems: (ids) => setHistory(prev => prev.filter(h => !ids.includes(h.id))),
      clearHistory: () => setHistory([]), bookmarks, toggleBookmark: (url, title) => setBookmarks(prev => prev.find(b => b.url === url) ? prev.filter(b => b.url !== url) : [{ id: Math.random().toString(36).substr(2, 9), url, title, timestamp: Date.now() }, ...prev]),
      downloads, 
      addDownload, removeDownload, removeDownloads, pauseDownload, resumeDownload, cancelDownload, updateDownloadPriority, moveDownloadOrder,
      speedDial, addShortcut: (n, u) => {}, removeShortcut: (id) => {}, updateSpeedDial: (s) => setSpeedDial(s),
      notes, deletedNotes, addNote, removeNote, recoverNote, permanentlyDeleteNote, clearAllNotes: () => setNotes([]),
      viewMode, setViewMode, navigateTo, navigateBack, notesEntrySource, setNotesEntrySource,
      architect, incrementTrackers, 
      incrementDataSaved,
      purgeAllData: () => { setHistory([]); setBookmarks([]); setDownloads([]); setNotes([]); setDeletedNotes([]); setSitePermissionRegistry({}); setSavedPages([]); setSettings(prev => ({ ...prev, trackersBlockedTotal: 0, dataSaved: 0 })); },
      activeMedia, playMedia: (url, filename, type) => setActiveMedia({ url, filename, type }), closeMedia: () => setActiveMedia(null),
      getSitePermissions, updateSitePermissions, resetSitePermissions, clearSiteData, clearGlobalData, sitePermissionRegistry,
      imageContextMenuData, openImageContextMenu: (url) => setImageContextMenuData({ url }), closeImageContextMenu: () => setImageContextMenuData(null),
      checkAndRequestNotificationPermission,
      savedPages, savePageOffline, deleteSavedPage, getOfflineContent,
      mediaInfoData,
      openMediaInfo: (url, type) => setMediaInfoData({ url, type }),
      closeMediaInfo: () => setMediaInfoData(null),
      t
    }}>
      {children}
    </DragonContext.Provider>
  );
};
