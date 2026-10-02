import { useEffect, useState } from "react";
import { ArrowUpRight, Folder, Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { eliminarProyecto, getProyectos } from "../../services/api";
import type { Proyecto, ProyectoUsuario } from "../../types/types";
import Busqueda from "../molecules/Busqueda";
import Mensaje from "../molecules/Mensaje";
import ModalProyects from "../organism/ModalProyectsArchivos";
import ModalCreateProyect from "../organism/ModalCreateProyect";
import ModalEditarProyecto from "../organism/ModalEditarProyecto";

const statusStyles: Record<string, string> = {
  en_progreso: "border-amber-200 bg-amber-50 text-amber-800",
  completado: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pausado: "border-slate-200 bg-slate-100 text-slate-600",
};

export default function Proyects() {
  const { accessToken, user} = useAuth();
  const [proyectos, setProyectos] = useState<ProyectoUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectProyect, setSelectProyect] = useState<ProyectoUsuario | null>(null);
  const [openModalProyectArchivo, setOpenModalProyectArchivo] = useState(false);

  const [openModalProyect, setOpenModalProyect] = useState (false);
  const [proyectoEnEdicion, setProyectoEnEdicion] = useState<Proyecto | null>(null);
  const [proyectoAEliminar, setProyectoAEliminar] = useState<ProyectoUsuario | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<number | null>(null);
  // filtros
  const [busqueda, setBusqueda] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [estado, setEstado] = useState("");
  useEffect(() => {
    async function cargarProyectos() {
      if (!accessToken) {
        setProyectos([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data: ProyectoUsuario[] = await getProyectos(accessToken);
        setProyectos(data);
      } catch {
        setError("No se pudieron cargar los proyectos.");
      } finally {
        setLoading(false);
      }
    }

    void cargarProyectos();
  }, [accessToken]);
  const proyectosFiltrados = proyectos.filter(({ proyecto }) => {

    const coincideBusqueda = proyecto.name
      .toLowerCase()
      .includes(busqueda.trim().toLowerCase());

    const coincideEstado = estado === "" || proyecto.status === estado;

    const fechaProyecto = proyecto.fecha_inicio?.slice(0, 10) ?? "";

    const coincideFechaDesde =
      !fechaDesde || (fechaProyecto !== "" && fechaProyecto >= fechaDesde);

    const coincideFechaHasta =
      !fechaHasta || (fechaProyecto !== "" && fechaProyecto <= fechaHasta);

    return (
      coincideBusqueda &&
      coincideEstado &&
      coincideFechaDesde &&
      coincideFechaHasta
    );
  });

  async function handleDeleteProject(project: ProyectoUsuario) {
    if (deletingProjectId !== null) return;
    if (!accessToken) {
      setActionError("Debes iniciar sesión para eliminar el proyecto.");
      return;
    }

    setDeletingProjectId(project.proyecto.id);
    setActionError(null);
    try {
      await eliminarProyecto(accessToken, project.proyecto.id);
      setProyectos((currentProyectos) =>
        currentProyectos.filter((currentProject) => currentProject.proyecto.id !== project.proyecto.id),
      );
      setSuccessMessage(`El proyecto "${project.proyecto.name}" se eliminó correctamente.`);
      setProyectoAEliminar(null);
    } catch {
      setActionError("No se pudo eliminar el proyecto. Verifica tus permisos e inténtalo de nuevo.");
    } finally {
      setDeletingProjectId(null);
    }
  }

  return (
<div className="flex-1 overflow-auto p-5 md:p-8">
  <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#9a55bf]">Espacio de trabajo</p>
      <h1 className="text-3xl font-bold text-gray-900">Mis proyectos</h1>
      <p className="mt-1 text-sm text-gray-500">Gestiona y revisa tus proyectos</p>
    </div>

    <div className="flex items-center gap-3">
      <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600">
        {proyectos.length} {proyectos.length === 1 ? "proyecto" : "proyectos"}
      </span>
      {user?.role === "admin" && (
        <button
          type="button"
          onClick={() => setOpenModalProyect(true)}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#7b2cd9] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6922bd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b2cd9] focus-visible:ring-offset-2"
        >
          <Plus size={18} aria-hidden="true" />
          Crear proyecto
        </button>
      )}
    </div>
  </div>
   <Busqueda
    busqueda={busqueda}
    setBusqueda={setBusqueda}
    fechaDesde={fechaDesde}
    setFechaDesde={setFechaDesde}
    fechaHasta={fechaHasta}
    setFechaHasta={setFechaHasta}
    estado={estado}
    setEstado={setEstado}
  />
  <Mensaje 
    successMessage={successMessage} 
    actionError={actionError} 
    setSuccessMessage={setSuccessMessage} 
    setActionError={setActionError} 
  />
  {loading ? (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Cargando proyectos">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-56 animate-pulse rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-6 size-11 rounded-xl bg-gray-100" />
          <div className="mb-3 h-4 w-2/3 rounded bg-gray-100" />
          <div className="h-3 w-full rounded bg-gray-100" />
          <div className="mt-2 h-3 w-4/5 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  ) : error ? (
    <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
  ) : proyectos.length === 0 ? (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-purple-50 text-[#7b2cd9]">
        <Folder size={26} aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900">Aún no tienes proyectos</h2>
      <p className="mt-1 max-w-sm text-sm text-gray-500">Aquí aparecerán los proyectos a los que tienes acceso.</p>
    </div>
  ) : proyectosFiltrados.length === 0 ? (
    <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500">
      No hay proyectos que coincidan con los filtros.
    </div>
  ) : (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {proyectosFiltrados.map((proyectoUsuario) => {
        return (
        <article
          key={proyectoUsuario.id}
          className="group flex min-h-64 flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-lg"
        >
          <button
            type="button"
            className="flex grow flex-col p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7b2cd9]"
            onClick={() => {
              setSelectProyect(proyectoUsuario);
              setOpenModalProyectArchivo(true);
            }}
          >
            <div className="mb-5 flex w-full items-start justify-between">
              <div className="flex size-11 items-center justify-center rounded-xl bg-linear-to-br from-[#7b2cd9] to-[#c42caa] text-white shadow-sm shadow-purple-200 transition-transform group-hover:scale-105">
                <Folder size={20} aria-hidden="true" />
              </div>
              <ArrowUpRight size={18} className="text-gray-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#7b2cd9]" aria-hidden="true" />
            </div>

            <span className={`mb-3 w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[proyectoUsuario.proyecto.status] ?? "border-gray-200 bg-gray-100 text-gray-600"}`}>
              {proyectoUsuario.proyecto.status.replaceAll("_", " ")}
            </span>
            <h2 className="truncate text-lg font-semibold text-gray-900">
              {proyectoUsuario.proyecto.name}
            </h2>
            <p className="mt-2 line-clamp-2 grow text-sm leading-6 text-gray-500">
              {proyectoUsuario.proyecto.descripcion || "Sin descripción"}
            </p>

            <div className="mt-5 flex w-full items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
              <span className="font-medium">{proyectoUsuario.proyecto.archivos.length} archivos</span>
              <span className="rounded-md bg-gray-50 px-2 py-1 font-medium capitalize text-gray-600">{proyectoUsuario.rol_en_proyecto}</span>
            </div>
          </button>
          {
            proyectoUsuario.rol_en_proyecto == "admin_proyect" && user?.role == "admin" && 
            <div className="flex gap-2 px-5 pb-5">
              <button
                type="button"
                aria-label="Editar proyecto"
                onClick={(event) => {
                  event.stopPropagation();
                  setProyectoEnEdicion(proyectoUsuario.proyecto);
                }}
                className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 text-sm font-medium text-purple-800 transition hover:bg-purple-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              >
                <Pencil size={15} aria-hidden="true" />
                Editar
              </button>
              <button
                type="button"
                aria-label={`Eliminar ${proyectoUsuario.proyecto.name}`}
                disabled={deletingProjectId !== null}
                onClick={(event) => {
                  event.stopPropagation();
                  setActionError(null);
                  setProyectoAEliminar(proyectoUsuario);
                }}
                className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 size={15} aria-hidden="true" />
                {deletingProjectId === proyectoUsuario.proyecto.id ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          }

        </article>
        );
      })}
    </div>
  )}
  
  {openModalProyectArchivo && selectProyect && (
    <ModalProyects
      project={selectProyect}
      onClose={() => {
        setOpenModalProyectArchivo(false);
        setSelectProyect(null);
      }}
    />
  )}
  {openModalProyect && (
    <ModalCreateProyect
      onClose={() => setOpenModalProyect(false)}
      onCreated={(project) => {
        setProyectos((currentProyectos) => [project, ...currentProyectos]);
        setSuccessMessage(`El proyecto "${project.proyecto.name}" se creó correctamente.`);
        setOpenModalProyect(false);
      }}
    />
  )}
  {proyectoEnEdicion && (
    <ModalEditarProyecto
      project={proyectoEnEdicion}
      onClose={() => setProyectoEnEdicion(null)}
      onUpdated={(updatedProject) => {
        setProyectos((currentProyectos) =>
          currentProyectos.map((project) =>
            project.proyecto.id === updatedProject.id
              ? { ...project, proyecto: updatedProject }
              : project,
          ),
        );
        setSuccessMessage(`El proyecto "${updatedProject.name}" se actualizó correctamente.`);
        setProyectoEnEdicion(null);
      }}
    />
  )}
  {proyectoAEliminar && (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cancelar eliminación"
        disabled={deletingProjectId !== null}
        onClick={() => {
          setProyectoAEliminar(null);
          setActionError(null);
        }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-project-title"
        aria-describedby="delete-project-description"
        className="relative z-10 w-full max-w-md rounded-xl border border-white/15 bg-[#111] p-6 text-white shadow-2xl"
      >
        <div className="mb-5 flex size-11 items-center justify-center rounded-lg border border-red-400/30 bg-red-500/10 text-red-300">
          <Trash2 size={20} aria-hidden="true" />
        </div>
        <h2 id="delete-project-title" className="text-xl font-semibold">
          ¿Eliminar este proyecto?
        </h2>
        <p id="delete-project-description" className="mt-2 text-sm leading-6 text-white/65">
          Se eliminará <span className="font-medium text-white">{proyectoAEliminar.proyecto.name}</span> y sus archivos. Esta acción no se puede deshacer.
        </p>
        {actionError && <p role="alert" className="mt-4 text-sm text-red-300">{actionError}</p>}
        <div className="mt-6 flex justify-end gap-2 border-t border-white/10 pt-4">
          <button
            type="button"
            autoFocus
            disabled={deletingProjectId !== null}
            onClick={() => {
              setProyectoAEliminar(null);
              setActionError(null);
            }}
            className="min-h-10 rounded-lg border border-white/20 px-4 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={deletingProjectId !== null}
            onClick={() => void handleDeleteProject(proyectoAEliminar)}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 size={15} aria-hidden="true" />
            {deletingProjectId === proyectoAEliminar.proyecto.id ? "Eliminando..." : "Eliminar proyecto"}
          </button>
        </div>
      </section>
    </div>
  )}
  

</div>
  );
}