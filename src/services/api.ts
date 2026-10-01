import axios from "axios";
import type {
  AvailableProjectUser,
  AdministrableProject,
  CreateProyectoPayload,
  CreateArchivoPayload,
  ProyectoAccessRole,
  ProyectoMember,
} from "../types/types";

const API_URL = import.meta.env.VITE_API_URL;

// ==========================================
// 1. CONFIGURACIÓN DE LA INSTANCIA DE AXIOS
// ==========================================
// NOTA: El interceptor ahora vive en AuthContext.tsx
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Vital para enviar las cookies
});

// ==========================================
// 2. HELPER Y FUNCIONES
// ==========================================

// Helper para crear headers con el token
function authHeaders(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

// PROYECTO-USUARIO

export async function getProyectos(token: string) {
  const res = await api.get(`/proyecto-usuario`, authHeaders(token));
  return res.data.proyectos;
}

export async function getProyectosDash(token: string) {
  const res = await api.get(`/proyecto-usuario/dash`, authHeaders(token));
  return res.data;
}

export async function getProyecto(token: string, idProyecto: number) {
  const res = await api.get(`/proyecto-usuario/${idProyecto}`, authHeaders(token));
  return res.data.proyecto;
}

export async function crearProyecto(token: string, data: CreateProyectoPayload) {
  const res = await api.post(`/proyecto-usuario`, data, authHeaders(token));
  return res.data;
}

export async function actualizarProyecto(token: string, idProyecto: number, data: Partial<CreateProyectoPayload>) {
  const res = await api.put(`/proyecto-usuario/${idProyecto}`, data, authHeaders(token));
  return res.data;
}

export async function eliminarProyecto(token: string, idProyecto: number) {
  const res = await api.delete(`/proyecto-usuario/${idProyecto}`, authHeaders(token));
  return res.data;
}

export async function getProyectosAdministrables(token: string): Promise<AdministrableProject[]> {
  const res = await api.get(`/proyecto-usuario/administrables`, authHeaders(token));
  return res.data.proyectos;
}

export async function getMiembrosProyecto(token: string, idProyecto: number): Promise<ProyectoMember[]> {
  const res = await api.get(`/proyecto-usuario/miembros/${idProyecto}`, authHeaders(token));
  return res.data.miembros;
}

export async function buscarUsuariosDisponibles(
  token: string,
  idProyecto: number,
  busqueda: string,
): Promise<AvailableProjectUser[]> {
  const res = await api.get(`/proyecto-usuario/usuarios-disponibles/${idProyecto}`, {
    ...authHeaders(token),
    params: { q: busqueda },
  });
  return res.data.usuarios;
}

export async function agregarColaborador(
  token: string,
  data: { fk_id_user: number; fk_id_proyecto: number; rol_en_proyecto: ProyectoAccessRole },
) {
  const res = await api.post(`/proyecto-usuario/colaborador`, data, authHeaders(token));
  return res.data;
}

export async function actualizarRolColaborador(
  token: string,
  idRelacion: number,
  rol_en_proyecto: ProyectoAccessRole,
) {
  const res = await api.put(
    `/proyecto-usuario/colaborador/${idRelacion}`,
    { rol_en_proyecto },
    authHeaders(token),
  );
  return res.data;
}

export async function eliminarColaborador(token: string, idRelacion: number) {
  const res = await api.delete(`/proyecto-usuario/colaborador/${idRelacion}`, authHeaders(token));
  return res.data;
}

// ===================== ARCHIVOS =====================

export async function getArchivos(token: string, idProyecto: number) {
  const res = await api.get(`/archivos/proyecto/${idProyecto}`, authHeaders(token));
  return res.data.archivos;
}

export async function subirArchivo(token: string, data: CreateArchivoPayload) {
  const res = await api.post(`/archivos`, data, authHeaders(token));
  return res.data;
}

export async function eliminarArchivo(token: string, idArchivo: number) {
  const res = await api.delete(`/archivos/${idArchivo}`, authHeaders(token));
  return res.data;
}

export async function actualizarArchivo(token: string, idArchivo: number, data: Partial<CreateArchivoPayload>) {
  const res = await api.put(`/archivos/${idArchivo}`, data, authHeaders(token));
  return res.data;
}

// ===================== USUARIOS =====================

export async function actualizarPerfil(
  token: string,
  idUsuario: number,
  data: {
    name?: string;
    username?: string;
    correo?: string;
    numberphone?: string;
    password?: string;
  }
) {
  const res = await api.put(`/auth/${idUsuario}`, data, authHeaders(token));
  return res.data;
}