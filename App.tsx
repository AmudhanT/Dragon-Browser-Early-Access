
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
import { MainMenu } from './components/MainMenu';
import { TabSwitcher } from './components/TabSwitcher';
import { BrowserViewMode, Tab } from './types';
import { Star, Mic, Plus, CheckCircle, Camera, Monitor, Pencil, LogOut, Shield, Languages, X } from 'lucide-react';
import { useTabs } from './hooks/useTabs';
import { normalizeUrl, getDisplayTitle, cleanUrlForDisplay } from './utils/urlUtils';
import AddressBar from './components/AddressBar';
import { useVoiceSearch } from './hooks/useVoiceSearch';
import { useGestures } from './hooks/useGestures';
import { AnimatePresence } from 'framer-motion';
import { SplashScreen } from './components/SplashScreen';
import { App as CapacitorApp } from '@capacitor/app';
import { SiteSettingsPopup } from './components/SiteSettingsPopup';
import { ShareIntentDialog } from './components/ShareIntentDialog';
import { ImageContextMenu } from './components/ImageContextMenu';
import { BottomBar } from './components/BottomBar';
import { SearchOverlay } from './components/SearchOverlay';
import { LensActionSheet } from './components/LensActionSheet';
import { MediaPlayer } from './components/MediaPlayer';
import { ImageViewer } from './components/ImageViewer';
import { QuickNotesPopup } from './components/QuickNotesPopup';
import { NotesLibrary } from './pages/NotesLibrary';
import { VoiceOverlay } from './components/VoiceOverlay';
import { MediaInfoSheet } from './components/MediaInfoSheet';
import { LANGUAGE_OPTIONS } from './utils/i18n';

const AppContent = () => {
  const { 
    settings, viewMode, setViewMode, updateSettings, addHistory, 
    bookmarks, toggleBookmark, addDownload,
    imageContextMenuData, closeImageContextMenu,
    activeMedia, closeMedia, mediaInfoData, closeMediaInfo,
    navigateBack
  } = useDragon();
  
  const { 
    tabs, tabGroups, activeTab, goBack, goForward, navigateTab, setTabLoading, 
    createTab, createTabGroup, deleteTabGroup, updateTabGroup, moveTabToGroup,
    reloadTab, closeTab, setActiveTabId, setTabs, duplicateTab,
    clearCurrentSession, closeIncognitoTabs, handleInternalNavigate,
    togglePinTab
  } = useTabs(settings.stealthFlight, settings.searchEngine);
  
  const [urlInputValue, setUrlInputValue] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showBookmarkToast, setShowBookmarkToast] = useState(false);
  const [showExitToast, setShowExitToast] = useState(false);
  const [isSiteSettingsOpen, setIsSiteSettingsOpen] = useState(false);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [isLensOpen, setIsLensOpen] = useState(false);
  const [isQuickNotesOpen, setIsQuickNotesOpen] = useState(false);
  
  // Language Assist
  const [languageSuggestion, setLanguageSuggestion] = useState<{code: string, label: string} | null>(null);
  
  // App Switcher Privacy State
  const [isAppBackgrounded, setIsAppBackgrounded] = useState(false);
  
  const viewportRefs = useRef<Map<string, BrowserViewportHandle>>(new Map());
  const [shareIntentUrl, setShareIntentUrl] = useState<string | null>(null);
  const lastBackPress = useRef(0);

  // LANGUAGE ASSIST LOGIC
  useEffect(() => {
    const hasPrompted = localStorage.getItem('dragon_language_prompted');
    if (hasPrompted) return;

    try {
      const deviceLang = navigator.language; // e.g. "ta", "es-419", "en-US"
      const baseLang = deviceLang.split('-')[0];

      // Find best match: exact match first, then base match
      const exactMatch = LANGUAGE_OPTIONS.find(l => l.code === deviceLang);
      const baseMatch = LANGUAGE_OPTIONS.find(l => l.code.startsWith(baseLang));
      const match = exactMatch || baseMatch;

      if (match && match.code !== settings.language && match.code !== 'en') {
        setLanguageSuggestion({ code: match.code, label: match.label });
      } else {
        // If match is same as current or English (default), mark as handled silently
        localStorage.setItem('dragon_language_prompted', 'true');
      }
    } catch (e) {
      console.warn("Language detection failed", e);
    }
  }, [settings.language]);

  const handleAcceptLanguage = () => {
    if (languageSuggestion) {
      updateSettings({ language: languageSuggestion.code });
      setLanguageSuggestion(null);
      localStorage.setItem('dragon_language_prompted', 'true');
    }
  };

  const handleDismissLanguage = () => {
    setLanguageSuggestion(null);
    localStorage.setItem('dragon_language_prompted', 'true');
  };

  // AUTO-CLOSE TABS LOGIC Removed

  // THEME SYNCHRONIZATION CORE
  useEffect(() => {
    const updateTheme = () => {
      const root = window.document.documentElement;
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = settings.themeMode === 'dark' || 
        (settings.themeMode === 'system' && systemDark);
      
      if (isDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }

      // Sync Native/Browser Meta Color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', isDark ? '#000000' : '#ffffff');
      }
    };

    updateTheme();

    // Listen for OS theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (settings.themeMode === 'system') {
        updateTheme();
      }
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [settings.themeMode]);

  // DEEP LINK / SHARE INTENT LISTENER
  useEffect(() => {
    const handleUrlOpen = (data: any) => {
      let url = data.url;
      if (url) {
        if (url.startsWith('dragon://')) {
           const match = url.match(/https?:\/\/[^\s]+/);
           if (match) url = match[0];
           else url = url.replace('dragon://', 'https://');
        }
        setShareIntentUrl(url);
      }
    };

    CapacitorApp.addListener('appUrlOpen', handleUrlOpen);
    
    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, []);

  const handleShareDownload = () => {
    if (shareIntentUrl) {
      const filename = shareIntentUrl.split('/').pop()?.split('?')[0] || `shared-${Date.now()}.bin`;
      addDownload(shareIntentUrl, filename);
      setShareIntentUrl(null);
    }
  };

  const handleShareOpen = () => {
    if (shareIntentUrl) {
      handleNavigate(shareIntentUrl);
      setShareIntentUrl(null);
    }
  };

  const handleSmartBack = useCallback(() => {
    // 1. Close overlays first
    if (isSearchOverlayOpen) { setIsSearchOverlayOpen(false); return; }
    if (isSiteSettingsOpen) { setIsSiteSettingsOpen(false); return; }
    if (isQuickNotesOpen) { setIsQuickNotesOpen(false); return; }
    if (mediaInfoData) { closeMediaInfo(); return; }
    if (activeMedia) { closeMedia(); return; }

    // 2. Handle internal WebView history
    const currentViewport = viewportRefs.current.get(activeTab.id);
    const handledInternally = currentViewport?.goBack() ?? false;
    if (handledInternally) return;

    // 3. Handle App Tab history
    if (activeTab.currentIndex > 0) {
      goBack(); 
      return;
    }

    // 4. Handle App UI History (New Flat Routing)
    if (viewMode !== BrowserViewMode.BROWSER) {
      navigateBack();
      return;
    }

    // 5. Handle Exit
    const now = Date.now();
    if (now - lastBackPress.current < 2000) {
      CapacitorApp.exitApp();
    } else {
      setShowExitToast(true);
      lastBackPress.current = now;
      setTimeout(() => setShowExitToast(false), 2000);
    }
  }, [activeTab.id, activeTab.currentIndex, goBack, isSearchOverlayOpen, isSiteSettingsOpen, isQuickNotesOpen, activeMedia, mediaInfoData, viewMode, navigateBack]);

  useEffect(() => {
    let backListener: any;
    const setupBackListener = async () => {
      backListener = await CapacitorApp.addListener('backButton', () => {
        handleSmartBack();
      });
    };
    setupBackListener();
    return () => { if (backListener) backListener.remove(); };
  }, [viewMode, handleSmartBack]);

  const { isListening, startListening, voiceState, interimTranscript, error: voiceError, reset: resetVoice } = useVoiceSearch((transcript) => handleNavigate(transcript));

  const gestureHandlers = useGestures({
    onSwipeLeft: () => {
      const idx = tabs.findIndex(t => t.id === activeTab.id);
      if (idx < tabs.length - 1) setActiveTabId(tabs[idx + 1].id);
    },
    onSwipeRight: () => {
      const idx = tabs.findIndex(t => t.id === activeTab.id);
      if (idx > 0) setActiveTabId(tabs[idx - 1].id);
    }
  });

  // PRECISION SYNC: Updates the input field with the RAW literal URL
  useEffect(() => {
    if (!isListening && !isSearchOverlayOpen) {
      setUrlInputValue(cleanUrlForDisplay(activeTab.url));
    }
  }, [activeTab.url, isListening, isSearchOverlayOpen]);

  // Support translation options
  const handleNavigate = useCallback((input: string, options?: { isTranslation?: boolean, originalUrl?: string }) => {
    const normalized = normalizeUrl(input, settings.searchEngine, settings.httpsOnlyMode);
    setUrlInputValue(cleanUrlForDisplay(normalized));
    if (normalized !== 'dragon://home') {
      addHistory({ url: normalized, title: getDisplayTitle(normalized) });
    }
    navigateTab(normalized, options);
    setViewMode(BrowserViewMode.BROWSER);
    setIsSearchOverlayOpen(false);
  }, [navigateTab, settings.searchEngine, settings.httpsOnlyMode, setViewMode, addHistory]);

  const handleOpenInNewTab = useCallback((url: string) => {
    const normalized = normalizeUrl(url, settings.searchEngine, settings.httpsOnlyMode);
    const newId = Math.random().toString(36).substring(2, 15);
    const newTab: Tab = {
      id: newId, url: normalized, title: getDisplayTitle(normalized),
      lastAccessed: Date.now(), isLoading: true, isPrivate: activeTab.isPrivate,
      history: [normalized], currentIndex: 0, groupId: activeTab.groupId, renderId: 0, isTranslated: false
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
    setViewMode(BrowserViewMode.BROWSER);
  }, [activeTab.isPrivate, activeTab.groupId, settings.searchEngine, settings.httpsOnlyMode, setActiveTabId, setTabs, setViewMode]);

  const handleOpenInBackgroundTab = useCallback((url: string) => {
    const normalized = normalizeUrl(url, settings.searchEngine, settings.httpsOnlyMode);
    const newId = Math.random().toString(36).substring(2, 15);
    const newTab: Tab = {
      id: newId, url: normalized, title: getDisplayTitle(normalized),
      lastAccessed: Date.now(), isLoading: true, isPrivate: activeTab.isPrivate,
      history: [normalized], currentIndex: 0, groupId: activeTab.groupId, renderId: 0, isTranslated: false
    };
    setTabs(prev => [...prev, newTab]);
    // Silent creation: do not switch tab or view mode
  }, [activeTab.isPrivate, activeTab.groupId, settings.searchEngine, settings.httpsOnlyMode, setTabs]);

  const handleToggleDesktopMode = () => {
    updateSettings({ isDesktopMode: !settings.isDesktopMode });
    reloadTab();
  };

  const isBookmarked = bookmarks.some(b => b.url === activeTab.url);
  const isHomePage = activeTab.url === 'dragon://home';
  
  // Logic: Show Privacy Shield in Switcher if in Background & Private
  const showSwitcherShield = isAppBackgrounded && activeTab.isPrivate;

  const isSettingsMode = [
    BrowserViewMode.SETTINGS, BrowserViewMode.APPEARANCE, BrowserViewMode.PRIVACY, 
    BrowserViewMode.SITE_SETTINGS, BrowserViewMode.STORAGE, BrowserViewMode.ABOUT, 
    BrowserViewMode.LANGUAGES, BrowserViewMode.GENERAL
  ].includes(viewMode);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-black text-slate-900 dark:text-white overflow-hidden font-sans relative transition-colors duration-300">
      
      {/* Switcher Privacy Shield (Content Hiding) */}
      {showSwitcherShield && (
        <div className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center animate-fade-in">
           <div className="p-8 rounded-full bg-white/5 mb-6 border border-white/5 shadow-2xl">
              <Shield size={48} className="text-slate-500" />
           </div>
           <h2 className="text-xl font-black text-slate-200 uppercase tracking-[0.2em] italic">Dragon Incognito</h2>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Content Hidden</p>
        </div>
      )}

      {/* Global Voice Overlay */}
      <VoiceOverlay 
        isOpen={voiceState !== 'idle'} 
        onClose={resetVoice} 
        voiceState={voiceState} 
        transcript={interimTranscript} 
        error={voiceError} 
        onRetry={startListening} 
      />

      {viewMode === BrowserViewMode.BROWSER && !isHomePage && (
        <header className="h-[60px] bg-white dark:bg-black border-b border-slate-200 dark:border-white/5 flex items-center px-3 z-50 shrink-0 transition-colors duration-300 gap-2">
          <div className="flex-1 min-w-0">
            <AddressBar
  activeTab={activeTab}
  urlInputValue={urlInputValue}
  onUrlChange={setUrlInputValue}
  onUrlSubmit={() => handleNavigate(urlInputValue)}
  onFocus={() => setIsSearchOverlayOpen(true)}
/>
          </div>
          <div className="flex items-center shrink-0 gap-0.5">
            {settings.toolbarConfig.showLens && (
              <button onClick={() => setIsLensOpen(true)} className="p-1.5 text-slate-500 hover:text-orange-500 rounded-full"><Camera size={19} /></button>
            )}
            {settings.toolbarConfig.showMic && (
              <button onClick={startListening} className={`p-1.5 rounded-full ${isListening ? 'text-orange-500' : 'text-slate-500'}`}><Mic size={19} /></button>
            )}
            {settings.toolbarConfig.showDesktopMode && (
              <button onClick={handleToggleDesktopMode} className={`p-1.5 rounded-full ${settings.isDesktopMode ? 'text-orange-500' : 'text-slate-500'}`}><Monitor size={19} /></button>
            )}
            {settings.toolbarConfig.showNewTab && (
              <button onClick={() => createTab(false)} className="p-1.5 text-slate-500 hover:text-orange-500 rounded-full"><Plus size={20} /></button>
            )}
            <button onClick={() => { toggleBookmark(activeTab.url, activeTab.title); setShowBookmarkToast(true); setTimeout(() => setShowBookmarkToast(false), 2000); }} className={`p-1.5 rounded-full ${isBookmarked ? 'text-orange-500' : 'text-slate-500'}`}><Star size={19} fill={isBookmarked ? "currentColor" : "none"} /></button>
          </div>
        </header>
      )}

      <main className="flex-1 relative overflow-hidden flex flex-col" {...gestureHandlers}>
        {showBookmarkToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[120] animate-fade-in pointer-events-none bg-slate-900 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2"><CheckCircle size={14} className="text-orange-500" /> Bookmarked</div>
        )}

        {showExitToast && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[120] animate-fade-in pointer-events-none bg-slate-900 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2 shadow-2xl">
            <LogOut size={12} className="text-red-500" /> Press Back Again to Exit
          </div>
        )}

        {/* Language Suggestion Toast */}
        {languageSuggestion && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[130] animate-slide-up bg-dragon-navy/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 w-[90%] max-w-sm">
             <div className="p-3 bg-dragon-ember/10 rounded-xl text-dragon-ember">
                <Languages size={20} />
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Language</p>
                <p className="text-sm font-black text-white truncate">Switch to {languageSuggestion.label}?</p>
             </div>
             <div className="flex gap-2">
                <button onClick={handleAcceptLanguage} className="px-3 py-2 bg-dragon-ember text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-colors">
                   Yes
                </button>
                <button onClick={handleDismissLanguage} className="p-2 text-slate-500 hover:text-white rounded-lg">
                   <X size={16} />
                </button>
             </div>
          </div>
        )}

        <div className={`absolute inset-0 z-0 ${viewMode === BrowserViewMode.BROWSER ? 'visible' : 'invisible pointer-events-none'}`}>
          {tabs.map((tab) => (
            <div key={tab.id} className={`absolute inset-0 transition-opacity duration-300 ${tab.id === activeTab.id ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {tab.url === 'dragon://home' ? (
                <NewTabPage 
                  onNavigate={handleNavigate} 
                  onTriggerSearch={() => setIsSearchOverlayOpen(true)} 
                  onOpenInNewTab={handleOpenInNewTab} 
                />
              ) : (
                <div className="w-full h-full relative">
                  <FireProgressBar isLoading={tab.isLoading} themeColor="#f97316" />
                  <BrowserViewport 
                    ref={(el) => { if (el) viewportRefs.current.set(tab.id, el); else viewportRefs.current.delete(tab.id); }}
                    activeTab={tab} onLoadStart={() => setTabLoading(true)} onLoadEnd={() => setTabLoading(false)}
                    onInternalNavigate={handleInternalNavigate} isDragonBreath={settings.dragonBreath}
                    isDesktopMode={settings.isDesktopMode} javaScriptEnabled={settings.javaScriptEnabled}
                    accentColor="#f97316" onReload={reloadTab} refreshTrigger={refreshTrigger}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* QUICK NOTES FLOATING ACTION BUTTON - Global primary add note trigger */}
        {viewMode === BrowserViewMode.BROWSER && settings.toolbarConfig.showNotes && (
          <button 
            onClick={() => setIsQuickNotesOpen(true)}
            className="fixed bottom-24 right-6 p-4 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-slate-200 dark:border-red-500/30 text-red-500 rounded-2xl shadow-xl dark:shadow-[0_0_30px_rgba(225,29,72,0.3)] hover:bg-slate-50 dark:hover:bg-red-500/10 active:scale-90 transition-all z-[60] group ring-1 ring-black/5 dark:ring-white/5"
            title="Add Quick Note"
          >
            <Pencil size={24} className="group-hover:rotate-12 transition-transform" />
          </button>
        )}

        {viewMode !== BrowserViewMode.BROWSER && (
          <div className="absolute inset-0 z-10 bg-slate-50 dark:bg-black animate-fade-in transition-colors duration-300">
            {viewMode === BrowserViewMode.TAB_SWITCHER && (
              <TabSwitcher tabs={tabs} tabGroups={tabGroups} activeTabId={activeTab.id} 
                onSelectTab={(id) => { setActiveTabId(id); setViewMode(BrowserViewMode.BROWSER); }}
                onCloseTab={closeTab} onDuplicateTab={duplicateTab} onCreateTab={createTab}
                onCreateGroup={createTabGroup} onDeleteGroup={deleteTabGroup} onUpdateGroup={updateTabGroup}
                onMoveTabToGroup={moveTabToGroup} onClose={() => setViewMode(BrowserViewMode.BROWSER)}
                onCloseIncognito={closeIncognitoTabs} onCloseAll={() => { clearCurrentSession(); setViewMode(BrowserViewMode.BROWSER); }}
                onTogglePin={togglePinTab}
              />
            )}
            {isSettingsMode && <Settings mode={viewMode} />}
            {viewMode === BrowserViewMode.DOWNLOADS && <Downloads onNavigate={handleNavigate} />}
            {viewMode === BrowserViewMode.HISTORY && <History onNavigate={handleNavigate} onOpenInNewTab={handleOpenInNewTab} onOpenInBackgroundTab={handleOpenInBackgroundTab} />}
            {viewMode === BrowserViewMode.BOOKMARKS && <Bookmarks onNavigate={handleNavigate} />}
            {viewMode === BrowserViewMode.NOTES_LIBRARY && <NotesLibrary />}
            {viewMode === BrowserViewMode.LIBRARY && <Library />}
            {viewMode === BrowserViewMode.MAIN_MENU && <MainMenu activeTab={activeTab} onNavigate={handleNavigate} />}
          </div>
        )}

        {/* Overlays */}
        <SiteSettingsPopup isOpen={isSiteSettingsOpen} onClose={() => setIsSiteSettingsOpen(false)} url={activeTab.url} />
        <LensActionSheet isOpen={isLensOpen} onClose={() => setIsLensOpen(false)} />
        <QuickNotesPopup isOpen={isQuickNotesOpen} onClose={() => setIsQuickNotesOpen(false)} />
        <AnimatePresence>
          {imageContextMenuData && (
            <ImageContextMenu 
              key="img-ctx" 
              url={imageContextMenuData.url} 
              onClose={closeImageContextMenu} 
              onOpenInNewTab={handleOpenInNewTab} 
              onOpenInBackgroundTab={handleOpenInBackgroundTab}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isSearchOverlayOpen && (
            <SearchOverlay 
              isOpen={true} 
              onClose={() => setIsSearchOverlayOpen(false)} 
              onNavigate={handleNavigate} 
              initialValue={urlInputValue} 
              searchEngine={settings.searchEngine}
              onVoiceSearch={() => { setIsSearchOverlayOpen(false); startListening(); }}
              onLens={() => { setIsSearchOverlayOpen(false); setIsLensOpen(true); }}
            />
          )}
        </AnimatePresence>
        
        {/* Share Intent Dialog */}
        <AnimatePresence>
          {shareIntentUrl && (
            <ShareIntentDialog 
              url={shareIntentUrl} 
              onClose={() => setShareIntentUrl(null)}
              onOpen={handleShareOpen}
              onDownload={handleShareDownload}
            />
          )}
        </AnimatePresence>

        {/* Media Overlays */}
        <AnimatePresence>
          {activeMedia && (
            activeMedia.type === 'image' ? (
              <ImageViewer key="media-image" media={activeMedia} onClose={closeMedia} />
            ) : (
              <MediaPlayer key="media-av" media={activeMedia} onClose={closeMedia} />
            )
          )}
        </AnimatePresence>

        {/* Media Info Sheet */}
        <AnimatePresence>
          {mediaInfoData && (
            <MediaInfoSheet 
              url={mediaInfoData.url} 
              type={mediaInfoData.type} 
              onClose={closeMediaInfo} 
            />
          )}
        </AnimatePresence>
      </main>

      {viewMode === BrowserViewMode.BROWSER && (
        <BottomBar 
          onBack={handleSmartBack} onForward={goForward} onSearch={() => setIsSearchOverlayOpen(true)}
          onTabs={() => setViewMode(BrowserViewMode.TAB_SWITCHER)} onMenu={() => setViewMode(BrowserViewMode.MAIN_MENU)}
          tabCount={tabs.length} canGoBack={activeTab.currentIndex > 0} canGoForward={activeTab.currentIndex < activeTab.history.length - 1}
        />
      )}
    </div>
  );
};

const App = () => (
  <DragonProvider>
    <AppContent />
  </DragonProvider>
);

export default App;
