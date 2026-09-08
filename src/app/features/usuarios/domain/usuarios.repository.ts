import { Observable } from 'rxjs';

import { ActualizarUsuarioCommand, CrearUsuarioCommand, UsuarioAdministracion } from './usuario-administracion.model';

export abstract class UsuariosRepository {
  abstract listar(): Observable<UsuarioAdministracion[]>;
  abstract crear(command: CrearUsuarioCommand): Observable<UsuarioAdministracion>;
  abstract actualizar(id: number, command: ActualizarUsuarioCommand): Observable<UsuarioAdministracion>;
  abstract restablecerContrasena(id: number, nuevaContrasena: string): Observable<void>;
}
