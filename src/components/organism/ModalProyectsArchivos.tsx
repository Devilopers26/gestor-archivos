import { useState } from "react";
import { ArrowUpRight, CircleDot, Download, FileText, Folder, Pencil, Plus, Shield, Trash2, X } from "lucide-react";
import type { ProyectoUsuario, Archivo } from "../../types/types";
import { useAuth } from "../../context/AuthContext";
import { eliminarArchivo } from "../../services/api";
import ModalCrearArchivo from "./ModalCrearArchivo";
import ModalEditarArchivo from "./ModalEditarArchivo";

interface ModalProyectsProps {
  project: ProyectoUsuario;
  onClose: () => void;
}

export default function ModalProyects({ project, onClose }: ModalProyectsProps) {
  const { user, accessToken } = useAuth();
  const [archivos, setArchivos] = useState(project.proyecto.archivos);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [archivoToEdit, setArchivoToEdit] = useState<Archivo | null>(null);
  const [archivoToDelete, setArchivoToDelete] = useState<Archivo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!accessToken || !archivoToDelete) return;
    setIsDeleting(true);
    try {
      await eliminarArchivo(accessToken, archivoToDelete.id);
      setArchivos(prev => prev.filter(a => a.id !== archivoToDelete.id));
      setArchivoToDelete(null);
    } catch (error) {
      console.error("Error al eliminar el archivo:", error);
      alert("No se pudo eliminar el archivo.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button
          type="button"
          aria-label="Cerrar detalles del proyecto"
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-details-title"
          className={`relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-2xl border-3 border-white bg-white p-6 text-gray-900 shadow-2xl transition-[max-width] duration-300 sm:p-8 ${showCreateForm || archivoToEdit ? "max-w-3xl" : "max-w-xl"}`}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={19} />
          </button>

          <header className="pr-12">
            <div className="mb-4 flex size-11 items-center justify-center rounded-xl border border-pink-400/30 bg-pink-400/10 text-pink-300">
              <Folder size={21} aria-hidden="true" />
            </div>
            <h2 id="project-details-title" className="text-2xl font-semibold text-gray-900">
              {project.proyecto.name}
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              {project.proyecto.descripcion || "Sin descripción"}
            </p>
          </header>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Estado</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium capitalize text-gray-900">
                <CircleDot size={15} className="text-pink-400" aria-hidden="true" />
                {project.proyecto.status.replaceAll("_", " ")}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Tu rol</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium capitalize text-gray-900">
                <Shield size={15} className="text-pink-400" aria-hidden="true" />
                {project.rol_en_proyecto}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Archivos</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
                <FileText size={15} className="text-pink-400" aria-hidden="true" />
                {archivos.length}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-5">
            {user?.role === "admin" && project.rol_en_proyecto === "admin_proyect" && (
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="flex w-full items-center justify-between rounded-xl bg-[#ff2fa3] px-4 py-3 text-left font-semibold text-white transition-colors hover:bg-[#d63388] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-400"
              >
                <span>Crear archivo</span>
                <span className="flex size-9 items-center justify-center rounded-lg bg-white/15">
                  <Plus size={19} />
                </span>
              </button>
            )}

            <div className="mt-5 space-y-3">
              <h3 className="text-base font-semibold text-gray-900">
                Archivos del proyecto
              </h3>
              {archivos.length > 0 ? (
                <div className="space-y-2">
                  {archivos.map((archivo) => (
                    <div
                      key={archivo.id}
                      className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2"
                    >
                      <a
                         href={archivo.url_archivo}
                         target="_blank"
                         rel="noreferrer"
                         className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-2 text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-pink-400"
                       >
                         <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-pink-400/20 bg-pink-400/10 text-pink-300">
                           <FileText size={18} aria-hidden="true" />
                         </span>
                         <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
                           {archivo.name}
                         </span>
                         <ArrowUpRight size={17} className="shrink-0 text-gray-500" aria-hidden="true" />
                       </a>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <a
                          href={archivo.url_archivo}
                          download={archivo.name}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Descargar ${archivo.name}`}
                          title="Descargar"
                          className="flex size-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:border-emerald-400/40 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-emerald-400"
                        >
                          <Download size={16} aria-hidden="true" />
                        </a>
                        { user?.role === "admin" && project.rol_en_proyecto === "admin_proyect" && (
                          <>
                            <button
                              type="button"
                              aria-label={`Editar ${archivo.name}`}
                              title="Editar"
                              onClick={() => setArchivoToEdit(archivo)}
                              className="flex size-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:border-sky-400/40 hover:bg-sky-50 hover:text-sky-700 focus-visible:outline-2 focus-visible:outline-sky-400"
                            >
                              <Pencil size={16} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              aria-label={`Eliminar ${archivo.name}`}
                              title="Eliminar"
                              onClick={() => setArchivoToDelete(archivo)}
                              className="flex size-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:border-red-400/40 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-red-400"
                            >
                              <Trash2 size={16} aria-hidden="true" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-gray-300 px-4 py-5 text-sm text-gray-500">
                  Este proyecto aún no tiene archivos.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
            >
              Cerrar
            </button>
          </div>
        </section>
      </div>
      {showCreateForm && (
        <ModalCrearArchivo
          projectId={project.proyecto.id}
          onClose={() => setShowCreateForm(false)}
          onCreated={(archivo) => setArchivos((currentArchivos) => [archivo, ...currentArchivos])}
        />
      )}
      {archivoToEdit && (
        <ModalEditarArchivo
          archivo={archivoToEdit}
          onClose={() => setArchivoToEdit(null)}
          onUpdated={(updatedArchivo) => {
            setArchivos((currentArchivos) =>
              currentArchivos.map((a) => (a.id === updatedArchivo.id ? updatedArchivo : a))
            );
          }}
        />
      )}
      {archivoToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setArchivoToDelete(null)} />
          <section className="relative z-71 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-2xl">
            <div className="mb-5 flex size-12 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
              <Trash2 size={22} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">¿Eliminar archivo?</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              El archivo <span className="font-medium text-gray-900">{archivoToDelete.name}</span> será eliminado del proyecto. Esta acción no se puede deshacer.
            </p>
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setArchivoToDelete(null)}
                disabled={isDeleting}
                className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-sm font-medium text-white hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? "Eliminando..." : "Eliminar archivo"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
