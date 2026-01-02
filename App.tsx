import React, { useState } from 'react';
import { DragonProvider } from './DragonContext';

const AppContent: React.FC = () => {
  const [url, setUrl] = useState('https://google.com');

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#000', color: '#fff' }}>
      <div style={{ height: 56, padding: '0 12px', display: 'flex', alignItems: 'center', background: '#111' }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ flex: 1, height: 36, borderRadius: 18, border: 'none', padding: '0 14px', background: '#222', color: '#fff' }}
        />
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
        🌐 Dragon Browser UI Ready
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <DragonProvider>
    <AppContent />
  </DragonProvider>
);

export default App;
