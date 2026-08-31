import { Injectable, computed, inject, signal } from '@angular/core';

import { PedidosService } from '../../../shared/services/pedidos.service';
import { EstadoPedido, FiltroEstadoPedido } from '../domain/pedido-gestion.model';

@Injectable()
export class PedidosStore {
  private readonly pedidosService = inject(PedidosService);

  readonly filtroEstado = signal<FiltroEstadoPedido>('Todos');
  readonly busqueda = signal('');
  readonly pedidoSeleccionadoId = signal<number | null>(null);

  private readonly estados: EstadoPedido[] = ['Pendiente', 'En preparación', 'Listo', 'Entregado', 'Cancelado'];

  /** Todos los pedidos del sistema (fuente de verdad compartida) */
  readonly pedidos = this.pedidosService.pedidos;

  readonly filtros = computed<readonly FiltroEstadoPedido[]>(() => ['Todos', ...this.estados]);

  readonly pedidosFiltrados = computed(() => {
    const estado = this.filtroEstado();
    const termino = this.busqueda().trim().toLocaleLowerCase('es-CL');

    return this.pedidos().filter((pedido) => {
      const coincideEstado = estado === 'Todos' || pedido.estado === estado;
      const coincideBusqueda = termino === '' || pedido.numero.toLocaleLowerCase('es-CL').includes(termino);
      return coincideEstado && coincideBusqueda;
    });
  });

  readonly pedidoSeleccionado = computed(
    () => this.pedidos().find((pedido) => pedido.id === this.pedidoSeleccionadoId()) ?? null,
  );

  readonly totalPedidosHoy = computed(() => this.pedidos().length);

  contarPorEstado(estado: FiltroEstadoPedido): number {
    return estado === 'Todos'
      ? this.pedidos().length
      : this.pedidos().filter((p) => p.estado === estado).length;
  }

  seleccionarFiltro(estado: FiltroEstadoPedido): void {
    this.filtroEstado.set(estado);
  }

  buscar(termino: string): void {
    this.busqueda.set(termino);
  }

  seleccionarPedido(id: number): void {
    this.pedidoSeleccionadoId.set(id);
  }

  cerrarDetalle(): void {
    this.pedidoSeleccionadoId.set(null);
  }

  avanzarEstado(id: number): void {
    const siguiente: Partial<Record<EstadoPedido, EstadoPedido>> = {
      Pendiente: 'En preparación',
      'En preparación': 'Listo',
      Listo: 'Entregado',
    };

    const pedido = this.pedidos().find((p) => p.id === id);
    if (!pedido) return;
    const nuevoEstado = siguiente[pedido.estado];
    if (nuevoEstado) {
      this.pedidosService.actualizarEstado(id, nuevoEstado);
    }
  }

  etiquetaSiguienteEstado(estado: EstadoPedido): string | null {
    const etiquetas: Partial<Record<EstadoPedido, string>> = {
      Pendiente: 'Marcar como en preparación',
      'En preparación': 'Marcar como listo',
      Listo: 'Marcar como entregado',
    };
    return etiquetas[estado] ?? null;
  }
}
