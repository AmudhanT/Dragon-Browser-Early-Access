import React, { useState } from 'react';

const AppContent: React.FC = () => {
  const [url, setUrl] = useState('https://google.com');

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#000' }}>
      {/* Address Bar */}
      <div style={{ height: 56, padding: 12, background: '#111' }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setUrl(url)}
          style={{
            width: '100%',
            height: 36,
            borderRadius: 18,
            border: 'none',
            padding: '0 14px',
            background: '#222',
            color: '#fff'
          }}
        />
      </div>

      {/* Web Content */}
      <iframe
        src={url}
        style={{ flex: 1, border: 'none', background: '#000' }}
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  );
};

export default AppContent;
