import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Sparkles, X, Smartphone, Share } from 'lucide-react';
import { sound } from '../utils/audio';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Suppress button if already installed as standalone PWA
  if (isInstalled) {
    return null;
  }

  // Handle Android / Chrome / Edge installation
  const handleInstallClick = async () => {
    sound.playParchmentClick();
    await install();
  };

  // If installable via beforeinstallprompt
  if (isInstallable) {
    return (
      <button
        onClick={handleInstallClick}
        aria-label="Install App for Offline Play"
        title="Install Fiendfyre Bridge app for offline play"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#15121f]/90 border border-[#d4af37]/40 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-[11px] font-cinzel font-semibold shadow-md hover:shadow-[0_0_12px_rgba(212,175,55,0.3)] transition-all cursor-pointer backdrop-blur-sm"
      >
        <Download className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden sm:inline">Install Offline App</span>
        <span className="sm:hidden">Install</span>
        <Sparkles className="w-3 h-3 text-amber-400" />
      </button>
    );
  }

  // If on iOS device (WebKit does not support beforeinstallprompt)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => {
            sound.playParchmentClick();
            setShowIOSGuide(true);
          }}
          aria-label="Install App on iOS"
          title="Install Fiendfyre Bridge on iPhone or iPad"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#15121f]/90 border border-[#d4af37]/40 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-[11px] font-cinzel font-semibold shadow-md hover:shadow-[0_0_12px_rgba(212,175,55,0.3)] transition-all cursor-pointer backdrop-blur-sm"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Install on iOS</span>
          <span className="sm:hidden">Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="w-full max-w-sm parchment-panel rounded-2xl p-5 border-2 border-amber-400/60 shadow-2xl relative text-left space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#d4af37]/25">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <h3 className="font-cinzel text-sm font-bold text-amber-300">
                    Install on iPhone / iPad
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-stone-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#b8b0a1] leading-relaxed">
                Enjoy offline play and fullscreen bridge trials directly from your home screen:
              </p>

              <ol className="text-xs text-[#ede5d8] space-y-2.5 bg-[#120f1a] p-3 rounded-lg border border-stone-800">
                <li className="flex items-start gap-2">
                  <span className="font-cinzel font-bold text-amber-400">1.</span>
                  <span>
                    Tap the <strong className="text-amber-300 inline-flex items-center gap-1"><Share className="w-3 h-3 inline" /> Share</strong> icon in your Safari bottom navigation bar.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-cinzel font-bold text-amber-400">2.</span>
                  <span>
                    Scroll down and tap <strong className="text-amber-300">"Add to Home Screen"</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-cinzel font-bold text-amber-400">3.</span>
                  <span>
                    Launch <strong>Fiendfyre</strong> anytime, even with no internet connection!
                  </span>
                </li>
              </ol>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-cinzel font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
