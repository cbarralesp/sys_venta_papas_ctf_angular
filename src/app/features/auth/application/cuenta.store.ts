import { Injectable, inject, signal } from '@angular/core';

import { AuthRepository } from '../domain/auth.repository';
import { apiErrorMessage } from '../../../shared/services/api-error-message';

@Injectable()
export class CuentaStore {
  private readonly repository = inject(AuthRepository);

  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);
  readonly actualizado = signal(false);

  async cambiarContrasena(contrasenaActual: string, nuevaContrasena: string): Promise<boolean> {
    if (this.guardando()) return false;
    this.guardando.set(true);
    this.error.set(null);
    this.actualizado.set(false);
    try {
      await this.repository.cambiarContrasena(contrasenaActual, nuevaContrasena);
      this.actualizado.set(true);
      return true;
    } catch (error) {
      this.error.set(apiErrorMessage(
        error,
        'No fue posible cambiar la contraseña. Revisa tu contraseña actual.',
      ));
      return false;
    } finally {
      this.guardando.set(false);
    }
  }
}
