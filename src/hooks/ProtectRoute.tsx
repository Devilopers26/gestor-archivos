import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PantallaCarga from "../components/atoms/PantallaCarga";

export default function ProtectRoute() {
    const { accessToken, loading, user } = useAuth();
    
    if (loading) {
        return <PantallaCarga/>; 
    }
    
    if (!accessToken || !user) {
        return <Navigate to="/login" replace />;
    }
    
    return <Outlet />;
}