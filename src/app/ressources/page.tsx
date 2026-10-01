"use client";

import { useEffect, useState } from "react";
import BarometerGallery from "@/components/BarometerGallery";
import SupportContacts from "@/components/SupportContacts";
import {
  ArrowDown,
  Building2,
  Check,
  ExternalLink,
  Globe2,
  Headphones,
  HeartHandshake,
  LifeBuoy,
  Mail,
  MapPin,
  Phone,
  Search,
  Users,
  X,
} from "lucide-react";

interface Resource {
  id: string;
  name: string;
  type: string;
  contact: string;
  description: string | null;
  address: string | null;
  website: string | null;
}
interface Country {
  id: string;
  name: string;
  code: string;
  emergencyNumber: string | null;
  resources: Resource[];
}
const resourceTypes = [
  { key: "all", label: "Tous les services", icon: LifeBuoy },
  { key: "association", label: "Associations", icon: Users },
  { key: "institution", label: "Institutions", icon: Building2 },
  { key: "ligne_ecoute", label: "Lignes d’écoute", icon: Headphones },
  { key: "urgence", label: "Urgences", icon: Phone },
];
const typeLabels: Record<string, string> = {
  association: "Association",
  institution: "Institution",
  ligne_ecoute: "Ligne d’écoute",
  urgence: "Urgence",
};
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .trim();
function contactLink(contact: string) {
  const value = contact.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `mailto:${value}`;
  if (/^\+?[\d\s().-]+$/.test(value) && /\d/.test(value))
    return `tel:${value.replace(/[^\d+]/g, "")}`;
  return null;
}
function websiteLink(website: string | null) {
  try {
    const url = new URL(website || "");
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export default function ResourcesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/resources", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Resources unavailable");
        const data = await response.json();
        if (!data.ok || !Array.isArray(data.countries))
          throw new Error("Invalid resources");
        if (controller.signal.aborted) return;
        setCountries(data.countries.filter((country: Country) => country.code === "NE"));
        setError(false);
        setLoading(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError(true);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [retry]);
  const selected = countries.find((country) => country.code === "NE");
  const resources = selected?.resources || [];
  const visible = resources.filter(
    (resource) =>
      (type === "all" || type === resource.type) &&
      normalize(
        `${resource.name} ${resource.description || ""} ${resource.address || ""} ${resource.contact}`,
      ).includes(normalize(search)),
  );
  const totalResources = countries.reduce(
    (sum, country) => sum + country.resources.length,
    0,
  );
  return (
    <div className="min-h-screen bg-[#faf9f6] pb-16">
      <section className="relative overflow-hidden border-b border-orange-100 bg-[#fff7ee]">
        <div
          className="pointer-events-none absolute -right-32 -top-40 h-[500px] w-[500px] rounded-full border-[70px] border-orange-100/60"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-16 lg:px-8 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-2 text-xs font-semibold text-orange-800">
              <HeartHandshake size={16} aria-hidden="true" />
              Un premier pas vers du soutien
            </span>
            <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Vous n’avez pas à<br className="hidden sm:block" /> faire face{" "}
              <span className="text-[#d94c18]">seul·e.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Trouvez une association, un service d’écoute ou une structure
              d’accompagnement au Niger.
            </p>
            <a
              href="#trouver-une-ressource"
              className="glass-button mt-7 inline-flex items-center justify-center gap-2"
            >
              Trouver un contact
              <ArrowDown size={18} aria-hidden="true" />
            </a>
            <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <Check size={15} aria-hidden="true" />
              Annuaire accessible sans créer de compte
            </p>
          </div>
          <aside
            className="relative rounded-[2rem] border border-white bg-white/90 p-6 shadow-[0_20px_70px_-35px_rgba(154,70,27,0.4)] sm:p-8"
            aria-labelledby="support-title"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                <HeartHandshake size={25} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-orange-700">
                  À votre rythme
                </p>
                <h2
                  id="support-title"
                  className="mt-1 text-xl font-bold text-slate-900"
                >
                  Un soutien adapté
                </h2>
              </div>
            </div>
            <div className="space-y-5">
              {[
                {
                  icon: Headphones,
                  title: "Être écouté·e",
                  text: "Repérez les lignes d’écoute et les contacts disponibles.",
                },
                {
                  icon: Users,
                  title: "Être accompagné·e",
                  text: "Découvrez les associations et leurs services.",
                },
                {
                  icon: Building2,
                  title: "Trouver un interlocuteur",
                  text: "Identifiez les structures à contacter au Niger.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-3">
                  <Icon
                    size={20}
                    className="mt-1 shrink-0 text-orange-600"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
      <section
        id="trouver-une-ressource"
        className="mx-auto max-w-7xl scroll-mt-28 px-4 pt-10 sm:px-6 lg:px-8"
        aria-labelledby="directory-title"
      >
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
              L’annuaire d’accompagnement
            </p>
            <h2
              id="directory-title"
              className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl"
            >
              Le bon contact, près de vous
            </h2>
          </div>
          {!loading && !error && (
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Globe2 size={17} aria-hidden="true" />
              {totalResources} ressource{totalResources > 1 ? "s" : ""} ·{" "}
              Niger
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 md:grid-cols-1">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Rechercher un contact
              </span>
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-4 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Nom, service, ville…"
                  className="glass-input min-h-12 w-full !pl-11"
                />
              </div>
            </label>
          </div>
          <div
            role="group"
            aria-label="Type de service"
            className="mt-5 flex flex-wrap gap-2"
          >
            {resourceTypes.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setType(key)}
                aria-pressed={type === key}
                className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${type === key ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50"}`}
              >
                <Icon size={15} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div role="status" className="py-12 text-center text-slate-500">
            Chargement des contacts…
          </div>
        ) : error ? (
          <div
            role="alert"
            className="my-6 rounded-2xl border border-orange-200 bg-white p-8 text-center"
          >
            <h3 className="font-semibold text-slate-900">
              L’annuaire est momentanément indisponible
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Les contacts n’ont pas pu être chargés.
            </p>
            <button
              onClick={() => {
                setLoading(true);
                setError(false);
                setRetry((value) => value + 1);
              }}
              className="mt-4 min-h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5 mt-8 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">
                {selected?.name || "Contacts disponibles"}{" "}
                <span
                  role="status"
                  className="ml-2 text-sm font-normal text-slate-500"
                >
                  {visible.length} résultat{visible.length > 1 ? "s" : ""}
                </span>
              </h3>
              {(search || type !== "all") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setType("all");
                  }}
                  className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-orange-700"
                >
                  <X size={16} aria-hidden="true" />
                  Effacer les filtres
                </button>
              )}
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((resource) => {
                const Icon =
                  resourceTypes.find((item) => item.key === resource.type)
                    ?.icon || HeartHandshake;
                const contactHref = contactLink(resource.contact);
                const websiteHref = websiteLink(resource.website);
                return (
                  <article
                    key={resource.id}
                    className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
                  >
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${resource.type === "urgence" ? "bg-red-50 text-red-700" : "bg-orange-50 text-orange-700"}`}
                      >
                        <Icon size={21} aria-hidden="true" />
                      </div>
                      <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                        {typeLabels[resource.type] || resource.type}
                      </span>
                    </div>
                    <h4 className="break-words text-lg font-bold leading-snug text-slate-900">
                      {resource.name}
                    </h4>
                    <p className="mt-3 break-words text-sm leading-relaxed text-slate-500">
                      {resource.description ||
                        "Contactez cette structure pour connaître les services proposés."}
                    </p>
                    {resource.address && (
                      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
                        <MapPin
                          size={15}
                          className="mt-0.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="break-words">{resource.address}</span>
                      </p>
                    )}
                    <div className="mt-auto pt-6">
                      <div className="border-t border-slate-100 pt-4">
                        <p className="mb-3 break-all text-sm font-medium text-slate-700">
                          {resource.contact}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {contactHref && (
                            <a
                              href={contactHref}
                              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-800 hover:bg-orange-100"
                              aria-label={`${contactHref.startsWith("mailto:") ? "Écrire à" : "Appeler"} ${resource.name}`}
                            >
                              {contactHref.startsWith("mailto:") ? (
                                <Mail size={16} aria-hidden="true" />
                              ) : (
                                <Phone size={16} aria-hidden="true" />
                              )}
                              {contactHref.startsWith("mailto:")
                                ? "Écrire un e-mail"
                                : "Appeler"}
                            </a>
                          )}
                          {websiteHref && (
                            <a
                              href={websiteHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
                              aria-label={`Site web de ${resource.name} (nouvel onglet)`}
                            >
                              Site web
                              <ExternalLink size={15} aria-hidden="true" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            {!visible.length && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 px-6 text-center">
                <Search
                  size={30}
                  className="mx-auto text-slate-400"
                  aria-hidden="true"
                />
                <h3 className="mt-4 font-semibold text-slate-900">
                  {resources.length
                    ? "Aucun contact ne correspond"
                    : "Aucun contact disponible pour le moment"}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  {resources.length
                    ? "Essayez un autre mot-clé ou un autre type de service."
                    : "Les contacts de la clinique et les secours figurent ci-dessus."}
                </p>
              </div>
            )}
          </>
        )}
      </section>
      <BarometerGallery />
      <section className="page-container pb-12"><SupportContacts /></section>
    </div>
  );
}
