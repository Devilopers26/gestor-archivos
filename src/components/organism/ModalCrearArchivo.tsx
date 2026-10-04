import { useState, type ChangeEvent, type FormEvent } from "react";
import { CloudUpload, Link2, Upload, X } from "lucide-react";
import { subirArchivo } from "../../services/api";
import type { Archivo, CreateArchivoPayload } from "../../types/types";
import { useAuth } from "../../context/AuthContext";

type SourceMode = "cloudinary" | "url";

interface CloudinaryUploadResponse {
  secure_url?: string;
  error?: { message?: string };
}

interface ModalCrearArchivoProps {
  projectId: number;
  onClose: () => void;
  onCreated: (archivo: Archivo) => void;
}

export default function ModalCrearArchivo({
  projectId,
  onClose,
  onCreated,
}: ModalCrearArchivoProps) {
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [urlArchivo, setUrlArchivo] = useState("");
  const [tipoArchivo, setTipoArchivo] = useState("");
  const [sizeKb, setSizeKb] = useState("");
  const [sourceMode, setSourceMode] = useState<SourceMode>("cloudinary");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setError(null);
    if (file) {
      if (!name.trim()) setName(file.name.replace(/\.[^/.]+$/, ""));
      setTipoArchivo(file.type || tipoArchivo);
      setSizeKb((file.size / 1024).toFixed(2));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("El nombre del archivo es obligatorio.");
      return;
    }
    if (!accessToken) {
      setError("Debes iniciar sesión para crear un archivo.");
      return;
    }

    if (sourceMode === "url" && !urlArchivo.trim()) {
      setError("Ingresa la URL completa del archivo.");
      return;
    }
    if (sourceMode === "cloudinary" && !selectedFile) {
      setError("Selecciona un archivo para subir a Cloudinary.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      let finalUrl = urlArchivo.trim();

      if (sourceMode === "cloudinary" && selectedFile) {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
        if (!cloudName || !uploadPreset) {
          throw new Error("Configura VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET para habilitar la carga.");
        }

        const uploadData = new FormData();
        uploadData.append("file", selectedFile);
        uploadData.append("upload_preset", uploadPreset);

        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/auto/upload`,
          { method: "POST", body: uploadData },
        );
        const cloudinaryResult = await cloudinaryResponse.json() as CloudinaryUploadResponse;
        if (!cloudinaryResponse.ok || !cloudinaryResult.secure_url) {
          throw new Error(cloudinaryResult.error?.message || "Cloudinary no pudo subir el archivo.");
        }
        finalUrl = cloudinaryResult.secure_url;
      }

      const payload: CreateArchivoPayload = {
        name: name.trim(),
        url_archivo: finalUrl,
        fk_id_proyecto: projectId,
        ...(tipoArchivo.trim() && { tipo_archivo: tipoArchivo.trim() }),
        ...(sizeKb !== "" && { size_kb: Number(sizeKb) }),
      };

      const response = await subirArchivo(accessToken, payload);
      onCreated(response.archivo as Archivo);
      onClose();
    } catch (caughtError: unknown) {
      if (caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError("No se pudo guardar el archivo. Inténtalo de nuevo.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar formulario de archivo"
        onClick={onClose}
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-file-title"
        className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border-2 border-gray-200 bg-black p-4 shadow-2xl sm:p-6"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <X size={19} />
        </button>
        <h2 id="create-file-title" className="pr-10 text-xl font-semibold text-white">
          Agregar archivo
        </h2>
        <p className="mt-1 text-sm text-gray-200">
          Completa los datos del archivo del proyecto.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block space-y-1.5 text-sm font-medium text-white">
            Nombre <span className="text-red-500">*</span>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={255}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-pink-500"
              placeholder="Ej. Informe final"
            />
          </label>
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-white">Origen del archivo</legend>
            <div className="grid grid-cols-1 gap-2 rounded-xl bg-gray-100 p-1 sm:grid-cols-2">
              <button
                type="button"
                aria-pressed={sourceMode === "cloudinary"}
                onClick={() => {
                  setSourceMode("cloudinary");
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${sourceMode === "cloudinary" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
              >
                <CloudUpload size={17} aria-hidden="true" />
                Subir a Cloudinary
              </button>
              <button
                type="button"
                aria-pressed={sourceMode === "url"}
                onClick={() => {
                  setSourceMode("url");
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${sourceMode === "url" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
              >
                <Link2 size={17} aria-hidden="true" />
                Usar URL
              </button>
            </div>

            {sourceMode === "cloudinary" ? (
              <label className="block cursor-pointer rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center transition-colors hover:border-amber-400 hover:bg-amber-50">
                <Upload size={21} className="mx-auto mb-2 text-gray-500" aria-hidden="true" />
                <span className="block text-sm font-medium text-gray-700">
                  {selectedFile ? selectedFile.name : "Selecciona un archivo para subir"}
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} KB` : "El archivo se enviará a Cloudinary al guardar"}
                </span>
                <input
                  required
                  type="file"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            ) : (
              <label className="block space-y-1.5 text-sm font-medium text-white">
                URL completa del archivo <span className="text-red-500">*</span>
                <input
                  required
                  type="url"
                  value={urlArchivo}
                  onChange={(event) => {
                    setUrlArchivo(event.target.value);
                    setError(null);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-pink-500"
                  placeholder="https://..."
                />
              </label>
            )}
          </fieldset>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5 text-sm font-medium text-white">
              Tipo
              <input
                value={tipoArchivo}
                onChange={(event) => setTipoArchivo(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-pink-500"
                placeholder="PDF, imagen..."
              />
            </label>
            <label className="block space-y-1.5 text-sm font-medium text-white">
              Tamaño (KB)
              <input
                type="number"
                min="0"
                step="any"
                value={sizeKb}
                onChange={(event) => setSizeKb(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-pink-500"
                placeholder="Opcional"
              />
            </label>
          </div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-[#ff2fa3] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d63388] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving ? "Guardando..." : "Guardar archivo"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}