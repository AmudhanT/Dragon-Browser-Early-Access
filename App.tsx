
import React, { useState } from 'react';
import { DragonProvider } from './DragonContext';

/* =========================
   APP CONTENT (SAFE UI)
========================= */

const AppContent: React.FC = () => {
  const [url, setUrl] = useState('https://google.com');

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
          value={url}
          onChange={(e) => setUrl(e.target.value)}
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

      {/* CONTENT AREA */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          color: '#aaa',
        }}
      >
        🌐 Dragon Browser UI Ready
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
