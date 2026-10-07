import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BriefcaseBusiness,
  CalendarDays,
  CircleDollarSign,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  actualizarServicio,
  crearServicio,
  eliminarServicio,
  getServicios,
} from "../../services/api";
import type { CreateServicioPayload, Servicio } from "../../types/types";
import ModalServicio from "../organism/ModalServicio";

function formatDate(value: string | null) {
  if (!value) return "No especificada";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Fecha no válida";
  return new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(date);
}

function formatCost(value: Servicio["costo_renovacion"]) {
  if (value === null || value === "") return "No especificado";
  const cost = Number(value);
  if (!Number.isFinite(cost)) return "No válido";
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency: "USD",
  }).format(cost);
}

function statusStyle(status: string | null) {
  switch (status?.toLowerCase()) {
    case "activo":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "inactivo":
    case "desactivo":
    case "cancelado":
      return "border-gray-200 bg-gray-100 text-gray-600";
    case "vencido":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-purple-200 bg-purple-50 text-purple-700";
  }
}

export default function Servicios() {
  const { accessToken, loading: authLoading, user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Servicio | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Servicio | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!accessToken) {
      setServicios([]);
      setLoading(false);
      setError("Inicia sesión para ver tus servicios.");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    void getServicios(accessToken)
      .then((data) => {
        if (!cancelled) setServicios(data);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudieron cargar tus servicios. Inténtalo de nuevo.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, authLoading]);

  const serviciosFiltrados = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return servicios;
    return servicios.filter((servicio) =>
      [
        servicio.nombre,
        servicio.tipo,
        servicio.estado ?? "",
        servicio.usuario_nombre ?? "",
        servicio.usuario_username ?? "",
        servicio.usuario_correo ?? "",
      ]
        .some((value) => value.toLocaleLowerCase().includes(term)),
    );
  }, [search, servicios]);

  async function saveService(data: CreateServicioPayload) {
    if (!accessToken) throw new Error("Sesión no disponible");
    if (serviceToEdit) {
      await actualizarServicio(accessToken, serviceToEdit.id, data);
    } else {
      await crearServicio(accessToken, data);
    }
    setServicios(await getServicios(accessToken));
    setCreateModalOpen(false);
    setServiceToEdit(null);
  }

  async function deleteService() {
    if (!accessToken || !serviceToDelete || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await eliminarServicio(accessToken, serviceToDelete.id);
      setServicios((current) => current.filter((service) => service.id !== serviceToDelete.id));
      setServiceToDelete(null);
    } catch {
      setError("No se pudo eliminar el servicio. Inténtalo de nuevo.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="w-full p-5 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
              <BriefcaseBusiness size={24} aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {isAdmin ? "Servicios" : "Mis servicios"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isAdmin
                ? "Administra los servicios y las asignaciones a usuarios."
                : "Consulta tus servicios, fechas de expiración y costos de renovación."}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <label className="relative block w-full sm:max-w-xs">
              <span className="sr-only">Buscar servicios</span>
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={isAdmin ? "Buscar servicio o usuario" : "Buscar por nombre, tipo o estado"}
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
              />
            </label>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#7b2cd9] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6823bb]"
              >
                <Plus size={18} aria-hidden="true" />
                Crear servicio
              </button>
            )}
          </div>
        </header>

        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-600">
            {loading ? "Cargando servicios..." : `${serviciosFiltrados.length} servicios`}
          </p>
        </div>

        {error && !loading && (
          <div role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Cargando servicios">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5">
                <div className="mb-5 flex justify-between">
                  <div className="size-11 rounded-xl bg-gray-200" />
                  <div className="h-6 w-20 rounded-full bg-gray-200" />
                </div>
                <div className="mb-3 h-5 w-2/3 rounded bg-gray-200" />
                <div className="mb-6 h-4 w-1/3 rounded bg-gray-100" />
                <div className="h-4 w-full rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : serviciosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 px-5 py-16 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-400 shadow-sm">
              <BriefcaseBusiness size={25} aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {search ? "No hay servicios que coincidan" : "Todavía no tienes servicios"}
            </h2>
            <p className="mt-1 max-w-md text-sm text-gray-500">
              {search
                ? "Prueba con otro nombre, tipo o estado."
                : "Cuando tengas servicios asociados a tu cuenta, aparecerán aquí."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {serviciosFiltrados.map((servicio) => (
              <article
                key={servicio.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-md"
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                    <BriefcaseBusiness size={21} aria-hidden="true" />
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyle(servicio.estado)}`}>
                    {servicio.estado || "Sin estado"}
                  </span>
                </div>

                <h2 className="truncate text-lg font-semibold text-gray-900" title={servicio.nombre}>
                  {servicio.nombre}
                </h2>
                <p className="mt-1 text-sm text-gray-500">{servicio.tipo}</p>
                {isAdmin && (
                  <p className="mt-2 truncate text-xs text-gray-500" title={servicio.usuario_correo}>
                    Asignado a {servicio.usuario_nombre ?? `Usuario #${servicio.fk_id_user}`}
                    {servicio.usuario_correo ? ` · ${servicio.usuario_correo}` : ""}
                  </p>
                )}

                <dl className="mt-5 space-y-3 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <dt className="flex items-center gap-2 text-gray-500">
                      <CalendarDays size={16} aria-hidden="true" />
                      Contratación
                    </dt>
                    <dd className="text-right font-medium text-gray-800">
                      {formatDate(servicio.fecha_contratacion)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <dt className="flex items-center gap-2 text-gray-500">
                      <CalendarDays size={16} aria-hidden="true" />
                      Expiración
                    </dt>
                    <dd className="text-right font-medium text-gray-800">
                      {formatDate(servicio.fecha_expiracion)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <dt className="flex items-center gap-2 text-gray-500">
                      <CircleDollarSign size={16} aria-hidden="true" />
                      Renovación
                    </dt>
                    <dd className="text-right font-medium text-gray-800">
                      {formatCost(servicio.costo_renovacion)}
                    </dd>
                  </div>
                </dl>

                {isAdmin && (
                  <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setServiceToEdit(servicio)}
                      aria-label={`Editar servicio ${servicio.nombre}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                    >
                      <Pencil size={15} aria-hidden="true" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceToDelete(servicio)}
                      aria-label={`Eliminar servicio ${servicio.nombre}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                      Eliminar
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
      {isAdmin && (createModalOpen || serviceToEdit) && (
        <ModalServicio
          service={serviceToEdit}
          onClose={() => {
            setCreateModalOpen(false);
            setServiceToEdit(null);
          }}
          onSave={saveService}
        />
      )}
      {isAdmin && serviceToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Cerrar confirmación de eliminación"
            onClick={() => setServiceToDelete(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-service-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-2xl"
          >
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle size={23} aria-hidden="true" />
            </div>
            <h2 id="delete-service-title" className="text-xl font-semibold">¿Eliminar servicio?</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Se eliminará <span className="font-medium text-gray-900">{serviceToDelete.nombre}</span>. Esta acción no se puede deshacer.
            </p>
            {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setServiceToDelete(null)}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void deleteService()}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
