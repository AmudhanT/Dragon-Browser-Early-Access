import React from 'react';
import { DragonProvider } from './DragonContext';

/* =========================
   APP CONTENT (TEST)
========================= */

const AppContent: React.FC = () => {
  return (
    <div
      style={{
        color: 'white',
        background: 'black',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
      }}
    >
      Dragon Browser Loaded ✅
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
