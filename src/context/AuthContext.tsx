// context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import axios from "axios";
import { api } from "../services/api";

// tipo User
interface User {
  id: number;
  name: string;
  correo: string;
  username: string;
  numberphone?: string;
  role: string;
}
// tipo Contexto
interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (correo: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
    updateUser: (data: Partial<User>) => void;
  isAuthenticated: boolean;
}
// tipo de Children
interface AuthContextProviderProps {
  children: ReactNode;
}

// contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Al montar la app intenta renovar sesión usando la cookie httpOnly
  useEffect(() => {
    async function tryRefresh() {
      try {
        const res = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        setAccessToken(res.data.accessToken);
        await fetchProfile(res.data.accessToken);
      } catch (err) {
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    }
    tryRefresh();
  }, []);

  // 2. EL INTERCEPTOR: Conectado al estado de React
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response: any) => {
        return response;
      },
      async (error: any) => {
        const originalRequest = error.config;

        // Si es error 401/403, no se ha reintentado, y no es la ruta de refresh
        if (
          (error.response?.status === 401 || error.response?.status === 403) &&
          !originalRequest._retry &&
          originalRequest.url !== "/auth/refresh"
        ) {
          originalRequest._retry = true;

          try {
            // Pide un nuevo token
            const refreshResponse = await axios.post(
              `${API_URL}/auth/refresh`,
              {},
              { withCredentials: true }
            );

            const newAccessToken = refreshResponse.data.accessToken;

            // ACTUALIZA EL ESTADO GLOBAL DE REACT
            setAccessToken(newAccessToken);

            // Inyecta el nuevo token en la petición original y la reintenta
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            // Si el refresh token expiró definitivamente, saca al usuario
            setUser(null);
            setAccessToken(null);
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Limpia el interceptor si el componente se desmonta
    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // funcion para traer al usuario logueado 
  async function fetchProfile(token: string) {
    const res = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(res.data.user);
  }

  // funcion de login
  async function login(correo: string, password: string) {
    const res = await axios.post(
      `${API_URL}/auth/login`,
      { correo, password },
      { withCredentials: true }
    );
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    console.log("Login exitoso:", res.data);
  }

  // funcion de logout
  async function logout() {
    try {
      await axios.post(
        `${API_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  }

  // funcion para actualizar los datos de usuario logueado en memoria
  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser(prev => prev ? { ...prev, ...data } : null);
    }
  };

  const value: AuthContextType = {
    user,
    accessToken,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};