import React from 'react';

interface FireProgressBarProps {
  isLoading: boolean;
  themeColor: string;
}

export const FireProgressBar: React.FC<FireProgressBarProps> = ({ isLoading, themeColor }) => {
  if (!isLoading) return null;

  return (
    <div className="absolute top-0 left-0 w-full h-[2.5px] z-[60] overflow-hidden pointer-events-none">
      <div 
        className="h-full w-full animate-fire-loading origin-left"
        style={{
          background: `linear-gradient(90deg, 
            ${themeColor}00 0%, 
            ${themeColor} 50%, 
            #ef4444 100%)`,
            boxShadow: `0 0 12px ${themeColor}, 0 0 4px #ef4444`
        }}
      />
      <style>{`
        @keyframes fire-loading {
          0% { transform: translateX(-100%) scaleX(0.5); }
          50% { transform: translateX(-20%) scaleX(1.2); }
          100% { transform: translateX(100%) scaleX(0.5); }
        }
        .animate-fire-loading {
          animation: fire-loading 1.2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};