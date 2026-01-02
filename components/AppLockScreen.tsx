
import React, { useState, useEffect } from 'react';
import { Lock, Fingerprint, Delete, ShieldCheck, AlertCircle } from 'lucide-react';
import { useDragon } from '../DragonContext';

interface AppLockScreenProps {
  isSetupMode?: boolean;
  onSetupComplete?: (pin: string) => void;
  onCancelSetup?: () => void;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({ 
  isSetupMode = false, 
  onSetupComplete,
  onCancelSetup
}) => {
  const { unlockApp, settings, performBiometricCheck } = useDragon();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [confirmStep, setConfirmStep] = useState(false);
  const [firstPin, setFirstPin] = useState('');

  useEffect(() => {
    // If not in setup mode and biometrics enabled, try auto-trigger
    if (!isSetupMode && settings.security.biometricsEnabled && !pin) {
      handleBiometric();
    }
  }, [isSetupMode, settings.security.biometricsEnabled]);

  const handleBiometric = async () => {
    const success = await performBiometricCheck();
    if (success) {
      unlockApp();
    }
  };

  const handleNumClick = (num: number) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');
      
      // Check immediately if 4 digits
      if (newPin.length === 4) {
        if (isSetupMode) {
          setTimeout(() => handleSetupLogic(newPin), 300);
        } else {
          setTimeout(() => handleUnlockLogic(newPin), 300);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleUnlockLogic = (inputPin: string) => {
    if (inputPin === settings.security.pin) {
      unlockApp();
    } else {
      setError('Incorrect PIN');
      setPin('');
      // Vibrate if available
      if (navigator.vibrate) navigator.vibrate(200);
    }
  };

  const handleSetupLogic = (inputPin: string) => {
    if (!confirmStep) {
      setFirstPin(inputPin);
      setPin('');
      setConfirmStep(true);
    } else {
      if (inputPin === firstPin) {
        if (onSetupComplete) onSetupComplete(inputPin);
      } else {
        setError('PINs do not match. Try again.');
        setPin('');
        setFirstPin('');
        setConfirmStep(false);
      }
    }
  };

  return (
    <div className={`fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center text-white animate-fade-in ${isSetupMode ? 'bg-black/95' : 'bg-black'}`}>
      
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm px-8">
        
        {/* Header Icon */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-dragon-ember/20 blur-3xl rounded-full animate-pulse-slow" />
          <div className="relative w-20 h-20 bg-[#111] rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl">
            {isSetupMode ? <ShieldCheck size={32} className="text-dragon-cyan" /> : <Lock size={32} className="text-dragon-ember" />}
          </div>
        </div>

        {/* Title & Status */}
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-xl font-black uppercase tracking-widest">
            {isSetupMode 
              ? (confirmStep ? 'Confirm PIN' : 'Create PIN') 
              : 'Dragon Locked'}
          </h2>
          <p className={`text-xs font-bold uppercase tracking-wider h-4 ${error ? 'text-red-500' : 'text-slate-500'}`}>
            {error || (isSetupMode ? 'Enter 4-digit code' : 'Enter Passcode')}
          </p>
        </div>

        {/* PIN Dots */}
        <div className="flex gap-4 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full border transition-all duration-300 ${
                pin.length >= i 
                  ? (isSetupMode ? 'bg-dragon-cyan border-dragon-cyan scale-110' : 'bg-dragon-ember border-dragon-ember scale-110')
                  : 'border-white/20 bg-transparent'
              }`} 
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-x-8 gap-y-6 w-full max-w-[280px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumClick(num)}
              className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/5 flex items-center justify-center text-2xl font-medium transition-all active:scale-95"
            >
              {num}
            </button>
          ))}
          
          <div className="flex items-center justify-center">
            {(!isSetupMode && settings.security.biometricsEnabled) && (
              <button 
                onClick={handleBiometric}
                className="w-16 h-16 rounded-full flex items-center justify-center text-dragon-cyan/80 hover:text-dragon-cyan active:scale-90 transition-all"
              >
                <Fingerprint size={32} />
              </button>
            )}
            {isSetupMode && (
              <button 
                onClick={onCancelSetup}
                className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>

          <button
            onClick={() => handleNumClick(0)}
            className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/5 flex items-center justify-center text-2xl font-medium transition-all active:scale-95"
          >
            0
          </button>

          <div className="flex items-center justify-center">
            <button 
              onClick={handleDelete}
              className="w-16 h-16 rounded-full flex items-center justify-center text-slate-400 hover:text-white active:scale-90 transition-all"
            >
              <Delete size={24} />
            </button>
          </div>
        </div>

      </div>

      <div className="pb-8 opacity-30">
        <p className="text-[8px] font-black uppercase tracking-[0.4em]">Dragon Security Core</p>
      </div>
    </div>
  );
};
