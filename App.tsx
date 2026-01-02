return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-black">
      {viewMode === BrowserViewMode.BROWSER && (
        <div>Browser</div>
      )}
    </div>
  );
};

const App: React.FC = () => (
  <DragonProvider>
    <AppContent />
  </DragonProvider>
);

export default App;
