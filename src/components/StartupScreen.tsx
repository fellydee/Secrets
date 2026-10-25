import React, { useEffect, useState } from 'react';

interface StartupScreenProps {
  onComplete: () => void;
}

export const StartupScreen: React.FC<StartupScreenProps> = ({ onComplete }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start fading out after 1.5 seconds
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1500);

    // Complete transition after fade animation finishes
    const finishTimer = setTimeout(() => {
      onComplete();
    }, 2100);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(onComplete, 300);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F4F3F7] cursor-pointer transition-opacity duration-600 ease-out select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center transform transition-transform duration-700 ease-out scale-100 animate-in fade-in zoom-in-95">
        {/* Logo Card */}
        <div className="w-24 h-24 rounded-3xl bg-white p-3.5 shadow-md border border-[#E4DFEC] flex items-center justify-center mb-5">
          <img
            src="/assets/aistudio/SECRET_LOGS_b4791025.png"
            alt="Secret Logs"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Wordmark */}
        <h1 className="font-mono text-sm uppercase tracking-[0.25em] text-[#E83375] font-bold">
          SECRET LOGS
        </h1>

        <p className="font-mono text-xs text-[#7A7485] mt-2 tracking-wide lowercase">
          every day matters
        </p>

        {/* Minimal dot loading indicator */}
        <div className="flex items-center gap-1.5 mt-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E83375] animate-ping" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#E83375]/60" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#E83375]/30" />
        </div>
      </div>
    </div>
  );
};
