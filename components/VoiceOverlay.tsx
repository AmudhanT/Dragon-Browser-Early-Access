
import React from 'react';
import { Mic, X, Loader2, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import { VoiceState } from '../hooks/useVoiceSearch';

interface VoiceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  voiceState: VoiceState;
  transcript: string;
  error: string | null;
  onRetry: () => void;
}

export const VoiceOverlay: React.FC<VoiceOverlayProps> = ({ 
  isOpen, onClose, voiceState, transcript, error, onRetry 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 animate-fade-in touch-none">
      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-12">
        
        {/* Status Text */}
        <div className="space-y-2 h-16">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
            {voiceState === 'listening' && 'Listening...'}
            {voiceState === 'processing' && 'Processing...'}
            {voiceState === 'success' && 'Identified'}
            {voiceState === 'error' && 'Connection Error'}
          </h2>
          {voiceState !== 'error' && (
             <p className="text-lg text-dragon-ember font-medium leading-relaxed min-h-[1.5em] animate-pulse">
               {transcript || ""}
             </p>
          )}
        </div>

        {/* Dynamic Visualizer */}
        <div className="relative">
          {/* Ripple Effects for Listening */}
          {voiceState === 'listening' && (
            <>
              <div className="absolute inset-0 bg-dragon-ember/30 rounded-full animate-ping opacity-75 duration-1000" />
              <div className="absolute inset-[-20px] bg-dragon-ember/10 rounded-full animate-pulse opacity-50 duration-2000" />
            </>
          )}

          {/* Icon Container */}
          <div className={`
            relative w-24 h-24 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-500
            ${voiceState === 'listening' ? 'bg-dragon-ember text-white scale-110' : ''}
            ${voiceState === 'processing' ? 'bg-white text-dragon-ember animate-spin-slow' : ''}
            ${voiceState === 'error' ? 'bg-red-500 text-white' : ''}
            ${voiceState === 'success' ? 'bg-green-500 text-white' : ''}
            ${voiceState === 'idle' ? 'bg-white/10 text-slate-400' : ''}
          `}>
            {voiceState === 'listening' && <Mic size={40} className="animate-float" />}
            {voiceState === 'processing' && <Loader2 size={40} className="animate-spin" />}
            {voiceState === 'error' && <WifiOff size={40} />}
            {voiceState === 'success' && <CheckCircle size={40} />}
            {voiceState === 'idle' && <Mic size={40} />}
          </div>
        </div>

        {/* Error / Actions */}
        <div className="min-h-[80px] w-full flex flex-col items-center justify-center">
          {voiceState === 'error' ? (
            <div className="space-y-4 animate-slide-up">
              <p className="text-red-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <AlertCircle size={14} /> {error || "Unknown Error"}
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-black uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={onRetry}
                  className="px-6 py-3 rounded-xl bg-dragon-ember text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-dragon-ember/20 active:scale-95 transition-all"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={onClose}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all active:scale-90"
            >
              <X size={24} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
