import { Injectable, signal } from '@angular/core';

import { AuthSession, AuthUser } from '../../features/auth/domain/auth.model';

const STORAGE_KEY = 'venta-papas-auth';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly initialSession = this.readStoredSession();
  readonly token = signal<string | null>(this.initialSession?.accessToken ?? null);
  readonly usuario = signal<AuthUser | null>(this.initialSession?.usuario ?? null);

  guardar(session: AuthSession): void {
    this.token.set(session.accessToken);
    this.usuario.set(session.usuario);
    this.storage()?.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  limpiar(): void {
    this.token.set(null);
    this.usuario.set(null);
    this.storage()?.removeItem(STORAGE_KEY);
  }

  private readStoredSession(): AuthSession | null {
    try {
      const value = this.storage()?.getItem(STORAGE_KEY);
      return value ? (JSON.parse(value) as AuthSession) : null;
    } catch {
      return null;
    }
  }

  private storage(): Storage | null {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  }
}
