'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

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

export default function ResourcesManager({
  countries,
  resources
}: {
  countries: Country[];
  resources: Resource[];
}) {
  const [form, setForm] = useState({
    countryId: countries[0]?.id || '',
    countryCode: '',
    countryName: '',
    emergencyNumber: '',
    name: '',
    type: 'association',
    contact: '',
    description: '',
    address: '',
    website: ''
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, Resource[]>();
    for (const resource of resources) {
      if (!map.has(resource.countryId)) {
        map.set(resource.countryId, []);
      }
      map.get(resource.countryId)?.push(resource);
    }
    return map;
  }, [resources]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const payload = form.countryId
        ? { ...form, countryCode: undefined, countryName: undefined }
        : form;
      const response = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.message || 'Erreur lors de la création.');
      } else {
        setMessage('Ressource créée. Rafraîchissez la page pour la voir.');
        setForm((prev) => ({
          ...prev,
          name: '',
          contact: '',
          description: '',
          address: '',
          website: ''
        }));
      }
    } catch (err) {
      console.error(err);
      setMessage('Erreur réseau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="glass-card p-7">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Ajouter une ressource
        </h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pays existant
              </label>
              <select
                className="glass-input w-full"
                value={form.countryId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, countryId: event.target.value }))
                }
              >
                <option value="">Créer un nouveau pays</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            {!form.countryId && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nom du pays
                  </label>
                  <input
                    className="glass-input w-full"
                    value={form.countryName}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, countryName: event.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Code pays
                  </label>
                  <input
                    className="glass-input w-full"
                    value={form.countryCode}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, countryCode: event.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Numéro urgence
                  </label>
                  <input
                    className="glass-input w-full"
                    value={form.emergencyNumber}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        emergencyNumber: event.target.value
                      }))
                    }
                  />
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nom de la ressource
              </label>
              <input
                className="glass-input w-full"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type
              </label>
              <select
                className="glass-input w-full"
                value={form.type}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, type: event.target.value }))
                }
              >
                <option value="association">Association</option>
                <option value="institution">Institution</option>
                <option value="urgence">Urgence</option>
                <option value="ligne_ecoute">Ligne d&apos;écoute</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contact
              </label>
              <input
                className="glass-input w-full"
                value={form.contact}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, contact: event.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Site web
              </label>
              <input
                className="glass-input w-full"
                value={form.website}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, website: event.target.value }))
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              className="glass-input w-full min-h-[100px]"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Adresse
            </label>
            <input
              className="glass-input w-full"
              value={form.address}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, address: event.target.value }))
              }
            />
          </div>

          <button
            type="submit"
            className="glass-button flex items-center gap-2"
            disabled={isSubmitting}
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>

          {message && <p className="text-sm text-slate-500">{message}</p>}
        </form>
      </div>

      <div className="space-y-8">
        {countries.map((country) => (
          <div key={country.id} className="glass-card p-7">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {country.name}
                </h3>
                <p className="text-sm text-slate-500">
                  Code {country.code} · Urgence {country.emergencyNumber || '—'}
                </p>
              </div>
              <span className="text-xs text-slate-400">
                {grouped.get(country.id)?.length || 0} ressources
              </span>
            </div>
            <div className="space-y-3">
              {(grouped.get(country.id) || []).map((resource) => (
                <div
                  key={resource.id}
                  className="rounded-xl bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900">
                      {resource.name}
                    </span>
                    <span className="text-xs text-slate-400">{resource.type}</span>
                  </div>
                  <p className="text-sm text-slate-600">{resource.contact}</p>
                  {resource.description && (
                    <p className="text-xs text-slate-500 mt-1">
                      {resource.description}
                    </p>
                  )}
                </div>
              ))}
              {(grouped.get(country.id) || []).length === 0 && (
                <p className="text-sm text-slate-500">
                  Aucune ressource enregistrée pour ce pays.
                </p>
              )}
            </div>
          </div>
        ))}
        {countries.length === 0 && (
          <p className="text-sm text-slate-500">
            Aucun pays enregistré. Ajoutez la première ressource.
          </p>
        )}
      </div>
    </div>
  );
}
