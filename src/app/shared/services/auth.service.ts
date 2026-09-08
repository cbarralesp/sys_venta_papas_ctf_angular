import { Injectable, computed, inject, signal } from '@angular/core';

import { AuthRole } from '../../features/auth/domain/auth.model';
import { AuthRepository } from '../../features/auth/domain/auth.repository';
import { AuthSessionService } from './auth-session.service';
import { apiErrorMessage } from './api-error-message';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly repository = inject(AuthRepository);
  private readonly session = inject(AuthSessionService);

  readonly usuario = this.session.usuario;
  readonly autenticado = computed(() => this.session.token() !== null && this.usuario() !== null);
  readonly error = signal<string | null>(null);

  async login(usuario: string, contrasena: string): Promise<boolean> {
    this.error.set(null);
    try {
      this.session.guardar(await this.repository.login(usuario.trim(), contrasena));
      return true;
    } catch (error) {
      this.session.limpiar();
      this.error.set(apiErrorMessage(error, 'Usuario o contraseña incorrectos'));
      return false;
    }
  }

  logout(): void {
    this.error.set(null);
    this.session.limpiar();
  }

  tieneRol(...roles: AuthRole[]): boolean {
    const rol = this.usuario()?.rol;
    return rol !== undefined && roles.includes(rol);
  }

  rutaInicial(): string {
    return this.tieneRol('COCINA') ? '/cocina' : '/caja';
  }
}
