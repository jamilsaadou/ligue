"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Globe2,
  Headphones,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Phone,
  MapPin,
  ExternalLink,
  Save,
  Loader2,
} from "lucide-react";
import AdminDialog from "./AdminDialog";

type Country = {
  id: string;
  name: string;
  code: string;
  emergencyNumber: string | null;
};
type Resource = {
  id: string;
  name: string;
  type: string;
  contact: string;
  description: string | null;
  address: string | null;
  website: string | null;
  countryId: string;
};
const types: Record<string, string> = {
  association: "Association",
  institution: "Institution",
  urgence: "Urgence",
  ligne_ecoute: "Ligne d’écoute",
};
const emptyForm = {
  countryId: "",
  countryCode: "",
  countryName: "",
  emergencyNumber: "",
  name: "",
  type: "association",
  contact: "",
  description: "",
  address: "",
  website: "",
};
const action =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold disabled:opacity-50";
function websiteHref(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export default function ResourcesManager({
  countries,
  resources,
}: {
  countries: Country[];
  resources: Resource[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [form, setForm] = useState(emptyForm);
  const [editor, setEditor] = useState<"new" | Resource | null>(null);
  const [details, setDetails] = useState<Resource | null>(null);
  const [deleting, setDeleting] = useState<Resource | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const countryMap = new Map(countries.map((country) => [country.id, country]));
  const visible = resources.filter(
    (resource) =>
      (countryFilter === "all" || countryFilter === resource.countryId) &&
      (typeFilter === "all" || resource.type === typeFilter) &&
      `${resource.name} ${resource.contact} ${resource.description || ""} ${countryMap.get(resource.countryId)?.name || ""}`
        .toLocaleLowerCase("fr")
        .includes(search.trim().toLocaleLowerCase("fr")),
  );
  const summaries = [
    { label: "Ressources", value: resources.length, icon: BookOpen },
    {
      label: "Pays couverts",
      value: new Set(resources.map((r) => r.countryId)).size,
      icon: Globe2,
    },
    {
      label: "Services d’urgence",
      value: resources.filter((r) => r.type === "urgence").length,
      icon: Phone,
    },
    {
      label: "Lignes d’écoute",
      value: resources.filter((r) => r.type === "ligne_ecoute").length,
      icon: Headphones,
    },
  ];
  function openEditor(resource?: Resource) {
    setError("");
    setNotice("");
    setForm(
      resource
        ? {
            ...emptyForm,
            ...resource,
            description: resource.description || "",
            address: resource.address || "",
            website: resource.website || "",
          }
        : {
            ...emptyForm,
            countryId:
              countryFilter !== "all" ? countryFilter : countries[0]?.id || "",
          },
    );
    setEditor(resource || "new");
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy || !editor) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        editor === "new"
          ? "/api/admin/resources"
          : `/api/admin/resources/${editor.id}`,
        {
          method: editor === "new" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            form.countryId
              ? { ...form, countryCode: undefined, countryName: undefined }
              : form,
          ),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Enregistrement impossible.");
      setEditor(null);
      setNotice(
        editor === "new" ? "Ressource ajoutée." : "Ressource mise à jour.",
      );
      setSearch("");
      setCountryFilter("all");
      setTypeFilter("all");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur réseau. Réessayez.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!deleting || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/resources/${deleting.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Suppression impossible. Réessayez.");
      setDeleting(null);
      setNotice("Ressource supprimée.");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur réseau. Réessayez.",
      );
    } finally {
      setBusy(false);
    }
  }
  const field = (
    key: keyof typeof emptyForm,
    label: string,
    required = false,
    inputType = "text",
  ) => (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        type={inputType}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        required={required}
        className="glass-input w-full"
      />
    </label>
  );
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Ressources
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Réseau d’accompagnement
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Organisez les contacts et les services disponibles par pays.
          </p>
        </div>
        <button
          onClick={() => openEditor()}
          className="glass-button inline-flex shrink-0 items-center justify-center gap-2"
        >
          <Plus size={18} aria-hidden="true" />
          Ajouter une ressource
        </button>
      </header>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {summaries.map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass-card p-4 sm:p-5">
            <Icon
              size={20}
              className="mb-3 text-[#f15b24]"
              aria-hidden="true"
            />
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>
      {notice && (
        <p
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {notice}
        </p>
      )}
      <div className="glass-card grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_200px_200px]">
        <label className="block sm:col-span-2 xl:col-span-1">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Rechercher une ressource
          </span>
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-3 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom, contact ou pays…"
              className="glass-input w-full !py-2.5 !pl-10 text-sm"
            />
          </div>
        </label>
        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Pays
          </span>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="glass-input w-full !py-2.5 text-sm"
          >
            <option value="all">Tous les pays</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Type de ressource
          </span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="glass-input w-full !py-2.5 text-sm"
          >
            <option value="all">Tous les types</option>
            {Object.entries(types).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
        <p role="status">
          {visible.length} ressource{visible.length > 1 ? "s" : ""} affichée
          {visible.length > 1 ? "s" : ""} sur {resources.length}
        </p>
        {(search || countryFilter !== "all" || typeFilter !== "all") && (
          <button
            onClick={() => {
              setSearch("");
              setCountryFilter("all");
              setTypeFilter("all");
            }}
            className="min-h-11 font-semibold text-orange-700"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>
      <div className="grid items-start gap-4 xl:grid-cols-2">
        {visible.map((resource) => (
          <article key={resource.id} className="glass-card overflow-hidden">
            <div className="p-5">
              <div className="flex flex-wrap gap-2 text-xs">
                <span
                  className={`rounded-full px-2.5 py-1 font-semibold ${resource.type === "urgence" ? "bg-red-50 text-red-700" : "bg-orange-50 text-orange-800"}`}
                >
                  {types[resource.type] || resource.type}
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <Globe2 size={14} aria-hidden="true" />
                  {countryMap.get(resource.countryId)?.name ||
                    "Pays non renseigné"}
                </span>
              </div>
              <h2 className="mt-3 break-words text-lg font-semibold text-slate-900">
                {resource.name}
              </h2>
              <p className="mt-2 flex items-start gap-2 break-all text-sm font-medium text-slate-700">
                <Phone
                  size={16}
                  className="mt-0.5 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                {resource.contact}
              </p>
              <p className="mt-3 line-clamp-2 break-words text-sm text-slate-500">
                {resource.description || "Aucune description renseignée."}
              </p>
            </div>
            <footer className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50/60 p-4 sm:flex sm:flex-wrap">
              <button
                onClick={() => setDetails(resource)}
                className={`${action} border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
              >
                <Eye size={16} aria-hidden="true" />
                Détails
              </button>
              <button
                onClick={() => openEditor(resource)}
                className={`${action} border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100`}
              >
                <Pencil size={16} aria-hidden="true" />
                Modifier
              </button>
              <button
                onClick={() => {
                  setDeleting(resource);
                  setError("");
                }}
                className={`${action} border-red-200 bg-white text-red-700 hover:bg-red-50`}
              >
                <Trash2 size={16} aria-hidden="true" />
                Supprimer
              </button>
            </footer>
          </article>
        ))}
      </div>
      {!visible.length && (
        <div className="glass-card p-8 text-center">
          <BookOpen
            size={32}
            className="mx-auto mb-3 text-slate-400"
            aria-hidden="true"
          />
          <h2 className="font-semibold text-slate-900">
            {resources.length
              ? "Aucune ressource ne correspond"
              : "Ajoutez votre première ressource"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {resources.length
              ? "Modifiez votre recherche ou vos filtres."
              : "Renseignez un pays et les coordonnées d’un service d’accompagnement."}
          </p>
        </div>
      )}
      {editor && (
        <AdminDialog
          title={
            editor === "new" ? "Ajouter une ressource" : "Modifier la ressource"
          }
          subtitle="Les champs marqués d’un astérisque sont obligatoires."
          onClose={() => setEditor(null)}
          busy={busy}
          size="max-w-2xl"
        >
          <form onSubmit={save}>
            <div className="space-y-5 p-5 sm:p-6">
              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}
              <fieldset className="space-y-4">
                <legend className="mb-3 font-semibold text-slate-900">
                  Pays d’intervention
                </legend>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Pays *
                  </span>
                  <select
                    value={form.countryId}
                    onChange={(e) =>
                      setForm({ ...form, countryId: e.target.value })
                    }
                    className="glass-input w-full"
                  >
                    {editor === "new" && (
                      <option value="">Créer un nouveau pays</option>
                    )}
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </label>
                {!form.countryId && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {field("countryName", "Nom du pays", true)}
                    {field("countryCode", "Code pays (ex. NE)", true)}
                    {field("emergencyNumber", "Numéro d’urgence national")}
                  </div>
                )}
              </fieldset>
              <fieldset className="space-y-4 border-t border-slate-100 pt-5">
                <legend className="font-semibold text-slate-900">
                  Coordonnées du service
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  {field("name", "Nom de la ressource", true)}
                  <label>
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Type *
                    </span>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value })
                      }
                      className="glass-input w-full"
                    >
                      {Object.entries(types).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {field("contact", "Contact", true)}
                  {field("website", "Site web (https://…)", false, "url")}
                </div>
                {field("address", "Adresse")}
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Description
                  </span>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="glass-input min-h-28 w-full"
                  />
                </label>
              </fieldset>
            </div>
            <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50 p-5">
              <button
                type="button"
                onClick={() => setEditor(null)}
                disabled={busy}
                className={`${action} border-slate-200 bg-white text-slate-700`}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={busy}
                className={`${action} border-orange-600 bg-orange-600 text-white`}
              >
                {busy ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {busy ? "Enregistrement…" : "Enregistrer"}
              </button>
            </footer>
          </form>
        </AdminDialog>
      )}
      {details && (
        <AdminDialog
          title={details.name}
          subtitle={types[details.type]}
          onClose={() => setDetails(null)}
        >
          <dl className="space-y-5 p-5 text-sm sm:p-6">
            {[
              {
                label: "Pays",
                value: countryMap.get(details.countryId)?.name,
                icon: Globe2,
              },
              { label: "Contact", value: details.contact, icon: Phone },
              { label: "Adresse", value: details.address, icon: MapPin },
              {
                label: "Description",
                value: details.description,
                icon: BookOpen,
              },
              {
                label: "Numéro d’urgence national",
                value: countryMap.get(details.countryId)?.emergencyNumber,
                icon: Phone,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label}>
                <dt className="flex items-center gap-2 font-semibold text-slate-700">
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </dt>
                <dd className="mt-2 whitespace-pre-line break-words text-slate-500">
                  {value || "Non renseigné"}
                </dd>
              </div>
            ))}
            <div>
              <dt className="font-semibold text-slate-700">Site web</dt>
              <dd className="mt-2 break-all text-slate-500">
                {websiteHref(details.website) ? (
                  <a
                    href={websiteHref(details.website)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-orange-700 underline"
                  >
                    {details.website}
                    <ExternalLink
                      size={16}
                      className="shrink-0"
                      aria-label="Nouvel onglet"
                    />
                  </a>
                ) : (
                  details.website || "Non renseigné"
                )}
              </dd>
            </div>
          </dl>
          <footer className="flex justify-end border-t border-slate-100 bg-slate-50 p-5">
            <button
              onClick={() => {
                openEditor(details);
                setDetails(null);
              }}
              className={`${action} border-orange-200 bg-orange-50 text-orange-800`}
            >
              <Pencil size={16} />
              Modifier
            </button>
          </footer>
        </AdminDialog>
      )}
      {deleting && (
        <AdminDialog
          title="Supprimer cette ressource ?"
          onClose={() => setDeleting(null)}
          busy={busy}
        >
          <div className="space-y-3 p-5">
            <p className="break-words text-sm text-slate-600">
              « {deleting.name} » sera retirée du réseau d’accompagnement. Le
              pays associé sera conservé.
            </p>
            <p className="text-sm font-medium text-red-700">
              Cette action est irréversible.
            </p>
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
          </div>
          <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50 p-5">
            <button
              onClick={() => setDeleting(null)}
              disabled={busy}
              className={`${action} border-slate-200 bg-white`}
            >
              Annuler
            </button>
            <button
              onClick={remove}
              disabled={busy}
              className={`${action} border-red-600 bg-red-600 text-white`}
            >
              <Trash2 size={16} />
              {busy ? "Suppression…" : "Supprimer définitivement"}
            </button>
          </footer>
        </AdminDialog>
      )}
    </div>
  );
}
