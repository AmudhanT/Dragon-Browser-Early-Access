
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [hide, setHide] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    const timer = setTimeout(() => {
      setHide(true);
      setTimeout(() => onFinish?.(), 800);
    }, 2800); 

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onFinish]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden font-sans"
      initial={{ opacity: 1 }}
      animate={hide ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <div className="flex flex-col items-center justify-center relative z-10 w-full px-4 h-full">
        <div className="flex-1" />
        <div className="flex flex-col items-center w-full max-w-sm">
          <div className="relative w-32 h-32 mb-12">
            <div className="absolute inset-0 bg-orange-600/20 blur-[60px] rounded-full animate-pulse-slow" />
            <img
              src="https://i.ibb.co/CKVTVSbg/IMG-20251221-WA0021.jpg"
              alt="Dragon Logo"
              className="w-full h-full object-cover rounded-[2.2rem] shadow-[0_0_40px_rgba(249,115,22,0.2)] border border-white/5 relative z-10"
              loading="eager"
            />
          </div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4 drop-shadow-2xl">
            Dragon Browser
          </h1>
          <div className="flex items-center gap-4 w-full justify-center mb-16">
            <div className="h-[2px] flex-1 max-w-[40px] bg-orange-600 rounded-full opacity-80" />
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.35em] whitespace-nowrap">
              Fast • Secure • Private
            </p>
            <div className="h-[2px] flex-1 max-w-[40px] bg-orange-600 rounded-full opacity-80" />
          </div>
          <div className="w-64 h-[3.5px] bg-white/10 rounded-full overflow-hidden relative shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-orange-600 to-orange-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
        </div>
        <div className="flex-1" />
        <div className="pb-16 text-center">
          <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.25em] leading-relaxed">
            DEVELOPED BY: AMUDHAN .T
          </p>
        </div>
      </div>
    </motion.div>
  );
};
