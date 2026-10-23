import React, { useEffect } from 'react';
import { Flame, RefreshCw, BookOpen, AlertOctagon } from 'lucide-react';
import { sound } from '../utils/audio';

interface GameOverModalProps {
  stepsCompleted: number;
  totalSteps: number;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stepsCompleted,
  totalSteps,
  onRestart,
}) => {
  useEffect(() => {
    sound.playWrongFizzle();
    sound.playFiendfyreCrackle();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg parchment-panel rounded-2xl p-6 sm:p-8 relative border-2 border-red-600/70 shadow-[0_0_50px_rgba(239,68,68,0.5)] text-center">
        {/* Roaring Flame Icon */}
        <div className="mx-auto w-16 h-16 rounded-full border-2 border-red-500/60 bg-red-950/60 flex items-center justify-center text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)] animate-pulse">
          <Flame className="w-9 h-9" />
        </div>

        {/* Title */}
        <div className="mt-4">
          <span className="text-xs font-cinzel tracking-widest uppercase text-red-400 font-semibold flex items-center justify-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Magical Stamina Depleted</span>
          </span>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-red-100 mt-1">
            The Fiendfyre Caught Up!
          </h1>
          <p className="text-xs sm:text-sm text-[#baa3a3] mt-2 max-w-sm mx-auto">
            The cursed flames engulfed the bridge before you could finish your incantations.
          </p>
        </div>

        {/* Journey Statistics */}
        <div className="my-5 p-4 rounded-xl bg-[#1c1214] border border-red-900/50 text-left">
          <div className="flex items-center justify-between text-xs text-[#baa3a3] pb-2 border-b border-red-900/40">
            <span>Progress Reached</span>
            <span className="font-mono text-red-300 font-bold tabular-nums">
              Stone {stepsCompleted} of {totalSteps}
            </span>
          </div>
          <div className="pt-2 text-xs text-[#baa3a3] leading-relaxed">
            <span className="font-semibold text-amber-300">Defense Tip:</span> Answering cybersecurity questions quickly and accurately restores precious seconds to your spell bar.
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center mt-6">
          <button
            onClick={() => {
              sound.playParchmentClick();
              onRestart();
            }}
            className="px-8 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-cinzel font-bold text-sm tracking-wider uppercase transition-all duration-200 shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Bridge Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
