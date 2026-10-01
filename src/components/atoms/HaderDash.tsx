import { User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
export default function HaderDash() {
    const { user } = useAuth();
  return (
    <div>
        {/* Header */}
        <header className="bg-[#0A0A0A] border-gray-200 h-16 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-white text-2xl font-sans font-bold">Dashboard</h2>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-white font-medium">{user?.name}</span>
            <div className="w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center text-white font-bold shadow-md">
              <User size={20} />
            </div>
          </div>
        </header>
    </div>
  )
}
