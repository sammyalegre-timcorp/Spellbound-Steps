import React, { useMemo } from 'react';
import { HouseTheme, GameStatus } from '../types/game';
import { ASSETS } from '../utils/triviaStorage';
import { Shield, Sparkles, Flame, AlertTriangle } from 'lucide-react';

interface GameCanvasProps {
  currentStep: number; // 0 (start) to totalSteps (Hogwarts)
  totalSteps: number;
  houseTheme: HouseTheme;
  gameStatus: GameStatus;
  staminaPercent: number; // 0 to 100
  isFizzling: boolean;
  isHopping: boolean;
  castSpellName?: string;
}

// Ancient Elder Futhark & Arithmancy runes
const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ'];

export const GameCanvas: React.FC<GameCanvasProps> = ({
  currentStep,
  totalSteps,
  houseTheme,
  gameStatus,
  staminaPercent,
  isFizzling,
  isHopping,
  castSpellName,
}) => {
  // Generate ambient floating fiery embers in the Fiendfyre chasm
  const embers = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      left: `${(i * 3.7 + (i % 5) * 4) % 96 + 2}%`,
      size: (i % 3) + 2.5,
      duration: 2.5 + (i % 4) * 0.7,
      delay: (i % 7) * 0.4,
      color: i % 4 === 0 ? '#c084fc' : i % 3 === 0 ? '#fb923c' : '#ef4444',
    }));
  }, []);

  // Falling crumbling rock debris from collapsing start ledge
  const debris = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      left: `${4 + (i * 2)}%`,
      delay: i * 0.6,
      duration: 1.8 + (i % 3) * 0.5,
      size: 3 + (i % 3) * 2,
    }));
  }, []);

  // Celestial sanctuary light particles (gentle silver-white patronus motes on the right)
  const sanctuaryMotes = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      right: `${2 + (i * 2.2)}%`,
      top: `${20 + (i * 6) % 60}%`,
      size: 2 + (i % 2) * 2,
      duration: 3 + (i % 3) * 1.2,
      delay: i * 0.5,
    }));
  }, []);

  // Calculate coordinates on the bridge
  // Step 0: Collapsing Cliff (start at ~8% X)
  // Steps 1 to totalSteps: Stepping stones spread from 15% to 83%
  // Sanctuary Threshold / Courtyard: ~87% - 100%
  const getStonePosition = (index: number) => {
    if (index === 0) return { x: 7, y: 55 };
    const stepRatio = (index - 1) / Math.max(1, totalSteps - 1);
    const x = 15 + stepRatio * 68; // 15% to 83%
    // Gentle natural parabolic arch across the chasm
    const y = 56 + Math.sin(stepRatio * Math.PI) * 4.5;
    return { x, y };
  };

  const currentPos = getStonePosition(currentStep);
  const nextPos = getStonePosition(Math.min(totalSteps, currentStep + 1));

  // Fiendfyre level rises higher as stamina depletes (16% to 46% of canvas height)
  const fiendfyreHeight = Math.max(18, 46 - staminaPercent * 0.28);
  const isDangerCritical = staminaPercent < 30;

  // Dynamic stone sizing depending on totalSteps count
  const stoneSizeClass = totalSteps > 11 
    ? 'w-7 h-6 sm:w-9 sm:h-7' 
    : totalSteps > 8 
    ? 'w-8 h-6 sm:w-10 sm:h-8' 
    : 'w-10 h-8 sm:w-12 sm:h-9';

  return (
    <div 
      className={`relative w-full flex-1 min-h-[175px] max-h-[46vh] overflow-hidden rounded-xl border transition-all duration-300 shadow-2xl bg-[#07060c] select-none ${
        isDangerCritical || isFizzling
          ? 'border-red-500/80 shadow-[0_0_35px_rgba(239,68,68,0.5)]'
          : 'border-[#d4af37]/35'
      }`}
    >
      {/* 1. Backdrop: Hogwarts Castle Sanctuary at Night */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105 pointer-events-none"
        style={{
          backgroundImage: `url(${ASSETS.castle})`,
          filter: 'brightness(0.6) contrast(1.2)',
        }}
      />

      {/* Atmospheric Starry Night & Mist Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#08070d] via-transparent to-[#08070d]/80 pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-transparent via-[#06050a]/50 to-[#06050a]/90 pointer-events-none" />

      {/* Fiery danger vignette pulsing when stamina is critical */}
      {isDangerCritical && (
        <div className="absolute inset-0 border-2 border-red-500/40 pointer-events-none animate-pulse bg-gradient-to-t from-red-950/30 via-transparent to-red-950/20" />
      )}

      {/* ========================================================================= */}
      {/* 2. THE COLLAPSING PRECIPICE (Left Side - Step 0)                          */}
      {/* ========================================================================= */}
      <div 
        className="absolute left-0 bottom-[26%] w-[13%] h-36 bg-gradient-to-t from-stone-950 via-stone-900 to-stone-800 border-r border-red-500/40 rounded-r shadow-2xl z-15 flex flex-col justify-between p-1.5"
        style={{
          clipPath: 'polygon(0 0, 100% 28%, 88% 85%, 70% 100%, 0% 100%)',
        }}
      >
        {/* Fractured glowing magma fissure in the stone */}
        <div className="w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-transparent shadow-[0_0_8px_#ef4444] animate-pulse" />
        
        {/* Label */}
        <div className="mb-2">
          <span className="text-[9px] font-cinzel font-bold text-red-400 flex items-center gap-1 drop-shadow">
            <AlertTriangle className="w-2.5 h-2.5 text-red-500 animate-bounce" />
            <span className="hidden sm:inline">Collapsing</span>
          </span>
        </div>
      </div>

      {/* Falling crumbling rock debris fragments */}
      {debris.map((d) => (
        <div
          key={d.id}
          className="absolute bg-stone-700 border border-red-500/50 rounded-sm pointer-events-none animate-ping"
          style={{
            left: d.left,
            bottom: `${20 + (d.id * 8)}%`,
            width: `${d.size}px`,
            height: `${d.size * 1.2}px`,
            opacity: 0.6,
            animationDuration: `${d.duration}s`,
          }}
        />
      ))}

      {/* ========================================================================= */}
      {/* 3. ROARING FIENDFYRE ABYSS & CURSED PURSUING FIRE BEAST                   */}
      {/* ========================================================================= */}
      <div 
        className="absolute bottom-0 inset-x-0 transition-all duration-700 ease-out z-10 pointer-events-none"
        style={{ height: `${fiendfyreHeight}%` }}
      >
        {/* Glow halo */}
        <div className="absolute -top-14 inset-x-0 h-20 bg-gradient-to-t from-red-600/50 via-purple-600/25 to-transparent blur-lg" />

        {/* Fiendfyre flame layer */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-red-950/90 to-red-600/40">
          <svg className="w-full h-full preserve-3d" viewBox="0 0 1200 220" fill="none" preserveAspectRatio="none">
            {/* Rear cursed violet fire wave */}
            <path
              d="M0,90 C160,150 280,30 420,110 C560,180 720,40 880,105 C1020,170 1120,50 1200,80 L1200,220 L0,220 Z"
              fill="rgba(147, 51, 234, 0.45)"
            />
            {/* Mid scarlet inferno wave */}
            <path
              d="M0,120 C190,50 340,140 520,70 C700,130 840,60 1020,120 C1140,80 1190,140 1200,110 L1200,220 L0,220 Z"
              fill="rgba(220, 38, 38, 0.6)"
            />
            {/* Front searing magma wave */}
            <path
              d="M0,140 C140,100 300,170 470,120 C640,70 800,150 970,110 C1100,140 1160,100 1200,130 L1200,220 L0,220 Z"
              fill="rgba(249, 115, 22, 0.65)"
            />
          </svg>
        </div>

        {/* Rising glowing embers */}
        {embers.map((em) => (
          <div
            key={em.id}
            className="absolute rounded-full pointer-events-none animate-pulse"
            style={{
              left: em.left,
              bottom: `${(em.id * 7) % 85}%`,
              width: `${em.size}px`,
              height: `${em.size * 1.5}px`,
              backgroundColor: em.color,
              boxShadow: `0 0 10px ${em.color}`,
              opacity: 0.85,
              animationDuration: `${em.duration}s`,
            }}
          />
        ))}

        {/* Cursed Fiendfyre Beast Silhouette pursuing the wizard from the left! */}
        <div 
          className="absolute left-1 bottom-4 z-12 pointer-events-none transition-all duration-700 opacity-80"
          style={{
            transform: `scale(${1 + (100 - staminaPercent) * 0.005})`,
          }}
        >
          {/* Beast Head SVG with white hot glowing eyes */}
          <svg className="w-24 h-24 sm:w-32 sm:h-32 filter drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" viewBox="0 0 120 120" fill="none">
            {/* Flaming horned serpent silhouette */}
            <path
              d="M10,110 C25,80 30,55 50,40 C65,30 85,25 95,10 C92,28 80,45 88,60 C95,72 110,80 115,95 C100,90 85,95 75,105 C60,95 40,105 10,110 Z"
              fill="rgba(20, 10, 20, 0.9)"
              stroke="rgba(239, 68, 68, 0.7)"
              strokeWidth="2"
            />
            {/* Flaming crest */}
            <path
              d="M50,40 C58,20 70,15 85,10 C75,25 70,35 68,45 Z"
              fill="rgba(249, 115, 22, 0.8)"
            />
            {/* White hot demon eyes */}
            <circle cx="72" cy="48" r="3.5" fill="#ffffff" filter="drop-shadow(0 0 6px #fde047)" />
            <circle cx="72" cy="48" r="1.5" fill="#ef4444" />
            {/* Flaming jaw teeth */}
            <polygon points="65,65 72,70 68,75" fill="#fef08a" />
            <polygon points="75,68 82,73 78,78" fill="#fef08a" />
          </svg>
        </div>

        {/* Fiendfyre Lash Effect when player answers incorrectly */}
        {isFizzling && (
          <div 
            className="absolute z-20 pointer-events-none transition-all"
            style={{
              left: `${currentPos.x - 5}%`,
              bottom: '25%',
            }}
          >
            <div className="w-20 h-28 bg-gradient-to-t from-red-600 via-orange-500 to-transparent rounded-full blur-sm opacity-90 animate-ping" />
          </div>
        )}

        {/* Urgent Danger Text Overlay when Fiendfyre is surging */}
        {isDangerCritical && (
          <div className="absolute bottom-2 inset-x-0 text-center">
            <span className="font-cinzel text-xs tracking-widest uppercase text-red-200 font-bold bg-black/60 px-3 py-1 rounded-full border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse inline-flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>Fiendfyre Beast Closing In · Spellcast Immediately!</span>
            </span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. THE FLOATING STONE STEPS                                               */}
      {/* ========================================================================= */}
      {Array.from({ length: totalSteps }).map((_, idx) => {
        const stepNum = idx + 1;
        const pos = getStonePosition(stepNum);
        const isPassed = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        const isNextTarget = stepNum === currentStep + 1;
        // Stones far behind current step are burnt/destroyed by the pursuing fire!
        const isBurntAndFallen = stepNum <= currentStep - 2;

        // Visual states
        let stoneBorder = 'border-stone-700/80';
        let stoneBg = 'bg-stone-900/90';
        let runeColor = 'text-stone-500';
        let glow = '';

        if (isBurntAndFallen) {
          // Charred stone sinking into magma
          stoneBorder = 'border-red-900/60';
          stoneBg = 'bg-stone-950/80';
          runeColor = 'text-red-950';
          glow = 'shadow-[0_0_8px_rgba(239,68,68,0.2)] opacity-40';
        } else if (isPassed) {
          stoneBorder = 'border-emerald-500/70';
          stoneBg = 'bg-[#0f291e]';
          runeColor = 'text-emerald-400';
          glow = 'shadow-[0_0_14px_rgba(52,211,153,0.3)]';
        } else if (isCurrent) {
          stoneBorder = 'border-amber-400';
          stoneBg = 'bg-[#261f14]';
          runeColor = 'text-amber-300 font-bold';
          glow = 'shadow-[0_0_20px_rgba(251,191,36,0.5)]';
        } else if (isNextTarget) {
          stoneBorder = 'border-sky-500/60';
          stoneBg = 'bg-stone-900';
          runeColor = 'text-sky-300';
          glow = 'shadow-[0_0_12px_rgba(56,189,248,0.25)]';
        }

        return (
          <div
            key={stepNum}
            className={`absolute z-20 transition-all duration-500 flex flex-col items-center ${
              !isCurrent && !isBurntAndFallen ? 'animate-float' : ''
            }`}
            style={{
              left: `${pos.x}%`,
              top: `${isBurntAndFallen ? pos.y + 6 : pos.y}%`,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${(stepNum % 5) * 0.35}s`,
            }}
          >
            {/* Step Number Badge */}
            <span 
              className={`text-[9px] font-mono tracking-tighter mb-0.5 ${
                isBurntAndFallen 
                  ? 'text-red-900 line-through' 
                  : isPassed 
                  ? 'text-emerald-400' 
                  : isCurrent 
                  ? 'text-amber-300 font-bold' 
                  : 'text-stone-500'
              }`}
            >
              #{stepNum}
            </span>

            {/* Stone Pedestal */}
            <div
              className={`${stoneSizeClass} rounded-md border flex items-center justify-center transition-all duration-300 ${stoneBg} ${stoneBorder} ${glow} relative overflow-hidden`}
              style={{
                boxShadow: isCurrent 
                  ? `0 4px 18px rgba(0,0,0,0.8), 0 0 16px ${houseTheme.glowColor}` 
                  : '0 4px 12px rgba(0,0,0,0.7)',
              }}
            >
              {/* Rune symbol */}
              <span className={`text-xs sm:text-sm font-serif select-none ${runeColor} transition-colors`}>
                {RUNES[idx % RUNES.length]}
              </span>

              {/* Magical ward ring on passed / current stones */}
              {isPassed && !isBurntAndFallen && (
                <div className="absolute inset-0 border border-emerald-400/40 rounded-md pointer-events-none" />
              )}
              {isCurrent && (
                <div className="absolute inset-0 bg-amber-400/15 pointer-events-none animate-pulse" />
              )}
              {isBurntAndFallen && (
                <div className="absolute inset-0 bg-black/60 pointer-events-none" />
              )}
            </div>

            {/* Glowing reflection or scorched smoke below stone */}
            <div 
              className="w-5 h-1 rounded-full blur-[2px] mt-0.5 transition-opacity"
              style={{
                backgroundColor: isBurntAndFallen ? '#7f1d1d' : isPassed ? '#10b981' : isCurrent ? '#f59e0b' : 'transparent',
                opacity: isBurntAndFallen ? 0.3 : isPassed || isCurrent ? 0.6 : 0,
              }}
            />
          </div>
        );
      })}

      {/* ========================================================================= */}
      {/* 5. THE HOGWARTS CASTLE SANCTUARY (Right Side - The Safe Haven!)           */}
      {/* ========================================================================= */}
      <div 
        className="absolute right-0 bottom-[24%] w-[16%] sm:w-[15%] h-44 z-20 pointer-events-none flex flex-col justify-end items-end pr-1 sm:pr-2 pb-1"
      >
        {/* Luminous Celestial Protego Dome (Guarding the safe haven) */}
        <div 
          className="absolute -top-16 -left-12 right-0 bottom-0 pointer-events-none border-l-2 border-t-2 border-amber-300/70 rounded-tl-full bg-gradient-to-br from-amber-400/15 via-sky-400/10 to-transparent"
          style={{
            boxShadow: 'inset 0 0 35px rgba(251, 191, 36, 0.25), 0 0 25px rgba(56, 189, 248, 0.3)',
          }}
        >
          {/* Floating protective runes on the barrier arc */}
          <span className="absolute top-2 left-6 text-[10px] text-amber-300/80 font-serif animate-pulse">ᛏ</span>
          <span className="absolute top-10 left-2 text-[10px] text-sky-300/80 font-serif animate-pulse">ᚨ</span>
          <span className="absolute top-20 left-0 text-[10px] text-amber-300/80 font-serif animate-pulse">ᛋ</span>
        </div>

        {/* Hogwarts Arched Gateway with warm golden interior glow */}
        <div 
          className="relative w-full h-32 rounded-l-xl border-l-2 border-t border-amber-400/60 bg-gradient-to-t from-stone-900 via-stone-800 to-amber-950/70 shadow-2xl flex flex-col justify-between p-2 overflow-hidden"
          style={{
            boxShadow: '0 0 30px rgba(251, 191, 36, 0.35), inset 0 0 25px rgba(245, 158, 11, 0.2)',
          }}
        >
          {/* Grand gothic arched doorway pouring warm light */}
          <div className="absolute right-1 bottom-0 w-16 h-24 rounded-t-full bg-gradient-to-t from-amber-200 via-amber-400 to-amber-500 opacity-90 shadow-[0_0_35px_rgba(251,191,36,0.9)] flex items-end justify-center pb-2">
            <div className="w-10 h-16 rounded-t-full bg-stone-950/80 border-t-2 border-amber-400/80 shadow-inner flex flex-col items-center justify-center">
              <span className="text-[10px] text-amber-300 font-cinzel font-bold">Safe</span>
            </div>
          </div>

          {/* Golden Shield Heraldry on Top of Arch */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="w-7 h-7 rounded-full border border-amber-400/80 p-0.5 bg-amber-950 shadow-md">
              <img 
                src={ASSETS.crest} 
                alt="Hogwarts Seal" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
          </div>

          {/* Sanctuary Banner */}
          <div className="relative z-10 text-right">
            <span className="text-[9px] font-cinzel font-extrabold text-amber-200 tracking-wider uppercase block drop-shadow">
              Hogwarts
            </span>
            <span className="text-[8px] font-cinzel text-emerald-300 font-semibold uppercase block drop-shadow">
              Sanctuary
            </span>
          </div>
        </div>

        {/* Ethereal peaceful patronus light motes inside the safe zone */}
        {sanctuaryMotes.map((m) => (
          <div
            key={m.id}
            className="absolute rounded-full bg-amber-200 pointer-events-none animate-pulse"
            style={{
              right: m.right,
              top: m.top,
              width: `${m.size}px`,
              height: `${m.size}px`,
              boxShadow: '0 0 8px #fde047',
              opacity: 0.8,
              animationDuration: `${m.duration}s`,
            }}
          />
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 6. SPELL BEAM ANIMATION ON CORRECT ANSWER                                 */}
      {/* ========================================================================= */}
      {isHopping && currentStep < totalSteps && (
        <svg className="absolute inset-0 w-full h-full z-25 pointer-events-none">
          <defs>
            <linearGradient id="spellBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#67e8f9" stopOpacity="1" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="1" />
            </linearGradient>
            <filter id="spellGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <line
            x1={`${currentPos.x}%`}
            y1={`${currentPos.y - 6}%`}
            x2={`${nextPos.x}%`}
            y2={`${nextPos.y}%`}
            stroke="url(#spellBeamGrad)"
            strokeWidth="4"
            filter="url(#spellGlow)"
            strokeDasharray="8 4"
            className="animate-pulse"
          />
        </svg>
      )}

      {/* Spell Incantation Banner over Wizard */}
      {castSpellName && (
        <div 
          className="absolute z-30 pointer-events-none transition-all duration-300 animate-bounce"
          style={{
            left: `${currentPos.x}%`,
            top: `${Math.max(10, currentPos.y - 22)}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="px-2.5 py-0.5 rounded bg-[#0d0a14]/95 border border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.5)] whitespace-nowrap">
            <span className="text-[11px] font-cinzel font-bold text-amber-200 tracking-wider">
              ✦ {castSpellName}! ✦
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. THE WIZARD STUDENT SPRITE                                              */}
      {/* ========================================================================= */}
      <div
        className={`absolute z-30 transition-all duration-500 ease-out flex flex-col items-center ${
          isFizzling ? 'animate-[shake_0.4s_ease-in-out]' : ''
        }`}
        style={{
          left: `${currentPos.x}%`,
          top: `${currentPos.y - 12}%`,
          transform: 'translate(-50%, -50%)',
          transitionProperty: 'left, top, transform',
        }}
      >
        <div className="relative flex flex-col items-center group">
          {/* Wand light / Lumos glow */}
          <div 
            className={`absolute -right-3 -top-2 w-4 h-4 rounded-full transition-transform ${
              isHopping ? 'scale-150 bg-amber-200 shadow-[0_0_20px_#fde047]' : 'bg-cyan-200/80 shadow-[0_0_10px_#38bdf8]'
            }`}
          />

          {/* Wizard Hat / Hood */}
          <div 
            className="w-7 h-5 rounded-t-full border-t border-l border-r border-[#d4af37]/40 shadow-sm"
            style={{ backgroundColor: '#1c1829' }}
          />

          {/* Wizard Face */}
          <div className="w-5 h-4 bg-[#f8d7b0] rounded-b-md flex items-center justify-center relative overflow-hidden">
            <div className="flex gap-1.5 mb-0.5">
              <div className="w-1 h-1 bg-[#1c1829] rounded-full" />
              <div className="w-1 h-1 bg-[#1c1829] rounded-full" />
            </div>
            <div className="absolute top-1 inset-x-0.5 h-0.5 border-t border-stone-800" />
          </div>

          {/* House Scarf */}
          <div 
            className="w-6 h-2 rounded-sm border border-black/20 flex shadow-sm"
            style={{
              background: `repeating-linear-gradient(90deg, ${houseTheme.scarfColors[0]}, ${houseTheme.scarfColors[0]} 4px, ${houseTheme.scarfColors[1]} 4px, ${houseTheme.scarfColors[1]} 8px)`,
            }}
          />

          {/* Wizard Robes */}
          <div 
            className="w-8 h-7 rounded-b-md border-b border-l border-r border-black/40 shadow-md relative flex justify-center"
            style={{
              backgroundColor: '#12101a',
              borderTop: `2px solid ${houseTheme.primaryColor}`,
            }}
          >
            {/* Wand held in right hand */}
            <div 
              className={`absolute -right-2 top-1 w-5 h-0.5 bg-amber-800 rounded-full transition-transform origin-left ${
                isHopping ? '-rotate-45' : '-rotate-12'
              }`}
              style={{
                boxShadow: '0 0 4px rgba(212, 175, 55, 0.6)',
              }}
            />
          </div>

          {/* Spark sputter effect on wrong answer */}
          {isFizzling && (
            <div className="absolute -top-5 inset-x-0 flex justify-center pointer-events-none">
              <span className="text-red-400 font-bold text-xs animate-ping whitespace-nowrap bg-black/80 px-1.5 py-0.5 rounded border border-red-500/60">
                ⚡ Fizzle!
              </span>
            </div>
          )}
        </div>

        {/* Wizard Shadow on Stone */}
        <div className="w-6 h-1.5 bg-black/60 rounded-full blur-[1px] mt-0.5" />
      </div>

      {/* Header Info Tag in Top-Left Corner */}
      <div className="absolute top-2.5 left-2.5 z-20 px-2 py-0.5 rounded bg-[#0b0a12]/85 backdrop-blur-sm border border-[#d4af37]/30 text-[11px] font-cinzel text-amber-300 flex items-center gap-1.5">
        <Shield className="w-3 h-3 text-amber-400" />
        <span>Step <strong className="text-amber-200">{currentStep}</strong> of {totalSteps} Stones</span>
      </div>
    </div>
  );
};
