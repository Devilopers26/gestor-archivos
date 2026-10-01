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
<div className="flex-1 overflow-auto bg-[#070807] p-6 md:p-8">

  {/* Header */}
  <div className="mb-6 flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-medium text-white">Mis proyectos</h1>
      <p className="mt-1 text-sm text-white/40">
        Gestiona y revisa tus proyectos
      </p>
    </div>

    {user?.role === "admin" && (
      <button onClick={() => setOpenModalProyect(true)} className="flex size-11 items-center justify-center rounded-xl bg-[#ff2fa3] text-white transition hover:bg-[#d633b5]">
        <Plus size={20} />
      </button>
    )}
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
    <p className="text-white/40">Cargando proyectos...</p>
  ) : error ? (
    <p className="text-red-400">{error}</p>
  ) : proyectos.length === 0 ? (
    <div className="rounded-2xl bg-[#20201f] p-10 text-center text-white/40">
      No tienes proyectos todavía.
    </div>
  ) : proyectosFiltrados.length === 0 ? (
    <div className="rounded-2xl bg-[#20201f] p-10 text-center text-white/40">
      No hay proyectos que coincidan con los filtros.
    </div>
  ) : (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {proyectosFiltrados.map((proyectoUsuario, index) => {
        return (
        <article
          key={proyectoUsuario.id}
          className=" bg-linear-to-br
                    from-[#111111]
                    via-[#17121f]
                    to-[#7B2CD9]/25

                    border-2 border-white
                    rounded-2xl

                    transition-all duration-300

                    hover:to-[#7B2CD9]/45
                    hover:border-[#7B2CD9]/40
                    hover:shadow-lg  p-6"
          onClick={() => {
            setSelectProyect(proyectoUsuario);
            setOpenModalProyectArchivo(true);
          }}
        >
          <div className="mb-8 flex items-start justify-between ">

            <div
              className=
                "flex size-11 items-center justify-center rounded-xl text-white"
            >
              <Folder size={20} />
            </div>

            <button
              className={`
                flex size-10 items-center justify-center rounded-xl border
                ${
                  index === 0
                    ? "border-white/30 text-white"
                    : "border-white/10 text-white/60"
                }
              `}
            >
              <ArrowUpRight size={18} />
            </button>
          </div>

          <span
            className={`text-xs ${
              index === 0 ? "text-white/70" : "text-white/40"
            }`}
          >
            {proyectoUsuario.proyecto.status.replaceAll("_", " ")}
          </span>

          <h2 className="mt-2 text-xl font-medium text-white">
            {proyectoUsuario.proyecto.name}
          </h2>

          <p
            className={`mt-2 line-clamp-2 text-sm leading-6 ${
              index === 0 ? "text-white/75" : "text-white/45"
            }`}
          >
            {proyectoUsuario.proyecto.descripcion || "Sin descripción"}
          </p>

          <div
            className={`mt-8 flex items-center justify-between border-t pt-4 text-xs ${
              index === 0
                ? "border-white/20 text-white/70"
                : "border-white/6 text-white/40"
            }`}
          >
            <span>{proyectoUsuario.proyecto.archivos.length} archivos</span>
            <span className="capitalize">{proyectoUsuario.rol_en_proyecto}</span>
          </div>
          {
            proyectoUsuario.rol_en_proyecto == "admin_proyect" && user?.role == "admin" && 
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                aria-label="Editar proyecto"
                onClick={(event) => {
                  event.stopPropagation();
                  setProyectoEnEdicion(proyectoUsuario.proyecto);
                }}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-3.5 text-sm font-medium text-[#171117] transition hover:bg-fuchsia-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#ff2fa3]"
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
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/50 bg-white/10 px-3.5 text-sm font-medium text-white transition hover:border-red-500 hover:bg-red-500/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#ff2fa3]"
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
