
import React, { useEffect, useState, useCallback } from 'react';
import { performDragonSearch, DragonSearchResponse } from '../services/geminiService';
import { Sparkles, Globe, Key, Search, ExternalLink, RefreshCcw, Cpu, ArrowRight } from 'lucide-react';
import { FireProgressBar } from './FireProgressBar';
import { enforceSovereignProtocol } from '../utils/urlUtils';

interface DragonEngineViewProps {
  url: string;
  onNavigate: (url: string) => void;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

export const DragonEngineView: React.FC<DragonEngineViewProps> = ({ url, onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DragonSearchResponse | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);
  
  const query = new URL(url).searchParams.get('q') || '';

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorType(null);
    const result = await performDragonSearch(query);
    if (result.error) setErrorType(result.error);
    else setData(result);
    setLoading(false);
  }, [query]);

  useEffect(() => {
    if (query) fetchData();
  }, [query, fetchData]);

  const handleOpenKeyDialog = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      fetchData();
    }
  };

  const handleGoogleFallback = () => {
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    onNavigate(enforceSovereignProtocol(googleUrl));
  };

  if (errorType === 'QUOTA_EXHAUSTED' || errorType === 'INVALID_KEY' || errorType === 'ENTITY_NOT_FOUND' || (errorType === 'UNKNOWN' && !loading)) {
    const isQuota = errorType === 'QUOTA_EXHAUSTED';
    return (
      <div className="w-full h-full bg-[#050505] text-slate-100 flex items-center justify-center p-8 text-center animate-fade-in relative overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none opacity-20 ${isQuota ? 'bg-orange-500' : 'bg-red-500'}`} />
        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="relative mx-auto w-24 h-24">
            <div className={`absolute inset-0 blur-3xl rounded-full animate-pulse ${isQuota ? 'bg-orange-500/20' : 'bg-red-500/20'}`} />
            <div className={`relative w-full h-full bg-[#0f0f0f] border rounded-3xl flex items-center justify-center shadow-2xl ${isQuota ? 'border-orange-500/30' : 'border-red-500/30'}`}>
              <Cpu className={`w-10 h-10 ${isQuota ? 'text-orange-500' : 'text-red-500'}`} />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">
              {isQuota ? 'AI Limit Reached' : 'Search Connection Error'}
            </h2>
            <p className="text-slate-400 text-[11px] font-bold leading-relaxed px-4">
              {isQuota 
                ? "The AI search limit has been reached. To continue using AI features, please add your own Gemini API key."
                : "Unable to connect to the AI search service. Please check your settings or use standard search."}
            </p>
          </div>
          <div className="space-y-4 pt-4">
            <button 
              onClick={handleOpenKeyDialog}
              className="w-full py-4 bg-orange-500 text-black font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.3)] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Key size={14} /> Add API Key
            </button>
            <button 
              onClick={handleGoogleFallback}
              className="w-full py-4 bg-white/5 border border-white/10 text-slate-300 font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-3 group"
            >
              <Globe size={14} /> Search on Google
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center justify-center gap-6 pt-4">
               <button onClick={fetchData} className="text-[9px] text-slate-500 hover:text-white font-black uppercase tracking-widest flex items-center gap-2 transition-colors">
                 <RefreshCcw size={12} /> Retry Search
               </button>
               <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-[9px] text-slate-500 hover:text-orange-500 font-black uppercase tracking-widest transition-colors">
                 API Documentation
               </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#050505] text-slate-100 overflow-y-auto no-scrollbar relative">
      {loading && <FireProgressBar isLoading={true} themeColor="#f97316" />}
      <div className="max-w-4xl mx-auto p-6 md:p-8 min-h-screen flex flex-col">
        <div className="flex items-center gap-4 mb-8 animate-fade-in border-b border-white/5 pb-6">
          <div className="relative shrink-0">
             <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full" />
             <img src="https://i.ibb.co/CKVTVSbg/IMG-20251221-WA0021.jpg" alt="Dragon Search" className="w-14 h-14 rounded-2xl shadow-2xl border border-white/10 relative z-10 object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none truncate">Dragon Search</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <Sparkles className="w-3 h-3 text-orange-500" />
              <p className="text-orange-500 text-[9px] font-black uppercase tracking-[0.3em]">AI-Powered Results</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchData} className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all">
              <RefreshCcw size={16} />
            </button>
            <button onClick={handleGoogleFallback} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white transition-all shrink-0">
              <Globe size={14} /> Use Google
            </button>
          </div>
        </div>
        {data ? (
          <div className="animate-fade-in space-y-8 pb-20">
            <div className="bg-[#0f0f0f] rounded-[2rem] p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles size={40} className="text-orange-500" />
              </div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Search size={12} className="text-orange-500" /> AI Summary
              </h3>
              <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed font-medium">
                <p className="whitespace-pre-wrap">{data.answer}</p>
              </div>
            </div>
            {data.results.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <Globe size={14} className="text-cyan-500" />
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Web Sources</h3>
                </div>
                <div className="grid gap-3">
                  {data.results.map((result, idx) => (
                    <button key={idx} onClick={() => onNavigate(enforceSovereignProtocol(result.url))} className="w-full text-left bg-[#0f0f0f] hover:bg-[#151515] border border-white/5 hover:border-orange-500/30 p-5 rounded-2xl transition-all group flex items-start gap-4 active:scale-[0.99]">
                      <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
                        <img src={`https://www.google.com/s2/favicons?sz=64&domain=${result.domain}`} alt="" className="w-5 h-5 opacity-70 group-hover:opacity-100" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">{result.domain}</span>
                        <h4 className="text-sm font-bold text-blue-400 group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug">{result.title}</h4>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-white opacity-0 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="text-center pt-8 border-t border-white/5 space-y-4">
               <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Need more info? Try a standard search</p>
               <button onClick={handleGoogleFallback} className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-white/5 transition-all active:scale-95">
                 Search on Google
               </button>
            </div>
          </div>
        ) : !loading && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-50">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Connection Error</p>
            <button onClick={fetchData} className="mt-4 px-6 py-2 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-colors">
              Retry Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
