import React, { useState, useEffect } from 'react';
import { Plane, Wifi, WifiOff, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenCapacitorGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCapacitorGuide }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center space-x-2">
        <div className="bg-indigo-600 p-2 rounded-xl shadow-inner flex items-center justify-center">
          <Plane className="w-5 h-5 text-white transform -rotate-45" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight leading-tight">FPPS</h1>
          <p className="text-[10px] text-slate-400 font-medium">Flight Price Prediction System</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenCapacitorGuide}
          className="bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs px-2.5 py-1 rounded-lg border border-indigo-500/30 font-medium flex items-center space-x-1 transition"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Capacitor Setup</span>
        </button>

        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-medium ${isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span className="hidden sm:inline">{isOnline ? 'Live AI' : 'Offline'}</span>
        </div>
      </div>
    </header>
  );
};
