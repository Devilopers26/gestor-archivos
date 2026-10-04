import { Menu, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface HaderDashProps {
  onMenuClick: () => void;
}

export default function HaderDash({ onMenuClick }: HaderDashProps) {
    const { user } = useAuth();
  return (
    <div className="border-b-2 border-black">
        {/* Header */}
        <header className="flex h-16 items-center justify-between bg-white px-4 shadow-sm sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Abrir menú"
              className="flex size-10 shrink-0 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 md:hidden"
            >
              <Menu size={21} />
            </button>
            <h2 className="truncate text-lg font-bold text-black sm:text-2xl">Dashboard</h2>
          </div>
          <div className="flex min-w-0 items-center space-x-2 sm:space-x-3">
            <span className="max-w-32 truncate text-sm font-medium text-black sm:max-w-56">{user?.name}</span>
            <div className="w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center text-white font-bold shadow-md">
              <User size={20} />
            </div>
          </div>
        </header>
    </div>
  )
}
