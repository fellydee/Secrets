import React, { useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';

interface AndroidFrameWrapperProps {
  children: React.ReactNode;
}

export const AndroidFrameWrapper: React.FC<AndroidFrameWrapperProps> = ({ children }) => {
  const [deviceMode, setDeviceMode] = useState<'phone' | 'fullscreen'>('phone');

  return (
    <div className="min-h-screen w-full bg-[#E4E2EB] flex flex-col items-center justify-center p-0 md:p-6 overflow-hidden">
      {/* Top Device Switcher Toolbar */}
      <div className="hidden md:flex items-center justify-between w-full max-w-md mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E83375] animate-pulse" />
          <span className="font-mono text-xs font-semibold text-[#544D5E] lowercase">
            android device mode
          </span>
        </div>

        <div className="flex items-center bg-white border border-[#DDD7E6] rounded-2xl p-0.5 text-xs shadow-xs">
          <button
            type="button"
            onClick={() => setDeviceMode('phone')}
            className={`px-3 py-1 rounded-xl flex items-center gap-1.5 font-mono text-[11px] transition-all lowercase ${
              deviceMode === 'phone'
                ? 'bg-[#E83375] text-white shadow-xs font-semibold'
                : 'text-[#7A7485] hover:text-[#1E1926]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>phone</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('fullscreen')}
            className={`px-3 py-1 rounded-xl flex items-center gap-1.5 font-mono text-[11px] transition-all lowercase ${
              deviceMode === 'fullscreen'
                ? 'bg-[#E83375] text-white shadow-xs font-semibold'
                : 'text-[#7A7485] hover:text-[#1E1926]'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>tablet</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      {deviceMode === 'phone' ? (
        <div className="w-full h-screen md:h-[844px] md:max-w-[412px] md:rounded-[48px] bg-[#F4F3F7] md:border-[10px] md:border-[#2C2735] shadow-2xl flex flex-col relative overflow-hidden ring-1 ring-black/10">
          {children}
        </div>
      ) : (
        <div className="w-full h-screen md:h-[90vh] md:max-w-4xl md:rounded-3xl bg-[#F4F3F7] md:border border-[#DCD7E6] shadow-2xl flex flex-col relative overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
};
