import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../../../shared/config/api.config';
import { AuthSession, AuthUser } from '../domain/auth.model';
import { AuthRepository } from '../domain/auth.repository';

@Injectable()
export class AuthApiRepository implements AuthRepository {
  private readonly http = inject(HttpClient);

  login(usuario: string, contrasena: string): Promise<AuthSession> {
    return firstValueFrom(
      this.http.post<AuthSession>(`${API_BASE_URL}/auth/login`, { usuario, contrasena }),
    );
  }

  usuarioActual(): Promise<AuthUser> {
    return firstValueFrom(this.http.get<AuthUser>(`${API_BASE_URL}/auth/me`));
  }

  cambiarContrasena(contrasenaActual: string, nuevaContrasena: string): Promise<void> {
    return firstValueFrom(
      this.http.put<void>(`${API_BASE_URL}/auth/contrasena`, { contrasenaActual, nuevaContrasena }),
    );
  }
}
