import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CajaStore } from '../../application/caja.store';
import { FormaPago } from '../../domain/pedido.model';
import { Producto } from '../../../productos/domain/producto.model';
import { FiltroCategoria } from '../../../productos/domain/categoria.model';

@Component({
  selector: 'app-caja',
  imports: [FormsModule],
  providers: [CajaStore],
  templateUrl: './caja-page.html',
  styleUrl: './caja-page.scss',
})
export class Caja {
  readonly cajaStore = inject(CajaStore);

  readonly categorias = this.cajaStore.categorias;
  readonly filtros = this.cajaStore.filtros;
  readonly categoriaActiva = this.cajaStore.categoriaActiva;
  readonly productosFiltrados = this.cajaStore.productosFiltrados;
  readonly carrito = this.cajaStore.carrito;
  readonly totalItems = this.cajaStore.totalItems;
  readonly subtotal = this.cajaStore.subtotal;
  readonly numeroPedidoActual = this.cajaStore.numeroPedidoActual;
  readonly pedidosHoy = this.cajaStore.pedidosHoy;
  readonly ventasHoy = this.cajaStore.ventasHoy;
  readonly formaPago = this.cajaStore.formaPago;
  readonly nota = this.cajaStore.nota;

  selectCategory(categoria: FiltroCategoria): void {
    this.cajaStore.seleccionarCategoria(categoria);
  }

  cantidadEnCarrito(producto: Producto): number {
    return this.cajaStore.cantidadEnCarrito(producto.id);
  }

  agregarProducto(producto: Producto): void {
    this.cajaStore.agregarProducto(producto);
  }

  incrementar(productoId: number): void {
    this.cajaStore.incrementarItem(productoId);
  }

  decrementar(productoId: number): void {
    this.cajaStore.decrementarItem(productoId);
  }

  eliminarItem(productoId: number): void {
    this.cajaStore.eliminarItem(productoId);
  }

  limpiarPedido(): void {
    this.cajaStore.limpiarPedido();
  }

  seleccionarFormaPago(formaPago: FormaPago): void {
    this.cajaStore.seleccionarFormaPago(formaPago);
  }

  actualizarNota(valor: string): void {
    this.cajaStore.actualizarNota(valor);
  }

  crearPedido(): void {
    this.cajaStore.crearPedido();
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
