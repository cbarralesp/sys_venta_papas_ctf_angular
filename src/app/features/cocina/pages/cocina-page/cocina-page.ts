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

  ngOnInit(): void {
    const intervalId = setInterval(() => this.cocinaStore.actualizarReloj(), 1000);
    this.destroyRef.onDestroy(() => clearInterval(intervalId));
  }

  comenzarPreparacion(pedido: PedidoCocina): void {
    this.cocinaStore.comenzarPreparacion(pedido.id);
  }

  marcarComoListo(pedido: PedidoCocina): void {
    this.cocinaStore.marcarComoListo(pedido.id);
  }

  entregarPedido(pedido: PedidoCocina): void {
    this.cocinaStore.entregarPedido(pedido.id);
  }

  tiempoTranscurrido(pedido: PedidoCocina): string {
    return this.cocinaStore.tiempoTranscurrido(pedido);
  }

  formatearHora(fecha: Date): string {
    return this.cocinaStore.formatearHora(fecha);
  }
}
