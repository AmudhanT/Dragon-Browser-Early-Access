
import { useCallback, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { SearchEngine } from '../types';

declare global {
  interface Window {
    cordova?: {
      InAppBrowser: {
        open: (url: string, target: string, options: string) => InAppBrowserRef;
      };
    };
  }
}

interface InAppBrowserRef {
  addEventListener: (eventname: string, callback: (event: any) => void) => void;
  removeEventListener: (eventname: string, callback: (event: any) => void) => void;
  close: () => void;
  show: () => void;
  executeScript: (details: any, callback?: (result: any) => void) => void;
  insertCSS: (details: any, callback?: () => void) => void;
}

interface DragonEngineOptions {
  themeColor: string;
  isPrivate: boolean;
  searchEngine: SearchEngine;
  isDesktopMode: boolean;
}

export const useDragonEngine = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [browserRef, setBrowserRef] = useState<InAppBrowserRef | null>(null);

  const open = useCallback(async (url: string, options: DragonEngineOptions) => {
    if (!url || url === 'dragon://newtab' || url === 'dragon://home') {
      setIsActive(false);
      setCurrentUrl(null);
      return;
    }

    const isNative = Capacitor.isNativePlatform();
    setCurrentUrl(url);
    setIsActive(true);

    if (isNative && window.cordova?.InAppBrowser) {
      try {
        const target = '_blank';
        
        // Mobile User Agent (Default) vs Desktop
        const userAgent = options.isDesktopMode 
          ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          : "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

        const optionsList = [
          'location=no',              // We use our own address bar
          'hidden=no',                // Show immediately
          'zoom=no',
          'hardwareback=yes',
          'toolbar=yes',              // Keep native toolbar for navigation safety (Back/Forward)
          `toolbarcolor=${options.themeColor.replace('#', '')}`,
          'navigationbuttoncolor=#ffffff',
          'closebuttoncolor=#ffffff',
          'closebuttoncaption=Close',
          'hidenavigationbuttons=no', // Allow native back/forward
          'mediaPlaybackRequiresUserAction=no',
          'allowInlineMediaPlayback=yes',
          'shouldPauseOnSuspend=yes',
          'useWideViewPort=yes',      // Critical for modern rendering
          'domStorageEnabled=yes',    // Critical for login sessions (FB/YouTube)
          'javaScriptEnabled=yes',    // Critical for interactivity
          'beforeload=yes'            // Allow intercepting navigation if needed
        ];

        if (options.isPrivate) {
          optionsList.push('clearcache=yes');
          optionsList.push('clearsessioncache=yes');
        }

        const optionsStr = optionsList.join(',');
        
        // Force UserAgent through the open call isn't standard in standard IAB, 
        // but standard webview behavior usually respects system UA. 
        // Ideally handled via native config, but we set robust options here.

        const ref = window.cordova.InAppBrowser.open(url, target, optionsStr);
        setBrowserRef(ref);

        ref.addEventListener('loaderror', (event: any) => {
           console.error("Dragon Engine Load Error:", event.message);
        });

        ref.addEventListener('exit', () => {
          setIsActive(false);
          setBrowserRef(null);
          setCurrentUrl(null);
        });

      } catch (error) {
        console.error("Dragon Engine Protocol Failure:", error);
        // Fallback for development/web
        window.open(url, '_blank');
      }
    } else {
      // Web Fallback: Just open in new tab to avoid iframe blocking
      window.open(url, '_blank');
    }
  }, []);

  const close = useCallback(async () => {
    if (browserRef) {
      browserRef.close();
    }
    setIsActive(false);
    setCurrentUrl(null);
    setBrowserRef(null);
  }, [browserRef]);

  return {
    open,
    close,
    isActive,
    currentUrl
  };
};
