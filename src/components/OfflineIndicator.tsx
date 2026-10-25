import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full bg-[#1A1822]/90 backdrop-blur-md border border-[#353145] px-3.5 py-1.5 text-[11px] font-mono text-[#D7D4E3] shadow-lg animate-in fade-in slide-in-from-bottom-2">
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>Offline Mode · Local logs fully accessible</span>
    </div>
  );
};
