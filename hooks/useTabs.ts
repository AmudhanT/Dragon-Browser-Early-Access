
import { useState, useEffect, useCallback } from 'react';
import { Tab, BrowserViewMode, SearchEngine, TabGroup } from '../types';
import { normalizeUrl, getDisplayTitle, isTranslatedUrl, getOriginalUrl } from '../utils/urlUtils';

const INITIAL_TAB: Tab = {
  id: '1',
  url: 'dragon://home',
  title: 'Dragon Browser',
  lastAccessed: Date.now(),
  isLoading: false,
  isPrivate: false,
  history: ['dragon://home'],
  currentIndex: 0,
  renderId: 0,
  isTranslated: false,
};

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useTabs = (initialPrivateState: boolean, searchEngine: SearchEngine = 'dragon') => {
  const [tabs, setTabs] = useState<Tab[]>([INITIAL_TAB]);
  const [tabGroups, setTabGroups] = useState<TabGroup[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>(INITIAL_TAB.id);
  const [viewMode, setViewMode] = useState<BrowserViewMode>(BrowserViewMode.BROWSER);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  // Hibernation Logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTabs(prev => prev.map(t => {
        if (t.id !== activeTabId && !t.isHibernating && (now - t.lastAccessed > 300000)) { 
          return { ...t, isHibernating: true };
        }
        return t;
      }));
    }, 60000); 
    return () => clearInterval(interval);
  }, [activeTabId]);

  // Wake on access
  useEffect(() => {
    if (activeTab.isHibernating) {
      setTabs(prev => prev.map(t => 
        t.id === activeTabId ? { ...t, isHibernating: false, lastAccessed: Date.now() } : t
      ));
    }
  }, [activeTabId, activeTab.isHibernating]);

  const createTab = useCallback((isPrivate?: boolean, groupId?: string) => {
    const newTab: Tab = {
      id: generateId(),
      url: 'dragon://home',
      title: 'Dragon Browser',
      lastAccessed: Date.now(),
      isLoading: false,
      isPrivate: isPrivate !== undefined ? isPrivate : initialPrivateState,
      history: ['dragon://home'],
      currentIndex: 0,
      groupId,
      renderId: 0,
      isTranslated: false
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setViewMode(BrowserViewMode.BROWSER);
  }, [initialPrivateState]);

  const closeTab = useCallback((id: string) => {
    setTabs(prev => {
      if (prev.length <= 1) {
        const resetTab = { ...INITIAL_TAB, id: generateId(), isPrivate: false, renderId: 0 };
        setActiveTabId(resetTab.id);
        return [resetTab];
      }
      const newTabs = prev.filter(t => t.id !== id);
      if (activeTabId === id) setActiveTabId(newTabs[newTabs.length - 1].id);
      return newTabs;
    });
  }, [activeTabId]);

  // OMNIBOX NAVIGATION
  const navigateTab = useCallback((rawInput: string, options?: { isTranslation?: boolean, originalUrl?: string }) => {
    const url = normalizeUrl(rawInput, searchEngine);
    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId) {
        const newHistory = t.history.slice(0, t.currentIndex + 1);
        newHistory.push(url);
        return { 
          ...t, url, title: getDisplayTitle(url),
          isLoading: true, lastAccessed: Date.now(),
          history: newHistory, currentIndex: newHistory.length - 1,
          // Handle Translation State
          isTranslated: options?.isTranslation ?? false,
          originalUrl: options?.isTranslation ? (options.originalUrl || t.originalUrl || t.url) : undefined
          // Do NOT increment renderId to preserve iframe state and history depth
        };
      }
      return t;
    }));
    setViewMode(BrowserViewMode.BROWSER);
  }, [activeTabId, searchEngine]);

  // INTERNAL WEBVIEW SYNC (Links clicked inside pages)
  const handleInternalNavigate = useCallback((url: string) => {
    if (!url || url.startsWith('about:') || url.startsWith('dragon://')) return;

    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId) {
        // Only update if the URL actually changed to prevent loops
        if (t.url === url) return t;

        // Check if this is a Back Navigation (URL matches previous history entry)
        if (t.currentIndex > 0 && t.history[t.currentIndex - 1] === url) {
           return {
             ...t,
             url: url,
             title: getDisplayTitle(url),
             lastAccessed: Date.now(),
             currentIndex: t.currentIndex - 1,
             // Auto-detect translation state on back nav
             isTranslated: isTranslatedUrl(url),
             originalUrl: isTranslatedUrl(url) ? getOriginalUrl(url) : undefined
           };
        }

        const newHistory = t.history.slice(0, t.currentIndex + 1);
        newHistory.push(url);

        // Auto-detect translation state for internal navigation
        const isTranslated = isTranslatedUrl(url);

        return {
          ...t,
          url: url, // RAW URL including parameters
          title: getDisplayTitle(url),
          lastAccessed: Date.now(),
          history: newHistory,
          currentIndex: newHistory.length - 1,
          // Maintain originalUrl if we are navigating *within* a translated session
          isTranslated: isTranslated,
          originalUrl: isTranslated ? (t.originalUrl || getOriginalUrl(url)) : undefined
        };
      }
      return t;
    }));
  }, [activeTabId]);

  const reloadTab = useCallback(() => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { 
      ...t, 
      isLoading: true, 
      lastAccessed: Date.now(),
      renderId: (t.renderId || 0) + 1 
    } : t));
  }, [activeTabId]);

  const goBack = useCallback(() => {
    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId && t.currentIndex > 0) {
        const newIndex = t.currentIndex - 1;
        const url = t.history[newIndex];
        const isTranslated = isTranslatedUrl(url);
        return { 
          ...t, 
          currentIndex: newIndex, 
          url, 
          title: getDisplayTitle(url), 
          isLoading: true,
          renderId: (t.renderId || 0) + 1,
          isTranslated: isTranslated,
          originalUrl: isTranslated ? (t.originalUrl || getOriginalUrl(url)) : undefined
        };
      }
      return t;
    }));
  }, [activeTabId]);

  const goForward = useCallback(() => {
    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId && t.currentIndex < t.history.length - 1) {
        const newIndex = t.currentIndex + 1;
        const url = t.history[newIndex];
        const isTranslated = isTranslatedUrl(url);
        return { 
          ...t, 
          currentIndex: newIndex, 
          url, 
          title: getDisplayTitle(url), 
          isLoading: true,
          renderId: (t.renderId || 0) + 1,
          isTranslated: isTranslated,
          originalUrl: isTranslated ? (t.originalUrl || getOriginalUrl(url)) : undefined
        };
      }
      return t;
    }));
  }, [activeTabId]);

  const togglePinTab = useCallback((id: string) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, pinned: !t.pinned } : t));
  }, []);

  const activateTab = useCallback((id: string) => {
    setActiveTabId(id);
    setTabs(prev => prev.map(t => t.id === id ? { ...t, lastAccessed: Date.now(), isHibernating: false } : t));
  }, []);

  return {
    tabs, tabGroups, activeTab, activeTabId, viewMode, setViewMode, setActiveTabId: activateTab,
    createTab, closeTab, navigateTab, handleInternalNavigate, reloadTab, goBack, goForward,
    setTabLoading: (isLoading: boolean) => setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading } : t)),
    setTabs, duplicateTab: (id: string) => {}, createTabGroup: (t: string) => "", deleteTabGroup: (id: string) => {}, updateTabGroup: (id: string, u: any) => {}, moveTabToGroup: (id: string, g?: string) => {},
    closeIncognitoTabs: () => {}, clearCurrentSession: () => {},
    togglePinTab
  };
};
