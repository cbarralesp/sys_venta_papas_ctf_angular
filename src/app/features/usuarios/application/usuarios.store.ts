import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';

import { ActualizarUsuarioCommand, CrearUsuarioCommand, UsuarioAdministracion } from '../domain/usuario-administracion.model';
import { UsuariosRepository } from '../domain/usuarios.repository';
import { apiErrorMessage } from '../../../shared/services/api-error-message';

@Injectable()
export class UsuariosStore {
  private readonly repository = inject(UsuariosRepository);

  readonly usuarios = signal<UsuarioAdministracion[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.error.set(null);
    try {
      this.usuarios.set(await firstValueFrom(this.repository.listar()));
    } catch (error) {
      this.error.set(apiErrorMessage(error, 'No fue posible cargar los usuarios.'));
    } finally {
      this.cargando.set(false);
    }
  }

  crear(command: CrearUsuarioCommand): Promise<boolean> {
    return this.ejecutar(() => this.repository.crear(command), 'No fue posible crear el usuario.');
  }

  actualizar(id: number, command: ActualizarUsuarioCommand): Promise<boolean> {
    return this.ejecutar(() => this.repository.actualizar(id, command),
      'No fue posible actualizar el usuario. Debe existir al menos un administrador activo.');
  }

  restablecerContrasena(id: number, nuevaContrasena: string): Promise<boolean> {
    return this.ejecutar(() => this.repository.restablecerContrasena(id, nuevaContrasena),
      'No fue posible restablecer la contraseña.');
  }

  private async ejecutar<T>(request: () => Observable<T>, message: string): Promise<boolean> {
    if (this.guardando()) return false;
    this.guardando.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(request());
      await this.cargar();
      return true;
    } catch (error) {
      this.error.set(apiErrorMessage(error, message));
      return false;
    } finally {
      this.guardando.set(false);
    }
  }
}
