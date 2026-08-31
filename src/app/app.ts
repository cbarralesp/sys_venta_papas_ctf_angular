import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AjustesService } from './shared/services/ajustes.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly ajustesService = inject(AjustesService);

  readonly menuOpen = signal(false);

  /** Información del negocio reactiva desde AjustesService */
  readonly negocio = this.ajustesService.ajustes;

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
