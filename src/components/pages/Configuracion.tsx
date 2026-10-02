import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { actualizarPerfil } from "../../services/api";
import Mensaje from "../molecules/Mensaje";
import { User as UserIcon, Lock, Save, Mail, Phone, Hash, Settings2 } from "lucide-react";

export default function Configuracion() {
  const { user, accessToken, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    correo: "",
    numberphone: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        username: user.username || "",
        correo: user.correo || "",
        numberphone: user.numberphone || ""
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !accessToken) return;

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: any = {
        name: formData.name,
        username: formData.username,
        correo: formData.correo,
        numberphone: formData.numberphone
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await actualizarPerfil(accessToken, user.id, payload);
      
      // Actualizar contexto global
      updateUser({
        name: res.user.name,
        username: res.user.username,
        correo: res.user.correo,
        numberphone: res.user.numberphone
      });

      setSuccess("Perfil actualizado correctamente");
      setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al actualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-[#faf9fc] p-5 md:p-8">
      <div className="mx-auto w-full max-w-4xl">
        <Mensaje
          successMessage={success}
          actionError={error}
          setSuccessMessage={setSuccess}
          setActionError={setError}
        />

        <div className="mb-7 flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#7b2cd9] to-[#c42caa] text-white shadow-md shadow-purple-200">
            <Settings2 size={23} aria-hidden="true" />
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#9a55bf]">Tu cuenta</p>
            <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
            <p className="mt-1 text-sm text-gray-500">Administra tu información personal y contraseña</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <form onSubmit={handleSubmit}>
            <section className="p-5 md:p-7">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Información personal</h2>
                <p className="mt-1 text-sm text-gray-500">Actualiza los datos asociados a tu perfil.</p>
              </div>
            
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Nombre */}
              <div className="space-y-2">
                <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700">Nombre completo</label>
                <div className="relative">
                  <UserIcon size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                  <input
                    id="profile-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#9a55bf] focus:bg-white focus:ring-2 focus:ring-purple-100 [&:-webkit-autofill]:[box-shadow:0_0_0_999px_#f9fafb_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#111827]"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label htmlFor="profile-username" className="block text-sm font-medium text-gray-700">Nombre de usuario</label>
                <div className="relative">
                  <Hash size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                  <input
                    id="profile-username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="username"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#9a55bf] focus:bg-white focus:ring-2 focus:ring-purple-100 [&:-webkit-autofill]:[box-shadow:0_0_0_999px_#f9fafb_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#111827]"
                    placeholder="Tu username"
                    required
                  />
                </div>
              </div>

              {/* Correo */}
              <div className="space-y-2">
                <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                  <input
                    id="profile-email"
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    autoComplete="email"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#9a55bf] focus:bg-white focus:ring-2 focus:ring-purple-100 [&:-webkit-autofill]:[box-shadow:0_0_0_999px_#f9fafb_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#111827]"
                    placeholder="tucorreo@ejemplo.com"
                    required
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
                <div className="relative">
                  <Phone size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                  <input
                    id="profile-phone"
                    type="tel"
                    name="numberphone"
                    value={formData.numberphone}
                    onChange={handleChange}
                    autoComplete="tel"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#9a55bf] focus:bg-white focus:ring-2 focus:ring-purple-100 [&:-webkit-autofill]:[box-shadow:0_0_0_999px_#f9fafb_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#111827]"
                    placeholder="Tu teléfono"
                  />
                </div>
              </div>
            </div>
            </section>

            <section className="border-t border-gray-100 bg-gray-50/70 p-5 md:p-7">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-purple-100 bg-white text-[#8b3fc1]">
                  <Lock size={18} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Cambiar contraseña</h2>
                  <p className="mt-1 text-sm text-gray-500">Déjalo en blanco si no deseas cambiar tu contraseña actual.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Contraseña Nueva */}
                <div className="space-y-2">
                  <label htmlFor="profile-password" className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
                  <div className="relative">
                    <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                    <input
                      id="profile-password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#9a55bf] focus:ring-2 focus:ring-purple-100"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </div>

                {/* Confirmar Contraseña */}
                <div className="space-y-2">
                  <label htmlFor="profile-confirm-password" className="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
                  <div className="relative">
                    <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                    <input
                      id="profile-confirm-password"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#9a55bf] focus:ring-2 focus:ring-purple-100"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="flex justify-end border-t border-gray-100 bg-white p-5 md:px-7">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#c42caa] to-[#7b2cd9] px-5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={17} aria-hidden="true" />
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
