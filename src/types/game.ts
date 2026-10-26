export interface TriviaQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number; // 0, 1, 2, or 3
  explanation: string;
  category: 'Social Engineering' | 'Authentication & Passwords' | 'Network & Defense' | 'Malware & Dark Curses' | 'Data Privacy & Cloud';
  difficulty: 'Apprentice' | 'Adept' | 'Master';
  spellName: string; // e.g. "Expecto Patronum", "Protego Horribilis", "Lumos Solem"
}

export type HouseType = 'gryffindor' | 'ravenclaw' | 'slytherin' | 'hufflepuff';

export interface HouseTheme {
  id: HouseType;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  motto: string;
  scarfColors: [string, string];
  avatarUrl: string;
}

export interface AcademySettings {
  academyName: string;
  customLogoUrl: string | null;
  selectedHouse: HouseType;
  totalSteps: number; // default 10, range 5 to 15
  initialTimeSeconds: number; // default 55
  timeBonusCorrect: number; // default +8s
  timePenaltyWrong: number; // default -12s
}

export type GameStatus = 'TITLE' | 'PLAYING' | 'CORRECT_ANIMATION' | 'WRONG_ANIMATION' | 'VICTORY' | 'GAME_OVER';

export interface GameSessionStats {
  stepsCompleted: number; // 0 to 10
  totalQuestionsAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  timeRemaining: number;
  startingTime: number;
  streak: number;
  maxStreak: number;
  startTime: number;
  endTime?: number;
}
