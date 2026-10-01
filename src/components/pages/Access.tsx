
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
    <div className="flex-1 overflow-auto bg-[#070807] p-10 flex flex-col items-center w-full">
      
      <div className="w-full max-w-350">
        {/* Mensajes de notificación */}
        <Mensaje
          successMessage={notice}
          actionError={error}
          setSuccessMessage={setNotice}
          setActionError={setError}
        />

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium text-white">Accesos</h1>
            <p className="mt-1 text-sm text-white/40">
              Administra los miembros y roles de tus proyectos
            </p>
          </div>
        </div>

        <section className="w-full">
          {/* Selector de proyecto */}
          <div className="mb-8 bg-linear-to-br from-[#111111] via-[#17121f] to-[#7B2CD9]/15 border-2 border-white/5 rounded-2xl p-6 shadow-lg">
            <label className="block space-y-3">
              <span className="text-sm font-semibold text-white/80 flex items-center gap-2">
                <Shield size={16} className="text-brand-pink" /> 
                Seleccionar Proyecto
              </span>
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
                className="block h-12 w-full md:w-1/2 rounded-xl border border-white/15 bg-[#111] px-4 text-white outline-none focus:border-[#7B2CD9] transition-colors disabled:opacity-50"
              >
                {projects.length === 0 && <option value="">Sin proyectos disponibles</option>}
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} — {project.rol_en_proyecto}
                  </option>
                ))}
              </select>
              {selectedProject && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-white/40">
                  <Shield size={12} className="text-brand-pink" />
                  Tu rol en este proyecto:
                  <span className="font-medium text-[#c084fc]">{selectedProject.rol_en_proyecto}</span>
                </p>
              )}
            </label>
          </div>

          {loadingProjects ? (
            <p className="text-sm text-white/50">Cargando proyectos...</p>
          ) : !selectedProject ? (
            <div className="rounded-2xl bg-[#20201f] p-10 text-center text-white/40">
              No hay proyectos para administrar.
            </div>
          ) : !canManage ? (
            <div className="rounded-2xl bg-[#20201f] p-10 text-center text-white/40">
              No tienes permisos para administrar los accesos de este proyecto.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
              
              {/* Panel Izquierdo: Agregar Miembro */}
              <div className="space-y-6">
                <div className="bg-linear-to-br from-[#111111] via-[#17121f] to-[#7B2CD9]/10 border-2 border-white/5 rounded-2xl p-6 shadow-lg">
                  <h2 className="mb-5 text-lg font-semibold text-white flex items-center gap-2">
                    <Plus size={20} className="text-[#ff2fa3]" />
                    Nuevo Acceso
                  </h2>
                  
                  <form onSubmit={(event) => void handleAddMember(event)} className="space-y-4">
                    <label className="relative block">
                      <span className="sr-only">Buscar usuario</span>
                      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
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
                        className="h-12 w-full rounded-xl border border-white/15 bg-[#111] pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#7B2CD9] transition-colors"
                      />
                    </label>
                    
                    {search.trim().length > 0 && search.trim().length < 2 && (
                      <p className="text-xs text-[#ff2fa3]">Escribe al menos 2 caracteres.</p>
                    )}
                    {!loadingUsers && search.trim().length >= 2 && availableUsers.length === 0 && (
                      <p className="text-xs text-white/45">No se encontraron usuarios.</p>
                    )}

                    <label className="block">
                      <span className="sr-only">Usuario encontrado</span>
                      <select
                        value={selectedUserId}
                        onChange={(event) => setSelectedUserId(event.target.value)}
                        disabled={availableUsers.length === 0}
                        className="h-12 w-full rounded-xl border border-white/15 bg-[#111] px-4 text-sm text-white outline-none focus:border-[#7B2CD9] transition-colors disabled:opacity-50"
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
                      <span className="sr-only">Rol a conceder</span>
                      <select
                        value={roleToGrant}
                        onChange={(event) => setRoleToGrant(event.target.value as ProyectoAccessRole)}
                        className="h-12 w-full rounded-xl border border-white/15 bg-[#111] px-4 text-sm text-white outline-none focus:border-[#7B2CD9] transition-colors"
                      >
                        {rolesToGrant.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
                      </select>
                    </label>
                    
                    <button
                      type="submit"
                      disabled={!selectedUserId || saving}
                      className="w-full h-12 flex items-center justify-center rounded-xl bg-linear-to-r from-brand-pink to-brand-purple text-white font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      Conceder Acceso
                    </button>
                  </form>

                  <div className="mt-6 p-4 rounded-xl border border-white/5 bg-white/5">
                    <p className="text-xs leading-5 text-white/50 text-center">
                      {actorRole === "owner"
                        ? "Como dueño, solo puedes agregar viewers."
                        : "Como administrador, puedes asignar roles o remover integrantes."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Panel Derecho: Lista de Miembros */}
              <div className="bg-[#111111] border-2 border-white/5 rounded-2xl p-6 shadow-lg">
                <div className="mb-6 flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-purple">
                    <Users size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Miembros del proyecto</h2>
                    <p className="text-xs text-white/40">{members.length} {members.length === 1 ? 'miembro' : 'miembros'}</p>
                  </div>
                </div>

                {loadingMembers ? (
                  <p className="py-5 text-sm text-white/50 text-center">Cargando miembros...</p>
                ) : members.length === 0 ? (
                  <div className="rounded-xl border border-white/5 border-dashed p-8 text-center text-white/40">
                    Aún no hay miembros adicionales.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-125 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                    {members.map((member) => (
                      <div key={member.id} className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:border-[#7B2CD9]/50 transition-colors">
                        <div className="flex-1 min-w-0 flex items-center gap-3">
                          <div className="size-10 rounded-full bg-linear-to-tr from-brand-pink to-brand-purple flex items-center justify-center text-white font-bold shrink-0">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">{member.name}</p>
                            <p className="truncate text-xs text-white/40">{member.correo}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                          <select
                            aria-label={`Rol de ${member.name}`}
                            value={member.rol_en_proyecto}
                            disabled={!canEditRoles || updatingMemberId === member.id}
                            onChange={(event) => void handleRoleChange(member, event.target.value as ProyectoAccessRole)}
                            className="h-9 min-w-35 rounded-lg border border-white/15 bg-[#111] px-3 text-xs text-white/80 outline-none focus:border-[#ff2fa3] disabled:opacity-50"
                          >
                            {manageableRoles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
                          </select>
                          
                          {canRemoveMember(member) && (
                            <button
                              type="button"
                              onClick={() => setPendingRemoval(member)}
                              className="flex size-9 items-center justify-center rounded-lg border border-white/10 text-white/40 transition hover:border-red-500 hover:bg-red-500/20 hover:text-red-400"
                            >
                              <Trash2 size={16} />
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
            <section className="relative z-10 w-full max-w-md rounded-2xl border border-white/15 bg-[#111] p-6 shadow-2xl">
              <div className="mb-5 flex size-12 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
                <Trash2 size={22} />
              </div>
              <h2 className="text-xl font-semibold text-white">¿Quitar este acceso?</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">
                <span className="font-medium text-white">{pendingRemoval.name}</span> perderá el acceso a {selectedProject?.name}. Esta acción no se puede deshacer.
              </p>
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPendingRemoval(null)}
                  disabled={deletingMemberId !== null}
                  className="px-5 py-2.5 rounded-xl border border-white/20 text-sm font-medium text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => void handleRemoveMember()}
                  disabled={deletingMemberId !== null}
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-sm font-medium text-white hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center gap-2"
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
