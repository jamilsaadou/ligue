'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Building, 
  Heart,
  Shield,
  AlertTriangle,
  Users,
  ArrowRight,
  Search,
  ChevronDown,
  Flag
} from 'lucide-react';

interface Resource {
  name: string;
  type: 'Association' | 'Institution' | 'Urgence' | 'Ligne d\'écoute';
  contact: string;
  description?: string;
  address?: string;
  website?: string;
}

interface Country {
  name: string;
  code: string;
  emergencyNumber: string;
  resources: Resource[];
}

export default function ResourcesPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>('Niger');
  const [searchQuery, setSearchQuery] = useState('');

  const countries: Country[] = [
    {
      name: "Niger",
      code: "NE",
      emergencyNumber: "17",
      resources: [
        {
          name: "Ligue Nigérienne des Droits des Femmes (LNDF)",
          type: "Association",
          contact: "lndf.niger@gmail.com",
          description: "Première organisation féministe du Niger, accompagnement des victimes de violences",
          address: "Niamey, Niger"
        },
        {
          name: "Ministère de la Promotion de la Femme et de la Protection de l'Enfant",
          type: "Institution",
          contact: "+227 20 72 29 83",
          description: "Institution gouvernementale pour la protection des femmes"
        },
        {
          name: "Police Secours",
          type: "Urgence",
          contact: "17",
          description: "Numéro d'urgence pour toute situation de danger immédiat"
        },
        {
          name: "UNFPA Niger",
          type: "Institution",
          contact: "+227 20 72 28 36",
          description: "Programme des Nations Unies pour la population et les droits reproductifs",
          website: "https://niger.unfpa.org"
        },
        {
          name: "ONG Dimol",
          type: "Association",
          contact: "+227 20 73 40 53",
          description: "Association de lutte contre les violences faites aux femmes"
        }
      ]
    },
    {
      name: "Mali",
      code: "ML",
      emergencyNumber: "17",
      resources: [
        {
          name: "AJM - Association des Juristes Maliennes",
          type: "Association",
          contact: "+223 20 22 49 95",
          description: "Aide juridique gratuite pour les femmes victimes de violences"
        },
        {
          name: "Police Secours",
          type: "Urgence",
          contact: "17",
          description: "Numéro d'urgence national"
        },
        {
          name: "APDF - Association pour le Progrès et la Défense des Droits des Femmes",
          type: "Association",
          contact: "+223 20 21 13 46",
          description: "Accompagnement juridique et psychologique des victimes"
        },
        {
          name: "CAFO - Coordination des Associations et ONG Féminines du Mali",
          type: "Association",
          contact: "+223 20 21 96 95",
          description: "Réseau d'organisations féminines pour les droits des femmes"
        }
      ]
    },
    {
      name: "Burkina Faso",
      code: "BF",
      emergencyNumber: "17",
      resources: [
        {
          name: "Association Voix de Femmes (AVF)",
          type: "Association",
          contact: "+226 25 31 32 95",
          description: "Écoute et accompagnement des femmes victimes de violences"
        },
        {
          name: "Police Secours",
          type: "Urgence",
          contact: "17",
          description: "Numéro d'urgence national"
        },
        {
          name: "Ministère de la Femme, de la Solidarité Nationale et de la Famille",
          type: "Institution",
          contact: "+226 25 30 68 75",
          description: "Institution gouvernementale pour les droits des femmes"
        },
        {
          name: "CIMDL - Centre d'Information sur les Droits de la Femme",
          type: "Association",
          contact: "+226 25 36 73 38",
          description: "Information et sensibilisation sur les droits des femmes"
        }
      ]
    },
    {
      name: "Sénégal",
      code: "SN",
      emergencyNumber: "17",
      resources: [
        {
          name: "AJS - Association des Juristes Sénégalaises",
          type: "Association",
          contact: "+221 33 824 42 09",
          description: "Aide juridique et accompagnement des victimes de violences"
        },
        {
          name: "Police Secours",
          type: "Urgence",
          contact: "17",
          description: "Numéro d'urgence national"
        },
        {
          name: "Maison Rose",
          type: "Association",
          contact: "+221 33 849 35 45",
          description: "Centre d'accueil et d'hébergement pour femmes victimes de violences"
        },
        {
          name: "CLVF - Comité de Lutte contre les Violences faites aux Femmes",
          type: "Association",
          contact: "+221 33 825 81 17",
          description: "Coordination nationale de lutte contre les VBG"
        },
        {
          name: "Ligne verte VBG",
          type: "Ligne d'écoute",
          contact: "800 00 50 50",
          description: "Ligne d'écoute gratuite pour les victimes de violences"
        }
      ]
    },
    {
      name: "Côte d'Ivoire",
      code: "CI",
      emergencyNumber: "110",
      resources: [
        {
          name: "AFJCI - Association des Femmes Juristes de Côte d'Ivoire",
          type: "Association",
          contact: "+225 22 44 63 18",
          description: "Aide juridique gratuite pour les femmes victimes de violences"
        },
        {
          name: "Police Secours",
          type: "Urgence",
          contact: "110",
          description: "Numéro d'urgence national"
        },
        {
          name: "Plateforme de lutte contre les VBG",
          type: "Institution",
          contact: "+225 27 22 50 32 00",
          description: "Plateforme gouvernementale de coordination anti-VBG"
        },
        {
          name: "ONG LIDER",
          type: "Association",
          contact: "+225 22 47 07 12",
          description: "Accompagnement psychologique et social des victimes"
        }
      ]
    },
    {
      name: "Bénin",
      code: "BJ",
      emergencyNumber: "117",
      resources: [
        {
          name: "Police Secours",
          type: "Urgence",
          contact: "117",
          description: "Numéro d'urgence national"
        },
        {
          name: "WILDAF Bénin",
          type: "Association",
          contact: "+229 21 30 01 63",
          description: "Réseau Femmes, Droit et Développement en Afrique"
        },
        {
          name: "Ministère des Affaires Sociales",
          type: "Institution",
          contact: "+229 21 31 36 25",
          description: "Service social pour l'accompagnement des victimes"
        }
      ]
    },
    {
      name: "Togo",
      code: "TG",
      emergencyNumber: "117",
      resources: [
        {
          name: "Police Secours",
          type: "Urgence",
          contact: "117",
          description: "Numéro d'urgence national"
        },
        {
          name: "GF2D - Groupe de réflexion et d'action Femme, Démocratie et Développement",
          type: "Association",
          contact: "+228 22 21 47 43",
          description: "Accompagnement juridique des femmes"
        },
        {
          name: "WILDAF Togo",
          type: "Association",
          contact: "+228 22 22 74 80",
          description: "Réseau pour les droits des femmes"
        }
      ]
    },
    {
      name: "Guinée",
      code: "GN",
      emergencyNumber: "122",
      resources: [
        {
          name: "Police Secours",
          type: "Urgence",
          contact: "122",
          description: "Numéro d'urgence national"
        },
        {
          name: "AGUIAS - Association Guinéenne pour l'Assistance Sociale",
          type: "Association",
          contact: "+224 622 35 11 22",
          description: "Accompagnement social des victimes de violences"
        },
        {
          name: "OPROGEM - Office de Protection du Genre",
          type: "Institution",
          contact: "+224 628 68 68 68",
          description: "Institution gouvernementale pour la protection des femmes"
        }
      ]
    }
  ];

  const selectedCountryData = countries.find(c => c.name === selectedCountry);

  const filteredResources = selectedCountryData?.resources.filter(resource =>
    resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Association':
        return Users;
      case 'Institution':
        return Building;
      case 'Urgence':
        return AlertTriangle;
      case "Ligne d'écoute":
        return Phone;
      default:
        return Heart;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Association':
        return 'text-[#eb5f2a] bg-[#eb5f2a]/10';
      case 'Institution':
        return 'text-slate-600 bg-slate-100';
      case 'Urgence':
        return 'text-red-600 bg-red-100';
      case "Ligne d'écoute":
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#eb5f2a]/10 border border-[#eb5f2a]/30 mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Shield className="w-4 h-4 text-[#eb5f2a]" />
              <span className="text-[#eb5f2a] text-sm font-medium">Structures d'aide</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Ressources <span className="gradient-text">d'aide</span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed">
              Trouvez les structures d'aide disponibles dans votre pays. Ces organisations 
              peuvent vous accompagner en toute confidentialité.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Emergency Banner */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="p-6 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h4 className="text-slate-900 font-semibold">En danger immédiat ?</h4>
                  <p className="text-slate-600 text-sm">Appelez immédiatement les secours de votre pays</p>
                </div>
              </div>
              {selectedCountryData && (
                <a
                  href={`tel:${selectedCountryData.emergencyNumber}`}
                  className="px-6 py-3 rounded-xl bg-red-500 text-white font-semibold flex items-center gap-2 hover:bg-red-600 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Appeler le {selectedCountryData.emergencyNumber}
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Country Selection & Search */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Country Selector */}
            <div className="relative flex-1 max-w-xs">
              <label className="block text-slate-500 text-sm mb-2">Sélectionnez votre pays</label>
              <div className="relative">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="glass-input w-full appearance-none cursor-pointer pr-10"
                >
                  {countries.map((country) => (
                    <option key={country.name} value={country.name} className="bg-white text-slate-900">
                      {country.code} — {country.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Search */}
            <div className="flex-1">
              <label className="block text-slate-500 text-sm mb-2">Rechercher une ressource</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-input w-full pl-12"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Country Tabs */}
      <section className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {countries.map((country) => {
              const isSelected = selectedCountry === country.name;
              return (
                <button
                  key={country.name}
                  onClick={() => setSelectedCountry(country.name)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-[#eb5f2a] border-[#eb5f2a] text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-slate-50'}`}>
                    <Flag className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#eb5f2a]'}`} />
                  </div>
                  <div className="text-left">
                    <div className={`text-[10px] uppercase tracking-widest ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                      {country.code}
                    </div>
                    <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                      {country.name}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {selectedCountryData && (
            <>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#eb5f2a]/10 border border-[#eb5f2a]/30 flex items-center justify-center">
                  <Flag className="w-6 h-6 text-[#eb5f2a]" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-slate-500">{selectedCountryData.code}</div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedCountryData.name}</h2>
                  <p className="text-slate-500 text-sm">
                    {filteredResources?.length} ressource{filteredResources && filteredResources.length > 1 ? 's' : ''} disponible{filteredResources && filteredResources.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredResources?.map((resource, index) => {
                  const TypeIcon = getTypeIcon(resource.type);
                  const typeColor = getTypeColor(resource.type);
                  
                  return (
                    <motion.div
                      key={index}
                      className="glass-card p-6"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-2 rounded-lg ${typeColor.split(' ')[1]}`}>
                          <TypeIcon className={`w-5 h-5 ${typeColor.split(' ')[0]}`} />
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${typeColor}`}>
                          {resource.type}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{resource.name}</h3>
                      
                      {resource.description && (
                        <p className="text-slate-600 text-sm mb-4">{resource.description}</p>
                      )}

                      <div className="space-y-2 pt-4 border-t border-slate-200">
                        <a
                          href={resource.type === 'Urgence' || resource.type === "Ligne d'écoute" 
                            ? `tel:${resource.contact}` 
                            : resource.contact.includes('@') 
                              ? `mailto:${resource.contact}` 
                              : `tel:${resource.contact}`
                          }
                          className="flex items-center gap-2 text-[#eb5f2a] hover:text-[#f4855c] transition-colors"
                        >
                          {resource.contact.includes('@') ? (
                            <Mail className="w-4 h-4" />
                          ) : (
                            <Phone className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">{resource.contact}</span>
                        </a>

                        {resource.address && (
                          <div className="flex items-center gap-2 text-slate-500">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{resource.address}</span>
                          </div>
                        )}

                        {resource.website && (
                          <a
                            href={resource.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
                          >
                            <Globe className="w-4 h-4" />
                            <span className="text-sm">Site web</span>
                          </a>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {filteredResources?.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-600">Aucune ressource trouvée pour votre recherche.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Information Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div 
              className="glass-card p-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-[#eb5f2a]" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Confidentialité garantie</h3>
              <p className="text-slate-600 leading-relaxed">
                Toutes les structures listées s'engagent à respecter votre confidentialité. 
                Vous pouvez les contacter en toute sécurité. Votre démarche restera confidentielle.
              </p>
            </motion.div>

            <motion.div 
              className="glass-card p-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-14 h-14 rounded-xl bg-[#eb5f2a]/10 flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 text-[#eb5f2a]" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Accompagnement bienveillant</h3>
              <p className="text-slate-600 leading-relaxed">
                Ces organisations sont formées pour vous accueillir avec bienveillance, 
                sans jugement. Elles sont là pour vous écouter et vous accompagner 
                dans vos démarches.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="glass-card p-8 md:p-12 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Vous n'avez pas encore fait le <span className="gradient-text">diagnostic</span> ?
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto mb-8">
              Notre outil d'autodiagnostic peut vous aider à évaluer votre situation 
              et à identifier les ressources adaptées à vos besoins.
            </p>
            <Link href="/diagnostic" className="glass-button inline-flex items-center gap-2">
              Faire le diagnostic
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
