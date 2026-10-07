import { useEffect, useState, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { buscarUsuariosServicios } from "../../services/api";
import type { AvailableProjectUser, CreateServicioPayload, Servicio } from "../../types/types";

interface ModalServicioProps {
  service?: Servicio | null;
  onClose: () => void;
  onSave: (data: CreateServicioPayload) => Promise<void>;
}

export default function ModalServicio({ service, onClose, onSave }: ModalServicioProps) {
  const { accessToken } = useAuth();
  const [name, setName] = useState(service?.nombre ?? "");
  const [type, setType] = useState(service?.tipo ?? "");
  const [contractDate, setContractDate] = useState(service?.fecha_contratacion?.slice(0, 10) ?? "");
  const [expirationDate, setExpirationDate] = useState(service?.fecha_expiracion?.slice(0, 10) ?? "");
  const [cost, setCost] = useState(
    service?.costo_renovacion === null || service?.costo_renovacion === undefined
      ? ""
      : String(service.costo_renovacion),
  );
  const [status, setStatus] = useState<CreateServicioPayload["estado"]>(
    service?.estado === "desactivo" || service?.estado === "cancelado"
      ? service.estado
      : "activo",
  );
  const [userQuery, setUserQuery] = useState("");
  const [users, setUsers] = useState<AvailableProjectUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AvailableProjectUser | null>(
    service
      ? {
          id: service.fk_id_user,
          name: service.usuario_nombre ?? `Usuario #${service.fk_id_user}`,
          username: service.usuario_username ?? "",
          correo: service.usuario_correo ?? "",
        }
      : null,
  );
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setLoadingUsers(false);
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      setLoadingUsers(true);
      void buscarUsuariosServicios(accessToken, userQuery.trim())
        .then((results) => {
          if (!cancelled) setUsers(results.slice(0, 3));
        })
        .catch(() => {
          if (!cancelled) setError("No se pudieron buscar usuarios.");
        })
        .finally(() => {
          if (!cancelled) setLoadingUsers(false);
        });
    }, userQuery ? 250 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [accessToken, userQuery]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUser) {
      setError("Busca y selecciona un usuario para asignarle el servicio.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave({
        nombre: name.trim(),
        tipo: type.trim(),
        fecha_contratacion: contractDate || undefined,
        fecha_expiracion: expirationDate,
        costo_renovacion: cost === "" ? undefined : Number(cost),
        estado: status,
        fk_id_user: selectedUser.id,
      });
    } catch {
      setError("No se pudo guardar el servicio. Revisa los datos e inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar formulario de servicio"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-modal-title"
        className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <X size={19} />
        </button>
        <h2 id="service-modal-title" className="pr-12 text-2xl font-semibold">
          {service ? "Editar servicio" : "Crear servicio"}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Completa los datos y selecciona el usuario propietario.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="service-user-search" className="block text-sm font-medium">
              Usuario <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="service-user-search"
                type="search"
                value={userQuery}
                onChange={(event) => {
                  setUserQuery(event.target.value);
                  setSelectedUser(null);
                  setError(null);
                }}
                placeholder="Buscar por nombre, usuario o correo"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
              />
            </div>
            {selectedUser && (
              <p className="text-xs text-purple-700">
                Seleccionado: {selectedUser.name} ({selectedUser.correo})
              </p>
            )}
            {loadingUsers ? (
              <p className="text-xs text-gray-500">Buscando usuarios...</p>
            ) : users.length > 0 ? (
              <ul className="space-y-1 rounded-lg border border-gray-200 p-1" aria-label="Hasta tres usuarios encontrados">
                {users.map((user) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(user);
                        setError(null);
                      }}
                      aria-pressed={selectedUser?.id === user.id}
                      className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                        selectedUser?.id === user.id
                          ? "bg-purple-50 text-purple-800"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <span className="block text-sm font-medium">{user.name}</span>
                      <span className="block text-xs text-gray-500">
                        @{user.username} · {user.correo}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500">No se encontraron usuarios.</p>
            )}
          </div>

          <label className="block space-y-1.5 text-sm font-medium">
            Nombre <span className="text-red-600">*</span>
            <input
              required
              maxLength={150}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-purple-500"
            />
          </label>

          <label className="block space-y-1.5 text-sm font-medium">
            Tipo <span className="text-red-600">*</span>
            <input
              required
              maxLength={50}
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-purple-500"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5 text-sm font-medium">
              Fecha de contratación
              <input
                type="date"
                value={contractDate}
                onChange={(event) => setContractDate(event.target.value)}
                className="block h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-normal outline-none focus:border-purple-500"
              />
            </label>
            <label className="block space-y-1.5 text-sm font-medium">
              Fecha de expiración <span className="text-red-600">*</span>
              <input
                required
                type="date"
                value={expirationDate}
                onChange={(event) => setExpirationDate(event.target.value)}
                className="block h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-normal outline-none focus:border-purple-500"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5 text-sm font-medium">
              Costo de renovación
              <input
                type="number"
                min="0"
                max="99999999.99"
                step="0.01"
                value={cost}
                onChange={(event) => setCost(event.target.value)}
                className="block h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-normal outline-none focus:border-purple-500"
              />
            </label>
            <label className="block space-y-1.5 text-sm font-medium">
              Estado
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as CreateServicioPayload["estado"])}
                className="block h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-normal outline-none focus:border-purple-500"
              >
                <option value="activo">Activo</option>
                <option value="desactivo">Desactivo</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </label>
          </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || loadingUsers}
              className="rounded-lg bg-[#7b2cd9] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6823bb] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Guardando..." : service ? "Guardar cambios" : "Crear servicio"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
