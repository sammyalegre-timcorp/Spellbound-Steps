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
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Flame, Wand2, Play, Volume2, VolumeX, ShieldCheck, Maximize, Minimize } from 'lucide-react';

export default function App() {
  // Global settings & question bank
  const [questions, setQuestions] = useState<TriviaQuestion[]>(() => getStoredQuestions());
  const [settings, setSettings] = useState<AcademySettings>(() => getStoredSettings());
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    return typeof document !== 'undefined' && Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement);
  });

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

  // Fullscreen Toggle Handler (supporting standard & webkit Fullscreen API)
  const toggleFullscreen = useCallback(async () => {
    sound.playParchmentClick();
    try {
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          await (document.documentElement as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen request could not be fulfilled:', err);
    }
  }, []);

  // Synchronize fullscreen state on changes & support 'F' key shortcut
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          toggleFullscreen();
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleFullscreen]);

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

  const isLastFiveSeconds = currentStaminaSeconds <= 5 && currentStaminaSeconds > 0 && (gameStatus === 'PLAYING' || isTransitioning);

  // MAIN GAME VIEW: 100% viewport visible without scrolling (h-screen overflow-hidden)
  return (
    <div className={`h-screen w-screen max-h-screen overflow-hidden bg-[#08090d] text-[#ede5d8] flex flex-col justify-between p-2 sm:p-3 relative font-sans selection:bg-amber-500/30 selection:text-amber-200 ${
      isFizzling ? 'animate-screen-shake' : ''
    }`}>
      {/* Last 5 seconds intense red panic flash to ramp up pressure */}
      {isLastFiveSeconds && (
        <div className="fixed inset-0 pointer-events-none z-50 animate-panic-flash border-4 border-red-600/70" />
      )}

      {/* Floating Controls (Top-Right): PWA Install + Fullscreen + Sound Toggle */}
      <div className="absolute top-2.5 right-3 z-40 flex items-center gap-2">
        <PWAInstallButton />
        <button
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
          title={isFullscreen ? 'Exit Full Screen (Esc or F)' : 'Enter Full Screen (F)'}
          className="p-1.5 sm:p-2 rounded-full bg-[#12101b]/80 border border-amber-400/30 text-stone-300 hover:text-amber-300 backdrop-blur-sm shadow-md transition-all hover:scale-105 cursor-pointer"
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4 text-amber-300" />
          ) : (
            <Maximize className="w-4 h-4 text-stone-300" />
          )}
        </button>
        <button
          onClick={handleToggleSound}
          aria-label={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          title={isMuted ? 'Sound muted (click to unmute)' : 'Sound active (click to mute)'}
          className="p-1.5 sm:p-2 rounded-full bg-[#12101b]/80 border border-amber-400/30 text-stone-300 hover:text-amber-300 backdrop-blur-sm shadow-md transition-all hover:scale-105 cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      {/* Offline Status Toast Indicator */}
      <OfflineIndicator />

      {/* TITLE SCREEN: Compact, centered, 100% no scroll */}
      {gameStatus === 'TITLE' ? (
        <div className="my-auto max-w-xl mx-auto w-full parchment-panel rounded-2xl p-4 sm:p-5 border border-[#d4af37]/40 shadow-2xl text-center space-y-3.5">
          {/* Character Dynamic House Preview Portrait */}
          <div className="flex flex-col items-center">
            <div 
              className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 p-1 bg-[#15121f] transition-all duration-300"
              style={{
                borderColor: currentHouse.secondaryColor,
                boxShadow: `0 0 25px ${currentHouse.glowColor}, 0 4px 15px rgba(0,0,0,0.8)`,
              }}
            >
              <img
                src={currentHouse.avatarUrl || ASSETS.wizard}
                alt={`${currentHouse.name} Student`}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.triedPublic) {
                    target.dataset.triedPublic = 'true';
                    const file = (currentHouse.avatarUrl || ASSETS.wizard).split('/').pop();
                    if (file) target.src = `/assets/images/${file}`;
                  }
                }}
                className="w-full h-full object-cover rounded-full transition-opacity duration-200"
              />
              <div 
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md border border-black/40"
                style={{ backgroundColor: currentHouse.primaryColor }}
              >
                <Wand2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Selected House Title & Motto Badge */}
            <div className="mt-1.5 space-y-0.5">
              <span className="text-xs font-cinzel font-bold text-amber-300 uppercase tracking-wider block">
                {currentHouse.name} House
              </span>
              <p className="text-[10px] sm:text-[11px] text-[#b0a89a] italic max-w-sm mx-auto line-clamp-1">
                "{currentHouse.motto}"
              </p>
            </div>
          </div>

          <div>
            <span className="font-cinzel text-[11px] uppercase tracking-widest text-amber-400 font-semibold flex items-center justify-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
              <span>Escape the Cursed Fiendfyre</span>
            </span>
            <h1 className="font-cinzel text-xl sm:text-2xl font-extrabold text-[#ede5d8] gold-glow mt-0.5">
              The Fiendfyre Bridge
            </h1>
            <p className="text-xs text-[#b0a89a] mt-1 leading-relaxed max-w-md mx-auto">
              Cross <strong>{TOTAL_STEPS} floating ancient stones</strong> to reach Hogwarts Castle before the cursed fire beasts overtake you. 
              Answer cybersecurity defense trivia to cast wards and advance!
            </p>
          </div>

          {/* House Robe Selector with Character Previews */}
          <div className="space-y-1.5 text-left bg-[#14111d] p-2.5 rounded-xl border border-stone-800">
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
                    type="button"
                    onClick={() => {
                      sound.playHopChime();
                      const updated = { ...settings, selectedHouse: house };
                      setSettings(updated);
                      saveStoredSettings(updated);
                    }}
                    className={`px-2.5 py-2 rounded-lg border font-cinzel transition-all cursor-pointer flex items-center gap-2 text-left ${
                      isSelected
                        ? 'border-amber-400 bg-[#251e33] text-amber-200 font-bold shadow-[0_0_12px_rgba(212,175,55,0.35)] ring-1 ring-amber-400/50'
                        : 'border-stone-800 bg-[#100d17] text-stone-400 hover:border-stone-700 hover:text-stone-200'
                    }`}
                  >
                    {/* Mini avatar thumbnail */}
                    <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden shrink-0 border border-black/50 bg-[#181524]">
                      <img
                        src={h.avatarUrl}
                        alt={h.name}
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.triedPublic) {
                            target.dataset.triedPublic = 'true';
                            const file = h.avatarUrl.split('/').pop();
                            if (file) target.src = `/assets/images/${file}`;
                          }
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[11px] sm:text-xs font-semibold whitespace-nowrap leading-tight">
                        {h.name}
                      </span>
                    </div>
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs border border-black/40"
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

          {/* Start and Fullscreen Controls */}
          <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              onClick={startNewGame}
              className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-cinzel font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-stone-950" />
              <span>Begin Bridge Crossing</span>
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Full Screen (Esc or F)' : 'Enter Full Screen (F)'}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#d4af37]/35 hover:border-amber-400/70 bg-[#14111d]/90 hover:bg-[#201a2d] text-stone-300 hover:text-amber-200 font-cinzel text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              {isFullscreen ? (
                <>
                  <Minimize className="w-3.5 h-3.5 text-amber-300" />
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize className="w-3.5 h-3.5 text-stone-300" />
                  <span>Fullscreen Mode</span>
                </>
              )}
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
