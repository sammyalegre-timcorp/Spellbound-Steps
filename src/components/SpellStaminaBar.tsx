import React from 'react';
import { Flame, Sparkles, AlertTriangle } from 'lucide-react';

interface SpellStaminaBarProps {
  currentSeconds: number;
  maxSeconds: number;
  currentStep: number;
  totalSteps: number;
  recentDelta: { type: 'bonus' | 'penalty'; amount: number; id: number } | null;
}

export const SpellStaminaBar: React.FC<SpellStaminaBarProps> = ({
  currentSeconds,
  maxSeconds,
  currentStep,
  totalSteps,
  recentDelta,
}) => {
  const percentage = Math.max(0, Math.min(100, (currentSeconds / maxSeconds) * 100));
  const isCritical = percentage < 25;
  const isWarning = percentage < 50 && !isCritical;

  // Fluid color calculation based on stamina health
  let barGradient = 'from-emerald-500 via-teal-400 to-cyan-300';
  let glowColor = 'rgba(52, 211, 153, 0.5)';
  if (isCritical) {
    barGradient = 'from-rose-600 via-red-500 to-amber-500';
    glowColor = 'rgba(239, 68, 68, 0.7)';
  } else if (isWarning) {
    barGradient = 'from-amber-600 via-amber-400 to-yellow-300';
    glowColor = 'rgba(245, 158, 11, 0.6)';
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 py-1 shrink-0">
      {/* Top Header Labels */}
      <div className="flex items-center justify-between mb-1 text-[11px] font-medium">
        <div className="flex items-center gap-2">
          <span className="font-cinzel font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Magical Stamina</span>
          </span>
          <span className="text-[#8c8477]">·</span>
          <span className="text-[#b3aca0]">
            Step {currentStep} of {totalSteps}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isCritical && (
            <span className="flex items-center gap-1 text-red-400 font-semibold text-[11px] animate-bounce">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span>Fiendfyre Surging!</span>
            </span>
          )}

          {/* Time display with tabular numbers */}
          <div className="flex items-baseline gap-1 font-mono text-xs">
            <span className={`font-bold tabular-nums text-sm ${isCritical ? 'text-red-400 animate-pulse' : 'text-amber-200'}`}>
              {Math.ceil(currentSeconds)}s
            </span>
            <span className="text-[10px] text-[#8c8477]">/ {maxSeconds}s</span>
          </div>
        </div>
      </div>

      {/* Main Filigree Progress Container */}
      <div className="relative">
        <div 
          className={`relative h-4 sm:h-5 w-full rounded bg-[#13111b] border ${
            isCritical ? 'border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'border-[#d4af37]/40 shadow-inner'
          } overflow-hidden p-0.5 transition-colors duration-300`}
        >
          {/* Background Runes Track Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:12px_12px]" />

          {/* Animated Depleting Fluid Fill */}
          <div
            className={`h-full rounded-sm bg-gradient-to-r ${barGradient} transition-all duration-300 ease-out relative`}
            style={{
              width: `${percentage}%`,
              boxShadow: `0 0 12px ${glowColor}`,
            }}
          >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white/40 shadow-[0_0_6px_#ffffff]" />
          </div>
        </div>

        {/* Floating time delta badge */}
        {recentDelta && (
          <div
            key={recentDelta.id}
            className={`absolute right-3 -top-7 px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wide pointer-events-none transition-all animate-bounce ${
              recentDelta.type === 'bonus'
                ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                : 'bg-red-950/90 text-red-300 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
            }`}
          >
            {recentDelta.type === 'bonus' ? `+${recentDelta.amount}s Restored!` : `-${recentDelta.amount}s Fiendfyre Strike!`}
          </div>
        )}
      </div>
    </div>
  );
};
