import { Component, DestroyRef, OnInit, inject } from '@angular/core';

import { CocinaStore } from '../../application/cocina.store';
import { PedidoCocina } from '../../domain/pedido-cocina.model';

@Component({
  selector: 'app-cocina',
  imports: [],
  providers: [CocinaStore],
  templateUrl: './cocina-page.html',
  styleUrl: './cocina-page.scss',
})
export class Cocina implements OnInit {
  readonly cocinaStore = inject(CocinaStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly pendientes = this.cocinaStore.pendientes;
  readonly enPreparacion = this.cocinaStore.enPreparacion;
  readonly listos = this.cocinaStore.listos;
  readonly pedidosActivos = this.cocinaStore.pedidosActivos;
  readonly completadosHoy = this.cocinaStore.completadosHoy;
  readonly guardando = this.cocinaStore.guardando;
  readonly error = this.cocinaStore.error;
  readonly errorMetricas = this.cocinaStore.errorMetricas;
  readonly tiempoEstimadoPreparacionMin = this.cocinaStore.tiempoEstimadoPreparacionMin;
  readonly fechaMetricas = this.cocinaStore.fechaMetricas;
  readonly tiempoPromedioPreparacionMin = this.cocinaStore.tiempoPromedioPreparacionMin;

  ngOnInit(): void {
    const intervalId = setInterval(() => this.cocinaStore.actualizarReloj(), 1000);
    const syncIntervalId = setInterval(() => void this.cocinaStore.sincronizar(), 5000);
    this.destroyRef.onDestroy(() => {
      clearInterval(intervalId);
      clearInterval(syncIntervalId);
    });
  }

  async comenzarPreparacion(pedido: PedidoCocina): Promise<void> {
    await this.cocinaStore.comenzarPreparacion(pedido.id);
  }

  async marcarComoListo(pedido: PedidoCocina): Promise<void> {
    await this.cocinaStore.marcarComoListo(pedido.id);
  }

  async entregarPedido(pedido: PedidoCocina): Promise<void> {
    await this.cocinaStore.entregarPedido(pedido.id);
  }

  tiempoTranscurrido(pedido: PedidoCocina): string {
    return this.cocinaStore.tiempoTranscurrido(pedido);
  }

  esDemorado(pedido: PedidoCocina): boolean {
    return this.cocinaStore.esDemorado(pedido);
  }

  porcentajeTiempoEstimado(pedido: PedidoCocina): number {
    return this.cocinaStore.porcentajeTiempoEstimado(pedido);
  }

  formatearHora(fecha: Date): string {
    return this.cocinaStore.formatearHora(fecha);
  }

  formatearFechaLarga(fecha: Date): string {
    return fecha.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
  }
}
