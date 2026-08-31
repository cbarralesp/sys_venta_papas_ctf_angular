import { Injectable, computed, inject, signal } from '@angular/core';

import { PedidosService } from '../../../shared/services/pedidos.service';
import { EstadoCocina, ItemPedidoCocina, PedidoCocina } from '../domain/pedido-cocina.model';

interface KitchenTiming {
  horaInicioPreparacion: Date | null;
  horaListo: Date | null;
}

@Injectable()
export class CocinaStore {
  private readonly pedidosService = inject(PedidosService);

  readonly ahora = signal(new Date());

  /**
   * Mapa local con los tiempos de preparación de cada pedido.
   * Se pre-popula con datos razonables para pedidos semilla que ya están
   * en estado "En preparación" o "Listo".
   */
  private readonly tiemposCocina = signal<Map<number, KitchenTiming>>(
    this.buildInitialTimings(),
  );

  /** Pedidos activos en cocina (Pendiente, En preparación o Listo) */
  readonly pedidos = computed<PedidoCocina[]>(() => {
    const tiempos = this.tiemposCocina();
    return this.pedidosService
      .pedidos()
      .filter((p) => p.estado === 'Pendiente' || p.estado === 'En preparación' || p.estado === 'Listo')
      .map((p) => {
        const timing = tiempos.get(p.id);
        return {
          id: p.id,
          numero: p.numero,
          items: p.items.map(
            (i): ItemPedidoCocina => ({
              nombre: i.nombre,
              cantidad: i.cantidad,
              icono: i.icono ?? '🍽️',
            }),
          ),
          solicitadoPor: 'Caja',
          estado: p.estado as EstadoCocina,
          horaSolicitud: p.creadoEn,
          horaInicioPreparacion: timing?.horaInicioPreparacion ?? null,
          horaListo: timing?.horaListo ?? null,
        };
      });
  });

  readonly pendientes = computed(() => this.pedidos().filter((p) => p.estado === 'Pendiente'));
  readonly enPreparacion = computed(() => this.pedidos().filter((p) => p.estado === 'En preparación'));
  readonly listos = computed(() => this.pedidos().filter((p) => p.estado === 'Listo'));

  readonly pedidosActivos = computed(
    () => this.pendientes().length + this.enPreparacion().length + this.listos().length,
  );

  /** Pedidos marcados como Entregado hoy */
  readonly completadosHoy = computed(() => {
    const hoy = new Date();
    return this.pedidosService
      .pedidos()
      .filter((p) => {
        const d = p.creadoEn;
        return (
          p.estado === 'Entregado' &&
          d.getFullYear() === hoy.getFullYear() &&
          d.getMonth() === hoy.getMonth() &&
          d.getDate() === hoy.getDate()
        );
      }).length;
  });

  actualizarReloj(): void {
    this.ahora.set(new Date());
  }

  tiempoTranscurrido(pedido: PedidoCocina): string {
    if (!pedido.horaInicioPreparacion) return '00:00';
    const diffMs = this.ahora().getTime() - pedido.horaInicioPreparacion.getTime();
    const totalSegundos = Math.max(0, Math.floor(diffMs / 1000));
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = totalSegundos % 60;
    return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
  }

  formatearHora(fecha: Date): string {
    return fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  }

  comenzarPreparacion(id: number): void {
    this.pedidosService.actualizarEstado(id, 'En preparación');
    this.tiemposCocina.update((map) => {
      const nuevo = new Map(map);
      nuevo.set(id, { horaInicioPreparacion: new Date(), horaListo: null });
      return nuevo;
    });
  }

  marcarComoListo(id: number): void {
    this.pedidosService.actualizarEstado(id, 'Listo');
    this.tiemposCocina.update((map) => {
      const nuevo = new Map(map);
      const existente = nuevo.get(id);
      nuevo.set(id, {
        horaInicioPreparacion: existente?.horaInicioPreparacion ?? new Date(),
        horaListo: new Date(),
      });
      return nuevo;
    });
  }

  entregarPedido(id: number): void {
    this.pedidosService.actualizarEstado(id, 'Entregado');
    this.tiemposCocina.update((map) => {
      const nuevo = new Map(map);
      nuevo.delete(id);
      return nuevo;
    });
  }

  /**
   * Pre-popula el mapa de tiempos para los pedidos semilla que ya tienen
   * un estado intermedio (En preparación / Listo).
   */
  private buildInitialTimings(): Map<number, KitchenTiming> {
    const map = new Map<number, KitchenTiming>();
    for (const pedido of this.pedidosService.pedidos()) {
      if (pedido.estado === 'En preparación') {
        map.set(pedido.id, {
          horaInicioPreparacion: pedido.creadoEn,
          horaListo: null,
        });
      } else if (pedido.estado === 'Listo') {
        map.set(pedido.id, {
          horaInicioPreparacion: pedido.creadoEn,
          horaListo: new Date(pedido.creadoEn.getTime() + 4 * 60_000),
        });
      }
    }
    return map;
  }
}
