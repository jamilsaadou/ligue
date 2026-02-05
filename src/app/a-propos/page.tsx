'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  Users,
  Calendar,
  Award,
  Target,
  Globe,
  ArrowRight,
  CheckCircle,
  Mail,
  MapPin,
  Sparkles
} from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: "Féminisme",
      description: "Première organisation du Niger officiellement féministe dans ses statuts"
    },
    {
      icon: Users,
      title: "Solidarité",
      description: "Un réseau de 81 bénévoles engagés pour les droits des femmes"
    },
    {
      icon: Target,
      title: "Action",
      description: "Des actions concrètes pour accompagner les survivantes de violences"
    },
    {
      icon: Globe,
      title: "Impact",
      description: "Une vision régionale pour toucher toute l'Afrique de l'Ouest"
    }
  ];

  const milestones = [
    {
      date: "Décembre 2022",
      title: "Création de la LNDF",
      description: "Fondée par une vingtaine de militantes déterminées"
    },
    {
      date: "Mai 2023",
      title: "Reconnaissance officielle",
      description: "Obtention de la reconnaissance légale au Niger"
    },
    {
      date: "2023",
      title: "Élection du bureau",
      description: "Six membres élues pour un mandat de trois ans"
    },
    {
      date: "2024",
      title: "Lancement ALERTE VIOLENCE",
      description: "Première plateforme numérique d'autodiagnostic en Afrique de l'Ouest"
    }
  ];

  const objectives = [
    "Promouvoir les droits des femmes au Niger et en Afrique de l'Ouest",
    "Offrir un soutien aux survivantes des violences",
    "Permettre aux victimes de s'exprimer et d'être crues",
    "Assurer une prise en charge bienveillante et confidentielle",
    "Sensibiliser sur les différentes formes de violences",
    "Plaider pour des politiques publiques protégeant les femmes"
  ];

  const partners = [
    { src: '/partenaires/Ligue.png', alt: 'Ligue Nigérienne des Droits des Femmes' },
    { src: '/partenaires/Unicef.png', alt: 'UNICEF' },
    { src: '/partenaires/onu femme.png', alt: 'ONU Femmes' },
    { src: '/partenaires/equipop.png', alt: 'Equipop' },
    { src: '/partenaires/feministe.png', alt: 'Fonds Féministe' },
    { src: '/partenaires/win.png', alt: 'WIN' },
    { src: '/partenaires/armoirie.png', alt: 'République du Niger' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#eb5f2a]/5 via-white to-slate-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#eb5f2a]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#eb5f2a]/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-[#eb5f2a]/20 shadow-sm mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-[#eb5f2a]" />
              <span className="text-[#eb5f2a] text-sm font-medium">À propos de nous</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
              Ligue Nigérienne des{' '}
              <span className="gradient-text">Droits des Femmes</span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Première organisation du Niger à se déclarer officiellement féministe.
              Nous militons pour que les survivantes des violences puissent s'exprimer,
              être crues et bénéficier d'une prise en charge bienveillante.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#eb5f2a]/10 text-[#eb5f2a] text-sm font-medium mb-6">
                <Heart className="w-4 h-4" />
                Notre mission
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                Promouvoir les droits des femmes au Niger
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                La Ligue Nigérienne des Droits des Femmes joue un rôle crucial dans la promotion
                des droits des femmes au Niger, en œuvrant pour une société plus équitable et en
                offrant un soutien indispensable aux femmes qui en ont besoin.
              </p>
              <p className="text-slate-600 leading-relaxed mb-8">
                Nous croyons fermement que chaque femme a le droit de vivre libre de toute violence,
                et nous nous engageons à créer les conditions pour que cela devienne une réalité.
              </p>

              <div className="space-y-4">
                {objectives.map((objective, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#eb5f2a]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-[#eb5f2a]" />
                    </div>
                    <span className="text-slate-700 leading-relaxed">{objective}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#eb5f2a]/20 to-[#eb5f2a]/5 rounded-3xl transform rotate-3" />
                <div className="relative bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { number: "2022", label: "Année de création" },
                      { number: "81", label: "Bénévoles actifs" },
                      { number: "6", label: "Membres du bureau" },
                      { number: "3 ans", label: "Mandat électoral" }
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        className="text-center p-4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="text-3xl md:text-4xl font-bold text-[#eb5f2a] mb-1">{stat.number}</div>
                        <div className="text-slate-500 text-sm">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#eb5f2a]/10 text-[#eb5f2a] text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Nos valeurs
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Les principes qui nous guident
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Ces valeurs fondamentales orientent chacune de nos actions au quotidien
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-[#eb5f2a]/20 transition-all duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#eb5f2a] to-[#d54d1a] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#eb5f2a]/10 text-[#eb5f2a] text-sm font-medium mb-4">
              <Calendar className="w-4 h-4" />
              Notre parcours
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Les étapes clés de notre histoire
            </h2>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-[#eb5f2a] via-[#eb5f2a]/50 to-slate-200 hidden md:block" />

            <div className="space-y-8 md:space-y-0">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  className={`flex flex-col md:flex-row items-center gap-8 md:gap-0 ${
                    index % 2 === 0 ? '' : 'md:flex-row-reverse'
                  }`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                >
                  <div className={`flex-1 md:px-8 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow inline-block">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eb5f2a]/10 text-[#eb5f2a] text-sm font-medium mb-3">
                        <Calendar className="w-3.5 h-3.5" />
                        {milestone.date}
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">{milestone.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>

                  <div className="relative z-10 hidden md:flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-[#eb5f2a] border-4 border-white shadow-md" />
                  </div>

                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ALERTE VIOLENCE Project Section */}
      <section className="bg-gradient-to-br from-[#eb5f2a]/5 via-white to-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-2 gap-0">
              <div className="p-8 md:p-12">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#eb5f2a]/10 text-[#eb5f2a] text-sm font-medium mb-6">
                  <Award className="w-4 h-4" />
                  Projet phare
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                  ALERTE <span className="gradient-text">VIOLENCE</span>
                </h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Notre plateforme numérique d'autodiagnostic est une innovation majeure :
                  aucun outil similaire n'existe dans la sous-région. ALERTE VIOLENCE comble
                  un vide crucial et répond à un besoin massif de plus de 200 millions de personnes
                  en Afrique de l'Ouest.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Première plateforme d'autodiagnostic en Afrique de l'Ouest",
                    "Couverture de 8 pays francophones",
                    "Objectif : 100 000+ utilisateurs en 3 ans",
                    "Orientation vers 10 000+ structures d'aide"
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-3 text-slate-700 leading-relaxed"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CheckCircle className="w-5 h-5 text-[#eb5f2a] flex-shrink-0 mt-0.5" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
                <Link
                  href="/diagnostic"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#eb5f2a] text-white font-medium rounded-xl hover:bg-[#d54d1a] transition-colors shadow-lg shadow-[#eb5f2a]/25"
                >
                  Faire le diagnostic
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="bg-gradient-to-br from-[#eb5f2a]/10 to-slate-100 p-8 md:p-12 flex items-center">
                <div className="grid grid-cols-2 gap-6 w-full">
                  {[
                    { number: "38", label: "Questions" },
                    { number: "6", label: "Catégories" },
                    { number: "8", label: "Pays couverts" },
                    { number: "100%", label: "Gratuit" }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      className="bg-white/80 backdrop-blur rounded-2xl p-6 text-center shadow-sm"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="text-3xl md:text-4xl font-bold text-[#eb5f2a] mb-1">{stat.number}</div>
                      <div className="text-slate-600 text-sm">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#eb5f2a]/10 text-[#eb5f2a] text-sm font-medium mb-4">
              <Users className="w-4 h-4" />
              Nos partenaires
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Ils nous soutiennent
            </h2>
            <div className="max-w-2xl mx-auto">
              <p className="text-lg text-slate-700 leading-relaxed font-medium bg-gradient-to-r from-[#eb5f2a]/10 to-[#eb5f2a]/5 px-8 py-5 rounded-2xl border border-[#eb5f2a]/15">
                Cette initiative est portée par la <span className="text-[#eb5f2a] font-semibold">Ligue</span> avec le soutien de plusieurs partenaires engagés
              </p>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {partners.map((partner, index) => (
              <motion.div
                key={index}
                className="bg-slate-50 hover:bg-white rounded-2xl p-6 flex items-center justify-center border border-slate-100 hover:border-[#eb5f2a]/20 hover:shadow-lg transition-all duration-300 aspect-[4/3]"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Image
                  src={partner.src}
                  alt={partner.alt}
                  width={140}
                  height={100}
                  className="object-contain h-16 md:h-20 w-auto opacity-80 hover:opacity-100 transition-opacity"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#eb5f2a]/10 text-[#eb5f2a] text-sm font-medium mb-6">
              <Mail className="w-4 h-4" />
              Contact
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Nous contacter
            </h2>
            <p className="text-slate-600 mb-10 leading-relaxed max-w-xl mx-auto">
              Pour toute question, partenariat ou soutien, n'hésitez pas à nous contacter.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:lndf.niger@gmail.com"
                className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-[#eb5f2a] text-white font-medium hover:bg-[#d54d1a] transition-colors shadow-lg shadow-[#eb5f2a]/25"
              >
                <Mail className="w-5 h-5" />
                lndf.niger@gmail.com
              </a>

              <div className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-slate-100 text-slate-700">
                <MapPin className="w-5 h-5 text-[#eb5f2a]" />
                Niamey, Niger
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
