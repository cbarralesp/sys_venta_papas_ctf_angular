import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../../shared/config/api.config';
import { ActualizarUsuarioCommand, CrearUsuarioCommand, UsuarioAdministracion } from '../domain/usuario-administracion.model';
import { UsuariosRepository } from '../domain/usuarios.repository';

@Injectable()
export class UsuariosApiRepository implements UsuariosRepository {
  private readonly http = inject(HttpClient);

  listar(): Observable<UsuarioAdministracion[]> {
    return this.http.get<UsuarioAdministracion[]>(`${API_BASE_URL}/usuarios`);
  }

  crear(command: CrearUsuarioCommand): Observable<UsuarioAdministracion> {
    return this.http.post<UsuarioAdministracion>(`${API_BASE_URL}/usuarios`, command);
  }

  actualizar(id: number, command: ActualizarUsuarioCommand): Observable<UsuarioAdministracion> {
    return this.http.put<UsuarioAdministracion>(`${API_BASE_URL}/usuarios/${id}`, command);
  }

  restablecerContrasena(id: number, nuevaContrasena: string): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/usuarios/${id}/contrasena`, { nuevaContrasena });
  }
}
