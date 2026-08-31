import { Component, HostListener, inject } from '@angular/core';

import { PedidosStore } from '../../application/pedidos.store';
import { EstadoPedido, FiltroEstadoPedido, FormaPagoPedido } from '../../domain/pedido-gestion.model';

@Component({
  selector: 'app-pedidos',
  imports: [],
  providers: [PedidosStore],
  templateUrl: './pedidos-page.html',
  styleUrl: './pedidos-page.scss',
})
export class Pedidos {
  readonly pedidosStore = inject(PedidosStore);

  readonly filtros = this.pedidosStore.filtros;
  readonly filtroEstado = this.pedidosStore.filtroEstado;
  readonly pedidosFiltrados = this.pedidosStore.pedidosFiltrados;
  readonly pedidoSeleccionado = this.pedidosStore.pedidoSeleccionado;
  readonly totalPedidosHoy = this.pedidosStore.totalPedidosHoy;

  seleccionarFiltro(estado: FiltroEstadoPedido): void {
    this.pedidosStore.seleccionarFiltro(estado);
  }

  contarPorEstado(estado: FiltroEstadoPedido): number {
    return this.pedidosStore.contarPorEstado(estado);
  }

  buscar(valor: string): void {
    this.pedidosStore.buscar(valor);
  }

  verDetalle(id: number): void {
    this.pedidosStore.seleccionarPedido(id);
  }

  cerrarDetalle(): void {
    this.pedidosStore.cerrarDetalle();
  }

  avanzarEstado(id: number): void {
    this.pedidosStore.avanzarEstado(id);
  }

  etiquetaSiguienteEstado(estado: EstadoPedido): string | null {
    return this.pedidosStore.etiquetaSiguienteEstado(estado);
  }

  totalItems(items: { cantidad: number }[]): number {
    return items.reduce((total, item) => total + item.cantidad, 0);
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatearHora(fecha: Date): string {
    return fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  }

  iconoFormaPago(formaPago: FormaPagoPedido): string {
    return formaPago === 'Efectivo' ? '💵' : '🔁';
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.pedidoSeleccionado() !== null) {
      this.cerrarDetalle();
    }
  }
}
