import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, ShieldCheck, ShieldAlert } from 'lucide-react';

interface AndroidStatusBarProps {
  isLocked: boolean;
  stealthMode?: boolean;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({ isLocked, stealthMode }) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full px-6 py-2.5 flex items-center justify-between text-xs text-[#7A7485] select-none bg-[#F3F2F6] backdrop-blur-md z-30 border-b border-[#E7E4ED]">
      {/* Time in clean font */}
      <div className="font-mono text-xs font-semibold tracking-tight text-[#1E1926]">
        {timeStr || '9:41'}
      </div>

      {/* Android Center Camera Punch Hole */}
      <div className="w-3.5 h-3.5 rounded-full bg-[#1A1622] border border-[#DDD9E5] shadow-inner" />

      {/* Status Icons */}
      <div className="flex items-center gap-2">
        {isLocked ? (
          <ShieldAlert className="w-3.5 h-3.5 text-[#E83375]" />
        ) : (
          <ShieldCheck className="w-3.5 h-3.5 text-[#E83375]" />
        )}
        <Wifi className="w-3.5 h-3.5 text-[#7A7485]" />
        <span className="font-mono text-[10px] text-[#7A7485]">5G</span>
        <div className="flex items-center gap-1">
          <span className="font-mono text-[10px] text-[#7A7485]">100%</span>
          <BatteryMedium className="w-3.5 h-3.5 text-[#1E1926]" />
        </div>
      </div>
    </div>
  );
};
