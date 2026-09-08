import { Injectable, computed, inject, signal } from '@angular/core';

import { PedidosService } from '../../../shared/services/pedidos.service';
import { MetricasDiariasService } from '../../../shared/services/metricas-diarias.service';
import { EstadoPedido, FiltroEstadoPedido } from '../domain/pedido-gestion.model';

@Injectable()
export class PedidosStore {
  private readonly pedidosService = inject(PedidosService);
  private readonly metricasService = inject(MetricasDiariasService);

  readonly filtroEstado = signal<FiltroEstadoPedido>('Todos');
  readonly busqueda = signal('');
  readonly pedidoSeleccionadoId = signal<number | null>(null);

  private readonly estados: EstadoPedido[] = [
    'Pendiente',
    'En preparación',
    'Listo',
    'Entregado',
    'Cancelado',
  ];

  /** Todos los pedidos del sistema (fuente de verdad compartida) */
  readonly pedidos = this.pedidosService.pedidos;
  readonly cargando = this.pedidosService.cargando;
  readonly error = this.pedidosService.error;
  readonly errorMetricas = this.metricasService.error;
  readonly guardando = this.pedidosService.guardando;

  readonly filtros = computed<readonly FiltroEstadoPedido[]>(() => ['Todos', ...this.estados]);

  readonly pedidosFiltrados = computed(() => {
    const estado = this.filtroEstado();
    const termino = this.busqueda().trim().toLocaleLowerCase('es-CL');

    return this.pedidos().filter((pedido) => {
      const coincideEstado = estado === 'Todos' || pedido.estado === estado;
      const coincideBusqueda =
        termino === '' || pedido.numero.toLocaleLowerCase('es-CL').includes(termino);
      return coincideEstado && coincideBusqueda;
    });
  });

  readonly pedidoSeleccionado = computed(
    () => this.pedidos().find((pedido) => pedido.id === this.pedidoSeleccionadoId()) ?? null,
  );

  readonly totalPedidosHoy = computed(() => this.metricasService.metricas().pedidosCreados);

  constructor() {
    void this.metricasService.cargar();
  }

  async sincronizar(): Promise<boolean> {
    const sincronizado = await this.pedidosService.cargar();
    if (sincronizado) void this.metricasService.cargar();
    return sincronizado;
  }

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
    void this.pedidosService.buscarPorId(id);
  }

  cerrarDetalle(): void {
    this.pedidoSeleccionadoId.set(null);
  }

  async avanzarEstado(id: number): Promise<boolean> {
    const siguiente: Partial<Record<EstadoPedido, EstadoPedido>> = {
      Pendiente: 'En preparación',
      'En preparación': 'Listo',
      Listo: 'Entregado',
    };

    const pedido = this.pedidos().find((p) => p.id === id);
    if (!pedido) return false;
    const nuevoEstado = siguiente[pedido.estado];
    if (nuevoEstado) {
      return this.pedidosService.actualizarEstado(id, nuevoEstado);
    }
    return false;
  }

  etiquetaSiguienteEstado(estado: EstadoPedido): string | null {
    const etiquetas: Partial<Record<EstadoPedido, string>> = {
      Pendiente: 'Marcar como en preparación',
      'En preparación': 'Marcar como listo',
      Listo: 'Marcar como entregado',
    };
    return etiquetas[estado] ?? null;
  }

  cancelar(id: number, motivo: string): Promise<boolean> {
    return this.pedidosService.cancelar(id, motivo);
  }
}
