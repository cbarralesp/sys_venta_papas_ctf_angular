export type RolUsuario = 'ADMIN' | 'CAJA' | 'COCINA';

export interface UsuarioAdministracion {
  id: number;
  nombreUsuario: string;
  nombreVisible: string;
  rol: RolUsuario;
  activo: boolean;
  bloqueadoHasta: string | null;
}

export interface CrearUsuarioCommand {
  nombreUsuario: string;
  nombreVisible: string;
  contrasena: string;
  rol: RolUsuario;
}

export interface ActualizarUsuarioCommand {
  nombreVisible: string;
  rol: RolUsuario;
  activo: boolean;
}
