import { Mail, Lock, Loader2, Users, Shield, Zap } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Mensaje from "../molecules/Mensaje";

export default function Login() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(correo, password);
      navigate("/");
    } catch (error: any) {
      console.error("Error en el login:", error.response?.data?.error || error.message);
      setLoginError(error.response?.data?.error || "Error al iniciar sesión");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] flex items-center justify-center p-4 md:p-8 font-sans relative">
      
      {/* Componente de Mensajes (Posicionado arriba al centro para que no rompa el diseño) */}
      <div className="absolute top-4 left-0 w-full flex justify-center z-50 px-4">
        <Mensaje
          successMessage={null}
          actionError={loginError}
          setSuccessMessage={() => {}}
          setActionError={setLoginError}
        />
      </div>

      {/* Contenedor Principal (Tarjeta Dividida) */}
      <div className="bg-white w-full max-w-275 min-h-150 rounded-4xl shadow-2xl flex overflow-hidden">
        
        {/* COLUMNA IZQUIERDA: Información (Oculta en móviles, visible en pantallas grandes) */}
        <div className="w-1/2 bg-gray-50 hidden lg:flex flex-col justify-center p-12 xl:p-16 border-r border-gray-100 relative">
          <div className="max-w-md mx-auto z-10">
            {/* Línea decorativa */}
            <div className="w-10 h-0.75 bg-gray-700 rounded-full mb-8"></div>
            
            {/* Título principal */}
            <h1 className="text-gray-800 text-4xl 
              xl:text-5xl font-bold leading-[1.1] tracking-tight mb-5">
              Bienvenido de <br /> nuevo
            </h1>

            {/* Párrafo descriptivo */}
            <p className="text-gray-500 text-base xl:text-lg mb-12 leading-relaxed">
              Inicia sesión para continuar y acceder a todas tus herramientas desde un solo lugar.
            </p>

            {/* Contenedor de las características */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 shrink-0">
                  <Zap className="w-6 h-6 text-gray-800" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm xl:text-base">Mayor productividad</h3>
                  <p className="text-gray-500 text-sm">Gestiona todo en un solo lugar.</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 shrink-0">
                  <Shield className="w-6 h-6 text-gray-800" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm xl:text-base">Seguro y confiable</h3>
                  <p className="text-gray-500 text-sm">Tus datos siempre protegidos.</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 shrink-0">
                  <Users className="w-6 h-6 text-gray-800" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm xl:text-base">Acceso en cualquier lugar</h3>
                  <p className="text-gray-500 text-sm">Desde tu computadora o móvil.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Formulario de Login */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 xl:p-16 bg-white">
          <div className="w-full max-w-sm mx-auto">
  
            {/* Encabezado del Formulario */}
            <div className="text-center lg:text-left mb-10">
              <div className="flex justify-center mb-6">
                <img src="/favicon1.png" alt="Logo" className="h-18 w-auto" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Iniciar sesión</h2>
              <p className="text-gray-500 text-sm">Ingresa tus credenciales para continuar.</p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Input Correo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
                  </div>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                    placeholder="tucorreo@ejemplo.com"
                    required
                  />
                </div>
              </div>

              {/* Input Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Enlace para móviles */}
              <div className="mt-8 text-center ">
                <span className="text-sm text-gray-500">
                  ¿No tienes una cuenta? <a href="#" className="font-semibold text-gray-900">Regístrate</a>
                </span>
              </div>

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#7b2cd9] hover:bg-[#4F1A9E] text-white rounded-xl py-3.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Iniciando...
                  </>
                ) : (
                  "Iniciar sesión →"
                )}
              </button>
            </form>



          </div>
        </div>
      </div>
    </div>
  );
}