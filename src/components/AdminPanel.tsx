import React, { useState, useRef } from 'react';
import { 
  TriviaQuestion, 
  AcademySettings, 
  HouseType 
} from '../types/game';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  Download, 
  RotateCcw, 
  Search, 
  Check, 
  X, 
  ArrowLeft,
  Shield, 
  Sliders, 
  Image as ImageIcon,
  HelpCircle,
  Sparkles,
  Footprints
} from 'lucide-react';
import { HOUSE_THEMES, ASSETS, DEFAULT_QUESTIONS, DEFAULT_SETTINGS } from '../utils/triviaStorage';
import { sound } from '../utils/audio';

interface AdminPanelProps {
  questions: TriviaQuestion[];
  settings: AcademySettings;
  onSaveQuestions: (questions: TriviaQuestion[]) => void;
  onSaveSettings: (settings: AcademySettings) => void;
  onReturnToGame: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  questions,
  settings,
  onSaveQuestions,
  onSaveSettings,
  onReturnToGame,
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'branding' | 'tuning'>('questions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Question editing/adding state
  const [editingQuestion, setEditingQuestion] = useState<TriviaQuestion | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Logo file input ref
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Filtered questions
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.spellName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    'all',
    'Social Engineering',
    'Authentication & Passwords',
    'Network & Defense',
    'Malware & Dark Curses',
    'Data Privacy & Cloud',
  ];

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotice('Please select an image file (PNG, JPG, SVG, WebP)', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showNotice('Logo image must be smaller than 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      const updated = { ...settings, customLogoUrl: base64Url };
      onSaveSettings(updated);
      showNotice('Custom academy logo updated successfully!');
      sound.playHopChime();
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    const updated = { ...settings, customLogoUrl: null };
    onSaveSettings(updated);
    showNotice('Reset to default Hogwarts academy crest');
    sound.playParchmentClick();
  };

  // Handle Question Deletion
  const handleDeleteQuestion = (id: string) => {
    const minRequired = Math.max(5, settings.totalSteps || 5);
    if (questions.length <= minRequired) {
      showNotice(`Cannot delete: A minimum of ${minRequired} trivia questions is required for the bridge game!`, 'error');
      return;
    }
    const updated = questions.filter((q) => q.id !== id);
    onSaveQuestions(updated);
    showNotice('Question removed from the trial archives');
    sound.playParchmentClick();
  };

  // Handle Save (Create or Edit)
  const handleSaveQuestionForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    // Validate
    if (!editingQuestion.question.trim()) {
      showNotice('Question text is required', 'error');
      return;
    }
    if (editingQuestion.options.some((opt) => !opt.trim())) {
      showNotice('All 4 answer options must be filled', 'error');
      return;
    }

    let updatedList: TriviaQuestion[];
    if (isCreatingNew) {
      updatedList = [editingQuestion, ...questions];
    } else {
      updatedList = questions.map((q) => (q.id === editingQuestion.id ? editingQuestion : q));
    }

    onSaveQuestions(updatedList);
    setEditingQuestion(null);
    setIsCreatingNew(false);
    showNotice(isCreatingNew ? 'New cybersecurity trial question added!' : 'Question updated successfully!');
    sound.playHopChime();
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      questions,
      settings,
      version: '2.0',
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'fiendfyre_bridge_questions.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotice('Trivia questions exported to JSON');
    sound.playParchmentClick();
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length >= 10) {
          onSaveQuestions(parsed.questions);
          if (parsed.settings) {
            onSaveSettings({ ...settings, ...parsed.settings });
          }
          showNotice(`Successfully imported ${parsed.questions.length} questions!`);
          sound.playHopChime();
        } else {
          showNotice('Invalid JSON format: Must contain at least 10 questions array', 'error');
        }
      } catch (err) {
        showNotice('Failed to parse JSON file', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Reset to default questions
  const handleResetToDefault = () => {
    if (window.confirm('Reset question bank back to the official default cybersecurity questions?')) {
      onSaveQuestions(DEFAULT_QUESTIONS);
      showNotice('Question bank restored to default set');
      sound.playHopChime();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#d4af37]/25">
        <div>
          <button
            onClick={onReturnToGame}
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-cinzel tracking-wider uppercase mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Bridge Trial</span>
          </button>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-[#ede5d8] gold-glow flex items-center gap-3">
            <Shield className="w-7 h-7 text-amber-400" />
            <span>Headmaster Administration Chamber</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#a89f91] mt-1">
            Configure cybersecurity bridge trivia, upload academy heraldry, and adjust spell stamina tuning.
          </p>
        </div>

        {/* Tab Controls (Functional Segmented Control) */}
        <div className="flex items-center p-1 bg-[#15121f] rounded-lg border border-[#d4af37]/25 shrink-0">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 text-xs font-cinzel font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-[#9c9486] hover:text-[#ede5d8]'
            }`}
          >
            Question Bank ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`px-4 py-2 text-xs font-cinzel font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'branding'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-[#9c9486] hover:text-[#ede5d8]'
            }`}
          >
            Logo & Branding
          </button>
          <button
            onClick={() => setActiveTab('tuning')}
            className={`px-4 py-2 text-xs font-cinzel font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'tuning'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-[#9c9486] hover:text-[#ede5d8]'
            }`}
          >
            Stamina Tuning
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`my-4 p-3 rounded-lg border text-xs sm:text-sm font-medium flex items-center justify-between transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/80 border-red-500/50 text-rose-200'
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: QUESTION BANK */}
      {activeTab === 'questions' && (
        <div className="mt-6 space-y-6">
          {/* Action & Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search questions, spells, or answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#13111b] border border-[#d4af37]/25 rounded-lg pl-9 pr-3 py-2 text-xs text-[#ede5d8] placeholder-stone-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#13111b] border border-[#d4af37]/25 rounded-lg px-3 py-2 text-xs text-[#ede5d8] focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All Defense Disciplines' : c}
                </option>
              ))}
            </select>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playParchmentClick();
                  setIsCreatingNew(true);
                  setEditingQuestion({
                    id: `q-${Date.now()}`,
                    question: '',
                    options: ['', '', '', ''],
                    correctIndex: 0,
                    explanation: '',
                    category: 'Social Engineering',
                    difficulty: 'Apprentice',
                    spellName: 'Protego',
                  });
                }}
                className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-cinzel font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>

              <button
                onClick={handleExportJSON}
                title="Export Questions as JSON"
                className="p-2 bg-[#1a1725] hover:bg-[#272237] text-amber-300 border border-[#d4af37]/25 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => importInputRef.current?.click()}
                title="Import Questions from JSON"
                className="p-2 bg-[#1a1725] hover:bg-[#272237] text-amber-300 border border-[#d4af37]/25 rounded-lg transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />

              <button
                onClick={handleResetToDefault}
                title="Reset to Curated Defaults"
                className="p-2 bg-[#1a1725] hover:bg-[#272237] text-stone-400 hover:text-amber-300 border border-[#d4af37]/25 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-stone-700 rounded-xl text-stone-400 text-sm">
                No trivia questions match your search or filter criteria.
              </div>
            ) : (
              filteredQuestions.map((q, index) => (
                <div
                  key={q.id}
                  className="p-4 rounded-lg bg-[#14121d] border border-[#d4af37]/20 hover:border-[#d4af37]/45 transition-colors space-y-2 relative"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      {/* Zero-Pill Metadata */}
                      <div className="flex items-center gap-2 text-xs text-[#9b9487]">
                        <span className="font-mono text-amber-400 font-semibold">#{index + 1}</span>
                        <span aria-hidden="true">·</span>
                        <span>{q.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{q.difficulty}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-300 font-cinzel">✦ {q.spellName}</span>
                      </div>
                      <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#ede5d8] leading-snug">
                        {q.question}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          sound.playParchmentClick();
                          setIsCreatingNew(false);
                          setEditingQuestion(JSON.parse(JSON.stringify(q)));
                        }}
                        className="p-1.5 text-amber-300 hover:bg-[#251f33] rounded transition-colors cursor-pointer"
                        title="Edit question"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-[#251f33] rounded transition-colors cursor-pointer"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 4 Choices Grid with Correct Option Highlight */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2 rounded border flex items-center gap-2 ${
                          oIdx === q.correctIndex
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                            : 'bg-[#1b1726]/60 border-stone-800 text-stone-400'
                        }`}
                      >
                        <span className="font-mono font-bold w-4">{String.fromCharCode(65 + oIdx)}.</span>
                        <span className="flex-1 truncate">{opt}</span>
                        {oIdx === q.correctIndex && (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Explanation summary */}
                  <div className="text-[11px] text-[#8e877a] italic pt-1 border-t border-stone-800/60">
                    <span className="font-semibold text-stone-400 not-italic">Cybersecurity Lesson: </span>
                    {q.explanation}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BRANDING & LOGO */}
      {activeTab === 'branding' && (
        <div className="mt-6 max-w-2xl mx-auto space-y-6">
          <div className="parchment-card p-6 rounded-xl border border-[#d4af37]/30 space-y-5">
            <h2 className="font-cinzel text-lg font-bold text-amber-300 border-b border-[#d4af37]/20 pb-2">
              Academy Crest & Visual Identity
            </h2>

            {/* Logo Preview and Uploader */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <img
                  src={settings.customLogoUrl || ASSETS.crest}
                  alt="Current Academy Crest"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.triedPublic) {
                      target.dataset.triedPublic = 'true';
                      const file = (settings.customLogoUrl || ASSETS.crest).split('/').pop();
                      if (file) target.src = `/assets/images/${file}`;
                    }
                  }}
                  className="w-28 h-28 object-contain rounded-full border-2 border-amber-400/50 p-1.5 bg-[#14121e] shadow-xl"
                />
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="text-xs text-[#a89f91]">
                  Upload your school, corporate security program, or custom wizard academy logo (PNG, JPG, SVG, WebP up to 2MB).
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-cinzel font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Custom Logo</span>
                  </button>

                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />

                  {settings.customLogoUrl && (
                    <button
                      onClick={handleResetLogo}
                      className="px-3 py-2 rounded-lg bg-[#201a2d] hover:bg-[#2b243d] text-stone-400 hover:text-amber-300 border border-stone-700 text-xs transition-colors cursor-pointer"
                    >
                      Reset to Default Crest
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Academy Name Input */}
            <div className="space-y-1.5 pt-3 border-t border-[#d4af37]/15">
              <label className="block text-xs font-cinzel text-amber-300 font-semibold uppercase">
                Academy / Organization Name
              </label>
              <input
                type="text"
                value={settings.academyName}
                onChange={(e) => {
                  const updated = { ...settings, academyName: e.target.value };
                  onSaveSettings(updated);
                }}
                className="w-full bg-[#13111b] border border-[#d4af37]/25 rounded-lg px-3.5 py-2.5 text-sm text-[#ede5d8] focus:outline-none focus:border-amber-400"
                placeholder="e.g. Hogwarts School of Witchcraft & Cyber Defense"
              />
            </div>

            {/* House Theme Selector */}
            <div className="space-y-2 pt-3 border-t border-[#d4af37]/15">
              <label className="block text-xs font-cinzel text-amber-300 font-semibold uppercase">
                Default Student House Robes
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['gryffindor', 'ravenclaw', 'slytherin', 'hufflepuff'] as HouseType[]).map((house) => {
                  const hTheme = HOUSE_THEMES[house];
                  const isSelected = settings.selectedHouse === house;
                  return (
                    <button
                      key={house}
                      onClick={() => {
                        sound.playParchmentClick();
                        onSaveSettings({ ...settings, selectedHouse: house });
                        showNotice(`House set to ${hTheme.name}`);
                      }}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                        isSelected
                          ? 'border-amber-400 bg-[#251e33] shadow-[0_0_12px_rgba(212,175,55,0.25)] ring-1 ring-amber-400/50'
                          : 'border-stone-800 bg-[#14111d] hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={hTheme.avatarUrl}
                          alt={hTheme.name}
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.dataset.triedPublic) {
                              target.dataset.triedPublic = 'true';
                              const file = hTheme.avatarUrl.split('/').pop();
                              if (file) target.src = `/assets/images/${file}`;
                            }
                          }}
                          className="w-7 h-7 rounded-full object-cover border border-black/40"
                        />
                        <div className="flex-1 truncate">
                          <span className="font-cinzel text-xs font-bold capitalize text-[#ede5d8] block">
                            {hTheme.name}
                          </span>
                        </div>
                        <div
                          className="w-3 h-3 rounded-full border border-black/40"
                          style={{ backgroundColor: hTheme.primaryColor }}
                        />
                      </div>
                      <div className="h-1 w-full rounded" style={{
                        background: `repeating-linear-gradient(90deg, ${hTheme.scarfColors[0]}, ${hTheme.scarfColors[0]} 4px, ${hTheme.scarfColors[1]} 4px, ${hTheme.scarfColors[1]} 8px)`
                      }} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STAMINA & DIFFICULTY TUNING */}
      {activeTab === 'tuning' && (
        <div className="mt-6 max-w-2xl mx-auto space-y-6">
          <div className="parchment-card p-6 rounded-xl border border-[#d4af37]/30 space-y-6">
            <h2 className="font-cinzel text-lg font-bold text-amber-300 border-b border-[#d4af37]/20 pb-2 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Bridge Length & Stamina Tuning</span>
            </h2>

            {/* Total Stepping Stones (Bridge Length) */}
            <div className="space-y-2 pb-4 border-b border-[#d4af37]/15">
              <div className="flex justify-between items-center text-xs">
                <span className="font-cinzel text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Footprints className="w-4 h-4 text-amber-400" />
                  <span>Number of Stepping Stones</span>
                </span>
                <span className="font-mono text-amber-300 font-bold text-sm tabular-nums">
                  {settings.totalSteps || 10} Stones to Cross
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={3}
                  max={15}
                  step={1}
                  value={settings.totalSteps || 10}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    onSaveSettings({ ...settings, totalSteps: val });
                  }}
                  className="flex-1 accent-amber-400 cursor-pointer"
                />
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {[5, 7, 10, 12, 15].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => {
                      sound.playParchmentClick();
                      onSaveSettings({ ...settings, totalSteps: count });
                    }}
                    className={`px-3 py-1 text-xs font-mono rounded border transition-colors cursor-pointer ${
                      (settings.totalSteps || 10) === count
                        ? 'bg-amber-500/25 text-amber-300 border-amber-400 font-bold shadow-[0_0_8px_rgba(251,191,36,0.25)]'
                        : 'bg-[#15121e] text-stone-400 border-stone-800 hover:text-stone-200'
                    }`}
                  >
                    {count} Steps
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#8e877a]">
                Choose how many floating stone steps the wizard must cross to reach Hogwarts Castle safety.
              </p>
            </div>

            {/* Initial Time Seconds */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-cinzel text-[#ede5d8] font-semibold">Initial Spell Stamina</span>
                <span className="font-mono text-amber-300 font-bold tabular-nums">{settings.initialTimeSeconds}s</span>
              </div>
              <input
                type="range"
                min={30}
                max={90}
                step={5}
                value={settings.initialTimeSeconds}
                onChange={(e) => {
                  onSaveSettings({ ...settings, initialTimeSeconds: parseInt(e.target.value, 10) });
                }}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <p className="text-[11px] text-[#8e877a]">Starting seconds on the depleting spell bar.</p>
            </div>

            {/* Time Bonus Correct */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-cinzel text-[#ede5d8] font-semibold">Correct Answer Time Bonus</span>
                <span className="font-mono text-emerald-400 font-bold tabular-nums">+{settings.timeBonusCorrect}s</span>
              </div>
              <input
                type="range"
                min={3}
                max={20}
                step={1}
                value={settings.timeBonusCorrect}
                onChange={(e) => {
                  onSaveSettings({ ...settings, timeBonusCorrect: parseInt(e.target.value, 10) });
                }}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <p className="text-[11px] text-[#8e877a]">Seconds added back to stamina upon a successful spellcast.</p>
            </div>

            {/* Time Penalty Wrong */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-cinzel text-[#ede5d8] font-semibold">Wrong Answer Penalty</span>
                <span className="font-mono text-rose-400 font-bold tabular-nums">-{settings.timePenaltyWrong}s</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={settings.timePenaltyWrong}
                onChange={(e) => {
                  onSaveSettings({ ...settings, timePenaltyWrong: parseInt(e.target.value, 10) });
                }}
                className="w-full accent-rose-400 cursor-pointer"
              />
              <p className="text-[11px] text-[#8e877a]">Seconds burned when an incantation fails from a wrong answer.</p>
            </div>

            {/* Reset Defaults button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  onSaveSettings({
                    ...settings,
                    totalSteps: DEFAULT_SETTINGS.totalSteps,
                    initialTimeSeconds: DEFAULT_SETTINGS.initialTimeSeconds,
                    timeBonusCorrect: DEFAULT_SETTINGS.timeBonusCorrect,
                    timePenaltyWrong: DEFAULT_SETTINGS.timePenaltyWrong,
                  });
                  showNotice('Stamina tuning reset to balanced defaults');
                }}
                className="px-4 py-2 text-xs font-cinzel rounded bg-[#1e1929] hover:bg-[#2c243a] text-stone-300 border border-stone-700 transition-colors cursor-pointer"
              >
                Reset to Default Balance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT QUESTION MODAL */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-2xl parchment-panel rounded-2xl p-6 border-2 border-amber-400/60 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#d4af37]/20">
              <h3 className="font-cinzel text-lg font-bold text-amber-300">
                {isCreatingNew ? 'Forge New Bridge Trivia Question' : 'Edit Bridge Trivia Question'}
              </h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestionForm} className="space-y-4 mt-4">
              {/* Question Text */}
              <div className="space-y-1">
                <label className="text-xs font-cinzel text-stone-300 font-semibold uppercase">
                  Question Text
                </label>
                <textarea
                  rows={3}
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  className="w-full bg-[#13111b] border border-[#d4af37]/30 rounded-lg p-3 text-xs sm:text-sm text-[#ede5d8] focus:outline-none focus:border-amber-400"
                  placeholder="Enter the cybersecurity trivia scenario..."
                  required
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="text-xs font-cinzel text-stone-300 font-semibold uppercase">
                  Multiple Choice Options (Select radio for correct answer)
                </label>
                {editingQuestion.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={editingQuestion.correctIndex === idx}
                      onChange={() => setEditingQuestion({ ...editingQuestion, correctIndex: idx })}
                      className="accent-amber-400 w-4 h-4 cursor-pointer"
                      title="Mark as correct answer"
                    />
                    <span className="font-cinzel text-xs font-bold text-amber-300 w-5">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...editingQuestion.options] as [string, string, string, string];
                        newOpts[idx] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOpts });
                      }}
                      className="flex-1 bg-[#13111b] border border-[#d4af37]/30 rounded-lg px-3 py-1.5 text-xs text-[#ede5d8] focus:outline-none focus:border-amber-400"
                      placeholder={`Choice ${String.fromCharCode(65 + idx)}`}
                      required
                    />
                  </div>
                ))}
              </div>

              {/* Category, Difficulty, Spell Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-cinzel text-stone-300 font-semibold uppercase">
                    Category
                  </label>
                  <select
                    value={editingQuestion.category}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        category: e.target.value as TriviaQuestion['category'],
                      })
                    }
                    className="w-full bg-[#13111b] border border-[#d4af37]/30 rounded-lg p-2 text-xs text-[#ede5d8] focus:outline-none focus:border-amber-400"
                  >
                    <option value="Social Engineering">Social Engineering</option>
                    <option value="Authentication & Passwords">Authentication & Passwords</option>
                    <option value="Network & Defense">Network & Defense</option>
                    <option value="Malware & Dark Curses">Malware & Dark Curses</option>
                    <option value="Data Privacy & Cloud">Data Privacy & Cloud</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-cinzel text-stone-300 font-semibold uppercase">
                    Difficulty
                  </label>
                  <select
                    value={editingQuestion.difficulty}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        difficulty: e.target.value as TriviaQuestion['difficulty'],
                      })
                    }
                    className="w-full bg-[#13111b] border border-[#d4af37]/30 rounded-lg p-2 text-xs text-[#ede5d8] focus:outline-none focus:border-amber-400"
                  >
                    <option value="Apprentice">Apprentice</option>
                    <option value="Adept">Adept</option>
                    <option value="Master">Master</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-cinzel text-stone-300 font-semibold uppercase">
                    Spell Incantation
                  </label>
                  <input
                    type="text"
                    value={editingQuestion.spellName}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, spellName: e.target.value })}
                    className="w-full bg-[#13111b] border border-[#d4af37]/30 rounded-lg p-2 text-xs text-[#ede5d8] focus:outline-none focus:border-amber-400"
                    placeholder="e.g. Revelio"
                    required
                  />
                </div>
              </div>

              {/* Explanation / Cybersecurity Lesson */}
              <div className="space-y-1">
                <label className="text-xs font-cinzel text-stone-300 font-semibold uppercase">
                  Educational Cybersecurity Explanation
                </label>
                <textarea
                  rows={2}
                  value={editingQuestion.explanation}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full bg-[#13111b] border border-[#d4af37]/30 rounded-lg p-2.5 text-xs text-[#ede5d8] focus:outline-none focus:border-amber-400"
                  placeholder="Explain why the answer is correct and the security defense principle..."
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#d4af37]/20">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 rounded-lg bg-[#201a2d] hover:bg-[#2b243d] text-stone-300 text-xs font-cinzel transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-cinzel font-bold text-xs transition-colors cursor-pointer"
                >
                  {isCreatingNew ? 'Add to Bank' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
