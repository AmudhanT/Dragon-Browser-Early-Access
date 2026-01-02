import React, { useState, useCallback } from 'react';
import { DragonProvider } from './DragonContext';

import { BrowserViewport } from './components/BrowserViewport';
import { FireProgressBar } from './components/FireProgressBar';

import { normalizeUrl } from './utils/urlUtils';

/* =========================
   APP CONTENT – REAL BROWSER (SAFE)
========================= */

const AppContent: React.FC = () => {
  const [urlInput, setUrlInput] = useState('https://google.com');
  const [currentUrl, setCurrentUrl] = useState('https://google.com');
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = useCallback(() => {
    const normalized = normalizeUrl(urlInput, 'google', true);
    setCurrentUrl(normalized);
  }, [urlInput]);

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#000',
        color: '#fff',
        fontFamily: 'sans-serif',
      }}
    >
      {/* ADDRESS BAR */}
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          backgroundColor: '#111',
          borderBottom: '1px solid #222',
        }}
      >
        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
          placeholder="Search or enter URL"
          style={{
            flex: 1,
            height: 36,
            borderRadius: 18,
            border: 'none',
            padding: '0 14px',
            outline: 'none',
            backgroundColor: '#222',
            color: '#fff',
            fontSize: 14,
          }}
        />
      </div>

      {/* LOADING BAR */}
      <FireProgressBar isLoading={isLoading} themeColor="#f97316" />

      {/* REAL BROWSER */}
      <div style={{ flex: 1 }}>
        <BrowserViewport
          activeTab={{
            id: 'main',
            url: currentUrl,
            title: '',
            lastAccessed: Date.now(),
            isLoading,
            isPrivate: false,
            history: [currentUrl],
            currentIndex: 0,
            groupId: null,
            renderId: 0,
            isTranslated: false,
          }}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onReload={() => setCurrentUrl(currentUrl)}
          isDesktopMode={false}
          javaScriptEnabled={true}
          isDragonBreath={false}
          accentColor="#f97316"
        />
      </div>
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
