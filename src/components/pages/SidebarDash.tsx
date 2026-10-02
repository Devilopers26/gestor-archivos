import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Folder,
  File,
  LogOut,
  Settings,
  LayoutDashboard
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import HaderDash from "../atoms/HaderDash";

export default function SidebarDash() {

  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
      isActive
        ? "bg-brand-purple/20 text-brand-purple"
        : "text-gray-300 hover:bg-gray-800"
    }`;

    const arrayNavLink = [
      {name: "Dashboard", to: "/", icon: <LayoutDashboard size={20} />},
      {name: "Mis Proyectos", to: "/proyects", icon: <Folder size={20} />},
      {name: "Accesos", to: "/access", icon: <File size={20} />}
    ]

  return (
    <div className="h-screen bg-[#0A0A0A] flex overflow-hidden">

      {/* Sidebar */}
    <aside className="w-64 h-screen shrink-0 bg-linear-to-b from-black to-[#7B2CD9]/30 text-brand-white flex flex-col">

        <div className="p-6">
          <img src="/DevLogoda.png" alt="logo" />
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {arrayNavLink.map((navlink) => (
            <NavLink
              key={navlink.name}
              to={navlink.to}
              end={navlink.to === "/"}
              className={navClass}
            >
              {navlink.icon}
              <span className="font-medium">{navlink.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">

          <NavLink
            to="/settings"
            className={navClass}
          >
            <Settings size={20} />
            <span className="font-medium">Configuración</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 hover:bg-gray-800 text-gray-300 px-4 py-3 rounded-xl transition-colors mt-2"
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>

        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 h-screen flex flex-col overflow-hidden bg-white ">

        <HaderDash />
        <div className=" border border-amber-50"></div>
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>

      </main>

    </div>
  );
}