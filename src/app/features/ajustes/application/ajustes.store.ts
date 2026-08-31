import { Injectable, inject, signal } from '@angular/core';

import { AjustesService } from '../../../shared/services/ajustes.service';
import { AjustesNegocio } from '../domain/ajustes.model';

@Injectable()
export class AjustesStore {
  private readonly ajustesService = inject(AjustesService);

  /** Alias reactivo al servicio compartido */
  readonly ajustes = this.ajustesService.ajustes;

  /** Señal de UI para el feedback de guardado — no pertenece al dominio */
  readonly guardadoRecientemente = signal(false);

  private temporizadorGuardado: ReturnType<typeof setTimeout> | null = null;

  actualizarInformacion(cambios: Partial<AjustesNegocio['informacion']>): void {
    this.ajustesService.actualizarInformacion(cambios);
  }

  actualizarOperativas(cambios: Partial<AjustesNegocio['operativas']>): void {
    this.ajustesService.actualizarOperativas(cambios);
  }

  actualizarNotificaciones(cambios: Partial<AjustesNegocio['notificaciones']>): void {
    this.ajustesService.actualizarNotificaciones(cambios);
  }

  guardarCambios(): void {
    this.guardadoRecientemente.set(true);

    if (this.temporizadorGuardado) {
      clearTimeout(this.temporizadorGuardado);
    }

    this.temporizadorGuardado = setTimeout(() => this.guardadoRecientemente.set(false), 2600);
  }
}
