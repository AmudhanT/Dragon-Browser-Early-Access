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

import AddressBar from './components/AddressBar';

import { BrowserViewMode } from './types';
import { Star, Plus } from 'lucide-react';

import { useTabs } from './hooks/useTabs';
import { normalizeUrl, getDisplayTitle, cleanUrlForDisplay } from './utils/urlUtils';

import { App as CapacitorApp } from '@capacitor/app';

/* =========================
   APP CONTENT
========================= */

const AppContent: React.FC = () => {
  const {
    settings,
    viewMode,
    setViewMode,
    addHistory,
    bookmarks,
    toggleBookmark,
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
  } = useTabs(settings.stealthFlight, settings.searchEngine);

  const viewportRefs = useRef<Map<string, BrowserViewportHandle>>(new Map());
  const lastBackPress = useRef(0);

  const [urlInputValue, setUrlInputValue] = useState('');
  const [showExitToast, setShowExitToast] = useState(false);

  /* =========================
     THEME
  ========================= */

  useEffect(() => {
    const root = document.documentElement;
    const dark =
      settings.themeMode === 'dark' ||
      (settings.themeMode === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.toggle('dark', dark);
  }, [settings.themeMode]);

  /* =========================
     BACK BUTTON
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
    const listener = CapacitorApp.addListener('backButton', handleSmartBack);
    return () => {
      listener.then(l => l.remove());
    };
  }, [handleSmartBack]);

  /* =========================
     NAVIGATION
  ========================= */

  const handleNavigate = useCallback(
    (input: string) => {
      const normalized = normalizeUrl(
        input,
        settings.searchEngine,
        settings.httpsOnlyMode
      );

      setUrlInputValue(cleanUrlForDisplay(normalized));
      addHistory({ url: normalized, title: getDisplayTitle(normalized) });
      navigateTab(normalized);
      setViewMode(BrowserViewMode.BROWSER);
    },
    [settings.searchEngine, settings.httpsOnlyMode, navigateTab, addHistory, setViewMode]
  );

  const handleOpenInNewTab = (url: string) => {
    createTab(false);
    navigateTab(url);
  };

  const isBookmarked = bookmarks.some(b => b.url === activeTab.url);
  const isHomePage = activeTab.url === 'dragon://home';

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-black">

      {/* HEADER */}
      {viewMode === BrowserViewMode.BROWSER && !isHomePage && (
        <header className="h-[60px] border-b flex items-center px-3 gap-2">
          <AddressBar
            activeTab={activeTab}
            urlInputValue={urlInputValue}
            onUrlChange={setUrlInputValue}
            onUrlSubmit={() => handleNavigate(urlInputValue)}
          />

          <button onClick={() => createTab(false)}>
            <Plus size={18} />
          </button>

          <button onClick={() => toggleBookmark(activeTab.url, activeTab.title)}>
            <Star size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </header>
      )}

      {/* MAIN */}
      <main className="flex-1 relative overflow-hidden">

        {showExitToast && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-4 py-2 rounded">
            Press back again to exit
          </div>
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
                  <NewTabPage
                    onNavigate={handleNavigate}
                    onOpenInNewTab={handleOpenInNewTab}
                    onTriggerSearch={() => {}}
                  />
                ) : (
                  <>
                    <FireProgressBar isLoading={tab.isLoading} themeColor="#f97316" />
                    <BrowserViewport
                      ref={el => el && viewportRefs.current.set(tab.id, el)}
                      activeTab={tab}
                      onLoadStart={() => setTabLoading(true)}
                      onLoadEnd={() => setTabLoading(false)}
                      onReload={reloadTab}
                      isDesktopMode={settings.isDesktopMode}
                      javaScriptEnabled={settings.javaScriptEnabled}
                      isDragonBreath={settings.dragonBreath}
                      accentColor="#f97316"
                    />
                  </>
                )}
              </div>
            ))}
          </>
        )}

        {/* OTHER SCREENS */}
        {viewMode !== BrowserViewMode.BROWSER && (
          <div className="absolute inset-0 bg-slate-50 dark:bg-black">

            {(viewMode === BrowserViewMode.SETTINGS ||
              viewMode === BrowserViewMode.GENERAL ||
              viewMode === BrowserViewMode.APPEARANCE ||
              viewMode === BrowserViewMode.PRIVACY ||
              viewMode === BrowserViewMode.SITE_SETTINGS ||
              viewMode === BrowserViewMode.STORAGE ||
              viewMode === BrowserViewMode.LANGUAGES ||
              viewMode === BrowserViewMode.ABOUT) && <Settings />}

            {viewMode === BrowserViewMode.DOWNLOADS && (
              <Downloads onNavigate={handleNavigate} />
            )}

            {viewMode === BrowserViewMode.HISTORY && (
              <History
                onNavigate={handleNavigate}
                onOpenInNewTab={handleOpenInNewTab}
              />
            )}

            {viewMode === BrowserViewMode.BOOKMARKS && (
              <Bookmarks onNavigate={handleNavigate} />
            )}

            {viewMode === BrowserViewMode.LIBRARY && <Library />}
            {viewMode === BrowserViewMode.NOTES_LIBRARY && <NotesLibrary />}
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
