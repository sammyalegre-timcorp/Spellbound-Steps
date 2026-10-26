import React, { useEffect } from 'react';
import { TriviaQuestion } from '../types/game';
import { ShieldCheck, XCircle, Info, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface QuestionCardProps {
  question: TriviaQuestion;
  questionNumber: number; // 1 to 10
  totalQuestions: number;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
  onSelectOption: (index: number) => void;
  isTransitioning: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  isCorrect,
  onSelectOption,
  isTransitioning,
}) => {
  // Support keyboard shortcuts (1, 2, 3, 4 or A, B, C, D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning || selectedAnswer !== null) return;
      const key = e.key.toUpperCase();
      if (key === '1' || key === 'A') onSelectOption(0);
      else if (key === '2' || key === 'B') onSelectOption(1);
      else if (key === '3' || key === 'C') onSelectOption(2);
      else if (key === '4' || key === 'D') onSelectOption(3);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTransitioning, selectedAnswer, onSelectOption]);

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="w-full max-w-4xl mx-auto parchment-card rounded-xl p-3 sm:p-4 relative transition-all duration-300 shadow-xl shrink-0">
      {/* Decorative Ornate Gold Filigree Corners */}
      <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t-2 border-l-2 border-[#d4af37]/60 pointer-events-none" />
      <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t-2 border-r-2 border-[#d4af37]/60 pointer-events-none" />
      <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b-2 border-l-2 border-[#d4af37]/60 pointer-events-none" />
      <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b-2 border-r-2 border-[#d4af37]/60 pointer-events-none" />

      {/* Header Metadata */}
      <div className="flex items-center justify-between pb-1.5 border-b border-[#d4af37]/15 text-[11px] text-[#a89f91]">
        <div className="flex items-center gap-2">
          <span className="font-cinzel text-amber-300 font-bold tracking-wider">
            Step {questionNumber} of {totalQuestions}
          </span>
          <span aria-hidden="true" className="text-stone-600">·</span>
          <span className="truncate max-w-[200px] sm:max-w-none">{question.category}</span>
          <span aria-hidden="true" className="text-stone-600 hidden sm:inline">·</span>
          <span className="text-stone-400 capitalize hidden sm:inline">{question.difficulty}</span>
        </div>

        {/* Incantation Spell Name */}
        <div className="flex items-center gap-1.5 text-amber-200 font-cinzel text-[11px] shrink-0">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Spell: <em>{question.spellName}</em></span>
        </div>
      </div>

      {/* Main Question Text */}
      <div className="my-2 sm:my-2.5">
        <h2 className="font-cinzel text-xs sm:text-sm md:text-base font-bold text-[#ede5d8] leading-snug tracking-wide line-clamp-3">
          {question.question}
        </h2>
      </div>

      {/* 4 Interactive Choice Tablets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 my-1">
        {question.options.map((option, idx) => {
          const isSelected = selectedAnswer === idx;
          const isThisCorrect = question.correctIndex === idx;

          let btnStyle = 'bg-[#15121e]/90 hover:bg-[#211b30] border-[#d4af37]/25 text-[#ded7c8] hover:border-[#d4af37]/60 hover:shadow-[0_0_12px_rgba(212,175,55,0.15)]';
          let letterBadge = 'bg-[#241f33] text-amber-300 border-amber-500/30';

          if (selectedAnswer !== null) {
            if (isThisCorrect) {
              btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-100 shadow-[0_0_16px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400';
              letterBadge = 'bg-emerald-800 text-emerald-100 border-emerald-400';
            } else if (isSelected && !isThisCorrect) {
              btnStyle = 'bg-rose-950/80 border-red-500 text-rose-200 shadow-[0_0_16px_rgba(239,68,68,0.3)] ring-1 ring-red-400';
              letterBadge = 'bg-red-800 text-rose-100 border-red-400';
            } else {
              btnStyle = 'bg-[#12101a]/50 border-stone-800 text-stone-500 opacity-50';
              letterBadge = 'bg-stone-900 text-stone-600 border-stone-800';
            }
          }

          return (
            <button
              key={idx}
              disabled={selectedAnswer !== null || isTransitioning}
              onClick={() => {
                sound.playParchmentClick();
                onSelectOption(idx);
              }}
              className={`w-full min-h-[38px] sm:min-h-[44px] text-left p-2 sm:p-2.5 rounded-lg border transition-all duration-150 flex items-center gap-2.5 relative focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 cursor-pointer disabled:cursor-default ${btnStyle}`}
            >
              {/* Option Letter (A, B, C, D) */}
              <span className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 rounded flex items-center justify-center font-cinzel font-bold text-[10px] sm:text-xs border ${letterBadge} transition-colors`}>
                {optionLetters[idx]}
              </span>

              {/* Option Text */}
              <span className="text-xs sm:text-sm font-medium leading-tight flex-1 line-clamp-2">
                {option}
              </span>

              {/* Status Icons */}
              {selectedAnswer !== null && isThisCorrect && (
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
              )}
              {selectedAnswer !== null && isSelected && !isThisCorrect && (
                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Post-Answer Educational Explanation Banner */}
      {selectedAnswer !== null && (
        <div 
          className={`mt-2 p-2 sm:p-2.5 rounded-lg border transition-all duration-200 flex items-start gap-2.5 text-xs ${
            isCorrect
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/60 border-red-500/50 text-rose-200'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {isCorrect ? (
              <Sparkles className="w-4 h-4 text-emerald-400" />
            ) : (
              <Info className="w-4 h-4 text-red-400" />
            )}
          </div>
          <div className="space-y-0.5 leading-snug">
            <span className="font-cinzel text-[11px] font-bold tracking-wider uppercase block">
              {isCorrect ? 'Spell Succeeded! · Advanced 1 Stone' : 'Spell Interrupted · Fiendfyre Strikes!'}
            </span>
            <p className="text-[11px] sm:text-xs text-[#ded7c8] line-clamp-2">
              {question.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
