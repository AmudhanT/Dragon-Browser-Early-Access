import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DragonProvider, useDragon } from './DragonContext';

import { NewTabPage } from './components/NewTabPage';
import { BrowserViewport, BrowserViewportHandle } from './components/BrowserViewport';
import { FireProgressBar } from './components/FireProgressBar';
import Settings from './pages/Settings';
import { Downloads } from './pages/Downloads';
import { History } from './pages/History';
import { Bookmarks } from './pages/Bookmarks';
import { Library } from './pages/Library';
import { NotesLibrary } from './pages/NotesLibrary';

import { MainMenu } from './components/MainMenu';
import { TabSwitcher } from './components/TabSwitcher';
import AddressBar from './components/AddressBar';

import { BrowserViewMode, Tab } from './types';
import { Star, Mic, Plus, CheckCircle, Camera, Monitor, Pencil, LogOut, Shield, Languages, X } from 'lucide-react';

import { useTabs } from './hooks/useTabs';
import { normalizeUrl, getDisplayTitle, cleanUrlForDisplay } from './utils/urlUtils';
import { useVoiceSearch } from './hooks/useVoiceSearch';
import { useGestures } from './hooks/useGestures';

import { SplashScreen } from './components/SplashScreen';
import { App as CapacitorApp } from '@capacitor/app';
import { VoiceOverlay } from './components/VoiceOverlay';

import { LANGUAGE_OPTIONS } from './utils/i18n';

/* =========================
   APP CONTENT
========================= */

const AppContent: React.FC = () => {
  const {
    settings,
    viewMode,
    setViewMode,
    updateSettings,
    addHistory,
    bookmarks,
    toggleBookmark,
    addDownload,
    navigateBack,
  } = useDragon();

  const {
    tabs,
    activeTab,
    goBack,
    navigateTab,
    setTabLoading,
    createTab,
    reloadTab,
    setActiveTabId,
    setTabs,
  } = useTabs(settings.stealthFlight, settings.searchEngine);

  const viewportRefs = useRef<Map<string, BrowserViewportHandle>>(new Map());
  const lastBackPress = useRef(0);

  const [urlInputValue, setUrlInputValue] = useState('');
  const [showBookmarkToast, setShowBookmarkToast] = useState(false);
  const [showExitToast, setShowExitToast] = useState(false);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);

  /* =========================
     THEME SYNC
  ========================= */

  useEffect(() => {
    const root = document.documentElement;
    const dark =
      settings.themeMode === 'dark' ||
      (settings.themeMode === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.toggle('dark', dark);
    root.style.colorScheme = dark ? 'dark' : 'light';
  }, [settings.themeMode]);

  /* =========================
     SMART BACK HANDLER
  ========================= */

  const handleSmartBack = useCallback(() => {
    if (viewMode !== BrowserViewMode.BROWSER) {
      navigateBack();
      return;
    }

    if (activeTab.currentIndex > 0) {
      goBack();
      return;
    }

    const now = Date.now();
    if (now - lastBackPress.current < 2000) {
      CapacitorApp.exitApp();
    } else {
      setShowExitToast(true);
      lastBackPress.current = now;
      setTimeout(() => setShowExitToast(false), 2000);
    }
  }, [viewMode, navigateBack, goBack, activeTab.currentIndex]);

  useEffect(() => {
    CapacitorApp.addListener('backButton', handleSmartBack);
    return () => CapacitorApp.removeAllListeners();
  }, [handleSmartBack]);

  /* =========================
     NAVIGATION
  ========================= */

  const handleNavigate = useCallback(
    (input: string) => {
      const normalized = normalizeUrl(input, settings.searchEngine, settings.httpsOnlyMode);
      setUrlInputValue(cleanUrlForDisplay(normalized));
      addHistory({ url: normalized, title: getDisplayTitle(normalized) });
      navigateTab(normalized);
      setViewMode(BrowserViewMode.BROWSER);
    },
    [settings, navigateTab, addHistory, setViewMode]
  );

  /* =========================
     UI FLAGS
  ========================= */

  const isBookmarked = bookmarks.some(b => b.url === activeTab.url);
  const isHomePage = activeTab.url === 'dragon://home';

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-black text-slate-900 dark:text-white overflow-hidden">

      {/* HEADER */}
      {viewMode === BrowserViewMode.BROWSER && !isHomePage && (
        <header className="h-[60px] border-b flex items-center px-3 gap-2">
          <AddressBar
            activeTab={activeTab}
            urlInputValue={urlInputValue}
            onUrlChange={setUrlInputValue}
            onUrlSubmit={() => handleNavigate(urlInputValue)}
            onFocus={() => setIsSearchOverlayOpen(true)}
          />
          <button onClick={() => createTab(false)}><Plus size={18} /></button>
          <button onClick={() => toggleBookmark(activeTab.url, activeTab.title)}>
            <Star size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </header>
      )}

      {/* MAIN */}
      <main className="flex-1 relative overflow-hidden">

        {showBookmarkToast && (
          <div className="toast">Bookmarked</div>
        )}

        {showExitToast && (
          <div className="toast">Press back again to exit</div>
        )}

        {/* BROWSER */}
        {viewMode === BrowserViewMode.BROWSER && (
          <>
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={`absolute inset-0 ${tab.id === activeTab.id ? 'block' : 'hidden'}`}
              >
                {tab.url === 'dragon://home' ? (
                  <NewTabPage onNavigate={handleNavigate} />
                ) : (
                  <>
                    <FireProgressBar isLoading={tab.isLoading} themeColor="#f97316" />
                    <BrowserViewport
                      ref={el => {
                        if (el) viewportRefs.current.set(tab.id, el);
                      }}
                      activeTab={tab}
                      onLoadStart={() => setTabLoading(true)}
                      onLoadEnd={() => setTabLoading(false)}
                      onReload={reloadTab}
                      isDesktopMode={settings.isDesktopMode}
                      javaScriptEnabled={settings.javaScriptEnabled}
                    />
                  </>
                )}
              </div>
            ))}
          </>
        )}

        {/* NON-BROWSER VIEWS */}
        {viewMode !== BrowserViewMode.BROWSER && (
          <div className="absolute inset-0 z-10 bg-slate-50 dark:bg-black">
            {viewMode === BrowserViewMode.SETTINGS ||
             viewMode === BrowserViewMode.GENERAL ||
             viewMode === BrowserViewMode.APPEARANCE ||
             viewMode === BrowserViewMode.PRIVACY ||
             viewMode === BrowserViewMode.SITE_SETTINGS ||
             viewMode === BrowserViewMode.STORAGE ||
             viewMode === BrowserViewMode.LANGUAGES ||
             viewMode === BrowserViewMode.ABOUT ? (
              <Settings />
            ) : null}

            {viewMode === BrowserViewMode.DOWNLOADS && <Downloads />}
            {viewMode === BrowserViewMode.HISTORY && <History />}
            {viewMode === BrowserViewMode.BOOKMARKS && <Bookmarks />}
            {viewMode === BrowserViewMode.LIBRARY && <Library />}
            {viewMode === BrowserViewMode.NOTES && <NotesLibrary />}
            {viewMode === BrowserViewMode.TAB_SWITCHER && <TabSwitcher />}
          </div>
        )}
      </main>
    </div>
  );
};

/* =========================
   ROOT
========================= */

const App: React.FC = () => (
  <DragonProvider>
    <AppContent />
  </DragonProvider>
);

export default App;
