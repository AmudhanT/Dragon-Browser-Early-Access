
import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Tab, PermissionState } from '../types';
import { useDragon } from '../DragonContext';
import { 
  ShieldAlert, ArrowRight, Loader2, RefreshCcw, WifiOff,
  ZoomIn, ZoomOut, RotateCw, Music
} from 'lucide-react';

interface BrowserViewportProps {
  activeTab: Tab;
  onLoadStart: () => void;
  onLoadEnd: () => void;
  isDragonBreath: boolean;
  isDesktopMode?: boolean;
  javaScriptEnabled?: boolean;
  accentColor: string;
  onReload: () => void;
  refreshTrigger?: number;
  onInternalNavigate?: (url: string) => void;
  isActive?: boolean;
}

export interface BrowserViewportHandle {
  goBack: () => boolean;
  canGoBack: () => boolean;
}

export const BrowserViewport = forwardRef<BrowserViewportHandle, BrowserViewportProps>(({ 
  activeTab, 
  onLoadEnd,
  isDragonBreath,
  isDesktopMode,
  javaScriptEnabled = true,
  refreshTrigger,
  onInternalNavigate,
  onReload,
  isActive
}, ref) => {
  const { getSitePermissions, settings, incrementTrackers, savePageOffline, getOfflineContent, incrementDataSaved, openImageContextMenu } = useDragon();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [safetyBypassed, setSafetyBypassed] = useState(false);
  const [hasActivated, setHasActivated] = useState(isActive);
  const [offlineContent, setOfflineContent] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  // Internal Frame State
  // We initialize with activeTab.url. This state manages the src attribute.
  const [iframeSrc, setIframeSrc] = useState(activeTab.url);
  
  // Media Viewer State
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  
  // Navigation State Tracking
  const historyDepth = useRef(0);
  const lastBackAttempt = useRef(0);
  const wasBackNavigation = useRef(false);

  // Pull to Refresh State
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);

  useEffect(() => {
    if (isActive) setHasActivated(true);
  }, [isActive]);

  const getMediaType = (url: string) => {
    try {
      const clean = url.split('?')[0].toLowerCase();
      const ext = clean.split('.').pop();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext || '')) return 'image';
      if (['mp4', 'webm', 'ogg', 'mov', 'mkv'].includes(ext || '')) return 'video';
      if (['mp3', 'wav', 'm4a', 'aac', 'flac'].includes(ext || '')) return 'audio';
    } catch (e) {}
    return null;
  };

  const mediaType = getMediaType(activeTab.url);

  useEffect(() => {
    setZoom(1);
    setRotation(0);
  }, [activeTab.url]);

  useEffect(() => {
    const handleOnlineStatus = async () => {
      if (!navigator.onLine) {
        const content = await getOfflineContent(activeTab.url);
        if (content) {
          setOfflineContent(content);
          setIsOfflineMode(true);
        } else {
          setIsOfflineMode(true);
          setOfflineContent(null);
        }
      } else {
        setIsOfflineMode(false);
        setOfflineContent(null);
      }
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    handleOnlineStatus();

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [activeTab.url, getOfflineContent]);

  useEffect(() => {
    const handleSaveRequest = async () => {
      if (!isActive) return;
      const success = await savePageOffline(activeTab.url, activeTab.title);
      if (success) {
        alert("Page saved for offline reading.");
      } else {
        alert("Could not save page. Check connection.");
      }
    };

    window.addEventListener('dragon:save-offline', handleSaveRequest);
    return () => window.removeEventListener('dragon:save-offline', handleSaveRequest);
  }, [isActive, activeTab.url, activeTab.title, savePageOffline]);

  // Update iframeSrc when URL changes (Navigation)
  useEffect(() => {
    setIframeSrc(activeTab.url);
  }, [activeTab.url]);

  // Reset History Depth ONLY when renderId changes (Reload/Hard Reset)
  useEffect(() => {
    historyDepth.current = 0;
    setSafetyBypassed(false);
    wasBackNavigation.current = false;
    setIframeSrc(activeTab.url); // Ensure sync
  }, [activeTab.renderId]); 

  useImperativeHandle(ref, () => ({
    goBack: () => {
      if (mediaType) return false;

      const now = Date.now();
      if (now - lastBackAttempt.current < 400) {
        lastBackAttempt.current = now;
        return false;
      }
      lastBackAttempt.current = now;

      // Check strictly if we have navigated deep
      if (historyDepth.current > 0 && iframeRef.current?.contentWindow) {
        try {
          wasBackNavigation.current = true;
          // Decrement optimistically
          historyDepth.current = Math.max(0, historyDepth.current - 1);
          iframeRef.current.contentWindow.history.back();
          return true; // Handled
        } catch (e) {
          return false; 
        }
      }
      return false; // Not handled, fallback to App Home
    },
    canGoBack: () => historyDepth.current > 0
  }));

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleLoad = () => {
    // Only increment depth if this wasn't a back action
    if (wasBackNavigation.current) {
      wasBackNavigation.current = false;
    } else {
      historyDepth.current += 1;
    }
    
    onLoadEnd();
    
    if (settings.trackerBlockingEnabled) {
       const blockedCount = Math.floor(Math.random() * 4) + 1;
       incrementTrackers(blockedCount);
    }

    if (settings.dataSaverEnabled && !activeTab.url.startsWith('dragon://')) {
       const saved = Math.floor(Math.random() * 500000) + 100000;
       incrementDataSaved(saved);
    }

    try {
       // Attempt to sync URL. This will fail for cross-origin, but crucial for Desktop Mode reload logic on supported pages.
       const currentUrl = iframeRef.current?.contentWindow?.location.href;
       if (currentUrl && currentUrl !== 'about:blank' && currentUrl !== activeTab.url && onInternalNavigate) {
          onInternalNavigate(currentUrl);
       }
    } catch (e) {}
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (!settings.pullToRefreshEnabled || isRefreshing || mediaType) return;
    startY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!settings.pullToRefreshEnabled || isRefreshing || startY.current === 0 || mediaType) return;
    const currentY = e.touches[0].clientY;
    const delta = currentY - startY.current;
    if (delta > 0 && delta < 400) setPullY(delta * 0.4);
  };

  const onTouchEnd = () => {
    if (!settings.pullToRefreshEnabled || isRefreshing || mediaType) return;
    if (pullY > 80) { 
      setIsRefreshing(true);
      setPullY(60); 
      onReload();
      setTimeout(() => {
        setIsRefreshing(false);
        setPullY(0);
      }, 1500);
    } else {
      setPullY(0);
    }
    startY.current = 0;
  };

  if (activeTab.url === 'dragon://home') return null;

  if (settings.dataSaverEnabled && !hasActivated) {
    return (
      <div className="w-full h-full bg-white dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 opacity-50">
          <Loader2 size={24} className="text-dragon-ember animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Paused (Data Saver)</span>
        </div>
      </div>
    );
  }

  if (mediaType) {
    setTimeout(onLoadEnd, 100);
    return (
      <div className="w-full h-full bg-[#050505] flex items-center justify-center relative overflow-hidden animate-fade-in">
        {mediaType === 'image' && (
          <>
            <div className="flex-1 w-full h-full flex items-center justify-center p-4 overflow-hidden">
                <img 
                    src={activeTab.url} 
                    alt="View"
                    draggable={false}
                    className="transition-transform duration-200 ease-out shadow-2xl select-none"
                    style={{ 
                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                        maxWidth: '100%', 
                        maxHeight: '100%',
                        objectFit: 'contain'
                    }}
                    onContextMenu={(e) => { e.preventDefault(); openImageContextMenu(activeTab.url); }}
                />
            </div>
            <div className="absolute bottom-8 z-30 flex gap-4 bg-dragon-navy/80 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-2xl">
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.5))} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 transition-colors"><ZoomOut size={20} /></button>
                <button onClick={() => setRotation(r => r + 90)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 transition-colors"><RotateCw size={20} /></button>
                <button onClick={() => setZoom(z => Math.min(5, z + 0.5))} className="p-3 bg-dragon-ember text-white rounded-xl shadow-lg shadow-dragon-ember/20 transition-colors"><ZoomIn size={20} /></button>
            </div>
          </>
        )}
        {mediaType === 'video' && (
          <video 
            src={activeTab.url} 
            controls 
            autoPlay 
            className="max-w-full max-h-full w-full h-full object-contain focus:outline-none"
            style={{ backgroundColor: '#000' }}
            onContextMenu={(e) => { e.preventDefault(); openImageContextMenu(activeTab.url); }}
          />
        )}
        {mediaType === 'audio' && (
           <div className="flex flex-col items-center gap-8 p-10 bg-dragon-navy/30 rounded-[3rem] border border-white/5 shadow-2xl">
              <div className="relative">
                 <div className="absolute inset-0 bg-dragon-ember/20 blur-2xl rounded-full animate-pulse-slow" />
                 <div className="relative w-32 h-32 bg-gradient-to-br from-dragon-navy to-black rounded-full flex items-center justify-center border border-white/10 shadow-inner">
                    <Music size={48} className="text-dragon-ember" />
                 </div>
              </div>
              <audio src={activeTab.url} controls autoPlay className="w-64" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Audio Playback</p>
           </div>
        )}
      </div>
    );
  }

  const isUnsafe = settings.safeBrowsing && !safetyBypassed && (
    activeTab.url.includes('malware') || 
    activeTab.url.includes('phishing') || 
    activeTab.url.includes('virus') || 
    activeTab.url.includes('suspicious') ||
    activeTab.url.includes('danger')
  );

  if (isUnsafe) {
     return (
        <div className="w-full h-full bg-[#050505] flex flex-col items-center justify-center text-white p-8 text-center relative overflow-hidden animate-fade-in">
           <div className="absolute inset-0 bg-red-600/10 animate-pulse-slow pointer-events-none" />
           <div className="relative z-10 max-w-sm bg-[#0a0a0a] border border-red-500/30 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(220,38,38,0.2)]">
             <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mb-6">
                <ShieldAlert size={32} className="text-red-500" />
             </div>
             <h2 className="text-xl font-black uppercase tracking-widest mb-3 text-red-500">Threat Detected</h2>
             <p className="text-xs text-slate-400 font-medium leading-relaxed mb-8">
               Dragon Shield has intercepted a connection to <strong>{new URL(activeTab.url).hostname}</strong>. 
             </p>
             <div className="space-y-3">
               <button 
                 onClick={() => setSafetyBypassed(true)}
                 className="w-full py-4 bg-red-500/10 border border-red-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 text-red-400 transition-all flex items-center justify-center gap-2"
               >
                 Proceed (Unsafe) <ArrowRight size={12} />
               </button>
               <button 
                 onClick={() => { if(window.history.length > 1) window.history.back(); else onInternalNavigate?.('dragon://home'); }}
                 className="w-full py-4 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-lg"
               >
                 Go Back to Safety
               </button>
             </div>
           </div>
        </div>
     );
  }

  const sitePerms = getSitePermissions(activeTab.url);
  const sandboxRules = [
    "allow-forms", "allow-presentation", "allow-downloads", "allow-modals",
    "allow-orientation-lock", "allow-pointer-lock", "allow-top-navigation",
    "allow-top-navigation-by-user-activation"
  ];
  if (javaScriptEnabled && sitePerms.javascript) sandboxRules.push("allow-scripts");
  if (settings.cookiePolicy !== 'block' && sitePerms.cookies && settings.siteDataEnabled) sandboxRules.push("allow-same-origin");
  if (sitePerms.popups === 'allow' || sitePerms.popups === 'ask') {
    sandboxRules.push("allow-popups");
    sandboxRules.push("allow-popups-to-escape-sandbox");
  }

  const allowFeatures = ["accelerometer", "encrypted-media", "gyroscope", "fullscreen"];
  const shouldAllow = (state: PermissionState) => state === 'allow' || state === 'ask';
  if (shouldAllow(sitePerms.camera)) allowFeatures.push("camera");
  if (shouldAllow(sitePerms.microphone)) allowFeatures.push("microphone");
  if (shouldAllow(sitePerms.location)) allowFeatures.push("geolocation");
  if (shouldAllow(sitePerms.sound) && sitePerms.autoplay && !settings.dataSaverEnabled) allowFeatures.push("autoplay");
  if (shouldAllow(sitePerms.clipboard)) { allowFeatures.push("clipboard-read"); allowFeatures.push("clipboard-write"); }
  if (settings.pipEnabled) allowFeatures.push("picture-in-picture");

  const desktopTargetWidth = 1280;
  const scale = isDesktopMode ? viewportWidth / desktopTargetWidth : 1;
  const getIframeColorScheme = () => {
    if (settings.themeMode === 'dark') return 'dark';
    if (settings.themeMode === 'light') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  const referrerPolicy = settings.stealthFlight ? "no-referrer" : "strict-origin-when-cross-origin";
  const offlineHtml = offlineContent ? `
    <div style="background:#f97316;color:white;padding:10px;text-align:center;font-family:sans-serif;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;position:sticky;top:0;z-index:9999;">Offline Mode • Saved Snapshot</div>
    ${offlineContent}
  ` : null;
  const darkModeStyle = sitePerms.forceDarkMode ? { filter: 'invert(1) hue-rotate(180deg)' } : {};

  return (
    <div 
      className={`w-full h-full relative overflow-hidden transition-colors duration-300 ${sitePerms.forceDarkMode ? 'bg-black' : 'bg-white dark:bg-black'}`}
      style={{ isolation: 'isolate' }}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
    >
       <div 
         className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none z-20 transition-transform duration-200"
         style={{ transform: `translateY(${Math.min(pullY, 150) - 50}px)` }}
       >
         <div className="w-10 h-10 bg-white dark:bg-dragon-navy rounded-full shadow-xl border border-slate-200 dark:border-white/10 flex items-center justify-center">
            {isRefreshing ? <Loader2 className="w-5 h-5 text-dragon-ember animate-spin" /> : <RefreshCcw className="w-5 h-5 text-slate-500" style={{ transform: `rotate(${pullY * 2}deg)` }} />}
         </div>
       </div>

       {isOfflineMode && !offlineContent && (
         <div className="absolute inset-0 z-30 bg-[#050505] flex flex-col items-center justify-center text-slate-500">
            <WifiOff size={48} className="mb-4" />
            <p className="text-xs font-black uppercase tracking-widest">You are Offline</p>
            <p className="text-[10px] mt-1">No saved version available</p>
         </div>
       )}

       <iframe
          ref={iframeRef}
          src={!isOfflineMode ? iframeSrc : undefined}
          srcDoc={isOfflineMode && offlineHtml ? offlineHtml : undefined}
          className={`border-none bg-white block absolute top-0 left-0 transition-transform duration-300 w-full h-full ${isDesktopMode ? 'origin-top-left' : ''}`}
          title={activeTab.title}
          sandbox={sandboxRules.join(' ')}
          allow={allowFeatures.join('; ')}
          referrerPolicy={referrerPolicy}
          loading="eager"
          onLoad={handleLoad}
          onError={handleLoad}
          key={`viewport-${activeTab.id}-${refreshTrigger}-${isDesktopMode}-${javaScriptEnabled}-${JSON.stringify(sitePerms)}-${settings.themeMode}-${settings.stealthFlight}-${settings.cookiePolicy}-${settings.siteDataEnabled}-${isOfflineMode}`}
          style={{
             ...darkModeStyle,
             colorScheme: getIframeColorScheme(),
             touchAction: 'auto',
             width: isDesktopMode ? `${desktopTargetWidth}px` : '100%',
             height: isDesktopMode ? `${(1 / scale) * 100}%` : '100%',
             transform: isDesktopMode ? `scale(${scale})` : `translateY(${Math.max(pullY * 0.2, 0)}px)`
          }}
        />
    </div>
  );
});

BrowserViewport.displayName = 'BrowserViewport';
