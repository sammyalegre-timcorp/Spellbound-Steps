import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  TriviaQuestion, 
  AcademySettings, 
  GameStatus, 
  GameSessionStats, 
  HouseType 
} from './types/game';
import { 
  getStoredQuestions, 
  saveStoredQuestions, 
  getStoredSettings, 
  saveStoredSettings, 
  getGameQuestionSet, 
  HOUSE_THEMES, 
  ASSETS 
} from './utils/triviaStorage';
import { sound } from './utils/audio';
import { SpellStaminaBar } from './components/SpellStaminaBar';
import { GameCanvas } from './components/GameCanvas';
import { QuestionCard } from './components/QuestionCard';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { AdminPanel } from './components/AdminPanel';
import { Flame, Wand2, Play, Volume2, VolumeX, ShieldCheck } from 'lucide-react';

export default function App() {
  // Global settings & question bank
  const [questions, setQuestions] = useState<TriviaQuestion[]>(() => getStoredQuestions());
  const [settings, setSettings] = useState<AcademySettings>(() => getStoredSettings());
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());

  // Dynamic step count chosen in Admin (defaults to 10)
  const TOTAL_STEPS = settings.totalSteps || 10;

  // Views: 'game' or 'admin' (Admin ONLY accessible via /admin URL)
  const [activeView, setActiveView] = useState<'game' | 'admin'>('game');

  // Game state
  const [gameStatus, setGameStatus] = useState<GameStatus>('TITLE');
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 (start cliff) to TOTAL_STEPS (Hogwarts)

  // Question session state
  const [sessionQuestions, setSessionQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Visual animation flags
  const [isHopping, setIsHopping] = useState<boolean>(false);
  const [isFizzling, setIsFizzling] = useState<boolean>(false);
  const [activeSpellName, setActiveSpellName] = useState<string | undefined>(undefined);

  // Timer & Stamina Bar
  const [currentStaminaSeconds, setCurrentStaminaSeconds] = useState<number>(settings.initialTimeSeconds);
  const [maxStaminaSeconds, setMaxStaminaSeconds] = useState<number>(settings.initialTimeSeconds);
  const [recentDelta, setRecentDelta] = useState<{ type: 'bonus' | 'penalty'; amount: number; id: number } | null>(null);

  // Session Statistics
  const [stats, setStats] = useState<GameSessionStats>({
    stepsCompleted: 0,
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    timeRemaining: settings.initialTimeSeconds,
    startingTime: settings.initialTimeSeconds,
    streak: 0,
    maxStreak: 0,
    startTime: Date.now(),
  });

  const timerRef = useRef<number | null>(null);
  const heartbeatAudioRef = useRef<number>(0);

  // Robust URL route detection for Vercel and SPA hosting:
  // Detects /admin, /admin/, subpaths ending with /admin, hash #/admin, or query ?admin
  useEffect(() => {
    const checkIsAdminRoute = () => {
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      const search = (window.location.search || '').toLowerCase();

      const isAdmin = 
        path === '/admin' || 
        path === '/admin/' || 
        path.endsWith('/admin') || 
        path.endsWith('/admin/') || 
        hash === '#/admin' || 
        hash === '#admin' || 
        hash.includes('admin') || 
        search.includes('admin');

      if (isAdmin) {
        setActiveView('admin');
      } else {
        setActiveView('game');
      }
    };

    checkIsAdminRoute();
    window.addEventListener('popstate', checkIsAdminRoute);
    window.addEventListener('hashchange', checkIsAdminRoute);
    return () => {
      window.removeEventListener('popstate', checkIsAdminRoute);
      window.removeEventListener('hashchange', checkIsAdminRoute);
    };
  }, []);

  // Return to game from admin
  const handleReturnFromAdmin = () => {
    setActiveView('game');
    const path = window.location.pathname.toLowerCase();
    if (path.includes('admin')) {
      window.history.pushState(null, '', '/');
    }
    if (window.location.hash.toLowerCase().includes('admin')) {
      window.location.hash = '';
    }
    if (window.location.search.toLowerCase().includes('admin')) {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  // Start / Restart a fresh game session
  const startNewGame = useCallback(() => {
    const poolCount = Math.max(16, (settings.totalSteps || 10) + 6);
    const freshQuestions = getGameQuestionSet(poolCount);
    setSessionQuestions(freshQuestions);
    setCurrentQuestionIndex(0);
    setCurrentStep(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setIsTransitioning(false);
    setIsHopping(false);
    setIsFizzling(false);
    setActiveSpellName(undefined);
    setRecentDelta(null);

    const initialTime = settings.initialTimeSeconds;
    setCurrentStaminaSeconds(initialTime);
    setMaxStaminaSeconds(initialTime);

    setStats({
      stepsCompleted: 0,
      totalQuestionsAnswered: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      timeRemaining: initialTime,
      startingTime: initialTime,
      streak: 0,
      maxStreak: 0,
      startTime: Date.now(),
    });

    setGameStatus('PLAYING');
    sound.playHopChime();
  }, [settings.initialTimeSeconds, settings.totalSteps]);

  // Depleting Timer Loop
  useEffect(() => {
    if (gameStatus !== 'PLAYING' && gameStatus !== 'CORRECT_ANIMATION' && gameStatus !== 'WRONG_ANIMATION') {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const intervalMs = 100;
    timerRef.current = window.setInterval(() => {
      setCurrentStaminaSeconds((prev) => {
        const next = Math.max(0, prev - intervalMs / 1000);

        // Heartbeat warning when stamina is critical (< 25%)
        if (next < maxStaminaSeconds * 0.25 && next > 0) {
          const now = Date.now();
          if (now - heartbeatAudioRef.current > 1200) {
            heartbeatAudioRef.current = now;
            sound.playLowStaminaHeartbeat();
          }
        }

        // Check loss condition: Timer hits zero!
        if (next <= 0) {
          window.clearInterval(timerRef.current!);
          timerRef.current = null;
          setGameStatus('GAME_OVER');
          return 0;
        }

        return next;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [gameStatus, maxStaminaSeconds]);

  // Handle Option Selection
  const handleSelectOption = (chosenIndex: number) => {
    if (selectedAnswer !== null || isTransitioning || gameStatus !== 'PLAYING') return;

    const currentQ = sessionQuestions[currentQuestionIndex];
    if (!currentQ) return;

    setSelectedAnswer(chosenIndex);
    const correct = chosenIndex === currentQ.correctIndex;
    setIsCorrect(correct);
    setIsTransitioning(true);

    if (correct) {
      // Correct Answer:
      // 1. Spell effect (glowing wand light, beam, sound)
      // 2. Adds time back to the stamina bar
      // 3. Hops wizard 1 stone forward!
      sound.playSpellCast();
      sound.playHopChime();
      setIsHopping(true);
      setActiveSpellName(currentQ.spellName);

      // Add time back to stamina bar
      const bonus = settings.timeBonusCorrect;
      setCurrentStaminaSeconds((prev) => {
        const boosted = Math.min(maxStaminaSeconds + 15, prev + bonus);
        return boosted;
      });
      setRecentDelta({ type: 'bonus', amount: bonus, id: Date.now() });

      // Update statistics
      setStats((prev) => {
        const newStreak = prev.streak + 1;
        return {
          ...prev,
          totalQuestionsAnswered: prev.totalQuestionsAnswered + 1,
          correctAnswers: prev.correctAnswers + 1,
          streak: newStreak,
          maxStreak: Math.max(prev.maxStreak, newStreak),
          stepsCompleted: prev.stepsCompleted + 1,
          timeRemaining: currentStaminaSeconds + bonus,
        };
      });

      // Advance wizard by 1 stone
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      // Transition to next question or trigger Victory!
      setTimeout(() => {
        setIsHopping(false);
        setActiveSpellName(undefined);

        if (nextStep >= TOTAL_STEPS) {
          // VICTORY: Completed all configured steps to reach Hogwarts castle!
          setGameStatus('VICTORY');
        } else {
          setCurrentQuestionIndex((prev) => (prev + 1) % sessionQuestions.length);
          setSelectedAnswer(null);
          setIsCorrect(null);
          setIsTransitioning(false);
        }
      }, 1200);

    } else {
      // Wrong Answer:
      // 1. Drains a portion of time bar with a fizzle sound/effect
      // 2. Screen/character shakes, Fiendfyre surges
      sound.playWrongFizzle();
      sound.playFiendfyreCrackle();
      setIsFizzling(true);

      const penalty = settings.timePenaltyWrong;
      setCurrentStaminaSeconds((prev) => Math.max(0, prev - penalty));
      setRecentDelta({ type: 'penalty', amount: penalty, id: Date.now() });

      setStats((prev) => ({
        ...prev,
        totalQuestionsAnswered: prev.totalQuestionsAnswered + 1,
        wrongAnswers: prev.wrongAnswers + 1,
        streak: 0,
        timeRemaining: Math.max(0, currentStaminaSeconds - penalty),
      }));

      // Dwell briefly to display mistake, then advance to next question
      setTimeout(() => {
        setIsFizzling(false);
        setCurrentQuestionIndex((prev) => (prev + 1) % sessionQuestions.length);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setIsTransitioning(false);
      }, 1400);
    }
  };

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const currentHouse = HOUSE_THEMES[settings.selectedHouse] || HOUSE_THEMES.gryffindor;
  const currentQuestion = sessionQuestions[currentQuestionIndex] || questions[0];
  const staminaPercent = Math.max(0, Math.min(100, (currentStaminaSeconds / maxStaminaSeconds) * 100));

  // If in Admin mode (accessible strictly by adding /admin to the URL)
  if (activeView === 'admin') {
    return (
      <div className="min-h-screen bg-[#08090d] text-[#ede5d8] overflow-y-auto selection:bg-amber-500/30 selection:text-amber-200">
        <AdminPanel
          questions={questions}
          settings={settings}
          onSaveQuestions={(newQuestions) => {
            setQuestions(newQuestions);
            saveStoredQuestions(newQuestions);
          }}
          onSaveSettings={(newSettings) => {
            setSettings(newSettings);
            saveStoredSettings(newSettings);
          }}
          onReturnToGame={handleReturnFromAdmin}
        />
      </div>
    );
  }

  // MAIN GAME VIEW: 100% viewport visible without scrolling (h-screen overflow-hidden)
  return (
    <div className="h-screen w-screen max-h-screen overflow-hidden bg-[#08090d] text-[#ede5d8] flex flex-col justify-between p-2 sm:p-3 relative font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Floating Sound Toggle Button (Top-Right) */}
      <button
        onClick={handleToggleSound}
        aria-label={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
        title={isMuted ? 'Sound muted (click to unmute)' : 'Sound active (click to mute)'}
        className="absolute top-2.5 right-3 z-40 p-1.5 sm:p-2 rounded-full bg-[#12101b]/80 border border-amber-400/30 text-stone-300 hover:text-amber-300 backdrop-blur-sm shadow-md transition-all hover:scale-105 cursor-pointer"
      >
        {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
      </button>

      {/* TITLE SCREEN: Compact, centered, 100% no scroll */}
      {gameStatus === 'TITLE' ? (
        <div className="my-auto max-w-xl mx-auto w-full parchment-panel rounded-2xl p-4 sm:p-6 border border-[#d4af37]/40 shadow-2xl text-center space-y-4">
          {/* Character Portrait */}
          <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-amber-400 p-1 bg-[#15121f] shadow-[0_0_25px_rgba(212,175,55,0.3)]">
            <img
              src={ASSETS.wizard}
              alt="Wizard Student"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full"
            />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-stone-950 shadow-md">
              <Wand2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <span className="font-cinzel text-[11px] uppercase tracking-widest text-amber-400 font-semibold flex items-center justify-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
              <span>Escape the Cursed Fiendfyre</span>
            </span>
            <h1 className="font-cinzel text-xl sm:text-3xl font-extrabold text-[#ede5d8] gold-glow mt-1">
              The Fiendfyre Bridge
            </h1>
            <p className="text-xs text-[#b0a89a] mt-1.5 leading-relaxed max-w-md mx-auto">
              Cross <strong>{TOTAL_STEPS} floating ancient stones</strong> to reach Hogwarts Castle before the cursed fire beasts overtake you. 
              Answer cybersecurity defense trivia to cast wards and advance!
            </p>
          </div>

          {/* House Robe Selector */}
          <div className="space-y-1.5 text-left bg-[#14111d] p-2.5 sm:p-3 rounded-xl border border-stone-800">
            <span className="text-[10px] font-cinzel text-amber-300 uppercase tracking-wider block font-semibold">
              Select Your Wizarding House Robes
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['gryffindor', 'ravenclaw', 'slytherin', 'hufflepuff'] as HouseType[]).map((house) => {
                const h = HOUSE_THEMES[house];
                const isSelected = settings.selectedHouse === house;
                return (
                  <button
                    key={house}
                    onClick={() => {
                      sound.playParchmentClick();
                      const updated = { ...settings, selectedHouse: house };
                      setSettings(updated);
                      saveStoredSettings(updated);
                    }}
                    className={`p-1.5 sm:p-2 rounded-lg border text-xs font-cinzel capitalize transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-400 bg-[#251e33] text-amber-200 font-bold shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                        : 'border-stone-800 bg-[#100d17] text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <span>{h.name}</span>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: h.primaryColor }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rules Triad */}
          <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-[#9b9487]">
            <div className="p-1.5 rounded bg-[#13111b] border border-stone-800/80">
              <span className="text-amber-300 font-cinzel block font-bold">{TOTAL_STEPS} Steps</span>
              <span>Hop across stones</span>
            </div>
            <div className="p-1.5 rounded bg-[#13111b] border border-stone-800/80">
              <span className="text-emerald-400 font-cinzel block font-bold">Spell Wards</span>
              <span>Advance + restore stamina</span>
            </div>
            <div className="p-1.5 rounded bg-[#13111b] border border-stone-800/80">
              <span className="text-rose-400 font-cinzel block font-bold">Fiendfyre Surge</span>
              <span>Flames burn stamina</span>
            </div>
          </div>

          {/* Start Button */}
          <div className="pt-1">
            <button
              onClick={startNewGame}
              className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-cinzel font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-[1.02] flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <Play className="w-4 h-4 fill-stone-950" />
              <span>Begin Bridge Crossing</span>
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE IN-GAME LAYOUT: 100% viewport visible without scrolling */
        <div className="h-full w-full max-w-5xl mx-auto flex flex-col justify-between gap-1.5 sm:gap-2 overflow-hidden">
          {/* 1. Depleting Timer Bar (Top) */}
          <SpellStaminaBar
            currentSeconds={currentStaminaSeconds}
            maxSeconds={maxStaminaSeconds}
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            recentDelta={recentDelta}
          />

          {/* 2. 2D Magical Bridge Canvas (Middle, flex-1) */}
          <GameCanvas
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            houseTheme={currentHouse}
            gameStatus={gameStatus}
            staminaPercent={staminaPercent}
            isFizzling={isFizzling}
            isHopping={isHopping}
            castSpellName={activeSpellName}
          />

          {/* 3. Question Card (Bottom, compact shrink-0) */}
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentStep + 1 > TOTAL_STEPS ? TOTAL_STEPS : currentStep + 1}
              totalQuestions={TOTAL_STEPS}
              selectedAnswer={selectedAnswer}
              isCorrect={isCorrect}
              onSelectOption={handleSelectOption}
              isTransitioning={isTransitioning}
            />
          )}
        </div>
      )}

      {/* VICTORY MODAL: Reached Hogwarts Castle Sanctuary! */}
      {gameStatus === 'VICTORY' && (
        <VictoryModal
          stats={stats}
          houseTheme={currentHouse}
          settings={settings}
          onRestart={startNewGame}
        />
      )}

      {/* GAME OVER MODAL: Fiendfyre caught up! */}
      {gameStatus === 'GAME_OVER' && (
        <GameOverModal
          stepsCompleted={currentStep}
          totalSteps={TOTAL_STEPS}
          onRestart={startNewGame}
        />
      )}
    </div>
  );
}
