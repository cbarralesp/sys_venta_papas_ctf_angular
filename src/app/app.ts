import { Component, effect, inject, signal, untracked } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AjustesService } from './shared/services/ajustes.service';
import { AuthService } from './shared/services/auth.service';
import { AuthRole } from './features/auth/domain/auth.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly ajustesService = inject(AjustesService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly menuOpen = signal(false);

  /** Información del negocio reactiva desde AjustesService */
  readonly negocio = this.ajustesService.ajustes;

  /** Estado de autenticación para mostrar/ocultar el shell */
  readonly autenticado = this.authService.autenticado;

  constructor() {
    effect(() => {
      if (this.autenticado()) untracked(() => void this.ajustesService.cargar());
    });
  }

  puede(...roles: AuthRole[]): boolean {
    return this.authService.tieneRol(...roles);
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.menuOpen.set(false);
    this.router.navigate(['/login']);
  }
}
