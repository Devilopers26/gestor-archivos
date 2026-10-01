import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { actualizarPerfil } from "../../services/api";
import Mensaje from "../molecules/Mensaje";
import { User as UserIcon, Lock, Save, Mail, Phone, Hash } from "lucide-react";

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
    <div className="flex-1 overflow-auto bg-[#070807] p-10 flex flex-col items-center w-full">
      <div className="w-full max-w-3xl">
        <Mensaje
          successMessage={success}
          actionError={error}
          setSuccessMessage={setSuccess}
          setActionError={setError}
        />

        <div className="mb-8">
          <h1 className="text-3xl font-medium text-white">Configuración</h1>
          <p className="mt-1 text-sm text-white/40">
            Administra tu información personal y contraseña
          </p>
        </div>

        <div className="bg-linear-to-br from-[#111111] via-[#17121f] to-[#7B2CD9]/10 border-2 border-white/5 rounded-2xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Nombre Completo</label>
                <div className="relative">
                  <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border border-white/15 bg-[#111] pl-11 pr-4 text-sm text-white outline-none focus:border-[#7B2CD9] transition-colors [&:-webkit-autofill]:[box-shadow:0_0_0_999px_#111_inset] [&:-webkit-autofill]:text-white"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Nombre de Usuario</label>
                <div className="relative">
                  <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border border-white/15 bg-[#111] pl-11 pr-4 text-sm text-white outline-none focus:border-[#7B2CD9] transition-colors [&:-webkit-autofill]:[box-shadow:0_0_0_999px_#111_inset] [&:-webkit-autofill]:text-white"
                    placeholder="Tu username"
                    required
                  />
                </div>
              </div>

              {/* Correo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Correo Electrónico</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border border-white/15 bg-[#111] pl-11 pr-4 text-sm text-white outline-none focus:border-[#7B2CD9] transition-colors [&:-webkit-autofill]:[box-shadow:0_0_0_999px_#111_inset] [&:-webkit-autofill]:text-white"
                    placeholder="tucorreo@ejemplo.com"
                    required
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Teléfono</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="tel"
                    name="numberphone"
                    value={formData.numberphone}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border border-white/15 bg-[#111] pl-11 pr-4 text-sm text-white outline-none focus:border-[#7B2CD9] transition-colors [&:-webkit-autofill]:[box-shadow:0_0_0_999px_#111_inset] [&:-webkit-autofill]:text-white"
                    placeholder="Tu teléfono"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 mt-6">
              <h3 className="text-lg font-medium text-white mb-4">Cambiar Contraseña</h3>
              <p className="text-xs text-white/40 mb-4">Déjalo en blanco si no deseas cambiar tu contraseña actual.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contraseña Nueva */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Nueva Contraseña</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="h-12 w-full rounded-xl border border-white/15 bg-[#111] pl-11 pr-4 text-sm text-white outline-none focus:border-[#7B2CD9] transition-colors [&:-webkit-autofill]:[box-shadow:0_0_0_999px_#111_inset] [&:-webkit-autofill]:text-white"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </div>

                {/* Confirmar Contraseña */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Confirmar Contraseña</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="h-12 w-full rounded-xl border border-white/15 bg-[#111] pl-11 pr-4 text-sm text-white outline-none focus:border-[#7B2CD9] transition-colors [&:-webkit-autofill]:[box-shadow:0_0_0_999px_#111_inset] [&:-webkit-autofill]:text-white"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="h-12 px-8 flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-brand-pink to-brand-purple text-white font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <Save size={18} />
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
