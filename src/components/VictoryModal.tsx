import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Flame, RefreshCw, Settings, Sparkles, CheckCircle2 } from 'lucide-react';
import { GameSessionStats, HouseTheme, AcademySettings } from '../types/game';
import { sound } from '../utils/audio';
import { ASSETS } from '../utils/triviaStorage';

interface VictoryModalProps {
  stats: GameSessionStats;
  houseTheme: HouseTheme;
  settings: AcademySettings;
  onRestart: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stats,
  houseTheme,
  settings,
  onRestart,
}) => {
  // Fire celebratory fireworks on mount
  useEffect(() => {
    sound.playVictoryFanfare();

    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#d4af37', '#f59e0b', '#38bdf8', '#10b981'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#d4af37', '#e11d48', '#a855f7', '#fbbf24'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const total = stats.totalQuestionsAnswered || 10;
  const accuracy = Math.round((stats.correctAnswers / total) * 100);
  const housePoints = stats.correctAnswers * 15 + Math.round(stats.timeRemaining * 2);

  // Determine Auror Rank based on accuracy
  let rank = 'Senior Defense Auror';
  if (accuracy === 100) rank = 'Order of Merlin, First Class';
  else if (accuracy >= 80) rank = 'Hogwarts Chief Ward-Caster';
  else if (accuracy >= 60) rank = 'Apprentice Curse-Breaker';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl parchment-panel rounded-2xl p-6 sm:p-8 relative border-2 border-amber-400 shadow-[0_0_50px_rgba(212,175,55,0.4)] text-center">
        {/* Hogwarts Castle Illustration Banner at Top */}
        <div className="relative w-full h-28 sm:h-32 rounded-xl overflow-hidden mb-4 border border-amber-400/40 shadow-inner">
          <img
            src={ASSETS.castle}
            alt="Hogwarts Castle Sanctuary"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121017] via-transparent to-transparent" />
          <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span className="font-cinzel text-xs font-bold uppercase tracking-widest text-amber-200">
              Sanctuary Reached · Bridge Defended
            </span>
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          </div>
        </div>

        {/* Heraldic Crest / Avatar */}
        <div className="relative -mt-12 mx-auto w-16 h-16 rounded-full border-2 border-amber-400 bg-[#171421] p-1 shadow-lg">
          <img
            src={settings.customLogoUrl || ASSETS.crest}
            alt="Academy Crest"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain rounded-full"
          />
        </div>

        {/* Victory Banner Title */}
        <div className="mt-3">
          <span className="text-xs font-cinzel tracking-widest uppercase text-amber-400 font-semibold">
            Glorious Spellcraft
          </span>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-[#f3ebde] gold-glow mt-1">
            Hogwarts Castle Safety!
          </h1>
          <p className="text-xs sm:text-sm text-[#b3aca0] mt-1 max-w-md mx-auto">
            You successfully cast your way across all 10 floating stone steps, leaving the cursed Fiendfyre flames behind!
          </p>
        </div>

        {/* House Points and Auror Rank Pill-Free Data */}
        <div className="my-4 p-4 rounded-xl bg-[#171421]/90 border border-amber-400/20 text-left">
          <div className="flex items-center justify-between pb-2.5 border-b border-amber-400/15">
            <span className="font-cinzel text-xs text-[#b3aca0]">Magical Distinction</span>
            <span className="font-cinzel text-sm font-bold text-amber-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>{rank}</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2.5 text-center">
            <div>
              <div className="text-[11px] text-[#9c9486] uppercase font-cinzel">House Points</div>
              <div className="text-xl font-bold font-mono tabular-nums text-amber-400">+{housePoints}</div>
            </div>
            <div>
              <div className="text-[11px] text-[#9c9486] uppercase font-cinzel">Trivia Accuracy</div>
              <div className="text-xl font-bold font-mono tabular-nums text-emerald-400">{accuracy}%</div>
            </div>
            <div>
              <div className="text-[11px] text-[#9c9486] uppercase font-cinzel">Stamina Remaining</div>
              <div className="text-xl font-bold font-mono tabular-nums text-sky-400">{Math.ceil(stats.timeRemaining)}s</div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center mt-5">
          <button
            onClick={() => {
              sound.playParchmentClick();
              onRestart();
            }}
            className="px-8 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-cinzel font-bold text-sm tracking-wider uppercase transition-all duration-200 shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Cross the Bridge Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
