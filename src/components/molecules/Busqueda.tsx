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
    <div className="mb-6 w-full rounded-2xl border border-white bg-[#121312] p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        
        {/* Buscador */}
        <div>
          <label className="mb-2 block text-sm text-white">
            Buscar
          </label>

          <input
            type="text"
            placeholder="Buscar proyecto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-white bg-[#20201f] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#ff2fa3]"
          />
        </div>

        {/* Fecha desde */}
        <div>
          <label className="mb-2 block text-sm text-white">
            Desde
          </label>

          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="w-full rounded-xl border border-white bg-[#20201f] px-4 py-3 text-sm text-white outline-none focus:border-[#ff2fa3]"
          />
        </div>

        {/* Fecha hasta */}
        <div>
          <label className="mb-2 block text-sm text-white">
            Hasta
          </label>

          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="w-full rounded-xl border border-white bg-[#20201f] px-4 py-3 text-sm text-white outline-none focus:border-[#ff2fa3]"
          />
        </div>

        {/* Estado */}
        <div>
          <label className="mb-2 block text-sm text-white">
            Estado
          </label>

          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full rounded-xl border border-white bg-[#20201f] px-4 py-3 text-sm text-white outline-none focus:border-[#ff2fa3]"
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