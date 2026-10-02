
import { useEffect, useState } from "react";
import { Plus, Search, Shield, Trash2, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  actualizarRolColaborador,
  agregarColaborador,
  buscarUsuariosDisponibles,
  eliminarColaborador,
  getMiembrosProyecto,
  getProyectosAdministrables,
} from "../../services/api";
import type {
  AvailableProjectUser,
  AdministrableProject,
  ProyectoAccessRole,
  ProyectoMember,
} from "../../types/types";
import Mensaje from "../molecules/Mensaje";

const roleLabels: Record<ProyectoAccessRole, string> = {
  owner: "Dueño",
  admin_proyect: "Administrador del proyecto",
  viewer: "Viewer",
};

const manageableRoles: ProyectoAccessRole[] = [
  "owner",
  "admin_proyect",
  "viewer",
];

export default function Access() {
  const { accessToken, loading: authLoading, user } = useAuth();
  const [projects, setProjects] = useState<AdministrableProject[]>([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [members, setMembers] = useState<ProyectoMember[]>([]);
  const [availableUsers, setAvailableUsers] = useState<AvailableProjectUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [roleToGrant, setRoleToGrant] = useState<ProyectoAccessRole>("viewer");
  const [search, setSearch] = useState("");
  const [pendingRemoval, setPendingRemoval] = useState<ProyectoMember | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingMemberId, setUpdatingMemberId] = useState<number | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const loadingProjects = authLoading || (Boolean(accessToken) && !projectsLoaded);

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;
    void getProyectosAdministrables(accessToken)
      .then((data) => {
        if (cancelled) return;
        setProjects(data);
        setSelectedProjectId(String(data[0]?.id ?? ""));
        setMembers([]);
        setLoadingMembers(data.length > 0);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudieron cargar los proyectos.");
      })
      .finally(() => {
        if (!cancelled) setProjectsLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const selectedProject = projects.find(
    (project) => String(project.id) === selectedProjectId,
  );

  const actorRole = selectedProject?.rol_en_proyecto === "admin" ? "admin" : selectedProject?.rol_en_proyecto;
  const canManage = actorRole === "admin" || actorRole === "owner" || actorRole === "admin_proyect";
  const canEditRoles =  actorRole === "admin_proyect";
  const rolesToGrant: ProyectoAccessRole[] = 
  actorRole === "admin_proyect" ? manageableRoles : 
  actorRole === "owner" ? ["viewer"] : 
  [];

  useEffect(() => {
    const projectId = Number(selectedProjectId);
    if (!accessToken || !projectId || !canManage) return;

    let cancelled = false;
    void getMiembrosProyecto(accessToken, projectId)
      .then((data) => {
        if (!cancelled) setMembers(data);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudieron cargar los accesos del proyecto.");
      })
      .finally(() => {
        if (!cancelled) setLoadingMembers(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, canManage, selectedProjectId]);

  useEffect(() => {
    const projectId = Number(selectedProjectId);
    const term = search.trim();
    if (!accessToken || !projectId || !canManage || term.length < 2) return;

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      void buscarUsuariosDisponibles(accessToken, projectId, term)
        .then((users) => {
          if (!cancelled) {
            setAvailableUsers(users);
            setSelectedUserId("");
          }
        })
        .catch(() => {
          if (!cancelled) setError("No se pudieron buscar usuarios.");
        })
        .finally(() => {
          if (!cancelled) setLoadingUsers(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [accessToken, canManage, search, selectedProjectId]);

  async function reloadMembers(projectId: number) {
    if (!accessToken) return;
    const data = await getMiembrosProyecto(accessToken, projectId);
    setMembers(data);
  }

  async function handleAddMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const projectId = Number(selectedProjectId);
    if (!accessToken || !projectId || !selectedUserId) return;

    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await agregarColaborador(accessToken, {
        fk_id_user: Number(selectedUserId),
        fk_id_proyecto: projectId,
        rol_en_proyecto: roleToGrant,
      });
      await reloadMembers(projectId);
      setSearch("");
      setAvailableUsers([]);
      setSelectedUserId("");
      setLoadingUsers(false);
      setNotice("El acceso se concedió correctamente.");
    } catch {
      setError("No se pudo conceder el acceso. Revisa los permisos e inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(member: ProyectoMember, role: ProyectoAccessRole) {
    if (!accessToken) return;
    setUpdatingMemberId(member.id);
    setError(null);
    setNotice(null);
    try {
      await actualizarRolColaborador(accessToken, member.id, role);
      setMembers((current) => current.map((item) =>
        item.id === member.id ? { ...item, rol_en_proyecto: role } : item,
      ));
      setNotice(`El rol de ${member.name} se actualizó.`);
    } catch {
      setError("No se pudo actualizar el rol. Revisa los permisos e inténtalo de nuevo.");
    } finally {
      setUpdatingMemberId(null);
    }
  }

  async function handleRemoveMember() {
    if (!accessToken || !pendingRemoval) return;
    setDeletingMemberId(pendingRemoval.id);
    setError(null);
    setNotice(null);
    try {
      await eliminarColaborador(accessToken, pendingRemoval.id);
      setMembers((current) => current.filter((member) => member.id !== pendingRemoval.id));
      setNotice(`Se quitó el acceso de ${pendingRemoval.name}.`);
      setPendingRemoval(null);
    } catch {
      setError("No se pudo quitar el acceso. Revisa los permisos e inténtalo de nuevo.");
    } finally {
      setDeletingMemberId(null);
    }
  }

  function canRemoveMember(member: ProyectoMember) {
    if (member.fk_id_user === user?.id) return false;
    if (actorRole === "owner") return member.rol_en_proyecto === "viewer";
    if (actorRole === "admin" || actorRole === "admin_proyect") {
      return ["owner", "viewer", "colaborador_proyect"].includes(member.rol_en_proyecto);
    }
    return false;
  }

  return (
    <div className="flex-1 overflow-auto bg-[#faf9fc] p-5 md:p-8">
      
      <div className="mx-auto w-full max-w-7xl">
        {/* Mensajes de notificación */}
        <Mensaje
          successMessage={notice}
          actionError={error}
          setSuccessMessage={setNotice}
          setActionError={setError}
        />

        {/* Header */}
        <div className="mb-7 flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#7b2cd9] to-[#c42caa] text-white shadow-md shadow-purple-200">
            <Shield size={23} aria-hidden="true" />
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#9a55bf]">Gestión del equipo</p>
            <h1 className="text-3xl font-bold text-gray-900">Accesos</h1>
            <p className="mt-1 text-sm text-gray-500">Administra los miembros y roles de tus proyectos</p>
          </div>
        </div>

        <section className="w-full">
          {/* Selector de proyecto */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-800">Proyecto</span>
              <select
                value={selectedProjectId}
                onChange={(event) => {
                  setSelectedProjectId(event.target.value);
                  setMembers([]);
                  setLoadingMembers(true);
                  setSearch("");
                  setAvailableUsers([]);
                  setSelectedUserId("");
                  setLoadingUsers(false);
                  setRoleToGrant("viewer");
                  setError(null);
                }}
                disabled={loadingProjects || projects.length === 0}
                className="block h-12 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition focus:border-[#9a55bf] focus:bg-white focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60 md:max-w-xl"
              >
                {projects.length === 0 && <option value="">Sin proyectos disponibles</option>}
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} — {project.rol_en_proyecto}
                  </option>
                ))}
              </select>
              {selectedProject && (
                <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                  Tu rol en este proyecto:
                  <span className="rounded-full border border-purple-100 bg-purple-50 px-2.5 py-1 font-semibold capitalize text-purple-800">{selectedProject.rol_en_proyecto}</span>
                </p>
              )}
            </label>
          </div>

          {loadingProjects ? (
            <p className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500">Cargando proyectos...</p>
          ) : !selectedProject ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-sm text-gray-500">
              No hay proyectos para administrar.
            </div>
          ) : !canManage ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-8 text-center text-sm text-amber-800">
              No tienes permisos para administrar los accesos de este proyecto.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.6fr)]">
              
              {/* Panel Izquierdo: Agregar Miembro */}
              <div className="space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
                  <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Plus size={19} className="text-[#9a55bf]" aria-hidden="true" />
                    Nuevo Acceso
                  </h2>
                  <p className="mb-5 text-sm text-gray-500">Busca una persona y define su nivel de acceso.</p>
                  
                  <form onSubmit={(event) => void handleAddMember(event)} className="space-y-4">
                    <label className="relative block">
                      <span className="mb-2 block text-xs font-semibold text-gray-600">Buscar usuario</span>
                      <Search size={17} className="absolute left-3.5 top-[2.65rem] -translate-y-1/2 text-gray-400" aria-hidden="true" />
                      <input
                        value={search}
                        onChange={(event) => {
                          const value = event.target.value;
                          setSearch(value);
                          setAvailableUsers([]);
                          setSelectedUserId("");
                          setLoadingUsers(value.trim().length >= 2);
                        }}
                        placeholder="Buscar por nombre, usuario..."
                        className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#9a55bf] focus:bg-white focus:ring-2 focus:ring-purple-100"
                      />
                    </label>
                    
                    {search.trim().length > 0 && search.trim().length < 2 && (
                      <p className="text-xs text-amber-700">Escribe al menos 2 caracteres.</p>
                    )}
                    {!loadingUsers && search.trim().length >= 2 && availableUsers.length === 0 && (
                      <p className="text-xs text-gray-500">No se encontraron usuarios.</p>
                    )}

                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold text-gray-600">Usuario</span>
                      <select
                        value={selectedUserId}
                        onChange={(event) => setSelectedUserId(event.target.value)}
                        disabled={availableUsers.length === 0}
                        className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-900 outline-none transition focus:border-[#9a55bf] focus:bg-white focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">{loadingUsers ? "Buscando..." : "Seleccionar usuario"}</option>
                        {availableUsers.map((availableUser) => (
                          <option key={availableUser.id} value={availableUser.id}>
                            {availableUser.name} · {availableUser.correo}
                          </option>
                        ))}
                      </select>
                    </label>
                    
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold text-gray-600">Rol</span>
                      <select
                        value={roleToGrant}
                        onChange={(event) => setRoleToGrant(event.target.value as ProyectoAccessRole)}
                        className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 text-sm text-gray-900 outline-none transition focus:border-[#9a55bf] focus:bg-white focus:ring-2 focus:ring-purple-100"
                      >
                        {rolesToGrant.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
                      </select>
                    </label>
                    
                    <button
                      type="submit"
                      disabled={!selectedUserId || saving}
                      className="flex h-11 w-full items-center justify-center rounded-lg bg-linear-to-r from-[#c42caa] to-[#7b2cd9] text-sm font-semibold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Conceder Acceso
                    </button>
                  </form>

                  <div className="mt-5 rounded-lg border border-purple-100 bg-purple-50 p-3.5">
                    <p className="text-center text-xs leading-5 text-purple-800">
                      {actorRole === "owner"
                        ? "Como dueño, solo puedes agregar viewers."
                        : "Como administrador, puedes asignar roles o remover integrantes."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Panel Derecho: Lista de Miembros */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-[#c42caa]">
                      <Users size={19} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-gray-900">Miembros del proyecto</h2>
                      <p className="text-xs text-gray-500">Personas con acceso a este proyecto</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">
                    {members.length} {members.length === 1 ? "miembro" : "miembros"}
                  </span>
                </div>

                {loadingMembers ? (
                  <div className="space-y-3" aria-label="Cargando miembros">
                    {[1, 2].map((item) => (
                      <div key={item} className="flex animate-pulse items-center gap-3 rounded-lg border border-gray-100 p-4">
                        <div className="size-10 rounded-full bg-gray-100" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-1/3 rounded bg-gray-100" />
                          <div className="h-3 w-1/2 rounded bg-gray-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : members.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center text-sm text-gray-500">
                    Aún no hay miembros adicionales.
                  </div>
                ) : (
                  <div className="max-h-125 space-y-3 overflow-y-auto pr-1">
                    {members.map((member) => (
                      <div key={member.id} className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3.5 transition-colors hover:border-purple-200 sm:flex-row sm:items-center">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#c42caa] to-[#7b2cd9] font-semibold text-white">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">{member.name}</p>
                            <p className="truncate text-xs text-gray-500">{member.correo}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 sm:mt-0">
                          <select
                            aria-label={`Rol de ${member.name}`}
                            value={member.rol_en_proyecto}
                            disabled={!canEditRoles || updatingMemberId === member.id}
                            onChange={(event) => void handleRoleChange(member, event.target.value as ProyectoAccessRole)}
                            className="h-9 min-w-35 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 text-xs text-gray-700 outline-none transition focus:border-[#9a55bf] focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                          >
                            {manageableRoles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
                          </select>
                          
                          {canRemoveMember(member) && (
                            <button
                              type="button"
                              aria-label={`Quitar acceso de ${member.name}`}
                              onClick={() => setPendingRemoval(member)}
                              className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:border-red-300 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                            >
                              <Trash2 size={16} aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </section>

        {/* Modal Confirmación de Eliminación */}
        {pendingRemoval && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setPendingRemoval(null)} />
            <section role="alertdialog" aria-modal="true" aria-labelledby="remove-access-title" className="relative z-10 w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-gray-900 shadow-2xl">
              <div className="mb-5 flex size-11 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600">
                <Trash2 size={20} aria-hidden="true" />
              </div>
              <h2 id="remove-access-title" className="text-xl font-semibold">¿Quitar este acceso?</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                <span className="font-semibold text-gray-900">{pendingRemoval.name}</span> perderá el acceso a {selectedProject?.name}. Esta acción no se puede deshacer.
              </p>
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPendingRemoval(null)}
                  disabled={deletingMemberId !== null}
                  className="min-h-10 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => void handleRemoveMember()}
                  disabled={deletingMemberId !== null}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingMemberId === pendingRemoval.id ? "Quitando..." : "Quitar acceso"}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
