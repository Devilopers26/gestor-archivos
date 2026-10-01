
export default function PantallaCarga() {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#070807] to-[#8d47f9] flex items-center justify-center">
      
      {/* Contenedor del Loader con la perspectiva 3D */}
      <div className="relative w-16 h-16 rounded-full perspective-midrange">
        
        {/* Aro 1 */}
        <div className="absolute w-full h-full rounded-full left-0 top-0 border-b-[3px] border-[#EFEFFA] animate-rotate-one"></div>
        
        {/* Aro 2 */}
        <div className="absolute w-full h-full rounded-full right-0 top-0 border-r-[3px] border-[#EFEFFA] animate-rotate-two"></div>
        
        {/* Aro 3 */}
        <div className="absolute w-full h-full rounded-full right-0 bottom-0 border-t-[3px] border-[#EFEFFA] animate-rotate-three"></div>
        
      </div>

    </div>
  )
}
