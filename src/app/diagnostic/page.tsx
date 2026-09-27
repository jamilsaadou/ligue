'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import DiagnosticResultShare from '@/components/DiagnosticResultShare';
import {
  getClientAnalyticsContext,
  sendAnalyticsEvent
} from '@/lib/analytics-client';
import {
  ArrowRight,
  ArrowLeft,
  User,
  Users,
  Shield,
  CheckCircle,
  AlertTriangle,
  Bell,
  BookOpen,
  Brain,
  ClipboardCheck,
  MessageCircle,
  Eye,
  Globe,
  HandHeart,
  Heart,
  RotateCcw,
  Home,
  Lock,
  MapPin,
  Phone,
  PlayCircle,
  Scale,
  Trash2,
  Clock,
  FileText,
  Smartphone,
  Target,
  UserCheck,
  UserX,
  type LucideIcon
} from 'lucide-react';
import { categories as staticCategories } from '@/data/questions';

type Mode = 'self' | 'other' | null;

type DiagnosticOption = {
  id: string;
  text: string;
  points: number;
};

type DiagnosticQuestion = {
  id: string;
  text: string;
  options: DiagnosticOption[];
};

type DiagnosticCategory = {
  id: string;
  name: string;
  description?: string;
  iconName?: string | null;
  icon?: LucideIcon | string | null;
  questions: DiagnosticQuestion[];
};

type DiagnosticData = {
  id: string;
  title: string;
  description?: string;
  categories: DiagnosticCategory[];
};

type DiagnosticListItem = {
  id: string;
  title: string;
  description?: string;
  totalQuestions: number;
  totalCategories: number;
  categories: DiagnosticCategory[];
};

interface CategoryScore {
  categoryId: string;
  score: number;
  maxScore: number;
  level: 'safe' | 'warning' | 'danger';
}

interface SavedProgress {
  version?: number;
  mode: Mode;
  diagnosticId: string;
  diagnosticSnapshot?: DiagnosticData;
  currentCategoryIndex: number;
  currentQuestionIndex: number;
  answers: Record<string, number>;
  isStarted: boolean;
  showResults?: boolean;
  attemptId?: string;
  startedAt?: string;
  completedAt?: string;
  submittedAt?: string;
  savedAt: string;
}

const STORAGE_KEY = 'violentometre_diagnostic_progress';
const STORAGE_VERSION = 2;
const STORAGE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DIAGNOSTIC_FALLBACK_ID = 'static';

const readSavedProgress = (): SavedProgress | null => {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as SavedProgress) : null;
  } catch (error) {
    console.warn('Diagnostic cache read error:', error);
    return null;
  }
};

const writeSavedProgress = (progress: SavedProgress) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch (error) {
    console.warn('Diagnostic cache write error:', error);
    return false;
  }
};

const removeSavedProgress = () => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Diagnostic cache clear error:', error);
  }
};

const iconMap: Record<string, LucideIcon> = {
  Heart,
  MessageCircle,
  Eye,
  Shield,
  AlertTriangle,
  Users,
  Smartphone,
  Lock,
  UserX,
  UserCheck,
  HandHeart,
  Brain,
  Scale,
  Target,
  Bell,
  Phone,
  MapPin,
  Home,
  Globe,
  BookOpen,
  ClipboardCheck
};

const resolveCategoryIcon = (category?: Pick<DiagnosticCategory, 'icon' | 'iconName'>) => {
  if (!category) return Shield;
  if (typeof category.icon === 'string') {
    return iconMap[category.icon] ?? Shield;
  }
  return category.icon ?? (category.iconName ? iconMap[category.iconName] : null) ?? Shield;
};

const fallbackDiagnostic: DiagnosticData = {
  id: DIAGNOSTIC_FALLBACK_ID,
  title: 'Violentomètre',
  description: '',
  categories: staticCategories.map((category) => ({
    id: String(category.id),
    name: category.name,
    description: category.description,
    icon: category.icon,
    questions: category.questions.map((question, index) => ({
      id: String(question.id ?? `${category.id}-${index}`),
      text: question.text,
      options: question.options.map((option, optionIndex) => ({
        id: `${question.id ?? `${category.id}-${index}`}-${optionIndex}`,
        text: option.text,
        points: option.points
      }))
    }))
  }))
};

const getAlertLevelForScore = (score: number, maxScore: number) => {
  const percentage = maxScore ? (score / maxScore) * 100 : 0;
  if (percentage <= 25) {
    return {
      level: 'safe' as const,
      title: 'Relation saine',
      subtitle: 'Profitez !',
      message:
        'Votre relation semble saine et équilibrée. Continuez à cultiver le respect mutuel, la communication ouverte et la confiance.',
      color: '#64748b',
      bgClass: 'level-safe'
    };
  }
  if (percentage <= 60) {
    return {
      level: 'warning' as const,
      title: 'Vigilance',
      subtitle: 'Dis STOP !',
      message:
        "Des signes préoccupants sont présents dans votre relation. Il est important d'en parler et de poser des limites claires. N'hésitez pas à consulter un professionnel.",
      color: '#f15b24',
      bgClass: 'level-warning'
    };
  }
  return {
    level: 'danger' as const,
    title: 'Danger',
    subtitle: 'Protège-toi !',
    message:
      "Vous subissez des violences. Ce n'est PAS normal et ce n'est PAS de votre faute. Protégez-vous et demandez de l'aide immédiatement.",
    color: '#ef4444',
    bgClass: 'level-danger'
  };
};

const getCategoryLevel = (score: number, maxPoints: number) => {
  const percentage = maxPoints ? (score / maxPoints) * 100 : 0;
  if (percentage <= 25) return 'safe';
  if (percentage <= 60) return 'warning';
  return 'danger';
};

const getCategoryMaxPoints = (category: DiagnosticCategory) =>
  category.questions.reduce((acc, question) => {
    const maxOption = Math.max(...question.options.map((option) => option.points));
    return acc + (Number.isFinite(maxOption) ? maxOption : 0);
  }, 0);

const getDiagnosticMaxScore = (data: DiagnosticData) =>
  data.categories.reduce((acc, category) => acc + getCategoryMaxPoints(category), 0);

export default function DiagnosticPage() {
  const [diagnosticList, setDiagnosticList] = useState<DiagnosticListItem[]>([]);
  const [diagnostic, setDiagnostic] = useState<DiagnosticData | null>(null);
  const [isDiagnosticLoading, setIsDiagnosticLoading] = useState(true);
  const [diagnosticLoadFailed, setDiagnosticLoadFailed] = useState(false);
  const [selectedDiagnosticId, setSelectedDiagnosticId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>(null);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedProgress, setSavedProgress] = useState<SavedProgress | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [attemptStartedAt, setAttemptStartedAt] = useState<string | null>(null);
  const hasSubmittedRef = useRef(false);
  const trackedMilestonesRef = useRef<Set<number>>(new Set());

  // Load list of available diagnostics
  useEffect(() => {
    let isMounted = true;
    const loadDiagnosticList = async () => {
      setIsDiagnosticLoading(true);
      setDiagnosticLoadFailed(false);
      try {
        const response = await fetch('/api/diagnostic/list');
        const data = await response.json();
        if (isMounted && response.ok && data?.diagnostics) {
          setDiagnosticList(data.diagnostics);
        } else if (isMounted) {
          setDiagnosticLoadFailed(true);
        }
      } catch (error) {
        console.error('Diagnostic list fetch error:', error);
        if (isMounted) {
          setDiagnosticLoadFailed(true);
        }
      } finally {
        if (isMounted) {
          setIsDiagnosticLoading(false);
        }
      }
    };
    loadDiagnosticList();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load full diagnostic when selected
  useEffect(() => {
    if (!selectedDiagnosticId) return;

    // Check if it's the fallback
    if (selectedDiagnosticId === DIAGNOSTIC_FALLBACK_ID) {
      setDiagnostic(fallbackDiagnostic);
      return;
    }

    // Find from list (already has full data)
    const selected = diagnosticList.find(d => d.id === selectedDiagnosticId);
    if (selected) {
      setDiagnostic({
        id: selected.id,
        title: selected.title,
        description: selected.description,
        categories: selected.categories
      });
    }
  }, [selectedDiagnosticId, diagnosticList]);

  // Check for saved progress once diagnostics are loaded
  useEffect(() => {
    if (isDiagnosticLoading || typeof window === 'undefined') return;
    const parsed = readSavedProgress();
    if (!parsed) return;

    const savedAt = new Date(parsed.savedAt).getTime();
    const isFresh = Number.isFinite(savedAt) && Date.now() - savedAt <= STORAGE_TTL_MS;
    const savedDiagnostic = diagnosticList.find((item) => item.id === parsed.diagnosticId);
    const targetDiagnostic =
      savedDiagnostic ||
      parsed.diagnosticSnapshot ||
      (parsed.diagnosticId === DIAGNOSTIC_FALLBACK_ID ? fallbackDiagnostic : null);

    if (!targetDiagnostic) {
      if (!diagnosticLoadFailed) removeSavedProgress();
      return;
    }

    const parsedCategory = targetDiagnostic.categories[parsed.currentCategoryIndex];
    const isValidProgress =
      parsed.currentCategoryIndex >= 0 &&
      parsed.currentCategoryIndex < targetDiagnostic.categories.length &&
      parsed.currentQuestionIndex >= 0 &&
      Boolean(parsedCategory) &&
      parsed.currentQuestionIndex < parsedCategory.questions.length;
    const hasAnswers = Object.keys(parsed.answers || {}).length > 0;
    const hasMode = parsed.mode === 'self' || parsed.mode === 'other';

    if (isFresh && parsed.isStarted && hasAnswers && hasMode && isValidProgress) {
      setSavedProgress(parsed);
      setShowResumeModal(true);
      return;
    }

    removeSavedProgress();
  }, [diagnosticList, diagnosticLoadFailed, isDiagnosticLoading]);

  // Auto-save progress when answering questions
  useEffect(() => {
    if (!diagnostic) return;
    if (isStarted && Object.keys(answers).length > 0 && !showResults) {
      const progressData: SavedProgress = {
        version: STORAGE_VERSION,
        mode,
        diagnosticId: diagnostic.id,
        diagnosticSnapshot: diagnostic,
        currentCategoryIndex,
        currentQuestionIndex,
        answers,
        isStarted,
        showResults: false,
        attemptId: attemptId || undefined,
        startedAt: attemptStartedAt || undefined,
        savedAt: new Date().toISOString()
      };
      writeSavedProgress(progressData);
    }
  }, [
    answers,
    currentCategoryIndex,
    currentQuestionIndex,
    diagnostic,
    isStarted,
    mode,
    showResults,
    attemptId,
    attemptStartedAt
  ]);

  // Clear saved progress when the user explicitly starts over.
  const clearSavedProgress = useCallback(() => {
    removeSavedProgress();
    setSavedProgress(null);
  }, []);

  // Resume saved progress
  const handleResumeProgress = () => {
    if (savedProgress) {
      const resumedDiagnostic =
        savedProgress.diagnosticId === DIAGNOSTIC_FALLBACK_ID
          ? fallbackDiagnostic
          : diagnosticList.find((item) => item.id === savedProgress.diagnosticId) ||
            savedProgress.diagnosticSnapshot;
      if (!resumedDiagnostic) {
        clearSavedProgress();
        setShowResumeModal(false);
        return;
      }
      const resumedAttemptId = savedProgress.attemptId || crypto.randomUUID();
      const resumedStartedAt = savedProgress.startedAt || new Date().toISOString();
      const resumedAnswersCount = Object.keys(savedProgress.answers).length;
      const resumedTotalQuestions = resumedDiagnostic
        ? resumedDiagnostic.categories.reduce(
            (total, category) => total + category.questions.length,
            0
          )
        : resumedAnswersCount;

      setSelectedDiagnosticId(savedProgress.diagnosticId);
      setDiagnostic(resumedDiagnostic);
      setMode(savedProgress.mode);
      setCurrentCategoryIndex(savedProgress.currentCategoryIndex);
      setCurrentQuestionIndex(savedProgress.currentQuestionIndex);
      setAnswers(savedProgress.answers);
      setIsStarted(savedProgress.isStarted);
      setShowResults(Boolean(savedProgress.showResults));
      setAttemptId(resumedAttemptId);
      setAttemptStartedAt(resumedStartedAt);
      hasSubmittedRef.current = Boolean(savedProgress.submittedAt);
      trackedMilestonesRef.current = new Set(
        [25, 50, 75].filter(
          (milestone) =>
            resumedTotalQuestions > 0 &&
            (resumedAnswersCount / resumedTotalQuestions) * 100 >= milestone
        )
      );
      setShowResumeModal(false);

      if (
        !savedProgress.showResults &&
        savedProgress.diagnosticId !== DIAGNOSTIC_FALLBACK_ID
      ) {
        fetch('/api/diagnostic/attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...getClientAnalyticsContext(),
            attemptId: resumedAttemptId,
            diagnosticId: savedProgress.diagnosticId,
            mode: savedProgress.mode || 'self',
            totalQuestions: resumedTotalQuestions,
            answersCount: resumedAnswersCount
          })
        }).catch(() => undefined);
      }
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

  const categories = useMemo(() => diagnostic?.categories ?? [], [diagnostic]);
  const currentCategory = categories[currentCategoryIndex];
  const currentQuestion = currentCategory?.questions[currentQuestionIndex];
  const CurrentCategoryIcon = resolveCategoryIcon(currentCategory);

  const totalQuestions = categories.reduce((acc, cat) => acc + cat.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const progress = totalQuestions ? (answeredQuestions / totalQuestions) * 100 : 0;

  // Calculate scores
  const calculateTotalScore = useCallback(() => {
    return Object.values(answers).reduce((acc, score) => acc + score, 0);
  }, [answers]);

  const calculateCategoryScores = useCallback((): CategoryScore[] => {
    return categories.map((category) => {
      const categoryScore = category.questions.reduce((acc, question) => {
        return acc + (answers[question.id] || 0);
      }, 0);
      const maxScore = getCategoryMaxPoints(category);
      return {
        categoryId: category.id,
        score: categoryScore,
        maxScore,
        level: getCategoryLevel(categoryScore, maxScore)
      };
    });
  }, [answers, categories]);

  const handleBeginDiagnostic = () => {
    if (!diagnostic || !mode) return;
    const nextAttemptId = crypto.randomUUID();
    const startedAt = new Date().toISOString();
    setAttemptId(nextAttemptId);
    setAttemptStartedAt(startedAt);
    trackedMilestonesRef.current = new Set();
    setIsStarted(true);

    if (diagnostic.id === DIAGNOSTIC_FALLBACK_ID) {
      sendAnalyticsEvent({
        eventName: 'diagnostic_started',
        eventCategory: 'diagnostic',
        diagnosticId: diagnostic.id,
        attemptId: nextAttemptId,
        metadata: { mode, totalQuestions }
      });
      return;
    }

    fetch('/api/diagnostic/attempt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...getClientAnalyticsContext(),
        attemptId: nextAttemptId,
        diagnosticId: diagnostic.id,
        mode,
        totalQuestions,
        answersCount: 0
      })
    }).catch(() => undefined);
  };

  useEffect(() => {
    if (
      !diagnostic ||
      diagnostic.id === DIAGNOSTIC_FALLBACK_ID ||
      !showResults ||
      hasSubmittedRef.current
    ) {
      return;
    }
    const submitResults = async () => {
      hasSubmittedRef.current = true;
      try {
        const totalScore = calculateTotalScore();
        const maxScore = getDiagnosticMaxScore(diagnostic);
        const categoryScores = calculateCategoryScores();
        const alertLevel = getAlertLevelForScore(totalScore, maxScore);

        const response = await fetch('/api/diagnostic/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...getClientAnalyticsContext(),
            diagnosticId: diagnostic.id,
            attemptId,
            mode,
            totalScore,
            maxScore,
            level: alertLevel.level,
            durationMs: attemptStartedAt
              ? Date.now() - new Date(attemptStartedAt).getTime()
              : undefined,
            answers,
            categoryScores
          })
        });
        if (!response.ok) {
          throw new Error(`Diagnostic submission failed with status ${response.status}`);
        }

        const cached = readSavedProgress();
        if (cached?.attemptId === attemptId && cached.showResults) {
          const submittedProgress = {
            ...cached,
            submittedAt: new Date().toISOString()
          };
          writeSavedProgress(submittedProgress);
          setSavedProgress(submittedProgress);
        }
      } catch (error) {
        console.error('Failed to submit diagnostic', error);
      }
    };
    submitResults();
  }, [
    answers,
    attemptId,
    attemptStartedAt,
    calculateCategoryScores,
    calculateTotalScore,
    diagnostic,
    mode,
    showResults
  ]);

  useEffect(() => {
    if (
      !diagnostic ||
      diagnostic.id === DIAGNOSTIC_FALLBACK_ID ||
      !attemptId ||
      !isStarted ||
      showResults ||
      totalQuestions === 0
    ) {
      return;
    }

    const percentage = (answeredQuestions / totalQuestions) * 100;
    const milestone = [75, 50, 25].find(
      (value) => percentage >= value && !trackedMilestonesRef.current.has(value)
    );
    if (!milestone) return;
    trackedMilestonesRef.current.add(milestone);

    fetch('/api/diagnostic/attempt', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...getClientAnalyticsContext(),
        attemptId,
        diagnosticId: diagnostic.id,
        answersCount: answeredQuestions,
        milestone
      })
    }).catch(() => undefined);
  }, [answeredQuestions, attemptId, diagnostic, isStarted, showResults, totalQuestions]);

  if (isDiagnosticLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
        <div className="glass-card w-full max-w-md p-7 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Chargement</h1>
          <p className="text-slate-600">Préparation du diagnostic en cours.</p>
        </div>
      </div>
    );
  }

  const handleAnswer = (questionId: string, points: number) => {
    if (!currentCategory || !diagnostic) return;
    const nextAnswers = { ...answers, [questionId]: points };
    setAnswers(nextAnswers);

    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < currentCategory.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else if (currentCategoryIndex < categories.length - 1) {
        setCurrentCategoryIndex(prev => prev + 1);
        setCurrentQuestionIndex(0);
      } else {
        const completedAt = new Date().toISOString();
        const completedProgress: SavedProgress = {
          version: STORAGE_VERSION,
          mode,
          diagnosticId: diagnostic.id,
          diagnosticSnapshot: diagnostic,
          currentCategoryIndex,
          currentQuestionIndex,
          answers: nextAnswers,
          isStarted: true,
          showResults: true,
          attemptId: attemptId || undefined,
          startedAt: attemptStartedAt || undefined,
          completedAt,
          savedAt: completedAt
        };
        writeSavedProgress(completedProgress);
        setSavedProgress(completedProgress);
        setShowResults(true);
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
    setSelectedDiagnosticId(null);
    setDiagnostic(null);
    setMode(null);
    setCurrentCategoryIndex(0);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setIsStarted(false);
    setAttemptId(null);
    setAttemptStartedAt(null);
    trackedMilestonesRef.current = new Set();
    hasSubmittedRef.current = false;
  };

  const canGoBack = currentCategoryIndex > 0 || currentQuestionIndex > 0;

  // Resume Modal
  if (showResumeModal && savedProgress) {
    // Calculate total questions from saved diagnostic
    const savedDiag = savedProgress.diagnosticId === DIAGNOSTIC_FALLBACK_ID
      ? fallbackDiagnostic
      : diagnosticList.find(d => d.id === savedProgress.diagnosticId) ||
        savedProgress.diagnosticSnapshot;
    const savedTotalQuestions = savedDiag
      ? savedDiag.categories.reduce((acc, cat) => acc + cat.questions.length, 0)
      : Object.keys(savedProgress.answers).length;

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
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[#f15b24]/20 to-[#f15b24]/10 flex items-center justify-center mx-auto mb-4"
              >
                <Clock className="w-8 h-8 text-[#f15b24]" />
              </motion.div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                {savedProgress.showResults
                  ? 'Revoir votre résultat ?'
                  : 'Reprendre le diagnostic ?'}
              </h1>
              <p className="text-slate-600">
                {savedProgress.showResults
                  ? 'Votre dernier diagnostic est conservé sur cet appareil'
                  : 'Vous avez un diagnostic en cours'}
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
                    {Object.keys(savedProgress.answers).length} / {savedTotalQuestions} questions
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
                      style={{ width: `${(Object.keys(savedProgress.answers).length / savedTotalQuestions) * 100}%` }}
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
                {savedProgress.showResults ? 'Voir mon résultat' : 'Reprendre où j’en étais'}
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

  // Diagnostic Selection Screen - shown first
  if (!selectedDiagnosticId) {
    const availableDiagnostics = diagnosticList.length > 0 ? diagnosticList : [
      {
        id: DIAGNOSTIC_FALLBACK_ID,
        title: fallbackDiagnostic.title,
        description: fallbackDiagnostic.description || 'Évaluez votre relation et identifiez les signes de violence.',
        totalQuestions: fallbackDiagnostic.categories.reduce((acc, cat) => acc + cat.questions.length, 0),
        totalCategories: fallbackDiagnostic.categories.length,
        categories: fallbackDiagnostic.categories
      }
    ];

    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8">
        <motion.div
          className="max-w-5xl w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f15b24] to-[#d14d1a] flex items-center justify-center mx-auto mb-6"
            >
              <ClipboardCheck className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Choisissez votre <span className="gradient-text">diagnostic</span>
            </h1>
            <p className="text-slate-600 max-w-md mx-auto">
              Sélectionnez le diagnostic que vous souhaitez réaliser.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 justify-items-center">
            {availableDiagnostics.map((diag, index) => (
              <motion.button
                key={diag.id}
                className="glass-card p-6 w-full h-full text-left flex flex-col hover:border-[#f15b24]/50 transition-all group"
                onClick={() => setSelectedDiagnosticId(diag.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#f15b24]/20 to-[#f15b24]/10 flex items-center justify-center mb-4 group-hover:from-[#f15b24]/30 group-hover:to-[#f15b24]/20 transition-all">
                  <FileText className="w-7 h-7 text-[#f15b24]" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-[#f15b24] transition-colors">
                  {diag.title}
                </h3>
                {diag.description && (
                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                    {diag.description}
                  </p>
                )}
                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4" />
                    {diag.totalQuestions} questions
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    {diag.totalCategories} catégories
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="mt-10 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#f15b24] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-slate-700 text-sm">
                  <strong className="text-[#f15b24]">100% confidentiel</strong> - Aucune identité n’est demandée.
                  Seules des statistiques anonymes permettent d’améliorer le service.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Mode Selection Screen - after a diagnostic is selected
  if (!mode) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8">
        <motion.div
          className="max-w-2xl w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-12">
            {diagnostic?.title && (
              <div className="category-badge mb-4 inline-flex">
                <FileText className="w-4 h-4" />
                {diagnostic.title}
              </div>
            )}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f15b24] to-[#d14d1a] flex items-center justify-center mx-auto mb-6"
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
              className="glass-card p-8 text-left hover:border-[#f15b24]/50 transition-all group"
              onClick={() => setMode('self')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f15b24]/20 to-[#f15b24]/10 flex items-center justify-center mb-6 group-hover:from-[#f15b24]/30 group-hover:to-[#f15b24]/20 transition-all">
                <User className="w-8 h-8 text-[#f15b24]" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-[#f15b24] transition-colors">
                Pour moi-même
              </h3>
              <p className="text-slate-600 text-sm">
                J’évalue ma propre situation relationnelle de manière confidentielle.
              </p>
            </motion.button>

            <motion.button
              className="glass-card p-8 text-left hover:border-[#f15b24]/50 transition-all group"
              onClick={() => setMode('other')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-6 group-hover:bg-slate-200 transition-all">
                <Users className="w-8 h-8 text-slate-600 group-hover:text-[#f15b24] transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-[#f15b24] transition-colors">
                Pour quelqu’un d’autre
              </h3>
              <p className="text-slate-600 text-sm">
                J’aide un proche (ami, famille, collègue) à évaluer sa situation.
              </p>
            </motion.button>
          </div>

          <div className="mt-10 flex justify-center">
            <motion.button
              className="glass-button-outline flex items-center gap-2"
              onClick={() => {
                setSelectedDiagnosticId(null);
                setDiagnostic(null);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="w-5 h-5" />
              Changer de diagnostic
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Instructions Screen
  if (!isStarted && diagnostic) {
    const instructionsTotalQuestions = diagnostic.categories.reduce(
      (acc, cat) => acc + cat.questions.length,
      0
    );
    const instructionsTotalCategories = diagnostic.categories.length;
    const estimatedMinutes = Math.max(5, Math.ceil(instructionsTotalQuestions / 4));

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
                <div className="w-10 h-10 rounded-lg bg-[#f15b24]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#f15b24] font-bold">{instructionsTotalQuestions}</span>
                </div>
                <div>
                  <h4 className="text-slate-900 font-medium">{instructionsTotalQuestions} questions</h4>
                  <p className="text-slate-500 text-sm">Réparties en {instructionsTotalCategories} catégories thématiques</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
                <div className="w-10 h-10 rounded-lg bg-[#f15b24]/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-[#f15b24]" />
                </div>
                <div>
                  <h4 className="text-slate-900 font-medium">Environ {estimatedMinutes} minutes</h4>
                  <p className="text-slate-500 text-sm">Prenez le temps de bien réfléchir à chaque question</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
                <div className="w-10 h-10 rounded-lg bg-[#f15b24]/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-[#f15b24]" />
                </div>
                <div>
                  <h4 className="text-slate-900 font-medium">Totalement anonyme</h4>
                  <p className="text-slate-500 text-sm">Aucune identité n’est demandée</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <motion.button
                className="glass-button flex-1 flex items-center justify-center gap-2"
                onClick={handleBeginDiagnostic}
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

  // Error check - only when in questionnaire mode
  if (!currentCategory || !currentQuestion || !CurrentCategoryIcon) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
        <div className="glass-card w-full max-w-xl p-7 md:p-10 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            Diagnostic indisponible
          </h1>
          <p className="text-slate-600 mb-6">
            Le contenu du diagnostic a changé ou les données locales sont corrompues.
            Vous pouvez recommencer pour repartir sur une base saine.
          </p>
          <button className="glass-button" onClick={handleRestart}>
            Recommencer le diagnostic
          </button>
        </div>
      </div>
    );
  }

  // Results Screen
  if (showResults && diagnostic) {
    const totalScore = calculateTotalScore();
    const maxScore = getDiagnosticMaxScore(diagnostic);
    const alertLevel = getAlertLevelForScore(totalScore, maxScore);
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
                    <span className="text-2xl text-slate-400">/{maxScore}</span>
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
                    const percentage =
                      catScore && catScore.maxScore
                        ? (catScore.score / catScore.maxScore) * 100
                        : 0;
                    const levelColor = catScore?.level === 'safe' ? '#64748b' : catScore?.level === 'warning' ? '#f15b24' : '#ef4444';
                    const CategoryIcon = resolveCategoryIcon(category);

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
                            <div className="w-8 h-8 rounded-lg bg-[#f15b24]/10 flex items-center justify-center">
                              <CategoryIcon className="w-4 h-4 text-[#f15b24]" />
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

              <DiagnosticResultShare
                diagnosticId={diagnostic.id}
                attemptId={attemptId}
                diagnosticTitle={diagnostic.title}
                level={alertLevel.level}
                title={alertLevel.title}
                subtitle={alertLevel.subtitle}
                message={alertLevel.message}
                totalScore={totalScore}
                maxScore={maxScore}
                categories={categories.map((category) => {
                  const categoryScore = categoryScores.find(
                    (score) => score.categoryId === category.id
                  );
                  return {
                    name: category.name,
                    score: categoryScore?.score || 0,
                    maxScore: categoryScore?.maxScore || 0,
                    level: categoryScore?.level || 'safe'
                  };
                })}
              />

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
                        <h3 className="text-xl font-bold text-slate-900">Besoin d’aide urgente ?</h3>
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
                <h2 className="text-xl font-bold text-slate-900 mb-4">Ressources d’aide</h2>
                <p className="text-slate-600 mb-8">
                  Quelle que soit votre situation, des structures existent pour vous accompagner.
                  N’hésitez pas à les contacter.
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
                    Retour à l’accueil
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
                  ? 'bg-[#f15b24]'
                  : index === currentCategoryIndex
                    ? 'bg-[#f15b24]/50 ring-2 ring-[#f15b24] ring-offset-2 ring-offset-transparent'
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
