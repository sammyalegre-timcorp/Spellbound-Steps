import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Sparkles } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 left-3 z-50 pointer-events-none transition-all duration-300">
      <div className="flex items-center gap-2 bg-[#14101e]/95 border border-amber-500/50 text-amber-200 px-3 py-1.5 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.8),0_0_15px_rgba(245,158,11,0.25)] text-xs font-cinzel backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <WifiOff className="w-3.5 h-3.5 text-amber-400" />
        <span className="tracking-wide">
          Offline Mode · <strong>Trial Fully Playable</strong>
        </span>
        <Sparkles className="w-3 h-3 text-amber-400" />
      </div>
    </div>
  );
};
