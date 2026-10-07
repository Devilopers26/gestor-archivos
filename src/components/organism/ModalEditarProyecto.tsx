
import { useState, type FormEvent } from "react";
import { Clock3, X } from "lucide-react";
import { actualizarProyecto } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import type { CreateProyectoPayload, Proyecto } from "../../types/types";

interface ModalEditarProyectoProps {
  project: Proyecto;
  onClose: () => void;
  onUpdated: (project: Proyecto) => void;
}

export default function ModalEditarProyecto({ project, onClose, onUpdated }: ModalEditarProyectoProps) {
  const { accessToken } = useAuth();
  const [form, setForm] = useState<CreateProyectoPayload>({
    name: project.name,
    descripcion: project.descripcion ?? "",
    status: project.status,
    fecha_inicio: project.fecha_inicio?.slice(0, 10) ?? "",
    fecha_estimada_fin: project.fecha_estimada_fin?.slice(0, 10) ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof CreateProyectoPayload>(
    field: K,
    value: CreateProyectoPayload[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) {
      setError("Debes iniciar sesión para editar el proyecto.");
      return;
    }
    if (form.fecha_inicio && form.fecha_estimada_fin && form.fecha_estimada_fin < form.fecha_inicio) {
      setError("La fecha estimada de fin no puede ser anterior a la fecha de inicio.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await actualizarProyecto(accessToken, project.id, {
        ...form,
        name: form.name.trim(),
        descripcion: form.descripcion?.trim(),
        fecha_inicio: form.fecha_inicio || undefined,
        fecha_estimada_fin: form.fecha_estimada_fin || undefined,
      });
      onUpdated({ ...project, ...response.proyecto, archivos: project.archivos });
    } catch {
      setError("No se pudo actualizar el proyecto. Revisa los datos e inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar formulario de edición"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-project-title"
        className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border-3 border-white bg-white p-6 text-gray-900 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <X size={19} />
        </button>

        <h2 id="edit-project-title" className="pr-12 text-2xl font-semibold text-gray-900">
          Editar proyecto
        </h2>
        <p className="mt-1 text-sm text-gray-600">Actualiza los datos del proyecto.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block space-y-1.5 text-sm font-medium text-gray-900">
            Nombre <span className="text-red-400">*</span>
            <input
              required
              autoFocus
              maxLength={255}
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/15"
            />
          </label>

          <label className="block space-y-1.5 text-sm font-medium text-gray-900">
            Descripción
            <textarea
              rows={3}
              maxLength={2000}
              value={form.descripcion}
              onChange={(event) => updateField("descripcion", event.target.value)}
              className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal text-gray-900 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/15"
            />
          </label>

          <label className="block space-y-1.5 text-sm font-medium text-gray-900">
            Estado
            <select
              value={form.status}
              onChange={(event) => updateField("status", event.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-pink-500"
            >
              <option value="en_progreso">En progreso</option>
              <option value="completado">Completado</option>
              <option value="pausado">Pausado</option>
            </select>
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5 text-sm font-medium text-gray-900">
              <span className="flex items-center gap-2">
                <Clock3 size={15} className="text-pink-400" aria-hidden="true" />
                Fecha de inicio
              </span>
              <input
                type="date"
                max={form.fecha_estimada_fin || undefined}
                value={form.fecha_inicio}
                onChange={(event) => updateField("fecha_inicio", event.target.value)}
                className="block h-12 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-normal text-gray-900 scheme-light outline-none transition-colors hover:border-gray-400 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/15 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            </label>
            <label className="block space-y-1.5 text-sm font-medium text-gray-900">
              <span className="flex items-center gap-2">
                <Clock3 size={15} className="text-pink-400" aria-hidden="true" />
                Fecha estimada de fin
              </span>
              <input
                type="date"
                min={form.fecha_inicio || undefined}
                value={form.fecha_estimada_fin}
                onChange={(event) => updateField("fecha_estimada_fin", event.target.value)}
                className="block h-12 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-normal text-gray-900 scheme-light outline-none transition-colors hover:border-gray-400 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/15 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
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
              disabled={saving}
              className="rounded-lg bg-[#ff2fa3] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d63388] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
