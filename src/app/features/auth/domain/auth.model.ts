export type AuthRole = 'ADMIN' | 'CAJA' | 'COCINA';

export interface AuthUser {
  id: number;
  usuario: string;
  nombre: string;
  rol: AuthRole;
}

export interface AuthSession {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  usuario: AuthUser;
}
