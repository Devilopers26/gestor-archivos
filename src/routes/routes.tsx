import { Routes, Route } from "react-router-dom";
import Home from "../components/pages/Home";
import Login from "../components/pages/Login";
import SidebarDash from "../components/pages/SidebarDash";
import Proyects from "../components/pages/Proyects";
import Access from "../components/pages/Access";
import Configuracion from "../components/pages/Configuracion";
import ProtectRoute from "../hooks/ProtectRoute";

// 1. Cambiamos el nombre a "AppRoutes" (los componentes siempre van en mayúscula)
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login/>} />

      <Route element={<ProtectRoute />}>
        
        <Route path="/" element={<SidebarDash/>}>
          <Route index element={<Home/>}/>
          <Route path="proyects" element={<Proyects/>}/>
          <Route path="access" element={<Access/>}/>
          <Route path="settings" element={<Configuracion/>}/>
        </Route>

      </Route>
    </Routes>
  )
}