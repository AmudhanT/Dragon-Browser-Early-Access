
export interface TabGroup {
  id: string;
  title: string;
  color: string;
  createdAt: number;
}

export interface Tab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  lastAccessed: number;
  isLoading: boolean;
  isPrivate: boolean;
  isHibernating?: boolean;
  pinned?: boolean;
  history: string[];
  currentIndex: number;
  groupId?: string;
  renderId?: number;
  originalUrl?: string; // Original URL before translation
  isTranslated?: boolean; // Whether the page is currently translated
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  timestamp: number;
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  timestamp: number;
}

export interface NoteItem {
  id: string;
  text: string;
  date: string;
}

export interface SavedPage {
  id: string;
  url: string;
  title: string;
  filename: string;
  timestamp: number;
  size: number;
}

export type DownloadPriority = 'high' | 'normal' | 'low';

export interface DownloadItem {
  id: string;
  filename: string;
  url: string;
  size: string; // Formatted size string (e.g. "5.2 MB")
  totalBytes: number;
  receivedBytes: number;
  speed: string;
  type: 'image' | 'video' | 'audio' | 'pdf' | 'document' | 'other' | 'archive' | 'apk';
  timestamp: number;
  progress: number;
  status: 'completed' | 'downloading' | 'paused' | 'failed' | 'canceled' | 'queued';
  resumable?: boolean;
  priority: DownloadPriority;
  queueIndex: number;
}

export interface ActiveMedia {
  url: string;
  filename: string;
  type: 'video' | 'audio' | 'image';
}

export interface Language {
  code: string;
  name: string;
}

export enum BrowserViewMode {
  BROWSER = 'BROWSER',
  TAB_SWITCHER = 'TAB_SWITCHER',
  SETTINGS = 'SETTINGS',
  HISTORY = 'HISTORY',
  DOWNLOADS = 'DOWNLOADS',
  BOOKMARKS = 'BOOKMARKS',
  NOTES_LIBRARY = 'NOTES_LIBRARY',
  SHIELD = 'SHIELD',
  LIBRARY = 'LIBRARY',
  MAIN_MENU = 'MAIN_MENU',
  // Flattened Settings Routes
  APPEARANCE = 'APPEARANCE',
  PRIVACY = 'PRIVACY',
  SITE_SETTINGS = 'SITE_SETTINGS',
  STORAGE = 'STORAGE',
  ABOUT = 'ABOUT',
  LANGUAGES = 'LANGUAGES',
  GENERAL = 'GENERAL'
}

export type SettingsPage = 'MAIN' | 'GENERAL' | 'PRIVACY' | 'STORAGE' | 'ABOUT' | 'APPEARANCE' | 'SITE_SETTINGS' | 'LANGUAGES';
export type SettingsSource = 'menu' | 'home' | 'internal';

export type ThemeMode = 'dark' | 'light' | 'system';
export type ThemeColor = 'ember' | 'frost' | 'midas' | 'venom';
export type SearchEngine = 'google' | 'bing' | 'dragon';

export interface ToolbarConfig {
  showLens: boolean;
  showTranslate: boolean;
  showMic: boolean;
  showNewTab: boolean;
  showNotes: boolean;
  showDesktopMode: boolean;
  showBookmark: boolean;
  showTabs: boolean;
}

export interface TranslationSettings {
  offerTranslate: boolean;
  targetLanguage: string;
  neverTranslate: string[];
}

export type CookiePolicy = 'allow' | 'block' | 'block_third_party';

export interface AppSettings {
  adBlockEnabled: boolean;
  javaScriptEnabled: boolean;
  dragonBreath: boolean;
  stealthFlight: boolean;
  trackerBlockingEnabled: boolean;
  autoPurge: boolean;
  scaleCompression: boolean;
  isDesktopMode: boolean;
  searchEngine: SearchEngine;
  themeMode: ThemeMode;
  themeColor: ThemeColor;
  wallpaper: string;
  wallpaperBlur: number;
  historyEnabled: boolean;
  doNotTrack: boolean;
  safeBrowsing: boolean;
  secureDns: boolean;
  downloadLocation: string;
  notificationsEnabled: boolean;
  muteDownloadNotifications: boolean;
  pullToRefreshEnabled: boolean;
  pipEnabled: boolean;
  floatingFeaturesEnabled: boolean;
  trackersBlockedTotal: number;
  sovereigntyMode: boolean; 
  showSpeedDial: boolean;
  toolbarConfig: ToolbarConfig;
  
  // Language & Translation
  language: string; // UI Language
  preferredLanguages: string[]; // Content negotiation
  translationSettings: TranslationSettings;

  cookiePolicy: CookiePolicy;
  siteDataEnabled: boolean;
  httpsOnlyMode: boolean;
  allowMixedContent: boolean;
  imagesEnabled: boolean;
  autoplayEnabled: boolean;
  popupsEnabled: boolean;
  locationPermission: PermissionState;
  cameraPermission: PermissionState;
  microphonePermission: PermissionState;
  notificationsPermission: PermissionState;
  mediaPermission: PermissionState; 
  soundPermission: PermissionState; 
  clipboardPermission: PermissionState; 
  forceDarkModeGlobal: boolean; 
  dataSaverEnabled: boolean;
  dataSaved: number;
}

export type PermissionState = 'allow' | 'block' | 'ask';

export interface SitePermissions {
  javascript: boolean;
  cookies: boolean;
  images: boolean;
  autoplay: boolean;
  forceDarkMode: boolean;
  location: PermissionState;
  camera: PermissionState;
  microphone: PermissionState;
  notifications: PermissionState;
  media: PermissionState; 
  sound: PermissionState;
  clipboard: PermissionState;
  popups: PermissionState;
  lastModified: number;
}

export interface ImageContextData {
  url: string;
}
