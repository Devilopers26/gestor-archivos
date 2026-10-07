// Tipos para Proyecto
export interface Archivo {
  id: number;
  name: string;
  url_archivo: string;
  tipo_archivo: string | null;
  size_kb: number | null;
  fk_id_proyecto: number;
  fk_id_user_uploader: number | null;
}

export interface Proyecto {
  id: number;
  name: string;
  descripcion: string | null;
  status: string;
  fecha_inicio: string | null;
  fecha_estimada_fin: string | null;
  fk_id_user_creador: number;
  archivos: Archivo[];
}

export interface ProyectoUsuario {
  id: number;
  fk_id_user: number;
  fk_id_proyecto: number;
  rol_en_proyecto: string;
  proyecto: Proyecto;
  proyect_archivos_nr: number
}

export type ProyectoAccessRole = "owner" | "admin_proyect" | "viewer";

export interface AdministrableProject {
  id: number;
  name: string;
  rol_en_proyecto: ProyectoAccessRole | "admin";
}

export interface ProyectoMember {
  id: number;
  fk_id_user: number;
  fk_id_proyecto: number;
  rol_en_proyecto: ProyectoAccessRole;
  name: string;
  username: string;
  correo: string;
}

export interface AvailableProjectUser {
  id: number;
  name: string;
  username: string;
  correo: string;
}

export interface Servicio {
  id: number;
  nombre: string;
  tipo: string;
  fecha_contratacion: string | null;
  fecha_expiracion: string;
  costo_renovacion: number | string | null;
  estado: string | null;
  fk_id_user: number;
  usuario_nombre?: string;
  usuario_username?: string;
  usuario_correo?: string;
}

export interface CreateServicioPayload {
  nombre: string;
  tipo: string;
  fecha_contratacion?: string;
  fecha_expiracion: string;
  costo_renovacion?: number;
  estado: "activo" | "desactivo" | "cancelado";
  fk_id_user: number;
}

export interface ProyectoInterface {
  id: number;
  fk_id_user:number;
  fk_id_proyecto:number;
  rol_en_proyecto:string;
  proyecto_id:number;
  name:string;
  descripcion:string;
  status:string;
  fecha_inicio:string;
  fecha_estimada_fin:string;
  fk_id_user_creador:number;
  proyect_archivos_nr:number;
}

// Payload para crear proyecto
export interface CreateProyectoPayload {
  name: string;
  descripcion?: string;
  status?: string;
  fecha_inicio?: string;
  fecha_estimada_fin?: string;
}

// Payload para crear archivo
export interface CreateArchivoPayload {
  name: string;
  url_archivo: string;
  tipo_archivo?: string;
  size_kb?: number;
  fk_id_proyecto: number;
}
