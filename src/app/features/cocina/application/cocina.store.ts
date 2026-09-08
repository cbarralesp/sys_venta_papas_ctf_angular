import { Injectable, computed, inject, signal } from '@angular/core';

import { PedidosService } from '../../../shared/services/pedidos.service';
import { AjustesService } from '../../../shared/services/ajustes.service';
import { MetricasDiariasService } from '../../../shared/services/metricas-diarias.service';
import { EstadoCocina, ItemPedidoCocina, PedidoCocina } from '../domain/pedido-cocina.model';
import { NotificadorCocina } from '../domain/notificador-cocina';

@Injectable()
export class CocinaStore {
  private readonly pedidosService = inject(PedidosService);
  private readonly ajustesService = inject(AjustesService);
  private readonly notificador = inject(NotificadorCocina);
  private readonly metricasService = inject(MetricasDiariasService);

  readonly ahora = signal(new Date());
  readonly guardando = this.pedidosService.guardando;
  readonly error = this.pedidosService.error;
  readonly errorMetricas = this.metricasService.error;
  readonly tiempoEstimadoPreparacionMin = computed(
    () => this.ajustesService.ajustes().operativas.tiempoEstimadoPreparacionMin,
  );

  constructor() {
    void this.metricasService.cargar();
  }

  readonly pedidos = computed<PedidoCocina[]>(() =>
    this.pedidosService
      .pedidos()
      .filter((p) => p.estado === 'Pendiente' || p.estado === 'En preparación' || p.estado === 'Listo')
      .map((p) => ({
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
        horaInicioPreparacion: p.iniciadoPreparacionEn ?? null,
        horaListo: p.listoEn ?? null,
      })),
  );

  readonly pendientes = computed(() => this.pedidos().filter((p) => p.estado === 'Pendiente'));
  readonly enPreparacion = computed(() => this.pedidos().filter((p) => p.estado === 'En preparación'));
  readonly listos = computed(() => this.pedidos().filter((p) => p.estado === 'Listo'));
  readonly pedidosActivos = computed(
    () => this.pendientes().length + this.enPreparacion().length + this.listos().length,
  );

  readonly completadosHoy = computed(() => this.metricasService.metricas().entregados);
  readonly fechaMetricas = computed(() => this.metricasService.metricas().fecha);
  readonly tiempoPromedioPreparacionMin = computed(
    () => this.metricasService.metricas().tiempoPromedioPreparacionMin,
  );

  actualizarReloj(): void {
    this.ahora.set(new Date());
  }

  async sincronizar(): Promise<boolean> {
    const pendientesAntes = new Set(this.pendientes().map((pedido) => pedido.id));
    const sincronizado = await this.pedidosService.cargar();
    if (!sincronizado) return false;
    void this.metricasService.cargar();
    const hayNuevoPedido = this.pendientes().some((pedido) => !pendientesAntes.has(pedido.id));
    if (hayNuevoPedido && this.ajustesService.ajustes().notificaciones.sonidoNuevoPedido) {
      this.notificador.notificarNuevoPedido();
    }
    return true;
  }

  esDemorado(pedido: PedidoCocina): boolean {
    const preferencias = this.ajustesService.ajustes().notificaciones;
    if (!preferencias.alertaPedidoDemorado) return false;
    const inicio = pedido.horaInicioPreparacion ?? pedido.horaSolicitud;
    return this.ahora().getTime() - inicio.getTime() >= preferencias.minutosParaAlertaDemora * 60_000;
  }

  porcentajeTiempoEstimado(pedido: PedidoCocina): number {
    if (!pedido.horaInicioPreparacion) return 0;
    const transcurrido = this.ahora().getTime() - pedido.horaInicioPreparacion.getTime();
    const estimado = this.tiempoEstimadoPreparacionMin() * 60_000;
    return Math.min(100, Math.max(0, Math.round((transcurrido / estimado) * 100)));
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

  async comenzarPreparacion(id: number): Promise<boolean> {
    return this.actualizarEstado(id, 'En preparación');
  }

  async marcarComoListo(id: number): Promise<boolean> {
    return this.actualizarEstado(id, 'Listo');
  }

  async entregarPedido(id: number): Promise<boolean> {
    return this.actualizarEstado(id, 'Entregado');
  }

  private async actualizarEstado(id: number, estado: 'En preparación' | 'Listo' | 'Entregado'): Promise<boolean> {
    const actualizado = await this.pedidosService.actualizarEstado(id, estado);
    if (actualizado) void this.metricasService.cargar();
    return actualizado;
  }
}
