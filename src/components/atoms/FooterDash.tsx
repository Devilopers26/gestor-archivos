import { Folder, LayoutDashboard, Settings, Users, Ellipsis } from "lucide-react";
import { NavLink } from "react-router-dom";

const footerRoutes = [
  { label: "Inicio", to: "/", icon: LayoutDashboard, end: true },
  { label: "Proyectos", to: "/proyects", icon: Folder },
  { label: "Accesos", to: "/access", icon: Users },
  { label: "Ajustes", to: "/settings", icon: Settings },
  { label: "mas", to: "/#", icon: Ellipsis }
];

export default function FooterDash() {
  return (
    <footer className="shrink-0 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <nav aria-label="Navegación principal">
        <ul className="flex min-h-16 items-stretch">
          {footerRoutes.map(({ label, to, icon: Icon, end }) => (
            <li key={to} className="min-w-0 flex-1">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex h-full min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition-colors ${
                    isActive ? "text-[#7b2cd9]" : "text-gray-500 hover:text-gray-900"
                  }`
                }
              >
                <Icon size={20} strokeWidth={2} aria-hidden="true" />
                <span className="truncate">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}