import { useState, type FormEvent } from "react";
import { Clock3, X } from "lucide-react";
import { crearProyecto } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import type { CreateProyectoPayload, ProyectoUsuario } from "../../types/types";

interface ModalCreateProyectProps {
  onClose: () => void;
  onCreated: (project: ProyectoUsuario) => void;
}

export default function ModalCreateProyect({ onClose, onCreated }: ModalCreateProyectProps) {
  const { accessToken } = useAuth();
  const [form, setForm] = useState<CreateProyectoPayload>({
    name: "",
    descripcion: "",
    status: "en_progreso",
    fecha_inicio: "",
    fecha_estimada_fin: "",
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
      setError("Debes iniciar sesión para crear un proyecto.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await crearProyecto(accessToken, {
        ...form,
        name: form.name.trim(),
        descripcion: form.descripcion?.trim(),
      });
      onCreated({ ...response.proyecto, proyect_archivos_nr: 0 } as ProyectoUsuario);
    } catch {
      setError("No se pudo crear el proyecto. Revisa los datos e inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar formulario de proyecto"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-project-title"
        className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-[#0a0a0a] p-6 shadow-2xl sm:p-8 border-3 border-white"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-lg text-white transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <X size={19} />
        </button>

        <h2 id="create-project-title" className="pr-12 text-2xl font-semibold text-white">
          Crear proyectos
        </h2>
        <p className="mt-1 text-sm text-gray-200">
          Define los datos iniciales del proyecto.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block space-y-1.5 text-sm font-medium text-white">
            Nombre <span className="text-red-500">*</span>
            <input
              required
              autoFocus
              maxLength={255}
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-pink-500"
              placeholder="Ej. Rediseño del sitio web"
            />
          </label>

          <label className="block space-y-1.5 text-sm font-medium text-white">
            Descripción
            <textarea
              rows={3}
              maxLength={2000}
              value={form.descripcion}
              onChange={(event) => updateField("descripcion", event.target.value)}
              className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-pink-500 "
              placeholder="Describe brevemente el objetivo del proyecto"
            />
          </label>
          
          <div className="block space-y-1.5">
            <label className="text-sm font-medium text-white">
                Estado
                </label>
                <select
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
                className="bg-black border border-gray-300 text-white text-sm rounded-lg focus:border-pink-500 block w-full p-2.5"            >
                <option value="en_progreso">En progreso</option>
                <option value="completado">Completado</option>
                <option value="pausado">Pausado</option>
                </select>
           </div>
          

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5 text-sm font-medium text-white">
              <span className="flex items-center gap-2">
                <Clock3 size={15} className="text-pink-400" aria-hidden="true" />
                Fecha de inicio
              </span>
              <input
                type="date"
                value={form.fecha_inicio}
                onChange={(event) => updateField("fecha_inicio", event.target.value)}
                className="block h-12 w-full rounded-xl border border-white/15 bg-white/4 px-3 text-sm font-normal text-white scheme-dark shadow-inner outline-none transition-colors hover:border-white/30 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/15 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-75"
              />
            </label>
            <label className="block space-y-1.5 text-sm font-medium text-white">
              <span className="flex items-center gap-2">
                <Clock3 size={15} className="text-pink-400" aria-hidden="true" />
                Fecha estimada de fin
              </span>
              <input
                type="date"
                min={form.fecha_inicio || undefined}
                value={form.fecha_estimada_fin}
                onChange={(event) => updateField("fecha_estimada_fin", event.target.value)}
                className="block h-12 w-full rounded-xl border border-white/15 bg-white/4 px-3 text-sm font-normal text-white scheme-dark shadow-inner outline-none transition-colors hover:border-white/30 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/15 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-75"
              />
            </label>
           </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#ff2fa3] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d63388] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Creando..." : "Crear proyecto"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
