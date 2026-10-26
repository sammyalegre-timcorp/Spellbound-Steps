import React, { useMemo } from 'react';
import { HouseTheme, GameStatus } from '../types/game';
import { ASSETS } from '../utils/triviaStorage';
import { Sparkles, Flame, AlertTriangle, ShieldCheck } from 'lucide-react';

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

// Ancient Elder Futhark & Arithmancy runes on the stones
const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ'];

interface CharacterVisuals {
  skinTone: string;
  hairColor: string;
  hairStyle: 'messy' | 'sleek' | 'platinum' | 'curly';
  hasGlasses?: boolean;
  hasDiadem?: boolean;
  hasSerpentPin?: boolean;
  hasRosyCheeks?: boolean;
  wandWood: string;
  wandGrip: string;
  wandGlow: string;
  hatBase: string;
  hatTrim: string;
  hatBand: string;
  hatOrnament: string;
  robeBase: string;
  robeInner: string;
  robeLapel: string;
  chestEmblem: 'lion' | 'eagle' | 'snake' | 'badger';
}

const CHARACTER_VISUALS: Record<string, CharacterVisuals> = {
  gryffindor: {
    skinTone: '#f7d7be',
    hairColor: '#2b1810', // messy brown hair
    hairStyle: 'messy',
    hasGlasses: true, // classic round spectacles
    wandWood: '#78350f',
    wandGrip: '#b45309',
    wandGlow: '#fde047',
    hatBase: '#150f1d',
    hatTrim: '#2a1e38',
    hatBand: '#8a1c14',
    hatOrnament: '#d4af37',
    robeBase: '#110d19',
    robeInner: '#8a1c14',
    robeLapel: '#5c120c',
    chestEmblem: 'lion',
  },
  ravenclaw: {
    skinTone: '#faebd7',
    hairColor: '#090d16', // sleek raven dark hair
    hairStyle: 'sleek',
    hasDiadem: true, // silver diadem circlet
    wandWood: '#0f172a',
    wandGrip: '#475569',
    wandGlow: '#38bdf8',
    hatBase: '#0b1021',
    hatTrim: '#172242',
    hatBand: '#0e1a40',
    hatOrnament: '#946b2d',
    robeBase: '#090d18',
    robeInner: '#1e3a8a',
    robeLapel: '#0e1a40',
    chestEmblem: 'eagle',
  },
  slytherin: {
    skinTone: '#f3e7da',
    hairColor: '#e5dec6', // platinum blonde hair
    hairStyle: 'platinum',
    hasSerpentPin: true, // high aristocratic collar & serpent
    wandWood: '#18181b',
    wandGrip: '#27272a',
    wandGlow: '#34d399',
    hatBase: '#091510',
    hatTrim: '#132b20',
    hatBand: '#1a472a',
    hatOrnament: '#c0c0c0',
    robeBase: '#08140e',
    robeInner: '#14532d',
    robeLapel: '#1a472a',
    chestEmblem: 'snake',
  },
  hufflepuff: {
    skinTone: '#f8d9c2',
    hairColor: '#713f12', // sandy brown curly hair
    hairStyle: 'curly',
    hasRosyCheeks: true, // friendly warm flushed cheeks
    wandWood: '#a16207',
    wandGrip: '#ca8a04',
    wandGlow: '#fbbf24',
    hatBase: '#17130e',
    hatTrim: '#292015',
    hatBand: '#ecb939',
    hatOrnament: '#2b2927',
    robeBase: '#14110b',
    robeInner: '#ca8a04',
    robeLapel: '#854d0e',
    chestEmblem: 'badger',
  },
};

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
    return Array.from({ length: 26 }).map((_, i) => ({
      id: i,
      left: `${(i * 3.9 + (i % 5) * 4) % 95 + 2}%`,
      size: (i % 3) + 2.5,
      duration: 2.2 + (i % 4) * 0.6,
      color: i % 4 === 0 ? '#c084fc' : i % 3 === 0 ? '#fb923c' : '#ef4444',
    }));
  }, []);

  // Falling crumbling rock chunks from the collapsing viaduct ledge
  const crumblingRocks = useMemo(() => {
    return Array.from({ length: 9 }).map((_, i) => ({
      id: i,
      left: `${2.5 + (i * 1.5)}%`,
      delay: (i * 0.3) % 2.2,
      duration: 1.3 + (i % 3) * 0.4,
      size: 3 + (i % 4) * 2,
    }));
  }, []);

  // Golden motes drifting out of the warm castle sanctuary
  const sanctuaryMotes = useMemo(() => {
    return Array.from({ length: 9 }).map((_, i) => ({
      id: i,
      right: `${2 + (i * 2.2)}%`,
      top: `${18 + (i * 8) % 60}%`,
      size: 2 + (i % 3) * 1.5,
      duration: 2.8 + (i % 3) * 1,
      delay: i * 0.35,
    }));
  }, []);

  // Calculate coordinates across the bridge:
  // Step 0: Collapsing Cliff (x: 6%, y: 56%)
  // Steps 1 to totalSteps: Spread smoothly from 13% to 74%
  // Sanctuary Castle Portal: Starts at 80% to 100% (Never covers any stone!)
  const getStonePosition = (index: number) => {
    if (index === 0) return { x: 6, y: 56 };
    const stepRatio = (index - 1) / Math.max(1, totalSteps - 1);
    const x = 13 + stepRatio * 61; // 13% to 74%
    // Gentle natural parabolic arch across the chasm
    const y = 56 + Math.sin(stepRatio * Math.PI) * 4.5;
    return { x, y };
  };

  const currentPos = getStonePosition(currentStep);
  const nextPos = getStonePosition(Math.min(totalSteps, currentStep + 1));

  // Fiendfyre level rises higher as stamina depletes (18% to 46% of canvas height)
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
      className={`relative w-full flex-1 min-h-[175px] max-h-[46vh] overflow-hidden rounded-xl border transition-all duration-300 shadow-2xl bg-[#06050b] select-none ${
        isDangerCritical || isFizzling
          ? 'border-red-500/80 shadow-[0_0_35px_rgba(239,68,68,0.5)]'
          : 'border-[#d4af37]/35'
      }`}
    >
      {/* 1. Backdrop: Hogwarts Night Sky & Misty Mountain Cliffs */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 pointer-events-none"
        style={{
          backgroundImage: `url(${ASSETS.castle})`,
          filter: 'brightness(0.5) contrast(1.3)',
        }}
      />

      {/* Atmospheric Starry Night Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07060d] via-transparent to-[#07060d]/80 pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-transparent via-[#06050a]/50 to-[#06050a]/90 pointer-events-none" />

      {/* Fiery danger vignette pulsing when stamina is critical */}
      {isDangerCritical && (
        <div className="absolute inset-0 border-2 border-red-500/40 pointer-events-none animate-pulse bg-gradient-to-t from-red-950/30 via-transparent to-red-950/20" />
      )}

      {/* ========================================================================= */}
      {/* 2. THE COLLAPSING & SHAKING VIADUCT (Left Side - Step 0)                  */}
      {/* ========================================================================= */}
      <div 
        className={`absolute left-0 bottom-[24%] w-[12%] h-40 z-15 flex flex-col justify-between p-1.5 animate-crumble ${
          currentStep === 0 ? 'filter drop-shadow-[0_0_12px_rgba(239,68,68,0.85)]' : ''
        }`}
        style={{
          clipPath: 'polygon(0 0, 100% 28%, 85% 82%, 65% 100%, 0% 100%)',
          background: 'linear-gradient(135deg, #231c26 0%, #15101a 60%, #0d0912 100%)',
          borderRight: '2px solid rgba(239, 68, 68, 0.75)',
        }}
      >
        {/* Fractured glowing magma fissure running through stone */}
        <div className="w-full h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 shadow-[0_0_10px_#ef4444] animate-pulse" />
        <div className="w-3/4 h-1 bg-gradient-to-r from-orange-600 to-transparent shadow-[0_0_8px_#f97316] my-1" />

        {/* Warning label on the crumbling edge */}
        <div className="mb-2">
          <span className="text-[9px] font-cinzel font-bold text-red-400 flex items-center gap-1 drop-shadow bg-black/70 px-1 rounded border border-red-500/40">
            <AlertTriangle className="w-2.5 h-2.5 text-red-500 animate-bounce" />
            <span className="hidden sm:inline">Collapsing</span>
          </span>
        </div>
      </div>

      {/* Falling broken rock debris plummeting into the fiery chasm */}
      {crumblingRocks.map((rock) => (
        <div
          key={rock.id}
          className="absolute bg-stone-800 border border-red-500/70 rounded-xs pointer-events-none animate-rubble"
          style={{
            left: rock.left,
            top: '48%',
            width: `${rock.size}px`,
            height: `${rock.size * 1.2}px`,
            animationDelay: `${rock.delay}s`,
            animationDuration: `${rock.duration}s`,
            boxShadow: '0 0 6px rgba(239,68,68,0.6)',
          }}
        />
      ))}

      {/* Dust and smoke puffs near crumbling edge */}
      <div className="absolute left-[7%] top-[50%] w-6 h-6 rounded-full bg-stone-700/30 blur-md pointer-events-none animate-ping" />

      {/* ========================================================================= */}
      {/* 3. ROARING FIENDFYRE ABYSS & PURSUING CURSED FIRE BEAST                   */}
      {/* ========================================================================= */}
      <div 
        className="absolute bottom-0 inset-x-0 transition-all duration-700 ease-out z-10 pointer-events-none"
        style={{ height: `${fiendfyreHeight}%` }}
      >
        {/* Glowing aura */}
        <div className="absolute -top-14 inset-x-0 h-20 bg-gradient-to-t from-red-600/50 via-purple-600/25 to-transparent blur-lg" />

        {/* Fiendfyre flame layer */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-red-950/90 to-red-600/40">
          <svg className="w-full h-full preserve-3d" viewBox="0 0 1200 220" fill="none" preserveAspectRatio="none">
            <path
              d="M0,90 C160,150 280,30 420,110 C560,180 720,40 880,105 C1020,170 1120,50 1200,80 L1200,220 L0,220 Z"
              fill="rgba(147, 51, 234, 0.45)"
            />
            <path
              d="M0,120 C190,50 340,140 520,70 C700,130 840,60 1020,120 C1140,80 1190,140 1200,110 L1200,220 L0,220 Z"
              fill="rgba(220, 38, 38, 0.6)"
            />
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

        {/* Cursed Fiendfyre Serpent Silhouette pursuing the wizard */}
        <div 
          className="absolute left-1 bottom-3 z-12 pointer-events-none transition-all duration-700 opacity-85"
          style={{
            transform: `scale(${1 + (100 - staminaPercent) * 0.005})`,
          }}
        >
          <svg className="w-24 h-24 sm:w-32 sm:h-32 filter drop-shadow-[0_0_16px_rgba(239,68,68,0.9)]" viewBox="0 0 120 120" fill="none">
            <path
              d="M10,110 C25,80 30,55 50,40 C65,30 85,25 95,10 C92,28 80,45 88,60 C95,72 110,80 115,95 C100,90 85,95 75,105 C60,95 40,105 10,110 Z"
              fill="rgba(18, 8, 22, 0.95)"
              stroke="rgba(239, 68, 68, 0.8)"
              strokeWidth="2.5"
            />
            <path
              d="M50,40 C58,20 70,15 85,10 C75,25 70,35 68,45 Z"
              fill="rgba(249, 115, 22, 0.85)"
            />
            <circle cx="72" cy="48" r="3.5" fill="#ffffff" filter="drop-shadow(0 0 6px #fde047)" />
            <circle cx="72" cy="48" r="1.5" fill="#ef4444" />
            <polygon points="65,65 72,70 68,75" fill="#fef08a" />
            <polygon points="75,68 82,73 78,78" fill="#fef08a" />
          </svg>
        </div>

        {/* Fiendfyre Curse Flash Burst when player answers incorrectly (no text) */}
        {isFizzling && (
          <div 
            className="absolute z-20 pointer-events-none transition-all"
            style={{
              left: `${currentPos.x - 5}%`,
              bottom: '20%',
            }}
          >
            <div className="w-24 h-32 bg-gradient-to-t from-red-600 via-orange-500 to-transparent rounded-full blur-md opacity-90 animate-ping" />
          </div>
        )}

        {/* Urgent Danger Warning */}
        {isDangerCritical && (
          <div className="absolute bottom-2 inset-x-0 text-center">
            <span className="font-cinzel text-xs tracking-widest uppercase text-red-200 font-bold bg-black/80 px-3 py-1 rounded-full border border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse inline-flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>Fiendfyre Closing In · Answer Swiftly!</span>
            </span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. THE FLOATING STONE STEPS (100% VISIBLE & NEVER COVERED)                 */}
      {/* ========================================================================= */}
      {Array.from({ length: totalSteps }).map((_, idx) => {
        const stepNum = idx + 1;
        const pos = getStonePosition(stepNum);
        const isPassed = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        const isNextTarget = stepNum === currentStep + 1;
        const isBurntAndFallen = stepNum <= currentStep - 2;

        let stoneBorder = 'border-stone-700/80';
        let stoneBg = 'bg-stone-900/90';
        let runeColor = 'text-stone-500';
        let glow = '';

        if (isBurntAndFallen) {
          stoneBorder = 'border-red-900/60';
          stoneBg = 'bg-stone-950/80';
          runeColor = 'text-red-950';
          glow = 'shadow-[0_0_8px_rgba(239,68,68,0.2)] opacity-35';
        } else if (isPassed) {
          stoneBorder = 'border-emerald-500/70';
          stoneBg = 'bg-[#0f291e]';
          runeColor = 'text-emerald-400 font-bold';
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
              <span className={`text-xs sm:text-sm font-serif select-none ${runeColor} transition-colors`}>
                {RUNES[idx % RUNES.length]}
              </span>

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

            {/* Reflection / smoke below stone */}
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
      {/* 5. ARCHITECTURAL HOGWARTS CASTLE SANCTUARY DOORWAY (No photo card!)       */}
      {/* Starts at 80% to 100%, leaving Step #totalSteps (at 74%) completely clear */}
      {/* ========================================================================= */}
      <div 
        className="absolute right-0 top-0 bottom-[12%] w-[20%] min-w-[135px] max-w-[210px] z-20 pointer-events-none flex flex-col justify-end"
      >
        {/* Shimmering Protego Barrier Ward Arch guarding the threshold */}
        <div 
          className="absolute -top-6 -left-8 right-0 bottom-0 pointer-events-none border-l-2 border-t-2 border-amber-300/80 rounded-tl-full bg-gradient-to-br from-amber-400/15 via-sky-400/10 to-transparent z-25"
          style={{
            boxShadow: 'inset 0 0 35px rgba(251, 191, 36, 0.3), 0 0 25px rgba(56, 189, 248, 0.35)',
          }}
        >
          <span className="absolute top-3 left-4 text-[9px] text-amber-300 font-serif animate-pulse drop-shadow">ᛏ</span>
          <span className="absolute top-12 left-1 text-[9px] text-sky-300 font-serif animate-pulse drop-shadow">ᚨ</span>
          <span className="absolute top-22 left-0 text-[9px] text-amber-300 font-serif animate-pulse drop-shadow">ᛋ</span>
        </div>

        {/* Castle Stone Wall & Gothic Arch Structure */}
        <div className="relative w-full h-[94%] bg-[#120f18] border-l border-amber-400/40 rounded-tl-xl shadow-2xl flex flex-col justify-between overflow-hidden">
          {/* Ashlar Stone Texture overlay */}
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:16px_10px] pointer-events-none" />

          {/* Castle Crenels / Battlements at Top */}
          <div className="relative z-10 w-full flex items-center justify-between bg-[#191522] border-b border-amber-500/30 px-2 py-1 shadow-md">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full border border-amber-400/70 p-0.5 bg-black/80 flex items-center justify-center shadow">
                <img 
                  src={ASSETS.crest} 
                  alt="Hogwarts Seal" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-cinzel text-[9px] font-bold text-amber-200 tracking-wider uppercase drop-shadow">
                Hogwarts
              </span>
            </div>
            <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
          </div>

          {/* The Grand Castle Gateway (Arch & Heavy Studded Timber Doors Ajar) */}
          <div className="relative flex-1 flex flex-col items-center justify-end px-2 pt-2">
            {/* Gothic Pointed Stone Arch Frame */}
            <div className="relative w-full max-w-[130px] h-[82%] rounded-t-full border-t-4 border-x-4 border-stone-600 bg-[#0d0a14] shadow-2xl flex items-end justify-center overflow-hidden">
              
              {/* Warm Golden Radiant Light Beaming out from Hogwarts Great Hall */}
              <div 
                className="absolute inset-0 bg-radial from-amber-300/70 via-amber-500/40 to-black/80 pointer-events-none"
                style={{
                  filter: 'blur(2px)',
                }}
              />

              {/* Distant Hogwarts Great Hall Candlelight silhouettes inside */}
              <div className="absolute inset-x-0 bottom-4 h-12 flex justify-around items-end opacity-75 pointer-events-none">
                <div className="w-1 h-5 bg-amber-200 blur-[1px] animate-pulse" />
                <div className="w-1 h-7 bg-amber-100 blur-[1px] animate-pulse" />
                <div className="w-1 h-6 bg-amber-200 blur-[1px] animate-pulse" />
                <div className="w-1 h-8 bg-yellow-200 blur-[1px] animate-pulse" />
              </div>

              {/* Massive Oak Door - Left Leaf (Slightly Ajar) */}
              <div 
                className="absolute left-0 bottom-0 w-[46%] h-[92%] bg-[#1e1511] border-r border-[#3a2920] shadow-xl flex flex-col justify-around p-1"
                style={{
                  transform: 'perspective(200px) rotateY(-22deg)',
                  transformOrigin: 'left center',
                }}
              >
                {/* Iron Hinges & Studs */}
                <div className="w-full h-1 bg-stone-700 rounded shadow-xs" />
                <div className="flex justify-around">
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-500 shadow" />
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-500 shadow" />
                </div>
                <div className="w-full h-1 bg-stone-700 rounded shadow-xs" />
                <div className="flex justify-around">
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-500 shadow" />
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-500 shadow" />
                </div>
                <div className="w-full h-1 bg-stone-700 rounded shadow-xs" />
              </div>

              {/* Massive Oak Door - Right Leaf (Slightly Ajar) */}
              <div 
                className="absolute right-0 bottom-0 w-[46%] h-[92%] bg-[#1e1511] border-l border-[#3a2920] shadow-xl flex flex-col justify-around p-1"
                style={{
                  transform: 'perspective(200px) rotateY(22deg)',
                  transformOrigin: 'right center',
                }}
              >
                {/* Iron Hinges & Studs */}
                <div className="w-full h-1 bg-stone-700 rounded shadow-xs" />
                <div className="flex justify-around">
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-500 shadow" />
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-500 shadow" />
                </div>
                <div className="w-full h-1 bg-stone-700 rounded shadow-xs" />
                <div className="flex justify-around">
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-500 shadow" />
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-500 shadow" />
                </div>
                <div className="w-full h-1 bg-stone-700 rounded shadow-xs" />
              </div>

              {/* Door Gap Golden Light Shaft spilling onto landing */}
              <div className="w-4 h-full bg-gradient-to-t from-amber-200 via-amber-300 to-transparent blur-[1px] opacity-90 animate-pulse pointer-events-none" />
            </div>

            {/* Flanking Wall Mounted Iron Torches */}
            <div className="absolute left-1 top-10 flex flex-col items-center">
              <div className="w-2.5 h-3.5 bg-gradient-to-t from-orange-500 to-amber-300 rounded-full blur-[1px] animate-bounce shadow-[0_0_8px_#f59e0b]" />
              <div className="w-1.5 h-3 bg-stone-600 rounded-xs shadow" />
            </div>
            <div className="absolute right-1 top-10 flex flex-col items-center">
              <div className="w-2.5 h-3.5 bg-gradient-to-t from-orange-500 to-amber-300 rounded-full blur-[1px] animate-bounce shadow-[0_0_8px_#f59e0b]" />
              <div className="w-1.5 h-3 bg-stone-600 rounded-xs shadow" />
            </div>
          </div>

          {/* Stone Castle Threshold Landing */}
          <div className="relative z-10 w-full bg-[#18131e] border-t-2 border-stone-600 p-1.5 flex flex-col items-center shadow-lg">
            <div className="w-full h-1 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400 shadow-[0_0_8px_#fbbf24]" />
            <div className="mt-1 flex items-center gap-1 text-[8px] font-cinzel font-bold text-emerald-300 uppercase tracking-widest bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-500/40">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
              <span>Castle Sanctuary</span>
            </div>
          </div>
        </div>

        {/* Floating patronus mist motes outside doorway */}
        {sanctuaryMotes.map((m) => (
          <div
            key={m.id}
            className="absolute rounded-full bg-amber-200 pointer-events-none animate-pulse z-25"
            style={{
              right: m.right,
              top: m.top,
              width: `${m.size}px`,
              height: `${m.size}px`,
              boxShadow: '0 0 10px #fde047',
              opacity: 0.85,
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
            y1={`${currentPos.y - 7}%`}
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
          className="absolute z-35 pointer-events-none transition-all duration-300 animate-bounce"
          style={{
            left: `${currentPos.x}%`,
            top: `${Math.max(6, currentPos.y - 25)}%`,
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
      {/* 7. FULL 2D STANDING WIZARD STUDENT CHARACTER FIGURE                       */}
      {/* (Actual standing wizard character, NOT an icon; shakes on danger step 0)  */}
      {/* ========================================================================= */}
      <div
        className={`absolute z-30 transition-all duration-500 ease-out flex flex-col items-center ${
          currentStep === 0 || isDangerCritical ? 'animate-tremble' : ''
        }`}
        style={{
          left: `${currentPos.x}%`,
          top: `${currentPos.y - 12}%`,
          transform: 'translate(-50%, -50%)',
          transitionProperty: 'left, top, transform',
        }}
      >
        {(() => {
          const char = CHARACTER_VISUALS[houseTheme.id] || CHARACTER_VISUALS.gryffindor;
          return (
            <div className="relative flex flex-col items-center select-none">
              {/* Wand tip Lumos glow particle styled with character's signature wand glow */}
              <div 
                className={`absolute -right-5 top-1.5 w-4 h-4 rounded-full transition-transform z-25 ${
                  isHopping ? 'scale-150' : ''
                }`}
                style={{
                  backgroundColor: char.wandGlow,
                  boxShadow: isHopping 
                    ? `0 0 24px ${char.wandGlow}, 0 0 10px #ffffff` 
                    : `0 0 14px ${char.wandGlow}`,
                }}
              />

              {/* Full Standing 2D Wizard Figure SVG - Changes with Chosen Character */}
              <div className="relative w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center">
                <svg 
                  viewBox="0 0 60 70" 
                  className={`w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.85)] filter ${
                    isHopping ? 'scale-110 -rotate-3' : ''
                  } transition-transform duration-200`}
                >
                  {/* Billowing Robe Cloak Behind */}
                  <path
                    d="M17,25 C14,35 11,55 13,62 C18,63 42,63 47,62 C49,55 46,35 43,25 Z"
                    fill={char.robeBase}
                    stroke={char.hatTrim}
                    strokeWidth="1.2"
                  />

                  {/* Wizard Robe Inner Lining in House Color */}
                  <path
                    d="M23,28 L30,45 L37,28 Z"
                    fill={char.robeInner}
                    opacity="0.9"
                  />

                  {/* Hogwarts Sweater & Shirt Collar */}
                  <polygon points="26,27 30,34 34,27" fill="#ede5d8" />
                  <polygon points="27,29 30,35 33,29" fill="#1e1b24" />

                  {/* House Striped Scarf around Neck */}
                  <rect x="23" y="24" width="14" height="4.5" rx="2" fill={houseTheme.scarfColors[0]} />
                  <line x1="26" y1="24" x2="26" y2="28.5" stroke={houseTheme.scarfColors[1]} strokeWidth="2.5" />
                  <line x1="31" y1="24" x2="31" y2="28.5" stroke={houseTheme.scarfColors[1]} strokeWidth="2.5" />
                  <line x1="35" y1="24" x2="35" y2="28.5" stroke={houseTheme.scarfColors[1]} strokeWidth="2" />

                  {/* Fluttering Scarf Tail */}
                  <path
                    d="M24,28.5 C23,34 22,38 21,43 C23,43 25,42.5 26,42 C26,37 25,32 25,28.5 Z"
                    fill={houseTheme.scarfColors[0]}
                    stroke={houseTheme.scarfColors[1]}
                    strokeWidth="1"
                  />

                  {/* Wizard Legs / Trousers */}
                  <rect x="24" y="52" width="4" height="11" fill="#13101c" />
                  <rect x="32" y="52" width="4" height="11" fill="#13101c" />

                  {/* Wizard Leather Boots planted on stone */}
                  <path d="M22,62 L28,62 L28,65 L21,65 Z" fill="#08070d" />
                  <path d="M32,62 L38,62 L39,65 L32,65 Z" fill="#08070d" />

                  {/* Wizard Head / Face with Character-Specific Skin Tone */}
                  <circle cx="30" cy="18" r="6" fill={char.skinTone} />

                  {/* Character-Specific Hair Styling */}
                  {char.hairStyle === 'messy' && (
                    <g>
                      {/* Gryffindor messy dark brown bangs */}
                      <path d="M25,16 C26,19 28,19 29,16 C30,19 32,20 34,16 C33,13 26,13 25,16 Z" fill={char.hairColor} />
                      <path d="M24,17 C22,19 23,23 25,24" stroke={char.hairColor} strokeWidth="2.5" strokeLinecap="round" />
                    </g>
                  )}

                  {char.hairStyle === 'sleek' && (
                    <g>
                      {/* Ravenclaw sleek raven-black locks */}
                      <path d="M25,15 C28,18 31,18 35,16 C34,13 26,13 25,15 Z" fill={char.hairColor} />
                      <path d="M24,16 C22,20 22,25 24,28" stroke={char.hairColor} strokeWidth="2.5" strokeLinecap="round" />
                    </g>
                  )}

                  {char.hairStyle === 'platinum' && (
                    <g>
                      {/* Slytherin slicked platinum-blonde hair */}
                      <path d="M25,15 C28,14 32,14 35,15 C33,17 27,17 25,15 Z" fill={char.hairColor} />
                      <path d="M24,16 L23.5,21" stroke={char.hairColor} strokeWidth="2" strokeLinecap="round" />
                    </g>
                  )}

                  {char.hairStyle === 'curly' && (
                    <g>
                      {/* Hufflepuff sandy brown curls */}
                      <circle cx="25" cy="16" r="1.8" fill={char.hairColor} />
                      <circle cx="34" cy="16" r="1.8" fill={char.hairColor} />
                      <circle cx="24" cy="20" r="1.8" fill={char.hairColor} />
                      <circle cx="24.5" cy="23" r="1.4" fill={char.hairColor} />
                    </g>
                  )}

                  {/* Alert Eyes */}
                  <circle cx="32" cy="18" r="1" fill="#261b17" />
                  <circle cx="32.3" cy="17.7" r="0.4" fill="#ffffff" />

                  {/* Character-Specific Feature: Gryffindor Round Glasses */}
                  {char.hasGlasses && (
                    <g>
                      <circle cx="32" cy="18" r="2.2" stroke="#1c1917" strokeWidth="0.8" fill="none" />
                      <line x1="29.8" y1="18" x2="28" y2="18.3" stroke="#1c1917" strokeWidth="0.8" />
                    </g>
                  )}

                  {/* Character-Specific Feature: Ravenclaw Diadem / Circlet */}
                  {char.hasDiadem && (
                    <g>
                      <path d="M26.5,15 Q30,13.5 33.5,15" stroke="#cbd5e1" strokeWidth="0.9" fill="none" />
                      <circle cx="30" cy="14" r="0.8" fill="#38bdf8" />
                    </g>
                  )}

                  {/* Character-Specific Feature: Slytherin Aristocratic Upturned Collar */}
                  {char.hasSerpentPin && (
                    <polygon points="26,24 23,19 27,24" fill={char.robeLapel} stroke="#34d399" strokeWidth="0.5" />
                  )}

                  {/* Character-Specific Feature: Hufflepuff Rosy Warm Cheeks */}
                  {char.hasRosyCheeks && (
                    <circle cx="33.5" cy="20" r="1.3" fill="#fb7185" opacity="0.45" />
                  )}

                  {/* Hogwarts Pointed Wizard Hat Tailored to House */}
                  <ellipse cx="30" cy="15" rx="10" ry="2.5" fill={char.hatBase} stroke={char.hatTrim} strokeWidth="0.8" />
                  {/* Hat House Ribbon Band */}
                  <ellipse cx="30" cy="14" rx="7" ry="1.5" fill={char.hatBand} />
                  {/* Hat Clasp / Buckle */}
                  <circle cx="33" cy="14" r="1.2" fill={char.hatOrnament} />
                  {/* Pointed Hat Crown with bend */}
                  <path
                    d="M24,14 C27,10 26,6 23,2 C29,4 32,8 36,14 Z"
                    fill={char.hatBase}
                    stroke={char.hatTrim}
                    strokeWidth="0.8"
                  />

                  {/* House Chest Crest / Brooch */}
                  {char.chestEmblem === 'lion' && (
                    <g>
                      <circle cx="28" cy="33" r="1.4" fill="#d4af37" />
                      <polygon points="27.5,31.5 28.5,31.5 28,30.8" fill="#d4af37" />
                    </g>
                  )}
                  {char.chestEmblem === 'eagle' && (
                    <polygon points="28,31.5 29.5,33.5 26.5,33.5" fill="#cbd5e1" />
                  )}
                  {char.chestEmblem === 'snake' && (
                    <path d="M27,31.5 Q29,32.5 28,33.5 Q27,34.5 29,34.5" stroke="#34d399" strokeWidth="1" fill="none" />
                  )}
                  {char.chestEmblem === 'badger' && (
                    <g>
                      <circle cx="28" cy="33" r="1.4" fill="#ecb939" />
                      <line x1="27" y1="33" x2="29" y2="33" stroke="#1c1917" strokeWidth="0.6" />
                    </g>
                  )}

                  {/* Left Arm (holding robes or balancing) */}
                  <path
                    d="M21,28 C16,33 15,38 17,44"
                    stroke={char.hatBase}
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Right Arm Outstretched Casting Wand */}
                  <path
                    d="M38,28 C43,30 46,31 50,30"
                    stroke={char.hatBase}
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Hand */}
                  <circle cx="50.5" cy="30" r="1.8" fill={char.skinTone} />

                  {/* Magic Wand in Hand pointing toward next stone */}
                  <line
                    x1="49"
                    y1="31"
                    x2="59"
                    y2="28"
                    stroke={char.wandWood}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <line
                    x1="58"
                    y1="28.3"
                    x2="60"
                    y2="27.7"
                    stroke={char.wandGrip}
                    strokeWidth="1.2"
                  />
                </svg>
              </div>

              {/* Floating House Crest Pin Badge below character */}
              <div 
                className="w-4 h-4 rounded-full border border-amber-400 p-0.5 bg-black/80 shadow-md -mt-2 z-15 flex items-center justify-center"
                style={{
                  borderColor: houseTheme.primaryColor,
                  boxShadow: `0 0 8px ${houseTheme.glowColor}`,
                }}
              >
                <img 
                  src={houseTheme.avatarUrl || ASSETS.wizard} 
                  alt={houseTheme.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
          );
        })()}

        {/* Wizard Shadow on Stone Pedestal */}
        <div className="w-8 h-1.5 bg-black/80 rounded-full blur-[1px] mt-0.5" />
      </div>

      {/* Header Info Tag in Top-Left Corner */}
      <div className="absolute top-2.5 left-2.5 z-20 px-2 py-0.5 rounded bg-[#0b0a12]/85 backdrop-blur-sm border border-[#d4af37]/30 text-[11px] font-cinzel text-amber-300 flex items-center gap-1.5">
        <span>Step <strong className="text-amber-200">{currentStep}</strong> of {totalSteps} Stones</span>
      </div>
    </div>
  );
};
