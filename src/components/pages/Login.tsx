import { Mail, Lock, Loader2 } from "lucide-react"; // Importamos Loader2
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
    <div className="min-h-screen bg-linear-to-br from-[#070807] to-[#8d47f9] flex items-center justify-center p-4">
      <Mensaje
        successMessage={null}
        actionError={loginError}
        setSuccessMessage={() => {}}
        setActionError={setLoginError}
      />
      {/* Contenedor principal de la tarjeta */}
      <div className="bg-brand-white w-full max-w-5xl rounded-[3rem] shadow-2xl flex overflow-hidden min-h-150 relative">
        
        <div className="absolute top-0 left-0 w-[45%] h-full">
          <div className="absolute inset-0 bg-brand-purple" style={{ clipPath: 'polygon(0 0, 100% 0, 65% 100%, 0% 100%)', borderRadius: '3rem 0 0 3rem' }}></div>
          <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-brand-purple to-brand-pink opacity-80" style={{ clipPath: 'polygon(0 0, 100% 0, 80% 50%, 65% 100%, 0% 100%)' }}></div>
        </div>

        {/* Lado izquierdo (Ilustración / Decoración) */}
        <div className="w-1/2 relative z-10 hidden md:flex flex-col items-center justify-center p-10">
           <div className="w-64 h-96 bg-brand-white rounded-3xl shadow-lg border-4 border-gray-100 flex flex-col relative z-20">
              <div className="flex-1 flex flex-col items-center justify-center p-4">
                 <div className="w-12 h-12 bg-brand-purple rounded-full flex items-center justify-center mb-4">
                   <Lock className="text-brand-white w-6 h-6" />
                 </div>
                 <h3 className="font-bold text-lg mb-6">Password</h3>
                 <div className="flex gap-2 mb-8">
                   {[1,2,3,4,5].map(i => (
                     <div key={i} className="w-6 h-6 border rounded border-gray-300 flex items-center justify-center">
                        <span className="text-brand-purple text-xs">*</span>
                     </div>
                   ))}
                 </div>
                 <button className="bg-brand-purple text-brand-white px-8 py-2 rounded-full font-semibold text-sm w-full">
                   Done
                 </button>
              </div>
           </div>
        </div>

        {/* Lado derecho (Formulario) */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-10 z-10">
          
          <div className="w-full max-w-sm">
            {/* Ícono superior / Decoración */}
            <div className="flex justify-center mb-8">
              <img src="/favicon1.png" alt="" width="100" height="50" />
            </div>

            <h2 className="text-3xl font-light text-center text-gray-700 mb-10">Inicio de Sesión</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="relative">
                <label className="text-xs text-gray-400 font-semibold mb-1 block uppercase">Correo Electrónico</label>
                <div className="flex items-end border-b-2 border-brand-purple pb-1">
                  <Mail className="text-brand-purple w-5 h-5 mr-3 mb-1" />
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="w-full focus:outline-none text-brand-black bg-transparent text-sm pb-1 font-medium"
                    placeholder=""
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="relative pt-4">
                <label className="text-xs text-gray-400 font-semibold mb-1 block uppercase">Contraseña</label>
                <div className="flex items-end border-b-2 border-gray-300 pb-1">
                  <Lock className="text-gray-400 w-5 h-5 mr-3 mb-1" />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    className="w-full focus:outline-none text-brand-black bg-transparent text-sm pb-1 font-medium"
                  />
                </div>
              </div>

              {/* Olvidaste / Necesitas cuenta */}
              <div className="flex justify-end pt-2">
                <a href="#" className="text-xs text-gray-500 hover:text-brand-purple font-medium">
                  ¿Necesitas una Cuenta?
                </a>
              </div>

              {/* Botón de inicio */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-purple hover:bg-[#6c1fc2] text-brand-white rounded-full py-3 font-semibold transition-colors duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Iniciando...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}