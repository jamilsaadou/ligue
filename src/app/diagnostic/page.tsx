'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Users, 
  Shield, 
  CheckCircle,
  AlertTriangle,
  Heart,
  RotateCcw,
  Home,
  Phone,
  PlayCircle,
  Trash2,
  Clock
} from 'lucide-react';
import { categories, getAlertLevel, getCategoryLevel, Category } from '@/data/questions';

type Mode = 'self' | 'other' | null;

interface CategoryScore {
  categoryId: number;
  score: number;
  maxScore: number;
  level: 'safe' | 'warning' | 'danger';
}

interface SavedProgress {
  mode: Mode;
  currentCategoryIndex: number;
  currentQuestionIndex: number;
  answers: Record<number, number>;
  isStarted: boolean;
  savedAt: string;
}

const STORAGE_KEY = 'violentometre_diagnostic_progress';

export default function DiagnosticPage() {
  const [mode, setMode] = useState<Mode>(null);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedProgress, setSavedProgress] = useState<SavedProgress | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Check for saved progress on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed: SavedProgress = JSON.parse(saved);
          // Check if the saved progress is valid and not too old (7 days)
          const savedDate = new Date(parsed.savedAt);
          const now = new Date();
          const daysDiff = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysDiff < 7 && parsed.isStarted && Object.keys(parsed.answers).length > 0) {
            setSavedProgress(parsed);
            setShowResumeModal(true);
          }
        } catch (e) {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Auto-save progress when answering questions
  useEffect(() => {
    if (isStarted && Object.keys(answers).length > 0 && !showResults) {
      const progressData: SavedProgress = {
        mode,
        currentCategoryIndex,
        currentQuestionIndex,
        answers,
        isStarted,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
    }
  }, [answers, currentCategoryIndex, currentQuestionIndex, isStarted, mode, showResults]);

  // Clear saved progress when completing or restarting
  const clearSavedProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSavedProgress(null);
  }, []);

  // Resume saved progress
  const handleResumeProgress = () => {
    if (savedProgress) {
      setMode(savedProgress.mode);
      setCurrentCategoryIndex(savedProgress.currentCategoryIndex);
      setCurrentQuestionIndex(savedProgress.currentQuestionIndex);
      setAnswers(savedProgress.answers);
      setIsStarted(savedProgress.isStarted);
      setShowResumeModal(false);
    }
  };

  // Start new diagnostic (discard saved progress)
  const handleStartNew = () => {
    clearSavedProgress();
    setShowResumeModal(false);
  };

  // Format saved date
  const formatSavedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentCategory = categories[currentCategoryIndex];
  const currentQuestion = currentCategory?.questions[currentQuestionIndex];
  const CurrentCategoryIcon = currentCategory.icon;
  
  const totalQuestions = categories.reduce((acc, cat) => acc + cat.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  // Calculate scores
  const calculateTotalScore = () => {
    return Object.values(answers).reduce((acc, score) => acc + score, 0);
  };

  const calculateCategoryScores = (): CategoryScore[] => {
    return categories.map(category => {
      const categoryScore = category.questions.reduce((acc, question) => {
        return acc + (answers[question.id] || 0);
      }, 0);
      return {
        categoryId: category.id,
        score: categoryScore,
        maxScore: category.maxPoints,
        level: getCategoryLevel(categoryScore, category.maxPoints)
      };
    });
  };

  const handleAnswer = (questionId: number, points: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: points }));
    
    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < currentCategory.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else if (currentCategoryIndex < categories.length - 1) {
        setCurrentCategoryIndex(prev => prev + 1);
        setCurrentQuestionIndex(0);
      } else {
        setShowResults(true);
        clearSavedProgress(); // Clear saved progress when completing the diagnostic
      }
    }, 300);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
      setCurrentQuestionIndex(categories[currentCategoryIndex - 1].questions.length - 1);
    }
  };

  const handleRestart = () => {
    clearSavedProgress();
    setMode(null);
    setCurrentCategoryIndex(0);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setIsStarted(false);
  };

  const canGoBack = currentCategoryIndex > 0 || currentQuestionIndex > 0;

  // Resume Modal
  if (showResumeModal && savedProgress) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8">
        <motion.div 
          className="max-w-lg w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="glass-card p-7 md:p-10">
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[#eb5f2a]/20 to-[#eb5f2a]/10 flex items-center justify-center mx-auto mb-4"
              >
                <Clock className="w-8 h-8 text-[#eb5f2a]" />
              </motion.div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                Reprendre le diagnostic ?
              </h1>
              <p className="text-slate-600">
                Vous avez un diagnostic en cours
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 mb-12">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Mode</span>
                  <span className="text-slate-900 font-medium text-sm">
                    {savedProgress.mode === 'self' ? 'Pour moi-même' : 'Pour quelqu\'un d\'autre'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Progression</span>
                  <span className="text-slate-900 font-medium text-sm">
                    {Object.keys(savedProgress.answers).length} / {totalQuestions} questions
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Sauvegardé le</span>
                  <span className="text-slate-900 font-medium text-sm">
                    {formatSavedDate(savedProgress.savedAt)}
                  </span>
                </div>
                <div className="pt-3">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(Object.keys(savedProgress.answers).length / totalQuestions) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <motion.button
                className="glass-button w-full flex items-center justify-center gap-2"
                onClick={handleResumeProgress}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlayCircle className="w-5 h-5" />
                Reprendre où j'en étais
              </motion.button>
              
              <motion.button
                className="glass-button-outline w-full flex items-center justify-center gap-2"
                onClick={handleStartNew}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Trash2 className="w-5 h-5" />
                Commencer un nouveau diagnostic
              </motion.button>
            </div>

            <p className="text-center text-slate-400 text-xs mt-8">
              Votre progression est sauvegardée localement sur cet appareil pendant 7 jours.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Mode Selection Screen
  if (!mode) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8">
        <motion.div 
          className="max-w-2xl w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-[#eb5f2a] to-[#d14d1a] flex items-center justify-center mx-auto mb-6"
            >
              <Heart className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Choisissez votre <span className="gradient-text">mode</span>
            </h1>
            <p className="text-slate-600 max-w-md mx-auto">
              Vous pouvez évaluer votre propre situation ou aider un proche à identifier une situation de violence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.button
              className="glass-card p-8 text-left hover:border-[#eb5f2a]/50 transition-all group"
              onClick={() => setMode('self')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#eb5f2a]/20 to-[#eb5f2a]/10 flex items-center justify-center mb-6 group-hover:from-[#eb5f2a]/30 group-hover:to-[#eb5f2a]/20 transition-all">
                <User className="w-8 h-8 text-[#eb5f2a]" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-[#eb5f2a] transition-colors">
                Pour moi-même
              </h3>
              <p className="text-slate-600 text-sm">
                J'évalue ma propre situation relationnelle de manière confidentielle.
              </p>
            </motion.button>

            <motion.button
              className="glass-card p-8 text-left hover:border-[#eb5f2a]/50 transition-all group"
              onClick={() => setMode('other')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-6 group-hover:bg-slate-200 transition-all">
                <Users className="w-8 h-8 text-slate-600 group-hover:text-[#eb5f2a] transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-[#eb5f2a] transition-colors">
                Pour quelqu'un d'autre
              </h3>
              <p className="text-slate-600 text-sm">
                J'aide un proche (ami, famille, collègue) à évaluer sa situation.
              </p>
            </motion.button>
          </div>

          <div className="mt-10 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#eb5f2a] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-slate-700 text-sm">
                  <strong className="text-[#eb5f2a]">100% confidentiel</strong> - Aucune donnée personnelle n'est collectée. 
                  Vous pouvez fermer cette page à tout moment.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Instructions Screen
  if (!isStarted) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8">
        <motion.div 
          className="max-w-2xl w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="glass-card p-6 md:p-10">
            <div className="text-center mb-8">
              <div className="category-badge mb-4 inline-flex">
                {mode === 'self' ? <User className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                {mode === 'self' ? 'Mode personnel' : 'Mode tiers'}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                Avant de commencer
              </h1>
              <p className="text-slate-600">
                {mode === 'self' 
                  ? 'Répondez honnêtement aux questions suivantes en pensant à votre relation actuelle.'
                  : 'Répondez aux questions en pensant à la situation de la personne que vous souhaitez aider.'
                }
              </p>
            </div>

            <div className="space-y-5 mb-10">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
                <div className="w-10 h-10 rounded-lg bg-[#eb5f2a]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#eb5f2a] font-bold">38</span>
                </div>
                <div>
                  <h4 className="text-slate-900 font-medium">38 questions</h4>
                  <p className="text-slate-500 text-sm">Réparties en 6 catégories thématiques</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
                <div className="w-10 h-10 rounded-lg bg-[#eb5f2a]/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-[#eb5f2a]" />
                </div>
                <div>
                  <h4 className="text-slate-900 font-medium">Environ 10 minutes</h4>
                  <p className="text-slate-500 text-sm">Prenez le temps de bien réfléchir à chaque question</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
                <div className="w-10 h-10 rounded-lg bg-[#eb5f2a]/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-[#eb5f2a]" />
                </div>
                <div>
                  <h4 className="text-slate-900 font-medium">Totalement anonyme</h4>
                  <p className="text-slate-500 text-sm">Aucune donnée n'est enregistrée</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <motion.button
                className="glass-button flex-1 flex items-center justify-center gap-2"
                onClick={() => setIsStarted(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Commencer le diagnostic
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                className="glass-button-outline flex items-center justify-center gap-2"
                onClick={() => setMode(null)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-5 h-5" />
                Retour
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Results Screen
  if (showResults) {
    const totalScore = calculateTotalScore();
    const alertLevel = getAlertLevel(totalScore);
    const categoryScores = calculateCategoryScores();

    return (
      <div className="min-h-[calc(100vh-80px)] px-4 py-8 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="space-y-10 md:space-y-12">
              {/* Main Result Card */}
              <div className={`glass-card p-6 md:p-10 ${alertLevel.bgClass} border-2`}>
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ backgroundColor: `${alertLevel.color}20` }}
                  >
                    {alertLevel.level === 'safe' && <CheckCircle className="w-12 h-12" style={{ color: alertLevel.color }} />}
                    {alertLevel.level === 'warning' && <AlertTriangle className="w-12 h-12" style={{ color: alertLevel.color }} />}
                    {alertLevel.level === 'danger' && <AlertTriangle className="w-12 h-12" style={{ color: alertLevel.color }} />}
                  </motion.div>

                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                    {alertLevel.title}
                  </h1>
                  <p className="text-2xl mb-4" style={{ color: alertLevel.color }}>
                    {alertLevel.subtitle}
                  </p>
                  
                  <div className="text-6xl font-bold mb-4" style={{ color: alertLevel.color }}>
                    {totalScore}
                    <span className="text-2xl text-slate-400">/120</span>
                  </div>

                  <p className="text-slate-600 max-w-xl mx-auto leading-relaxed">
                    {alertLevel.message}
                  </p>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="glass-card p-5 md:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-8">Résultats par catégorie</h2>
                <div className="space-y-5">
                  {categories.map((category, index) => {
                    const catScore = categoryScores.find(cs => cs.categoryId === category.id);
                    const percentage = catScore ? (catScore.score / catScore.maxScore) * 100 : 0;
                    const levelColor = catScore?.level === 'safe' ? '#64748b' : catScore?.level === 'warning' ? '#eb5f2a' : '#ef4444';
                    const CategoryIcon = category.icon;
                    
                    return (
                      <motion.div
                        key={category.id}
                        className="p-4 rounded-xl bg-slate-50"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#eb5f2a]/10 flex items-center justify-center">
                              <CategoryIcon className="w-4 h-4 text-[#eb5f2a]" />
                            </div>
                            <span className="text-slate-900 font-medium">{category.name}</span>
                          </div>
                          <span className="text-slate-500">
                            {catScore?.score || 0}/{catScore?.maxScore || 0}
                          </span>
                        </div>
                        <div className="progress-bar">
                          <motion.div 
                            className="progress-fill"
                            style={{ backgroundColor: levelColor }}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Emergency Contact for Danger Level */}
              {alertLevel.level === 'danger' && (
                <motion.div
                  className="glass-card p-5 md:p-8 border-2 border-red-500/50 bg-red-500/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
                        <Phone className="w-7 h-7 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Besoin d'aide urgente ?</h3>
                        <p className="text-slate-600">Des professionnels peuvent vous aider maintenant</p>
                      </div>
                    </div>
                    <div className="flex gap-5">
                      <a
                        href="tel:17"
                        className="px-6 py-3 rounded-xl bg-red-500 text-white font-semibold flex items-center gap-2 hover:bg-red-600 transition-colors"
                      >
                        <Phone className="w-5 h-5" />
                        Appeler le 17
                      </a>
                      <Link
                        href="/ressources"
                        className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
                      >
                        Voir les ressources
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Resources Link */}
              <div className="glass-card p-5 md:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Ressources d'aide</h2>
                <p className="text-slate-600 mb-8">
                  Quelle que soit votre situation, des structures existent pour vous accompagner. 
                  N'hésitez pas à les contacter.
                </p>
                <Link
                  href="/ressources"
                  className="glass-button inline-flex items-center gap-2"
                >
                  Accéder aux ressources
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <motion.button
                  className="glass-button-outline flex items-center justify-center gap-2"
                  onClick={handleRestart}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RotateCcw className="w-5 h-5" />
                  Refaire le diagnostic
                </motion.button>
                <Link href="/">
                  <motion.button
                    className="glass-button-outline flex items-center justify-center gap-2 w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Home className="w-5 h-5" />
                    Retour à l'accueil
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Questionnaire Screen
  return (
    <div className="min-h-[calc(100vh-80px)] px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="category-badge">
              <CurrentCategoryIcon className="w-4 h-4" />
              {currentCategory.name}
            </div>
            <span className="text-slate-500 text-sm">
              Question {answeredQuestions + 1} / {totalQuestions}
            </span>
          </div>
          <div className="progress-bar">
            <motion.div 
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-5 md:p-8"
          >
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-6 leading-relaxed">
              {mode === 'other' 
                ? currentQuestion.text.replace(/vous/gi, 'cette personne').replace(/votre/gi, 'sa').replace(/vos/gi, 'ses')
                : currentQuestion.text
              }
            </h2>

            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  className={`radio-option w-full text-left ${answers[currentQuestion.id] === option.points ? 'selected' : ''}`}
                  onClick={() => handleAnswer(currentQuestion.id, option.points)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="radio-circle" />
                  <span className="text-slate-800">{option.text}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <motion.button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all ${!canGoBack ? 'invisible' : ''}`}
            onClick={handlePrevious}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!canGoBack}
          >
            <ArrowLeft className="w-5 h-5" />
            Précédent
          </motion.button>

          <motion.button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
            onClick={handleRestart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-5 h-5" />
            Recommencer
          </motion.button>
        </div>

        {/* Category Progress */}
        <div className="mt-10 flex justify-center gap-3">
          {categories.map((cat, index) => (
            <div
              key={cat.id}
              className={`w-3 h-3 rounded-full transition-all ${
                index < currentCategoryIndex 
                  ? 'bg-[#eb5f2a]' 
                  : index === currentCategoryIndex 
                    ? 'bg-[#eb5f2a]/50 ring-2 ring-[#eb5f2a] ring-offset-2 ring-offset-transparent' 
                    : 'bg-slate-200'
              }`}
              title={cat.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
