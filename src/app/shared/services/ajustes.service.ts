import { Injectable, signal } from '@angular/core';

import { AjustesNegocio } from '../../features/ajustes/domain/ajustes.model';

/**
 * Servicio raíz singleton para la configuración del negocio.
 * Permite que todos los módulos (Caja, Cocina, App shell, etc.) lean
 * y reaccionen a los ajustes en tiempo real cuando se guardan desde
 * el módulo Ajustes.
 */
@Injectable({ providedIn: 'root' })
export class AjustesService {
  readonly ajustes = signal<AjustesNegocio>({
    informacion: {
      nombre: 'Panel del negocio',
      subtitulo: 'Sistema de ventas',
      icono: '🍟',
    },
    operativas: {
      moneda: 'CLP',
      impuestoPorcentaje: 0,
      tiempoEstimadoPreparacionMin: 8,
    },
    notificaciones: {
      sonidoNuevoPedido: true,
      alertaPedidoDemorado: true,
      minutosParaAlertaDemora: 10,
    },
  });

  actualizarInformacion(cambios: Partial<AjustesNegocio['informacion']>): void {
    this.ajustes.update((actual) => ({
      ...actual,
      informacion: { ...actual.informacion, ...cambios },
    }));
  }

  actualizarOperativas(cambios: Partial<AjustesNegocio['operativas']>): void {
    this.ajustes.update((actual) => ({
      ...actual,
      operativas: { ...actual.operativas, ...cambios },
    }));
  }

  actualizarNotificaciones(cambios: Partial<AjustesNegocio['notificaciones']>): void {
    this.ajustes.update((actual) => ({
      ...actual,
      notificaciones: { ...actual.notificaciones, ...cambios },
    }));
  }
}
