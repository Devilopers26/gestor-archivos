interface BusquedaProps {
  busqueda: string;
  setBusqueda: (value: string) => void;

  fechaDesde: string;
  setFechaDesde: (value: string) => void;

  fechaHasta: string;
  setFechaHasta: (value: string) => void;

  estado: string;
  setEstado: (value: string) => void;
}

export default function Busqueda({
  busqueda,
  setBusqueda,
  fechaDesde,
  setFechaDesde,
  fechaHasta,
  setFechaHasta,
  estado,
  setEstado,
}: BusquedaProps) {
  return (
    <div className="mb-6 w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        
        {/* Buscador */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Buscar
          </label>

          <input
            type="text"
            placeholder="Buscar proyecto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-[#9a55bf] focus:bg-white focus:ring-2 focus:ring-purple-100"
          />
        </div>

        {/* Fecha desde */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Desde
          </label>

          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#9a55bf] focus:bg-white focus:ring-2 focus:ring-purple-100"
          />
        </div>

        {/* Fecha hasta */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Hasta
          </label>

          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#9a55bf] focus:bg-white focus:ring-2 focus:ring-purple-100"
          />
        </div>

        {/* Estado */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Estado
          </label>

          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#9a55bf] focus:bg-white focus:ring-2 focus:ring-purple-100"
          >
            <option value="">Todos</option>
            <option value="en_progreso">En progreso</option>
            <option value="completado">Completado</option>
            <option value="pausado">Pausado</option>
          </select>
        </div>

      </div>
    </div>
  );
}