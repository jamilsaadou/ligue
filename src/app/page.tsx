'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Shield,
  Lock,
  Eye,
  Heart,
  CheckCircle,
  MessageCircle,
  ChevronRight,
  ClipboardCheck,
  FileText,
  type LucideIcon
} from 'lucide-react';

type DiagnosticSummary = {
  id: string;
  title: string;
  description?: string | null;
  totalQuestions: number;
  totalCategories: number;
};

// Représentation par défaut (avant le chargement de la liste réelle) afin
// d'éviter un écran vide et de rester correct même si l'API est indisponible.
const FALLBACK_DIAGNOSTICS: DiagnosticSummary[] = [
  {
    id: 'violentometre',
    title: 'Violentomètre',
    description: "Évaluez les signes de violence dans une relation amoureuse ou intime.",
    totalQuestions: 38,
    totalCategories: 6
  },
  {
    id: 'harcelometre',
    title: 'Harcélomètre',
    description: "Repérez les comportements de harcèlement, du signal ponctuel au danger.",
    totalQuestions: 13,
    totalCategories: 6
  },
  {
    id: 'incestometre',
    title: 'Incestomètre',
    description: "Repérez un climat incestuel et les situations qui appellent de l'aide.",
    totalQuestions: 24,
    totalCategories: 6
  }
];

const pickDiagnosticIcon = (title: string): LucideIcon => {
  const value = title.toLowerCase();
  if (value.includes('incest')) return Shield;
  if (value.includes('harc')) return MessageCircle;
  if (value.includes('violent')) return Heart;
  return ClipboardCheck;
};

export default function Home() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticSummary[]>(FALLBACK_DIAGNOSTICS);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/diagnostic/list')
      .then((response) => response.json())
      .then((data) => {
        if (isMounted && data?.ok && Array.isArray(data.diagnostics) && data.diagnostics.length > 0) {
          setDiagnostics(
            data.diagnostics.map((item: DiagnosticSummary) => ({
              id: item.id,
              title: item.title,
              description: item.description,
              totalQuestions: item.totalQuestions,
              totalCategories: item.totalCategories
            }))
          );
        }
      })
      .catch(() => {
        // On conserve la liste par défaut en cas d'erreur réseau.
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const features = [
    {
      icon: Lock,
      title: "100% Anonyme",
      description: "Aucune donnée personnelle requise. Votre confidentialité est notre priorité."
    },
    {
      icon: Eye,
      title: "Gratuit",
      description: "Un outil accessible à toutes, sans aucun frais."
    },
    {
      icon: Shield,
      title: "Sécurisé",
      description: "Mode discret disponible. Fermez rapidement en cas de besoin."
    },
    {
      icon: MessageCircle,
      title: "Orienté aide",
      description: "Ressources d'aide adaptées à votre situation au Niger."
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Choisissez votre diagnostic",
      description: "Violentomètre, Harcélomètre, Incestomètre…"
    },
    {
      step: 2,
      title: "Sélectionnez votre mode",
      description: "Pour vous-même ou pour aider un proche"
    },
    {
      step: 3,
      title: "Répondez aux questions",
      description: "Un questionnaire guidé, catégorie par catégorie"
    },
    {
      step: 4,
      title: "Obtenez votre résultat",
      description: "Diagnostic détaillé et orientation vers les ressources"
    }
  ];



  return (
    <div className="relative pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-1 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f15b24]/10 border border-[#f15b24]/30 mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="w-2 h-2 rounded-full bg-[#f15b24] animate-pulse" />
                <span className="text-[#f15b24] text-sm font-medium">Première plateforme au Niger</span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Diagnostiquer pour{' '}
                <span className="gradient-text">mieux protéger</span>
              </h1>

              <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto leading-relaxed">
                ALERTE VIOLENCE est la première plateforme numérique d&apos;autodiagnostic des violences
                au Niger. À travers plusieurs outils spécialisés, évaluez votre
                situation ou celle d&apos;un proche de manière anonyme et confidentielle.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/diagnostic" className="glass-button flex items-center justify-center gap-2 text-lg">
                    Commencer un diagnostic
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/a-propos" className="glass-button-outline flex items-center justify-center gap-2 text-lg">
                    En savoir plus
                  </Link>
                </motion.div>
              </div>

              {/* Trust Badges */}
              <div className="mt-12 flex items-center gap-6 flex-wrap justify-center">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <CheckCircle className="w-5 h-5 text-[#f15b24]" />
                  <span>Gratuit</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <CheckCircle className="w-5 h-5 text-[#f15b24]" />
                  <span>Anonyme</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <CheckCircle className="w-5 h-5 text-[#f15b24]" />
                  <span>Confidentiel</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="hidden lg:block absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-slate-300 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 rounded-full bg-[#f15b24]" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Une plateforme conçue pour <span className="gradient-text">vous protéger</span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Nos outils ont été pensés pour offrir un espace sûr, confidentiel et accessible
              à toutes les personnes qui en ont besoin.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 justify-items-center">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="glass-card p-5 w-full text-center flex flex-col items-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#f15b24]/20 to-[#f15b24]/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-[#f15b24]" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fff3ec] via-white to-white pointer-events-none" />
        <div className="absolute -top-10 right-10 w-44 h-44 rounded-full bg-[#f15b24]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-8 w-52 h-52 rounded-full bg-[#f15b24]/5 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="category-badge mx-auto mb-4">
              <CheckCircle className="w-4 h-4" />
              Processus en 4 étapes
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Comment ça <span className="gradient-text">fonctionne</span> ?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Un processus simple et guidé pour évaluer votre situation en toute sérénité.
            </p>
          </motion.div>

          <div className="relative">
            <div className="hidden lg:block absolute top-14 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#f15b24]/40 to-transparent" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full justify-items-center">
              {howItWorks.map((item, index) => (
                <motion.div
                  key={index}
                  className="relative w-full"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="glass-card p-6 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#f15b24] to-[#d14d1a]" />
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#f15b24] to-[#d14d1a] flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg ring-4 ring-white/70">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-600 text-sm">{item.description}</p>
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-14 -right-4 transform -translate-y-1/2 z-10">
                      <ChevronRight className="w-6 h-6 text-[#f15b24]" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Diagnostics disponibles */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="category-badge mx-auto mb-4">
              <ClipboardCheck className="w-4 h-4" />
              Nos outils
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Des diagnostics <span className="gradient-text">adaptés</span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Chaque outil couvre une forme de violence spécifique. Choisissez celui qui
              correspond à votre situation, puis répondez au questionnaire à votre rythme.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 justify-items-center">
            {diagnostics.map((diagnostic, index) => {
              const DiagnosticIcon = pickDiagnosticIcon(diagnostic.title);
              return (
                <motion.div
                  key={diagnostic.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="w-full"
                >
                  <Link
                    href="/diagnostic"
                    className="glass-card p-6 group w-full h-full flex flex-col items-center text-center"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#f15b24]/10 flex items-center justify-center mb-4">
                      <DiagnosticIcon className="w-6 h-6 text-[#f15b24]" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-[#f15b24] transition-colors">
                      {diagnostic.title}
                    </h3>
                    {diagnostic.description && (
                      <p className="text-slate-600 text-sm mb-3 line-clamp-3">{diagnostic.description}</p>
                    )}
                    <div className="mt-auto flex items-center justify-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        {diagnostic.totalQuestions} questions
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        {diagnostic.totalCategories} catégories
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-12 flex justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/diagnostic" className="glass-button flex items-center justify-center gap-2">
                Voir tous les diagnostics
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Importance de la plateforme */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <motion.div
            className="glass-card p-6 md:p-12 w-full"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="text-center">
                <div className="category-badge mb-4 mx-auto lg:mx-0">
                  <Shield className="w-4 h-4" />
                  Pourquoi c&apos;est important
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                  Nommer les violences pour <span className="gradient-text">mieux s&apos;en protéger</span>
                </h2>
                <p className="text-slate-600 leading-relaxed mb-8">
                  Trop souvent, les violences restent invisibles, banalisées ou tues par peur et par
                  tabou. Beaucoup de personnes n&apos;ont ni un espace sûr pour en parler, ni les
                  repères pour identifier ce qu&apos;elles vivent. ALERTE VIOLENCE offre un premier pas,
                  anonyme et gratuit : reconnaître les signaux, mettre des mots sur une situation et
                  s&apos;orienter vers les bonnes ressources — avant qu&apos;il ne soit trop tard.
                </p>

                <div className="space-y-4">
                  {[
                    {
                      icon: MessageCircle,
                      title: 'Briser le silence',
                      description: "Un espace confidentiel pour nommer ce qui est trop souvent tu."
                    },
                    {
                      icon: Eye,
                      title: 'Reconnaître les signaux',
                      description: "Des outils clairs pour identifier les différentes formes de violence."
                    },
                    {
                      icon: Heart,
                      title: 'Agir à temps',
                      description: "Une orientation vers une aide adaptée, locale et bienveillante."
                    }
                  ].map((point, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 text-left"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="w-11 h-11 rounded-lg bg-[#f15b24]/10 flex items-center justify-center flex-shrink-0">
                        <point.icon className="w-5 h-5 text-[#f15b24]" />
                      </div>
                      <div>
                        <h3 className="text-slate-900 font-semibold mb-1">{point.title}</h3>
                        <p className="text-slate-600 text-sm">{point.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 flex justify-center">
                  <Link href="/a-propos" className="inline-flex items-center gap-2 text-[#f15b24] hover:text-[#f4855c] transition-colors">
                    En savoir plus sur notre mission
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="relative flex justify-center">
                <div className="w-full max-w-md aspect-square rounded-2xl bg-gradient-to-br from-[#f15b24]/15 to-slate-200 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Shield className="w-32 h-32 text-[#f15b24]" />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex justify-center">
          <motion.div
            className="glass-card p-6 md:p-10 text-center relative overflow-hidden w-full max-w-3xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#f15b24]/10 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f15b24] to-[#d14d1a] flex items-center justify-center mb-6"
              >
                <Shield className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Prêt(e) à faire le <span className="gradient-text">diagnostic</span> ?
              </h2>
              <p className="text-slate-600 max-w-xl mx-auto mb-8">
                Quelques minutes suffisent pour évaluer votre situation. C&apos;est gratuit,
                anonyme et totalement confidentiel.
              </p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/diagnostic" className="glass-button flex items-center justify-center gap-2 text-lg">
                    Commencer maintenant
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
