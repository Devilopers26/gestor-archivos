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
      en_progreso: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
      completado: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
      pausado: "bg-white/10 text-white/50 border border-white/15",
    };
    return styles[status] || "bg-white/10 text-white/50 border border-white/15";
  }

  const stats = [
    {
      title: "Proyectos Recientes",
      count: String(totalProyectos),
      icon: Folder,
      gradient: "from-[#7B2CD9]/20 to-[#7B2CD9]/5",
      iconBg: "bg-[#7B2CD9]/20 border border-[#7B2CD9]/30",
      iconColor: "text-[#c084fc]",
    },
    {
      title: "Archivos Recientes",
      count: String(totalArchivos),
      icon: File,
      gradient: "from-[#c42caa]/20 to-[#c42caa]/5",
      iconBg: "bg-[#c42caa]/20 border border-[#c42caa]/30",
      iconColor: "text-pink-300",
    },
    {
      title: "Tu Rol",
      count: user?.role || "-",
      icon: User,
      gradient: "from-white/5 to-white/2",
      iconBg: "bg-white/10 border border-white/15",
      iconColor: "text-white/60",
    },
  ];

  return (
    <div className="flex-1 overflow-auto bg-[#070807] p-10 flex flex-col items-center w-full">
      <div className="w-full max-w-350">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-[#7B2CD9] to-[#c42caa] shadow-lg">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-white">
                ¡Hola, {user?.name || "de nuevo"}!
              </h1>
              <p className="text-sm text-white/40">
                Aquí tienes un resumen de tus proyectos y actividad reciente.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`bg-linear-to-br ${stat.gradient} border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:border-white/20 transition-colors`}
            >
              <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${stat.iconBg}`}>
                <stat.icon size={20} className={stat.iconColor} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-white/40 mb-0.5">{stat.title}</p>
                <p className="text-xl font-semibold text-white truncate">{stat.count}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Projects Section */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Clock size={18} className="text-white/40" />
            <h2 className="text-lg font-medium text-white">Proyectos Recientes</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/3 p-6 animate-pulse">
                  <div className="h-12 w-12 rounded-xl bg-white/10 mb-4" />
                  <div className="h-4 bg-white/10 rounded mb-2 w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                </div>
              ))}
            </div>
          ) : proyectos.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 py-20 text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 mb-4">
                <Folder size={28} className="text-white/30" />
              </div>
              <p className="text-white/50 text-base font-medium">No tienes proyectos aún.</p>
              <p className="text-white/30 text-sm mt-1">Crea uno nuevo desde la sección Proyectos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proyectos.map((pu) => (
                <div
                  key={pu.id}
                  className="bg-linear-to-br from-[#111111] via-[#17121f] to-[#7B2CD9]/20 border border-white/10 rounded-2xl p-6 hover:border-white/25 transition-colors group"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-[#7B2CD9] to-[#c42caa] shadow-md text-white">
                      <Folder size={22} />
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge(pu.status)}`}>
                      {pu.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Card Body */}
                  <h3 className="font-semibold text-white mb-1.5 text-base uppercase tracking-wide truncate">
                    {pu.name}
                  </h3>
                  <p className="text-white/40 mb-5 line-clamp-2 text-sm leading-relaxed">
                    {pu.descripcion || "Sin descripción"}
                  </p>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="flex items-center gap-1.5 text-sm text-white/50">
                      <FileText size={15} className="text-pink-400" />
                      {pu.proyect_archivos_nr || "0"} archivos
                    </span>
                    <span className="bg-[#7B2CD9]/20 border border-[#7B2CD9]/30 px-2.5 py-0.5 rounded-full text-xs font-medium text-[#c084fc]">
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
