
import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Settings, X, Maximize, Minimize, RotateCcw, RotateCw, 
  Languages, Headphones, Download, Fullscreen, PictureInPicture
} from 'lucide-react';
import { ActiveMedia } from '../types';
import { App as CapacitorApp } from '@capacitor/app';
import { useDragon } from '../DragonContext';

interface MediaPlayerProps {
  media: ActiveMedia;
  onClose: () => void;
  isBackground?: boolean;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ media, onClose, isBackground = false }) => {
  const { settings } = useDragon();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showAudioTracks, setShowAudioTracks] = useState(false);
  const [activeTrack, setActiveTrack] = useState('English (Original)');
  const [isInPip, setIsInPip] = useState(false);
  const controlsTimer = useRef<number | null>(null);

  const isVideo = media.type === 'video';
  const playerRef = isVideo ? videoRef : audioRef;

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onTimeUpdate = () => setCurrentTime(player.currentTime);
    const onLoadedMetadata = () => setDuration(player.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    
    // PiP Event Listeners
    const onEnterPip = () => setIsInPip(true);
    const onLeavePip = () => setIsInPip(false);

    player.addEventListener('timeupdate', onTimeUpdate);
    player.addEventListener('loadedmetadata', onLoadedMetadata);
    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);
    
    if (isVideo) {
      player.addEventListener('enterpictureinpicture', onEnterPip);
      player.addEventListener('leavepictureinpicture', onLeavePip);
    }

    return () => {
      player.removeEventListener('timeupdate', onTimeUpdate);
      player.removeEventListener('loadedmetadata', onLoadedMetadata);
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
      if (isVideo) {
        player.removeEventListener('enterpictureinpicture', onEnterPip);
        player.removeEventListener('leavepictureinpicture', onLeavePip);
      }
    };
  }, [playerRef, isVideo]);

  // Handle Auto PiP on Home (App Background)
  useEffect(() => {
    if (!isVideo || !settings.pipEnabled) return;

    const handleAppStateChange = async (state: any) => {
      if (!state.isActive && isPlaying && videoRef.current && document.pictureInPictureEnabled && !document.pictureInPictureElement) {
        try {
          // Attempt to enter PiP when app goes background.
          // Note: Browser constraints might block this if not triggered by user gesture immediately before.
          // However, in Capacitor WebView, sometimes it's permissive if video is active.
          await videoRef.current.requestPictureInPicture();
        } catch (e) {
          console.warn("Auto PiP blocked:", e);
        }
      }
    };

    const listener = CapacitorApp.addListener('appStateChange', handleAppStateChange);
    return () => {
        listener.then(l => l.remove());
    };
  }, [isVideo, isPlaying, settings.pipEnabled]);

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) playerRef.current.pause();
      else playerRef.current.play();
    }
  };

  const togglePip = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.error("PiP failed:", e);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (playerRef.current) {
      playerRef.current.currentTime = time;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    if (!isVideo) return;
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = window.setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const audioTracks = ['English (Original)', 'Tamil', 'Spanish', 'French', 'Hindi'];

  return (
    <div 
      className={`fixed inset-0 z-[200] bg-slate-950 flex flex-col transition-all duration-500 ${isBackground && !isVideo ? 'h-24 top-auto animate-slide-up' : ''}`}
      onMouseMove={handleMouseMove}
      onClick={handleMouseMove}
    >
      {/* Background Playback Identity */}
      {!isBackground && (
        <div className="absolute top-6 left-6 z-[210] flex items-center gap-3 animate-fade-in pointer-events-none opacity-20 group-hover:opacity-100">
          <img src="https://i.ibb.co/CKVTVSbg/IMG-20251221-WA0021.jpg" className="w-8 h-8 rounded-full" alt="" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Media Player</span>
        </div>
      )}

      {/* Close Button */}
      {!isBackground && (
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-[210] p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 transition-all active:scale-90 border border-white/5"
        >
          <X size={20} />
        </button>
      )}

      {/* Main Player Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {isVideo ? (
          <video 
            ref={videoRef}
            src={media.url}
            className="max-w-full max-h-full shadow-2xl"
            onClick={togglePlay}
            // Add attributes to support PiP
            controls={false} 
            playsInline
            x-webkit-airplay="allow" 
          />
        ) : (
          <div className="text-center space-y-8 p-12 animate-fade-in">
            <audio ref={audioRef} src={media.url} />
            <div className="relative mx-auto">
               <div className="absolute -inset-12 bg-dragon-ember/20 blur-[80px] rounded-full animate-pulse-slow" />
               <div className="relative w-48 h-48 bg-dragon-navy/60 rounded-[3rem] border border-white/10 flex items-center justify-center shadow-2xl">
                 <Headphones className="w-20 h-20 text-dragon-ember animate-bounce" />
               </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">{media.filename}</h2>
              <p className="text-dragon-ember text-[10px] font-black uppercase tracking-[0.4em]">Dragon Media Player</p>
            </div>
          </div>
        )}

        {/* Video Pause Overlay Logo */}
        {isVideo && !isPlaying && !isInPip && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center animate-fade-in">
            <img src="https://i.ibb.co/CKVTVSbg/IMG-20251221-WA0021.jpg" className="w-24 h-24 rounded-full opacity-30 grayscale" alt="" />
          </div>
        )}
      </div>

      {/* Custom Controls Container */}
      <div className={`
        bg-gradient-to-t from-slate-950/90 to-transparent p-8 space-y-6 transition-all duration-500
        ${!showControls && isPlaying && isVideo ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
      `}>
        {/* Progress Bar */}
        <div className="relative group px-1">
          <input 
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-dragon-ember group-hover:h-2 transition-all"
          />
          <div className="flex justify-between mt-2 text-[10px] font-black text-slate-500 font-mono uppercase tracking-widest">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-white transition-colors"><SkipBack size={24} /></button>
            <button 
              onClick={togglePlay}
              className="w-16 h-16 bg-dragon-ember text-white rounded-full flex items-center justify-center shadow-2xl shadow-dragon-ember/20 active:scale-90 transition-all"
            >
              {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" className="ml-1" />}
            </button>
            <button className="text-slate-400 hover:text-white transition-colors"><SkipForward size={24} /></button>
          </div>

          <div className="flex items-center gap-6">
            {/* Audio Track Selector (Multi-Audio Support) */}
            <div className="relative">
              <button 
                onClick={() => setShowAudioTracks(!showAudioTracks)}
                className={`p-3 rounded-xl transition-all ${showAudioTracks ? 'bg-dragon-ember text-white shadow-lg' : 'bg-white/5 text-slate-400'}`}
                title="Audio Tracks"
              >
                <Languages size={20} />
              </button>
              {showAudioTracks && (
                <div className="absolute bottom-16 right-0 w-56 bg-dragon-navy border border-white/10 rounded-2xl p-2 shadow-2xl animate-slide-up">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest p-2 border-b border-white/5 mb-1">Select Language</p>
                  {audioTracks.map(track => (
                    <button
                      key={track}
                      onClick={() => { setActiveTrack(track); setShowAudioTracks(false); }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${activeTrack === track ? 'bg-dragon-ember/20 text-dragon-ember' : 'text-slate-400 hover:bg-white/5'}`}
                    >
                      {track}
                      {activeTrack === track && <div className="w-1.5 h-1.5 rounded-full bg-dragon-ember" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
              <button onClick={() => setVolume(v => v === 0 ? 1 : 0)} className="text-slate-400">
                {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={volume}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setVolume(v);
                  if (playerRef.current) playerRef.current.volume = v;
                }}
                className="w-16 accent-dragon-ember cursor-pointer"
              />
            </div>

            {isVideo && (
              <div className="flex items-center gap-2">
                {document.pictureInPictureEnabled && settings.pipEnabled && (
                  <button 
                    onClick={togglePip}
                    className={`p-3 rounded-xl transition-all ${isInPip ? 'bg-dragon-cyan text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                    title="Picture-in-Picture"
                  >
                    <PictureInPicture size={20} />
                  </button>
                )}
                <button 
                  onClick={() => videoRef.current?.requestFullscreen()}
                  className="p-3 bg-white/5 text-slate-400 rounded-xl hover:text-white transition-all"
                >
                  <Maximize size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};
