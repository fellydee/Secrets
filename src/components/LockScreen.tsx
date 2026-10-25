import React, { useState, useEffect } from 'react';
import { Fingerprint, Lock, Shield, Delete, CheckCircle2 } from 'lucide-react';
import { SecuritySettings } from '../types/diary';
import { hashPin } from '../services/crypto';
import { verifyBiometrics } from '../services/biometrics';
import { DoodleFlower } from './BotanicalDoodles';

interface LockScreenProps {
  settings: SecuritySettings;
  onUnlock: () => void;
  onDecoyUnlock?: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ settings, onUnlock, onDecoyUnlock }) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isShaking, setIsShaking] = useState(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);

  // Trigger biometric unlock on mount if enabled
  useEffect(() => {
    if (settings.isBiometricsEnabled) {
      handleBiometricScan();
    }
  }, [settings.isBiometricsEnabled]);

  const handleKeyPress = (num: string) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }
    if (pinInput.length < 6) {
      const nextPin = pinInput + num;
      setPinInput(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4 || nextPin.length === 6) {
        validatePin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }
    setPinInput(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const validatePin = async (candidatePin: string) => {
    if (!settings.pinHash) {
      onUnlock();
      return;
    }

    const hashed = await hashPin(candidatePin);

    if (settings.fakeDecoyPinHash && hashed === settings.fakeDecoyPinHash && onDecoyUnlock) {
      if ('vibrate' in navigator) navigator.vibrate([20, 20]);
      onDecoyUnlock();
      return;
    }

    if (hashed === settings.pinHash) {
      if ('vibrate' in navigator) {
        navigator.vibrate([20, 40]);
      }
      onUnlock();
    } else {
      if (candidatePin.length === 6 || (candidatePin.length === 4 && settings.pinHash.length === 64)) {
        setIsShaking(true);
        setErrorMsg('incorrect pin, try again');
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
        setTimeout(() => {
          setIsShaking(false);
          setPinInput('');
        }, 600);
      }
    }
  };

  const handleBiometricScan = async () => {
    setIsBiometricScanning(true);
    setErrorMsg('');

    try {
      const res = await verifyBiometrics(settings.biometricCredentialId);
      if (res.success) {
        setBiometricSuccess(true);
        setTimeout(() => {
          onUnlock();
        }, 400);
      } else {
        setErrorMsg(res.error || 'biometric verification could not verify');
      }
    } catch (e: any) {
      setErrorMsg('biometric scan failed');
    } finally {
      setIsBiometricScanning(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-between px-6 py-6 bg-[#F4F3F7] text-[#1E1926] select-none">
      {/* Top Branding Section with Official SECRET LOGS Logo */}
      <div className="flex flex-col items-center pt-2">
        <div className="w-20 h-20 rounded-2xl bg-white p-2.5 shadow-sm border border-[#E4DFEC] flex items-center justify-center mb-3">
          <img
            src="/assets/aistudio/SECRET_LOGS_b4791025.png"
            alt="Secret Logs"
            className="w-full h-full object-contain"
          />
        </div>

        <span className="font-mono text-xs uppercase tracking-widest text-[#E83375] font-bold">
          Secret Logs
        </span>

        <p className="font-mono text-xs text-[#7A7485] mt-1 text-center lowercase">
          {settings.isBiometricsEnabled ? 'scan biometric or enter master pin' : 'enter master pin to unlock'}
        </p>

        {/* PIN Indicators */}
        <div className={`flex items-center gap-3 mt-5 ${isShaking ? 'animate-bounce' : ''}`}>
          {[0, 1, 2, 3, 4, 5].map(idx => {
            const isFilled = idx < pinInput.length;
            return (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-[#E83375] scale-110 shadow-sm shadow-[#E83375]/30'
                    : 'border border-[#C9C3D4] bg-[#E8E5EE]'
                }`}
              />
            );
          })}
        </div>

        {errorMsg && (
          <p className="font-mono text-[11px] text-[#E83375] font-medium mt-2 text-center animate-pulse">
            {errorMsg}
          </p>
        )}
      </div>

      {/* Middle Biometric Button */}
      <div className="flex flex-col items-center my-2">
        <button
          type="button"
          onClick={handleBiometricScan}
          disabled={isBiometricScanning}
          className={`relative group p-4 rounded-3xl border transition-all duration-300 shadow-sm ${
            biometricSuccess
              ? 'bg-[#E83375]/15 border-[#E83375] text-[#E83375]'
              : isBiometricScanning
              ? 'bg-[#E83375]/10 border-[#E83375] text-[#E83375] animate-pulse'
              : 'bg-white border-[#E0DAE8] hover:border-[#E83375] text-[#7A7485] active:scale-95'
          }`}
          aria-label="Scan Fingerprint"
        >
          {biometricSuccess ? (
            <CheckCircle2 className="w-10 h-10 text-[#E83375]" />
          ) : (
            <Fingerprint className="w-10 h-10 text-[#E83375] stroke-[1.6]" />
          )}

          {isBiometricScanning && (
            <span className="absolute inset-0 rounded-3xl border-2 border-[#E83375]/40 animate-ping" />
          )}
        </button>

        <span className="font-mono text-[11px] text-[#7A7485] mt-2 lowercase">
          {isBiometricScanning ? 'verifying biometric...' : 'tap to scan biometric'}
        </span>
      </div>

      {/* Bottom Numeric Keypad */}
      <div className="w-full max-w-[280px] pb-2">
        <div className="grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="h-13 rounded-2xl bg-white hover:bg-[#FDF2F7] active:bg-[#FBE4EE] border border-[#E2DCE9] text-lg font-semibold text-[#1E1926] shadow-xs transition-transform active:scale-90 flex items-center justify-center font-mono"
            >
              {num}
            </button>
          ))}

          {/* Clear Button */}
          <button
            type="button"
            onClick={() => setPinInput('')}
            className="h-13 rounded-2xl bg-transparent hover:bg-white/60 border border-transparent text-xs font-mono text-[#7A7485] transition-transform active:scale-95 flex items-center justify-center lowercase"
          >
            clear
          </button>

          {/* 0 Key */}
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-13 rounded-2xl bg-white hover:bg-[#FDF2F7] active:bg-[#FBE4EE] border border-[#E2DCE9] text-lg font-semibold text-[#1E1926] shadow-xs transition-transform active:scale-90 flex items-center justify-center font-mono"
          >
            0
          </button>

          {/* Backspace Key */}
          <button
            type="button"
            onClick={handleBackspace}
            aria-label="Delete last digit"
            className="h-13 rounded-2xl bg-transparent hover:bg-white/60 border border-transparent text-[#7A7485] hover:text-[#E83375] transition-transform active:scale-95 flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* First time hint */}
        {!settings.pinHash && (
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={onUnlock}
              className="font-mono text-xs text-[#E83375] hover:underline underline-offset-4 lowercase"
            >
              first time? tap here to open
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
