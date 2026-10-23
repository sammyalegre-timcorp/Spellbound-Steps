import React, { useEffect, useState, useMemo } from 'react';
import { HouseTheme, GameStatus } from '../types/game';
import { ASSETS } from '../utils/triviaStorage';

interface GameCanvasProps {
  currentStep: number; // 0 to 10
  totalSteps: number;
  houseTheme: HouseTheme;
  gameStatus: GameStatus;
  staminaPercent: number; // 0 to 100
  isFizzling: boolean;
  isHopping: boolean;
  castSpellName?: string;
}

// 10 stone runes (Ancient Elder Futhark & Arithmancy symbols)
const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᛏ'];

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
  // Generate ambient floating embers in the Fiendfyre chasm
  const embers = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: `${(i * 4.2 + (i % 5) * 3) % 96 + 2}%`,
      size: (i % 3) + 2,
      duration: 3 + (i % 4) * 0.8,
      delay: (i % 6) * 0.5,
      color: i % 4 === 0 ? '#c084fc' : i % 3 === 0 ? '#fb923c' : '#ef4444', // Fiendfyre violet & crimson flames
    }));
  }, []);

  // Wizard coordinates on the bridge (relative percentage coordinates)
  // Step 0: Collapsing Cliff (start)
  // Steps 1 to 10: Stepping stones
  // Step 10: Castle entrance
  const getStonePosition = (index: number) => {
    // 0 is start cliff (8%), 10 is destination cliff (92%)
    // Stones 1..10 spread evenly from 15% to 85%
    if (index === 0) return { x: 8, y: 55 };
    const stepRatio = (index - 1) / (totalSteps - 1);
    const x = 16 + stepRatio * 68; // 16% to 84%
    // Gentle natural curvature across the chasm
    const y = 56 + Math.sin(stepRatio * Math.PI) * 4;
    return { x, y };
  };

  const currentPos = getStonePosition(currentStep);
  const nextPos = getStonePosition(Math.min(totalSteps, currentStep + 1));

  // Fiendfyre height surges higher when stamina is depleted
  // normal: bottom 18%, depleted: bottom 36%
  const fiendfyreHeight = Math.max(16, 42 - staminaPercent * 0.26);

  return (
    <div className="relative w-full flex-1 min-h-[170px] overflow-hidden rounded-xl border border-[#d4af37]/30 shadow-2xl bg-[#090810] select-none">
      {/* 1. Backdrop: Hogwarts Castle Sanctuary at Night */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-luminosity scale-105 pointer-events-none transition-transform duration-1000"
        style={{
          backgroundImage: `url(${ASSETS.castle})`,
          filter: 'brightness(0.65) contrast(1.15)',
        }}
      />

      {/* Atmospheric Starry Night & Mist Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090810] via-transparent to-[#090810]/70 pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-transparent via-[#08070d]/60 to-[#08070d]/90 pointer-events-none" />

      {/* Castle Entrance Marker on Right Cliff */}
      <div className="absolute right-1 top-[28%] z-10 hidden sm:flex flex-col items-center pointer-events-none">
        <div className="w-12 h-12 rounded-full border border-amber-400/40 p-1 bg-amber-950/40 backdrop-blur-sm shadow-[0_0_20px_rgba(251,191,36,0.3)]">
          <img 
            src={ASSETS.crest} 
            alt="Castle Seal" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
          />
        </div>
        <span className="font-cinzel text-[11px] font-bold text-amber-300 mt-1 drop-shadow">
          Castle Courtyard
        </span>
      </div>

      {/* 2. Fiendfyre Abyss: Roaring Cursed Flames at the Bottom */}
      <div 
        className="absolute bottom-0 inset-x-0 transition-all duration-700 ease-out z-10 pointer-events-none"
        style={{ height: `${fiendfyreHeight}%` }}
      >
        {/* Glow halo */}
        <div className="absolute -top-12 inset-x-0 h-16 bg-gradient-to-t from-red-600/40 via-purple-600/20 to-transparent blur-md" />

        {/* Fiendfyre flame layer with animated gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-red-950/80 to-red-600/30">
          {/* Cursed fire serpents / flame tongues SVG */}
          <svg className="w-full h-full preserve-3d" viewBox="0 0 1200 200" fill="none" preserveAspectRatio="none">
            <path
              d="M0,80 C150,140 250,20 400,90 C550,160 700,30 850,95 C1000,150 1100,40 1200,70 L1200,200 L0,200 Z"
              fill="rgba(220, 38, 38, 0.45)"
            />
            <path
              d="M0,110 C180,40 320,130 500,60 C680,120 820,50 1000,110 C1120,70 1180,130 1200,100 L1200,200 L0,200 Z"
              fill="rgba(168, 85, 247, 0.35)"
            />
            <path
              d="M0,130 C120,90 280,160 450,110 C620,60 780,140 950,100 C1080,130 1150,90 1200,120 L1200,200 L0,200 Z"
              fill="rgba(249, 115, 22, 0.5)"
            />
          </svg>
        </div>

        {/* Rising magical embers */}
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
              boxShadow: `0 0 8px ${em.color}`,
              opacity: 0.75,
              animationDuration: `${em.duration}s`,
            }}
          />
        ))}

        {/* Cursed Fire warning label when stamina is low */}
        {staminaPercent < 30 && (
          <div className="absolute bottom-2 inset-x-0 text-center">
            <span className="font-cinzel text-xs tracking-widest uppercase text-red-300 font-bold drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
              Cursed Fiendfyre Rising — Cast Swiftly!
            </span>
          </div>
        )}
      </div>

      {/* 3. The Left Collapsing Precipice (Step 0) */}
      <div 
        className="absolute left-0 bottom-[32%] w-[12%] h-24 bg-gradient-to-t from-stone-900 to-stone-800 border-r border-[#d4af37]/30 rounded-r-lg shadow-2xl z-15 flex flex-col justify-end p-2"
        style={{
          clipPath: 'polygon(0 0, 100% 25%, 85% 100%, 0% 100%)',
        }}
      >
        <span className="text-[10px] font-cinzel text-stone-400 font-bold">Start</span>
      </div>

      {/* 4. The 10 Floating Stone Steps */}
      {Array.from({ length: totalSteps }).map((_, idx) => {
        const stepNum = idx + 1;
        const pos = getStonePosition(stepNum);
        const isPassed = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        const isNextTarget = stepNum === currentStep + 1;

        // Visual states
        let stoneBorder = 'border-stone-700/80';
        let stoneBg = 'bg-stone-900/90';
        let runeColor = 'text-stone-500';
        let glow = '';

        if (isPassed) {
          stoneBorder = 'border-emerald-500/60';
          stoneBg = 'bg-[#0f291e]';
          runeColor = 'text-emerald-400';
          glow = 'shadow-[0_0_15px_rgba(52,211,153,0.3)]';
        } else if (isCurrent) {
          stoneBorder = 'border-amber-400';
          stoneBg = 'bg-[#261f14]';
          runeColor = 'text-amber-300 font-bold';
          glow = 'shadow-[0_0_24px_rgba(251,191,36,0.5)]';
        } else if (isNextTarget) {
          stoneBorder = 'border-sky-500/50';
          stoneBg = 'bg-stone-900';
          runeColor = 'text-sky-300';
          glow = 'shadow-[0_0_12px_rgba(56,189,248,0.25)]';
        }

        return (
          <div
            key={stepNum}
            className={`absolute z-20 transition-all duration-500 flex flex-col items-center ${
              !isCurrent ? 'animate-float' : ''
            }`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${(stepNum % 5) * 0.4}s`,
            }}
          >
            {/* Step Number Badge */}
            <span 
              className={`text-[9px] font-mono tracking-tighter mb-0.5 ${
                isPassed ? 'text-emerald-400' : isCurrent ? 'text-amber-300 font-bold' : 'text-stone-500'
              }`}
            >
              #{stepNum}
            </span>

            {/* Hexagonal Stone Pedestal */}
            <div
              className={`w-9 h-7 sm:w-11 sm:h-9 rounded-md border flex items-center justify-center transition-all duration-300 ${stoneBg} ${stoneBorder} ${glow} relative overflow-hidden`}
              style={{
                boxShadow: isCurrent 
                  ? `0 4px 20px rgba(0,0,0,0.8), 0 0 16px ${houseTheme.glowColor}` 
                  : '0 4px 15px rgba(0,0,0,0.7)',
              }}
            >
              {/* Rune symbol */}
              <span className={`text-xs sm:text-sm font-serif select-none ${runeColor} transition-colors`}>
                {RUNES[idx]}
              </span>

              {/* Magical ward ring on passed / current stones */}
              {isPassed && (
                <div className="absolute inset-0 border border-emerald-400/40 rounded-md pointer-events-none" />
              )}
              {isCurrent && (
                <div className="absolute inset-0 bg-amber-400/10 pointer-events-none animate-pulse" />
              )}
            </div>

            {/* Glowing reflection below stone */}
            <div 
              className="w-6 h-1 rounded-full blur-[2px] mt-1 transition-opacity"
              style={{
                backgroundColor: isPassed ? '#10b981' : isCurrent ? '#f59e0b' : 'transparent',
                opacity: isPassed || isCurrent ? 0.6 : 0,
              }}
            />
          </div>
        );
      })}

      {/* 5. Destination Hogwarts Sanctuary Ledge (Right Cliff) */}
      <div 
        className="absolute right-0 bottom-[32%] w-[12%] h-24 bg-gradient-to-t from-amber-950/80 to-stone-800 border-l border-amber-400/50 rounded-l-lg shadow-2xl z-15 flex flex-col justify-end p-2 items-end"
        style={{
          clipPath: 'polygon(15% 0%, 100% 0, 100% 100%, 0% 100%)',
        }}
      >
        <span className="text-[10px] font-cinzel text-amber-300 font-bold">Sanctuary</span>
      </div>

      {/* 6. Spell Beam Animation when Answering Correctly */}
      {isHopping && currentStep < totalSteps && (
        <svg 
          className="absolute inset-0 w-full h-full z-25 pointer-events-none"
        >
          <defs>
            <linearGradient id="spellBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#67e8f9" stopOpacity="0.9" />
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
            top: `${Math.max(12, currentPos.y - 20)}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="px-2.5 py-1 rounded bg-[#0d0a14]/90 border border-amber-400/70 shadow-[0_0_15px_rgba(251,191,36,0.4)] whitespace-nowrap">
            <span className="text-xs font-cinzel font-bold text-amber-200 tracking-wider">
              ✦ {castSpellName}! ✦
            </span>
          </div>
        </div>
      )}

      {/* 7. The Wizard Student Sprite */}
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
        {/* Wizard Visual Figure */}
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

          {/* Wizard Face / Glasses / Hair */}
          <div className="w-5 h-4 bg-[#f8d7b0] rounded-b-md flex items-center justify-center relative overflow-hidden">
            {/* Eyes */}
            <div className="flex gap-1.5 mb-0.5">
              <div className="w-1 h-1 bg-[#1c1829] rounded-full" />
              <div className="w-1 h-1 bg-[#1c1829] rounded-full" />
            </div>
            {/* Glasses wire */}
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
            <div className="absolute -top-4 inset-x-0 flex justify-center pointer-events-none">
              <span className="text-red-400 font-bold text-xs animate-ping">
                ⚡ Fizzle!
              </span>
            </div>
          )}
        </div>

        {/* Wizard Shadow on Stone */}
        <div className="w-6 h-1.5 bg-black/60 rounded-full blur-[1px] mt-0.5" />
      </div>

      {/* Step Counter Indicator in Top Corner of Canvas */}
      <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded bg-[#0d0c14]/80 backdrop-blur-sm border border-[#d4af37]/30 text-xs font-cinzel text-amber-300">
        Bridge Progress: <span className="font-bold">{currentStep}</span> / {totalSteps} Stones
      </div>
    </div>
  );
};
