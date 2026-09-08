import { AuthSession, AuthUser } from './auth.model';

export abstract class AuthRepository {
  abstract login(usuario: string, contrasena: string): Promise<AuthSession>;
  abstract usuarioActual(): Promise<AuthUser>;
  abstract cambiarContrasena(contrasenaActual: string, nuevaContrasena: string): Promise<void>;
}
