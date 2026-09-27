'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Brain,
  CheckCircle,
  ClipboardCheck,
  Eye,
  Globe,
  HandHeart,
  Heart,
  Home,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Scale,
  Save,
  Shield,
  Smartphone,
  Target,
  Trash2,
  UserCheck,
  UserX,
  Users,
  type LucideIcon
} from 'lucide-react';

type OptionDraft = {
  text: string;
  points: number;
};

type QuestionDraft = {
  text: string;
  options: OptionDraft[];
};

type CategoryDraft = {
  name: string;
  description?: string;
  icon?: string;
  questions: QuestionDraft[];
};

export type DiagnosticDraft = {
  id?: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'archived';
  version: number;
  categories: CategoryDraft[];
};

const ICON_OPTIONS: Array<{ name: string; label: string; Icon: LucideIcon }> = [
  { name: 'Heart', label: 'Respect', Icon: Heart },
  { name: 'MessageCircle', label: 'Dialogue', Icon: MessageCircle },
  { name: 'Eye', label: 'Surveillance', Icon: Eye },
  { name: 'Shield', label: 'Protection', Icon: Shield },
  { name: 'AlertTriangle', label: 'Alerte', Icon: AlertTriangle },
  { name: 'Users', label: 'Entourage', Icon: Users },
  { name: 'Smartphone', label: 'Téléphone', Icon: Smartphone },
  { name: 'Lock', label: 'Contrôle', Icon: Lock },
  { name: 'UserX', label: 'Isolement', Icon: UserX },
  { name: 'UserCheck', label: 'Soutien', Icon: UserCheck },
  { name: 'HandHeart', label: 'Aide', Icon: HandHeart },
  { name: 'Brain', label: 'Psychologie', Icon: Brain },
  { name: 'Scale', label: 'Droits', Icon: Scale },
  { name: 'Target', label: 'Objectif', Icon: Target },
  { name: 'Bell', label: 'Signalement', Icon: Bell },
  { name: 'Phone', label: 'Urgence', Icon: Phone },
  { name: 'MapPin', label: 'Lieu', Icon: MapPin },
  { name: 'Home', label: 'Foyer', Icon: Home },
  { name: 'Globe', label: 'Réseau', Icon: Globe },
  { name: 'BookOpen', label: 'Éducation', Icon: BookOpen },
  { name: 'ClipboardCheck', label: 'Évaluation', Icon: ClipboardCheck }
];

const defaultOption = (): OptionDraft => ({
  text: '',
  points: 0
});

const defaultQuestion = (): QuestionDraft => ({
  text: '',
  options: [defaultOption(), { text: '', points: 1 }]
});

const defaultCategory = (): CategoryDraft => ({
  name: '',
  description: '',
  icon: ICON_OPTIONS[0].name,
  questions: [defaultQuestion()]
});

export default function DiagnosticBuilder({
  initial
}: {
  initial: DiagnosticDraft;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<DiagnosticDraft>(initial);
  const [draftId, setDraftId] = useState<string | undefined>(initial.id);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  const handleSave = useCallback(
    async (nextStatus?: DiagnosticDraft['status']) => {
      setIsSaving(true);
      setError(null);
      const payload = {
        ...draft,
        status: nextStatus ?? draft.status
      };

      try {
        const response = await fetch(
          draftId ? `/api/admin/diagnostics/${draftId}` : '/api/admin/diagnostics',
          {
            method: draftId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }
        );
        const data = await response.json();
        if (!response.ok) {
          setError(data?.message || 'Impossible de sauvegarder.');
        } else {
          if (!draftId && data.id) {
            setDraftId(data.id);
          }
          if (nextStatus) {
            setDraft((prev) => ({ ...prev, status: nextStatus }));
          }
          setSavedAt(new Date());
        }
      } catch (err) {
        console.error(err);
        setError('Impossible de sauvegarder.');
      } finally {
        setIsSaving(false);
      }
    },
    [draft, draftId]
  );

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    const timeout = setTimeout(() => {
      void handleSave();
    }, 900);

    return () => clearTimeout(timeout);
  }, [handleSave]);

  const handleDelete = useCallback(async () => {
    if (!draftId) return;
    const confirmed = window.confirm(
      'Supprimer définitivement ce diagnostic et ses réponses associées ?'
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/diagnostics/${draftId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.message || 'Impossible de supprimer le diagnostic.');
        return;
      }
      router.push('/admin/diagnostics');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Impossible de supprimer le diagnostic.');
    } finally {
      setIsDeleting(false);
    }
  }, [draftId, router]);

  const updateCategory = (index: number, patch: Partial<CategoryDraft>) => {
    setDraft((prev) => {
      const categories = [...prev.categories];
      categories[index] = { ...categories[index], ...patch };
      return { ...prev, categories };
    });
  };

  const updateQuestion = (
    categoryIndex: number,
    questionIndex: number,
    patch: Partial<QuestionDraft>
  ) => {
    setDraft((prev) => {
      const categories = [...prev.categories];
      const questions = [...categories[categoryIndex].questions];
      questions[questionIndex] = { ...questions[questionIndex], ...patch };
      categories[categoryIndex] = { ...categories[categoryIndex], questions };
      return { ...prev, categories };
    });
  };

  const updateOption = (
    categoryIndex: number,
    questionIndex: number,
    optionIndex: number,
    patch: Partial<OptionDraft>
  ) => {
    setDraft((prev) => {
      const categories = [...prev.categories];
      const questions = [...categories[categoryIndex].questions];
      const options = [...questions[questionIndex].options];
      options[optionIndex] = { ...options[optionIndex], ...patch };
      questions[questionIndex] = { ...questions[questionIndex], options };
      categories[categoryIndex] = { ...categories[categoryIndex], questions };
      return { ...prev, categories };
    });
  };

  const addCategory = () => {
    setDraft((prev) => ({
      ...prev,
      categories: [...prev.categories, defaultCategory()]
    }));
  };

  const removeCategory = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, idx) => idx !== index)
    }));
  };

  const addQuestion = (categoryIndex: number) => {
    setDraft((prev) => {
      const categories = [...prev.categories];
      const questions = [...categories[categoryIndex].questions, defaultQuestion()];
      categories[categoryIndex] = { ...categories[categoryIndex], questions };
      return { ...prev, categories };
    });
  };

  const removeQuestion = (categoryIndex: number, questionIndex: number) => {
    setDraft((prev) => {
      const categories = [...prev.categories];
      const questions = categories[categoryIndex].questions.filter(
        (_, idx) => idx !== questionIndex
      );
      categories[categoryIndex] = { ...categories[categoryIndex], questions };
      return { ...prev, categories };
    });
  };

  const addOption = (categoryIndex: number, questionIndex: number) => {
    setDraft((prev) => {
      const categories = [...prev.categories];
      const questions = [...categories[categoryIndex].questions];
      const options = [...questions[questionIndex].options, defaultOption()];
      questions[questionIndex] = { ...questions[questionIndex], options };
      categories[categoryIndex] = { ...categories[categoryIndex], questions };
      return { ...prev, categories };
    });
  };

  const removeOption = (
    categoryIndex: number,
    questionIndex: number,
    optionIndex: number
  ) => {
    setDraft((prev) => {
      const categories = [...prev.categories];
      const questions = [...categories[categoryIndex].questions];
      const options = questions[questionIndex].options.filter(
        (_, idx) => idx !== optionIndex
      );
      questions[questionIndex] = { ...questions[questionIndex], options };
      categories[categoryIndex] = { ...categories[categoryIndex], questions };
      return { ...prev, categories };
    });
  };

  const statusLabel = useMemo(() => {
    if (draft.status === 'active') return 'Actif';
    if (draft.status === 'archived') return 'Archivé';
    return 'Brouillon';
  }, [draft.status]);

  return (
    <div className="space-y-12">
      <div className="glass-card p-7">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {draft.title || 'Nouveau diagnostic'}
            </h2>
            <p className="text-sm text-slate-500">
              Statut : <span className="font-medium">{statusLabel}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {draftId && (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60"
                onClick={handleDelete}
                disabled={isSaving || isDeleting}
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            )}
            <button
              type="button"
              className="glass-button-outline flex items-center gap-2"
              onClick={() => handleSave()}
              disabled={isSaving || isDeleting}
            >
              <Save className="w-4 h-4" />
              Sauvegarder
            </button>
            <button
              type="button"
              className="glass-button flex items-center gap-2"
              onClick={() => handleSave('active')}
              disabled={isSaving || isDeleting}
            >
              <CheckCircle className="w-4 h-4" />
              Activer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Titre du diagnostic
            </label>
            <input
              className="glass-input w-full"
              value={draft.title}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="Nom du diagnostic"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Version
            </label>
            <input
              type="number"
              min={1}
              className="glass-input w-full"
              value={draft.version}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  version: Math.max(1, Number(event.target.value))
                }))
              }
            />
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Description
          </label>
          <textarea
            className="glass-input w-full min-h-[120px]"
            value={draft.description || ''}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, description: event.target.value }))
            }
            placeholder="Objectifs, public visé, etc."
          />
        </div>
        <div className="mt-4 text-xs text-slate-400">
          {isSaving
            ? 'Sauvegarde en cours...'
            : savedAt
              ? `Sauvegardé à ${savedAt.toLocaleTimeString('fr-FR')}`
              : 'Aucune sauvegarde pour le moment'}
        </div>
        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
      </div>

      <div className="space-y-10">
        {draft.categories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="glass-card p-8 md:p-9 space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nom de la catégorie
                  </label>
                  <input
                    className="glass-input w-full"
                    value={category.name}
                    onChange={(event) =>
                      updateCategory(categoryIndex, { name: event.target.value })
                    }
                    placeholder="Ex : Communication & Contrôle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <input
                    className="glass-input w-full"
                    value={category.description || ''}
                    onChange={(event) =>
                      updateCategory(categoryIndex, {
                        description: event.target.value
                      })
                    }
                    placeholder="Résumé de la catégorie"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Icône
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    {ICON_OPTIONS.map(({ name, label, Icon }) => {
                      const isSelected = category.icon === name;
                      return (
                        <button
                          key={name}
                          type="button"
                          title={label}
                          aria-pressed={isSelected}
                          onClick={() => updateCategory(categoryIndex, { icon: name })}
                          className={`flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-xl border px-3 py-3 text-center transition-all ${
                            isSelected
                              ? 'border-[#f15b24] bg-[#f15b24]/10 text-[#f15b24] shadow-sm'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-[#f15b24]/40 hover:text-[#f15b24]'
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                          <span className="text-[11px] font-medium leading-tight">
                            {label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="text-red-500 hover:text-red-600 flex items-center gap-2"
                onClick={() => removeCategory(categoryIndex)}
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>

            <div className="space-y-7">
              {category.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-7">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <label className="block text-sm font-medium text-slate-700">
                      Question {questionIndex + 1}
                    </label>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-600 flex items-center gap-2"
                      onClick={() => removeQuestion(categoryIndex, questionIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Retirer
                    </button>
                  </div>
                  <input
                    className="glass-input w-full mt-4"
                    value={question.text}
                    onChange={(event) =>
                      updateQuestion(categoryIndex, questionIndex, {
                        text: event.target.value
                      })
                    }
                    placeholder="Texte de la question"
                  />

                  <div className="mt-6 space-y-4">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="grid grid-cols-1 md:grid-cols-[1fr_130px_auto] gap-4 items-center rounded-xl border border-white bg-white/70 p-4"
                      >
                        <input
                          className="glass-input w-full"
                          value={option.text}
                          onChange={(event) =>
                            updateOption(categoryIndex, questionIndex, optionIndex, {
                              text: event.target.value
                            })
                          }
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                        <input
                          type="number"
                          className="glass-input w-full"
                          value={option.points}
                          onChange={(event) =>
                            updateOption(categoryIndex, questionIndex, optionIndex, {
                              points: Number(event.target.value)
                            })
                          }
                        />
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-600 flex items-center gap-2"
                          onClick={() =>
                            removeOption(categoryIndex, questionIndex, optionIndex)
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="text-sm text-[#f15b24] flex items-center gap-2"
                      onClick={() => addOption(categoryIndex, questionIndex)}
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter une option
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="text-sm text-[#f15b24] flex items-center gap-2"
                onClick={() => addQuestion(categoryIndex)}
              >
                <Plus className="w-4 h-4" />
                Ajouter une question
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="glass-button-outline flex items-center gap-2"
          onClick={addCategory}
        >
          <Plus className="w-4 h-4" />
          Ajouter une catégorie
        </button>
      </div>
    </div>
  );
}
