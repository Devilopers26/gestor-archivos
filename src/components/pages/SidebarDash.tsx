import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Folder,
  File,
  LogOut,
  Settings,
  LayoutDashboard,
  BriefcaseBusiness,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import FooterDash from "../atoms/FooterDash";
import HaderDash from "../atoms/HaderDash";

export default function SidebarDash() {

  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
      {name: "Accesos", to: "/access", icon: <File size={20} />},
      {name: "Servicios", to: "/services", icon: <BriefcaseBusiness size={20} />}
    ]

  return (
      <div className="flex h-dvh overflow-hidden bg-[#0A0A0A]">

      {/* Sidebar */}
    {mobileNavOpen && (
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={() => setMobileNavOpen(false)}
        className="fixed inset-0 z-30 bg-black/60 md:hidden"
      />
    )}
    <aside className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-64 shrink-0 flex-col bg-linear-to-b from-black to-[#7B2CD9]/30 text-brand-white transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}>

        <div className="p-6">
          <img src="/DevLogoda.png" alt="logo" className="mx-auto h-auto w-full max-w-40" />
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {arrayNavLink.map((navlink) => (
            <NavLink
              key={navlink.name}
              to={navlink.to}
              end={navlink.to === "/"}
              className={navClass}
              onClick={() => setMobileNavOpen(false)}
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
            onClick={() => setMobileNavOpen(false)}
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
      <main className="flex h-dvh min-w-0 flex-1 flex-col overflow-hidden bg-white">

        <HaderDash onMenuClick={() => setMobileNavOpen(true)} />
        <div className=" border border-amber-50"></div>
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
        <FooterDash />

      </main>

    </div>
  );
}