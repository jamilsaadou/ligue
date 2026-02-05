'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowRight, 
  Shield, 
  Lock, 
  Eye, 
  Users, 
  Heart, 
  CheckCircle,
  Globe,
  Smartphone,
  MessageCircle,
  ChevronRight
} from 'lucide-react';
import { categories } from '@/data/questions';

export default function Home() {
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
      description: "Ressources d'aide adaptées à votre situation et votre pays."
    }
  ];

  const stats = [
    { number: "38", label: "Questions", description: "pour un diagnostic complet" },
    { number: "6", label: "Catégories", description: "de violences analysées" },
    { number: "8", label: "Pays", description: "couverts en Afrique de l'Ouest" },
    { number: "100%", label: "Confidentiel", description: "et anonyme" }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Choisissez votre mode",
      description: "Pour vous-même ou pour aider un proche"
    },
    {
      step: 2,
      title: "Répondez aux questions",
      description: "38 questions réparties en 6 catégories"
    },
    {
      step: 3,
      title: "Obtenez votre diagnostic",
      description: "Résultat détaillé et personnalisé"
    },
    {
      step: 4,
      title: "Accédez aux ressources",
      description: "Orientations vers les structures d'aide"
    }
  ];

  return (
    <div className="relative pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              className="text-center lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#eb5f2a]/10 border border-[#eb5f2a]/30 mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="w-2 h-2 rounded-full bg-[#eb5f2a] animate-pulse" />
                <span className="text-[#eb5f2a] text-sm font-medium">Première plateforme en Afrique de l'Ouest</span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Diagnostiquer pour{' '}
                <span className="gradient-text">mieux protéger</span>
              </h1>

              <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                ALERTE VIOLENCE est la première plateforme numérique d'autodiagnostic des violences 
                en Afrique de l'Ouest. Évaluez votre situation ou celle d'un proche de manière 
                anonyme et confidentielle.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/diagnostic" className="glass-button flex items-center justify-center gap-2 text-lg">
                    Commencer le diagnostic
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
              <div className="mt-12 flex items-center gap-6 flex-wrap justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <CheckCircle className="w-5 h-5 text-[#eb5f2a]" />
                  <span>Gratuit</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <CheckCircle className="w-5 h-5 text-[#eb5f2a]" />
                  <span>Anonyme</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <CheckCircle className="w-5 h-5 text-[#eb5f2a]" />
                  <span>Confidentiel</span>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Illustration */}
            <motion.div
              className="relative hidden lg:block"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative">
                {/* Main Card */}
                <motion.div 
                  className="glass-card p-8 relative z-10"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#eb5f2a] to-[#d14d1a] flex items-center justify-center">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Violentomètre</h3>
                      <p className="text-slate-500">Outil d'autodiagnostic</p>
                    </div>
                  </div>

                  {/* Mini Category Preview */}
                  <div className="space-y-3">
                    {categories.slice(0, 3).map((category, index) => {
                      const CategoryIcon = category.icon;
                      return (
                        <motion.div 
                          key={category.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#eb5f2a]/10 flex items-center justify-center">
                            <CategoryIcon className="w-4 h-4 text-[#eb5f2a]" />
                          </div>
                          <span className="text-slate-700 text-sm">{category.name}</span>
                        </motion.div>
                      );
                    })}
                    <div className="text-center text-slate-500 text-sm">
                      + 3 autres catégories
                    </div>
                  </div>
                </motion.div>

                {/* Floating Elements */}
                <motion.div 
                  className="absolute -top-6 -right-6 w-24 h-24 rounded-2xl bg-gradient-to-br from-[#eb5f2a] to-[#d14d1a] flex items-center justify-center shadow-xl"
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Shield className="w-12 h-12 text-white" />
                </motion.div>

                <motion.div 
                  className="absolute -bottom-4 -left-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shadow-xl"
                  animate={{ rotate: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <Lock className="w-10 h-10 text-slate-700" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-slate-300 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 rounded-full bg-[#eb5f2a]" />
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
              Un outil conçu pour <span className="gradient-text">vous protéger</span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Notre plateforme a été pensée pour offrir un espace sûr, confidentiel et accessible
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
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#eb5f2a]/20 to-[#eb5f2a]/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-[#eb5f2a]" />
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
        <div className="absolute -top-10 right-10 w-44 h-44 rounded-full bg-[#eb5f2a]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-8 w-52 h-52 rounded-full bg-[#eb5f2a]/5 blur-3xl pointer-events-none" />

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
            <div className="hidden lg:block absolute top-14 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#eb5f2a]/40 to-transparent" />
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
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#eb5f2a] to-[#d14d1a]" />
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#eb5f2a] to-[#d14d1a] flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg ring-4 ring-white/70">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-600 text-sm">{item.description}</p>
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-14 -right-4 transform -translate-y-1/2 z-10">
                      <ChevronRight className="w-6 h-6 text-[#eb5f2a]" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              6 catégories <span className="gradient-text">analysées</span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Notre questionnaire couvre l'ensemble des formes de violence pour un diagnostic complet.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 justify-items-center">
            {categories.map((category, index) => {
              const CategoryIcon = category.icon;
              return (
                <motion.div
                  key={category.id}
                  className="glass-card p-5 group cursor-pointer w-full text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#eb5f2a]/10 flex items-center justify-center">
                      <CategoryIcon className="w-6 h-6 text-[#eb5f2a]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-[#eb5f2a] transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-slate-600 text-sm mb-3">{category.description}</p>
                      <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                        <span>{category.questions.length} questions</span>
                        <span>•</span>
                        <span>Max {category.maxPoints} pts</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About LNDF Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex justify-center">
          <motion.div
            className="glass-card p-6 md:p-10 w-full max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-2 gap-12 items-center text-center">
              <div className="text-center">
                <div className="category-badge mb-4">
                  <Users className="w-4 h-4" />
                  Organisation porteuse
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                  Ligue Nigérienne des <span className="gradient-text">Droits des Femmes</span>
                </h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  La LNDF est une pionnière : la première organisation du Niger à se déclarer 
                  officiellement féministe jusque dans ses textes statutaires. Créée en décembre 2022, 
                  elle œuvre pour une société plus équitable et offre un soutien indispensable aux 
                  femmes qui en ont besoin.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6 justify-items-center">
                  <div className="p-4 rounded-xl bg-slate-50">
                    <div className="text-2xl font-bold text-[#eb5f2a]">81</div>
                    <div className="text-slate-500 text-sm">Bénévoles actifs</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50">
                    <div className="text-2xl font-bold text-[#eb5f2a]">2022</div>
                    <div className="text-slate-500 text-sm">Année de création</div>
                  </div>
                </div>
                <Link href="/a-propos" className="inline-flex items-center gap-2 text-[#eb5f2a] hover:text-[#f4855c] transition-colors">
                  En savoir plus sur la LNDF
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="relative flex justify-center">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#eb5f2a]/15 to-slate-200 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Heart className="w-32 h-32 text-[#eb5f2a]" />
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
            <div className="absolute inset-0 bg-gradient-to-br from-[#eb5f2a]/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-[#eb5f2a] to-[#d14d1a] flex items-center justify-center mb-6"
              >
                <Shield className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Prêt(e) à faire le <span className="gradient-text">diagnostic</span> ?
              </h2>
              <p className="text-slate-600 max-w-xl mx-auto mb-8">
                Quelques minutes suffisent pour évaluer votre situation. C'est gratuit, 
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
