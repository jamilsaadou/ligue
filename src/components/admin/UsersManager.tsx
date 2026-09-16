"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Modal from "./AdminDialog";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  ClipboardCheck,
  Eye,
  FilePenLine,
  LoaderCircle,
  Mail,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/auth";
import { ADMIN_MODULES, type AdminModuleKey } from "@/lib/admin-modules";

export type AdminUserListItem = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  adminModules: AdminModuleKey[];
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  submissionsCount: number;
};

type UserDetails = AdminUserListItem & {
  _count: {
    submissions: number;
    attempts: number;
    tracking: number;
    diagnostics: number;
  };
};

type Props = {
  users: AdminUserListItem[];
  currentUserId: string;
  currentRole: UserRole;
  page: number;
  totalPages: number;
  totalResults: number;
  query: string;
  roleFilter: string;
  statusFilter: string;
  summary: { total: number; active: number; inactive: number; admins: number };
};

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super administrateur",
  admin: "Administrateur",
  user: "Utilisateur",
};

const formatDate = (value: string | null, withTime = false) => {
  if (!value) return "Jamais";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value));
};

const initials = (user: Pick<AdminUserListItem, "name" | "email">) => {
  const source = user.name?.trim() || user.email;
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const roleTone = (role: UserRole) => {
  if (role === "super_admin")
    return "bg-violet-50 text-violet-700 border-violet-200";
  if (role === "admin") return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
};

export default function UsersManager({
  users,
  currentUserId,
  currentRole,
  page,
  totalPages,
  totalResults,
  query,
  roleFilter,
  statusFilter,
  summary,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(query);
  const [viewUser, setViewUser] = useState<AdminUserListItem | null>(null);
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [editUser, setEditUser] = useState<AdminUserListItem | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "user" as UserRole,
    isActive: true,
    adminModules: [] as AdminModuleKey[],
  });
  const [confirmUser, setConfirmUser] = useState<AdminUserListItem | null>(
    null,
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    adminModules: [] as AdminModuleKey[],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const summaryItems = useMemo(
    () => [
      {
        label: "Tous les comptes",
        value: summary.total,
        icon: Users,
        tone: "bg-slate-900 text-white",
      },
      {
        label: "Comptes actifs",
        value: summary.active,
        icon: UserCheck,
        tone: "bg-emerald-600 text-white",
      },
      {
        label: "Comptes désactivés",
        value: summary.inactive,
        icon: UserX,
        tone: "bg-rose-600 text-white",
      },
      {
        label: "Administrateurs",
        value: summary.admins,
        icon: ShieldCheck,
        tone: "bg-blue-600 text-white",
      },
    ],
    [summary],
  );

  const navigate = (next: {
    page?: number;
    q?: string;
    role?: string;
    status?: string;
  }) => {
    const params = new URLSearchParams();
    const nextQuery = next.q ?? query;
    const nextRole = next.role ?? roleFilter;
    const nextStatus = next.status ?? statusFilter;
    params.set("page", String(next.page ?? 1));
    if (nextQuery) params.set("q", nextQuery);
    if (nextRole !== "all") params.set("role", nextRole);
    if (nextStatus !== "all") params.set("status", nextStatus);
    router.push(`/admin/utilisateurs?${params.toString()}`);
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    navigate({ q: search.trim(), page: 1 });
  };

  const openDetails = async (user: AdminUserListItem) => {
    setViewUser(user);
    setDetails(null);
    setError("");
    setDetailsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`);
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.message || "Impossible de charger le compte.");
      setDetails({
        ...payload.user,
        lastLoginAt: payload.user.lastLoginAt || null,
        createdAt: payload.user.createdAt,
        updatedAt: payload.user.updatedAt,
        submissionsCount: payload.user._count.submissions,
      });
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Impossible de charger le compte.",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const openEdit = (user: AdminUserListItem) => {
    setEditUser(user);
    setForm({
      name: user.name || "",
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      adminModules: user.adminModules,
    });
    setError("");
  };

  const createAdmin = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.message || "La création a échoué.");
      setCreateOpen(false);
      setCreateForm({ name: "", email: "", password: "", adminModules: [] });
      setNotice("Le compte administrateur a été créé.");
      router.refresh();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "La création a échoué.",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleModule = (
    modules: AdminModuleKey[],
    module: AdminModuleKey,
    update: (modules: AdminModuleKey[]) => void,
  ) =>
    update(
      modules.includes(module)
        ? modules.filter((item) => item !== module)
        : [...modules, module],
    );

  const updateUser = async (userId: string, body: Record<string, unknown>) => {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    if (!response.ok)
      throw new Error(payload.message || "La modification a échoué.");
    return payload;
  };

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editUser) return;
    setSaving(true);
    setError("");
    try {
      const payload =
        currentRole === "super_admin"
          ? form
          : { name: form.name, email: form.email, isActive: form.isActive };
      await updateUser(editUser.id, payload);
      setEditUser(null);
      setNotice("Les informations de l’utilisateur ont été enregistrées.");
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "La modification a échoué.",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async () => {
    if (!confirmUser) return;
    setSaving(true);
    setError("");
    try {
      await updateUser(confirmUser.id, { isActive: !confirmUser.isActive });
      const becameActive = !confirmUser.isActive;
      setConfirmUser(null);
      setNotice(
        becameActive
          ? "Le compte a été réactivé."
          : "Le compte a été désactivé.",
      );
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "La modification a échoué.",
      );
    } finally {
      setSaving(false);
    }
  };

  const visiblePages = Array.from(
    new Set([1, page - 1, page, page + 1, totalPages]),
  ).filter((value) => value >= 1 && value <= totalPages);

  return (
    <div className="space-y-7 pb-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Comptes et accès
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Utilisateurs</h1>
          <p className="mt-2 text-sm text-slate-600">
            Comptes, accès et activité des utilisateurs.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-slate-500">
            {totalResults} résultat{totalResults > 1 ? "s" : ""}
          </span>
          {currentRole === "super_admin" && (
            <button
              onClick={() => {
                setCreateOpen(true);
                setError("");
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#eb5f2a] px-4 text-sm font-semibold text-white transition hover:bg-[#d94c18]"
            >
              <Plus className="h-4 w-4" /> Nouvel administrateur
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {summaryItems.map((item) => (
          <div key={item.label} className="glass-card p-4 sm:p-5">
            <item.icon
              className="mb-3 h-5 w-5 text-[#eb5f2a]"
              aria-hidden="true"
            />
            <p className="text-2xl font-bold text-slate-900">{item.value}</p>
            <p className="mt-1 text-sm text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <div className="glass-card p-4">
          <form
            onSubmit={submitSearch}
            className="grid items-end gap-3 sm:grid-cols-2 2xl:grid-cols-[minmax(260px,1fr)_220px_200px_auto]"
          >
            <label className="relative block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Rechercher un utilisateur
              </span>
              <Search className="absolute left-3.5 bottom-3.5 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                type="search"
                placeholder="Nom ou adresse email"
                className="glass-input w-full !py-2.5 !pl-10 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Rôle
              </span>
              <select
                value={roleFilter}
                onChange={(event) =>
                  navigate({ role: event.target.value, page: 1 })
                }
                className="glass-input w-full !py-2.5 text-sm"
                aria-label="Filtrer par rôle"
              >
                <option value="all">Tous les rôles</option>
                <option value="user">Utilisateurs</option>
                <option value="admin">Administrateurs</option>
                <option value="super_admin">Super administrateurs</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Statut
              </span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  navigate({ status: event.target.value, page: 1 })
                }
                className="glass-input w-full !py-2.5 text-sm"
                aria-label="Filtrer par statut"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Désactivés</option>
              </select>
            </label>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Search className="h-4 w-4" /> Rechercher
            </button>
          </form>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
          <p>
            {totalResults} compte{totalResults > 1 ? "s" : ""} trouvé
            {totalResults > 1 ? "s" : ""}
          </p>
          {(query || roleFilter !== "all" || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                navigate({ q: "", role: "all", status: "all" });
              }}
              className="min-h-11 font-semibold text-orange-700"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
        <div className="space-y-4">
          {users.map((user) => {
            const canEdit =
              currentRole === "super_admin" || user.role === "user";
            const canToggle = canEdit && user.id !== currentUserId;
            const action =
              "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40";
            return (
              <article key={user.id} className="glass-card overflow-hidden">
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 font-bold text-orange-700">
                      {initials(user)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="break-words font-semibold text-slate-900">
                        {user.name || "Nom non renseigné"}{" "}
                        {user.id === currentUserId && (
                          <span className="ml-1 text-xs text-orange-700">
                            Vous
                          </span>
                        )}
                      </h2>
                      <p className="break-all text-sm text-slate-500">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${roleTone(user.role)}`}
                    >
                      {ROLE_LABELS[user.role]}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                    >
                      {user.isActive ? "Actif" : "Désactivé"}
                    </span>
                    {user.role === "admin" && (
                      <span className="text-xs text-slate-500">
                        {user.adminModules.length} modules autorisés
                      </span>
                    )}
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-slate-500">
                        Diagnostics enregistrés
                      </dt>
                      <dd className="mt-1 font-medium text-slate-700">
                        {user.submissionsCount}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">
                        Dernière connexion
                      </dt>
                      <dd className="mt-1 text-slate-700">
                        {formatDate(user.lastLoginAt, true)}
                      </dd>
                    </div>
                  </dl>
                </div>
                <footer
                  className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50/60 p-4 sm:flex sm:flex-wrap sm:justify-end"
                  aria-label={`Actions pour ${user.email}`}
                >
                  <button
                    onClick={() => openDetails(user)}
                    className={`${action} border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
                    aria-label={`Consulter ${user.email}`}
                  >
                    <Eye size={16} aria-hidden="true" />
                    Détails
                  </button>
                  <button
                    onClick={() => openEdit(user)}
                    disabled={!canEdit}
                    className={`${action} border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100`}
                    aria-label={`Modifier ${user.email}`}
                    title={
                      canEdit ? "Modifier" : "Réservé au super administrateur"
                    }
                  >
                    <Pencil size={16} aria-hidden="true" />
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      setConfirmUser(user);
                      setError("");
                    }}
                    disabled={!canToggle}
                    className={`${action} border-slate-200 bg-white ${user.isActive ? "text-red-700 hover:bg-red-50" : "text-emerald-700 hover:bg-emerald-50"}`}
                    aria-label={`${user.isActive ? "Désactiver" : "Réactiver"} ${user.email}`}
                    title={
                      user.id === currentUserId
                        ? "Vous ne pouvez pas désactiver votre propre compte"
                        : !canToggle
                          ? "Réservé au super administrateur"
                          : undefined
                    }
                  >
                    {user.isActive ? (
                      <PowerOff size={16} aria-hidden="true" />
                    ) : (
                      <Power size={16} aria-hidden="true" />
                    )}
                    {user.isActive ? "Désactiver" : "Réactiver"}
                  </button>
                </footer>
              </article>
            );
          })}
          {!users.length && (
            <div className="glass-card p-8 text-center">
              <CircleUserRound className="mx-auto h-10 w-10 text-slate-300" />
              <h2 className="mt-3 font-semibold text-slate-700">
                Aucun utilisateur trouvé
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Modifiez les filtres ou le terme de recherche.
              </p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row">
            <p className="text-sm text-slate-500">
              Page {page} sur {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigate({ page: page - 1 })}
                disabled={page === 1}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 disabled:opacity-35"
                aria-label="Page précédente"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {visiblePages.map((value, index) => (
                <span key={value} className="flex items-center gap-1.5">
                  {index > 0 && value - visiblePages[index - 1] > 1 && (
                    <span className="px-1 text-slate-400">…</span>
                  )}
                  <button
                    onClick={() => navigate({ page: value })}
                    className={`h-9 min-w-9 rounded-md px-2 text-sm font-semibold ${value === page ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    {value}
                  </button>
                </span>
              ))}
              <button
                onClick={() => navigate({ page: page + 1 })}
                disabled={page === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 disabled:opacity-35"
                aria-label="Page suivante"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-6 right-4 left-4 sm:left-auto z-[300] flex max-w-sm items-center gap-3 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl"
          >
            <Check className="h-5 w-5 text-emerald-400" />
            {notice}
          </motion.div>
        )}

        {viewUser && (
          <Modal
            busy={saving}
            title="Informations de l’utilisateur"
            subtitle="Consultation du compte"
            onClose={() => {
              setViewUser(null);
              setError("");
            }}
            size="max-w-2xl"
          >
            <div className="p-6">
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#eb5f2a]/10 text-xl font-bold text-[#d94c18]">
                  {initials(viewUser)}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-xl font-bold text-slate-900">
                    {viewUser.name || "Nom non renseigné"}
                  </h3>
                  <p className="truncate text-slate-500">{viewUser.email}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-2 self-start rounded-md px-3 py-1.5 text-sm font-semibold ${viewUser.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${viewUser.isActive ? "bg-emerald-500" : "bg-rose-500"}`}
                  />
                  {viewUser.isActive ? "Compte actif" : "Compte désactivé"}
                </span>
              </div>

              {detailsLoading ? (
                <div className="flex items-center justify-center py-14 text-slate-500">
                  <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                  Chargement…
                </div>
              ) : error ? (
                <div className="my-6 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  {error}
                </div>
              ) : (
                details && (
                  <>
                    <dl className="grid gap-x-8 gap-y-5 py-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-semibold uppercase text-slate-400">
                          Nom complet
                        </dt>
                        <dd className="mt-1 font-medium text-slate-900">
                          {details.name || "Non renseigné"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase text-slate-400">
                          Adresse email
                        </dt>
                        <dd className="mt-1 flex items-center gap-2 break-all font-medium text-slate-900">
                          <Mail className="h-4 w-4 text-slate-400" />
                          {details.email}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase text-slate-400">
                          Rôle
                        </dt>
                        <dd className="mt-1 font-medium text-slate-900">
                          {ROLE_LABELS[details.role]}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase text-slate-400">
                          Dernière connexion
                        </dt>
                        <dd className="mt-1 font-medium text-slate-900">
                          {formatDate(details.lastLoginAt, true)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase text-slate-400">
                          Compte créé
                        </dt>
                        <dd className="mt-1 font-medium text-slate-900">
                          {formatDate(details.createdAt, true)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase text-slate-400">
                          Dernière modification
                        </dt>
                        <dd className="mt-1 font-medium text-slate-900">
                          {formatDate(details.updatedAt, true)}
                        </dd>
                      </div>
                    </dl>
                    {details.role === "admin" && (
                      <div className="border-t border-slate-200 py-6">
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Modules autorisés
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {ADMIN_MODULES.filter((module) =>
                            details.adminModules.includes(module.key),
                          ).map((module) => (
                            <span
                              key={module.key}
                              className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"
                            >
                              {module.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="grid gap-3 border-t border-slate-200 pt-6 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        {
                          label: "Diagnostics",
                          value: details._count.submissions,
                          icon: ClipboardCheck,
                        },
                        {
                          label: "Tentatives",
                          value: details._count.attempts,
                          icon: Activity,
                        },
                        {
                          label: "Événements",
                          value: details._count.tracking,
                          icon: FilePenLine,
                        },
                        {
                          label: "Créés",
                          value: details._count.diagnostics,
                          icon: ShieldCheck,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-md bg-slate-50 p-4"
                        >
                          <item.icon className="h-5 w-5 text-slate-400" />
                          <p className="mt-3 text-2xl font-bold text-slate-900">
                            {item.value}
                          </p>
                          <p className="text-xs font-medium text-slate-500">
                            {item.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )
              )}
            </div>
            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                onClick={() => setViewUser(null)}
                className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Fermer
              </button>
              {(currentRole === "super_admin" || viewUser.role === "user") && (
                <button
                  onClick={() => {
                    setViewUser(null);
                    openEdit(viewUser);
                  }}
                  className="inline-flex items-center gap-2 rounded-md bg-[#eb5f2a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d94c18]"
                >
                  <Pencil className="h-4 w-4" />
                  Modifier
                </button>
              )}
            </div>
          </Modal>
        )}

        {editUser && (
          <Modal
            busy={saving}
            title="Modifier l’utilisateur"
            subtitle={editUser.email}
            onClose={() => {
              setEditUser(null);
              setError("");
            }}
          >
            <form onSubmit={saveEdit}>
              <div className="space-y-5 p-6">
                {error && (
                  <div className="rounded-md border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">
                    {error}
                  </div>
                )}
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Nom complet
                  </span>
                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    maxLength={100}
                    className="glass-input w-full"
                    placeholder="Nom de l’utilisateur"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Adresse email
                  </span>
                  <input
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    type="email"
                    required
                    maxLength={254}
                    className="glass-input w-full"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Rôle
                  </span>
                  <select
                    value={form.role}
                    onChange={(event) =>
                      setForm({ ...form, role: event.target.value as UserRole })
                    }
                    disabled={
                      currentRole !== "super_admin" ||
                      editUser.id === currentUserId
                    }
                    className="glass-input w-full disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                    <option value="super_admin">Super administrateur</option>
                  </select>
                  {currentRole !== "super_admin" && (
                    <p className="mt-2 text-xs text-slate-500">
                      Le rôle est modifiable uniquement par un super
                      administrateur.
                    </p>
                  )}
                </label>
                {form.role === "admin" && currentRole === "super_admin" && (
                  <div>
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      Modules autorisés
                    </span>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {ADMIN_MODULES.map((module) => {
                        const checked = form.adminModules.includes(module.key);
                        return (
                          <label
                            key={module.key}
                            className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition ${checked ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:bg-slate-50"}`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                toggleModule(
                                  form.adminModules,
                                  module.key,
                                  (adminModules) =>
                                    setForm({ ...form, adminModules }),
                                )
                              }
                              className="mt-0.5 h-4 w-4 accent-blue-600"
                            />
                            <span>
                              <span className="block text-sm font-semibold text-slate-800">
                                {module.label}
                              </span>
                              <span className="mt-0.5 block text-xs leading-4 text-slate-500">
                                {module.description}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
                <label
                  className={`flex items-center justify-between gap-5 rounded-md border p-4 ${editUser.id === currentUserId ? "border-slate-200 bg-slate-50" : "border-slate-200"}`}
                >
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      Compte actif
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      Un compte désactivé ne peut plus se connecter.
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      setForm({ ...form, isActive: event.target.checked })
                    }
                    disabled={editUser.id === currentUserId}
                    className="h-5 w-5 accent-[#eb5f2a]"
                  />
                </label>
              </div>
              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-w-32 items-center justify-center gap-2 rounded-md bg-[#eb5f2a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d94c18] disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Enregistrer
                </button>
              </div>
            </form>
          </Modal>
        )}

        {confirmUser && (
          <Modal
            busy={saving}
            title={
              confirmUser.isActive
                ? "Désactiver le compte ?"
                : "Réactiver le compte ?"
            }
            subtitle={confirmUser.email}
            onClose={() => {
              setConfirmUser(null);
              setError("");
            }}
            size="max-w-md"
          >
            <div className="p-6">
              <div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-lg ${confirmUser.isActive ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}
              >
                {confirmUser.isActive ? (
                  <PowerOff className="h-7 w-7" />
                ) : (
                  <Power className="h-7 w-7" />
                )}
              </div>
              <p className="mt-5 text-center text-sm leading-6 text-slate-600">
                {confirmUser.isActive
                  ? "Cet utilisateur ne pourra plus se connecter ni accéder à son compte."
                  : "Cet utilisateur pourra de nouveau se connecter et accéder à son compte."}
              </p>
              {error && (
                <div className="mt-5 rounded-md border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">
                  {error}
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                onClick={() => setConfirmUser(null)}
                className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={toggleStatus}
                disabled={saving}
                className={`inline-flex min-w-32 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${confirmUser.isActive ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
              >
                {saving ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : confirmUser.isActive ? (
                  <PowerOff className="h-4 w-4" />
                ) : (
                  <Power className="h-4 w-4" />
                )}
                {confirmUser.isActive ? "Désactiver" : "Réactiver"}
              </button>
            </div>
          </Modal>
        )}

        {createOpen && (
          <Modal
            busy={saving}
            title="Créer un administrateur"
            subtitle="Compte et accès modulaires"
            onClose={() => {
              setCreateOpen(false);
              setError("");
            }}
            size="max-w-2xl"
          >
            <form onSubmit={createAdmin}>
              <div className="space-y-5 p-6">
                {error && (
                  <div className="rounded-md border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">
                    {error}
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      Nom complet
                    </span>
                    <input
                      value={createForm.name}
                      onChange={(event) =>
                        setCreateForm({
                          ...createForm,
                          name: event.target.value,
                        })
                      }
                      maxLength={100}
                      className="glass-input w-full"
                      placeholder="Nom de l’administrateur"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      Adresse email
                    </span>
                    <input
                      value={createForm.email}
                      onChange={(event) =>
                        setCreateForm({
                          ...createForm,
                          email: event.target.value,
                        })
                      }
                      type="email"
                      required
                      maxLength={254}
                      className="glass-input w-full"
                      placeholder="admin@exemple.com"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Mot de passe initial
                  </span>
                  <input
                    value={createForm.password}
                    onChange={(event) =>
                      setCreateForm({
                        ...createForm,
                        password: event.target.value,
                      })
                    }
                    type="password"
                    required
                    minLength={8}
                    maxLength={128}
                    className="glass-input w-full"
                    placeholder="8 caractères minimum"
                  />
                </label>
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-700">
                      Modules autorisés
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCreateForm({
                          ...createForm,
                          adminModules:
                            createForm.adminModules.length ===
                            ADMIN_MODULES.length
                              ? []
                              : ADMIN_MODULES.map((module) => module.key),
                        })
                      }
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                    >
                      {createForm.adminModules.length === ADMIN_MODULES.length
                        ? "Tout désélectionner"
                        : "Tout sélectionner"}
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {ADMIN_MODULES.map((module) => {
                      const checked = createForm.adminModules.includes(
                        module.key,
                      );
                      return (
                        <label
                          key={module.key}
                          className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition ${checked ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:bg-slate-50"}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              toggleModule(
                                createForm.adminModules,
                                module.key,
                                (adminModules) =>
                                  setCreateForm({
                                    ...createForm,
                                    adminModules,
                                  }),
                              )
                            }
                            className="mt-0.5 h-4 w-4 accent-blue-600"
                          />
                          <span>
                            <span className="block text-sm font-semibold text-slate-800">
                              {module.label}
                            </span>
                            <span className="mt-0.5 block text-xs leading-4 text-slate-500">
                              {module.description}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving || createForm.adminModules.length === 0}
                  className="inline-flex min-w-40 items-center justify-center gap-2 rounded-md bg-[#eb5f2a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d94c18] disabled:opacity-50"
                >
                  {saving ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Créer le compte
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
