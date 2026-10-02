import { useState, useEffect } from "react";
import { Folder, File, User, FileText, TrendingUp, Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getProyectosDash } from "../../services/api";
import type { ProyectoInterface } from "../../types/types";

export default function Home() {
  const { user, accessToken } = useAuth();
  const [proyectos, setProyectos] = useState<ProyectoInterface[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProyectos() {
    if (!accessToken) return;
    try {
      const data = await getProyectosDash(accessToken);
      setProyectos(data);
    } catch (error) {
      console.error("Error cargando proyectos:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProyectos();
  }, [accessToken]);

  const totalProyectos = proyectos.length;
  const totalArchivos = proyectos.reduce((acc, p) => acc + (p.proyect_archivos_nr || 0), 0);

  function statusBadge(status: string) {
    const styles: Record<string, string> = {
      en_progreso: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      completado: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      pausado: "bg-gray-100 text-gray-600 border border-gray-200",
    };
    return styles[status] || "bg-gray-100 text-gray-600 border border-gray-200";
  }

  const stats = [
    {
      title: "Proyectos Recientes",
      count: String(totalProyectos),
      icon: Folder,
      iconBg: "bg-purple-50 border border-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Archivos Recientes",
      count: String(totalArchivos),
      icon: File,
      iconBg: "bg-pink-50 border border-pink-100",
      iconColor: "text-pink-600",
    },
    {
      title: "Tu Rol",
      count: user?.role || "-",
      icon: User,
      iconBg: "bg-gray-50 border border-gray-200",
      iconColor: "text-gray-600",
    },
  ];

  return (
    <div className="flex-1 overflow-auto p-10 md:p-10 flex flex-col items-center w-full">
      <div className="w-full ">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-[#7B2CD9] to-[#c42caa] shadow-md shadow-purple-500/20">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                ¡Hola, {user?.name || "de nuevo"}!
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Aquí tienes un resumen de tus proyectos y actividad reciente.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-5 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300"
            >
              <div className={`flex size-14 shrink-0 items-center justify-center rounded-xl ${stat.iconBg}`}>
                <stat.icon size={24} className={stat.iconColor} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 truncate">{stat.count}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Projects Section */}
        <div>
          <div className="flex items-center gap-2.5 mb-6">
            <Clock size={20} className="text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900">Proyectos Recientes</h2>
          </div>

          {loading ? (
            // Skeleton Loading Claro
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-gray-100 bg-gray-50 p-6 animate-pulse">
                  <div className="flex justify-between items-start mb-5">
                    <div className="h-12 w-12 rounded-xl bg-gray-200" />
                    <div className="h-6 w-20 bg-gray-200 rounded-full" />
                  </div>
                  <div className="h-5 bg-gray-200 rounded mb-3 w-3/4" />
                  <div className="h-4 bg-gray-200 rounded mb-6 w-full" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 pt-4 border-t border-gray-200" />
                </div>
              ))}
            </div>
          ) : proyectos.length === 0 ? (
            // Empty State Claro
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 py-24 text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 mb-5">
                <Folder size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-900 text-lg font-semibold">No tienes proyectos aún.</p>
              <p className="text-gray-500 text-sm mt-1.5">Crea uno nuevo desde la sección Proyectos.</p>
            </div>
          ) : (
            // Cards de Proyectos Claros
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proyectos.map((pu) => (
                <div
                  key={pu.id}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-purple-300 hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-[#7B2CD9] to-[#c42caa] shadow-md shadow-purple-500/20 text-white group-hover:scale-105 transition-transform">
                      <Folder size={22} />
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusBadge(pu.status)}`}>
                      {pu.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Card Body */}
                  <h3 className="font-bold text-gray-900 mb-2 text-lg truncate">
                    {pu.name}
                  </h3>
                  <p className="text-gray-500 mb-6 line-clamp-2 text-sm leading-relaxed grow">
                    {pu.descripcion || "Sin descripción proporcionada para este proyecto."}
                  </p>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                      <FileText size={16} className="text-pink-500" />
                      {pu.proyect_archivos_nr || "0"} archivos
                    </span>
                    <span className="bg-purple-50 border border-purple-100 px-3 py-1 rounded-full text-xs font-bold text-purple-700">
                      {pu.rol_en_proyecto}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}