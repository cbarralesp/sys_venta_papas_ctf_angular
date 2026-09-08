import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CajaStore } from '../../application/caja.store';
import { FormaPago } from '../../domain/pedido.model';
import { Producto } from '../../../productos/domain/producto.model';
import { FiltroCategoria } from '../../../productos/domain/categoria.model';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-caja',
  imports: [FormsModule],
  providers: [CajaStore],
  templateUrl: './caja-page.html',
  styleUrl: './caja-page.scss',
})
export class Caja {
  readonly cajaStore = inject(CajaStore);
  private readonly authService = inject(AuthService);

  readonly categorias = this.cajaStore.categorias;
  readonly filtros = this.cajaStore.filtros;
  readonly categoriaActiva = this.cajaStore.categoriaActiva;
  readonly productosFiltrados = this.cajaStore.productosFiltrados;
  readonly carrito = this.cajaStore.carrito;
  readonly totalItems = this.cajaStore.totalItems;
  readonly subtotal = this.cajaStore.subtotal;
  readonly pedidosHoy = this.cajaStore.pedidosHoy;
  readonly ventasHoy = this.cajaStore.ventasHoy;
  readonly ticketPromedioHoy = this.cajaStore.ticketPromedioHoy;
  readonly formaPago = this.cajaStore.formaPago;
  readonly avisoCarrito = this.cajaStore.avisoCarrito;
  readonly nota = this.cajaStore.nota;
  readonly guardando = this.cajaStore.guardando;
  readonly error = this.cajaStore.error;
  readonly errorMetricas = this.cajaStore.errorMetricas;
  readonly sesionCaja = this.cajaStore.sesionCaja;
  readonly turnoEsDeHoy = this.cajaStore.turnoEsDeHoy;
  readonly errorCaja = this.cajaStore.errorCaja;
  readonly operandoCaja = this.cajaStore.operandoCaja;
  readonly historialCaja = this.cajaStore.historialCaja;
  readonly sesionHistorial = this.cajaStore.sesionHistorial;
  readonly ventasSesionHistorial = this.cajaStore.ventasSesionHistorial;
  readonly cargandoHistorial = this.cajaStore.cargandoHistorial;
  readonly errorHistorial = this.cajaStore.errorHistorial;
  readonly puedeEliminarTurnos = () => this.authService.tieneRol('ADMIN');
  readonly modalCaja = signal<'abrir' | 'cerrar' | 'reiniciar' | null>(null);
  readonly historialVisible = signal(false);
  readonly saldoInicial = signal(0);
  readonly efectivoDeclarado = signal(0);
  readonly saldoInicialNuevo = signal(0);
  readonly contrasenaReinicio = signal('');
  readonly pedidoActual = viewChild<ElementRef<HTMLElement>>('pedidoActual');

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

  verPedido(): void {
    this.pedidoActual()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  seleccionarFormaPago(formaPago: FormaPago): void {
    this.cajaStore.seleccionarFormaPago(formaPago);
  }

  actualizarNota(valor: string): void {
    this.cajaStore.actualizarNota(valor);
  }

  async crearPedido(): Promise<void> {
    await this.cajaStore.crearPedido();
  }

  mostrarApertura(): void {
    this.saldoInicial.set(0);
    this.modalCaja.set('abrir');
  }

  mostrarCierre(): void {
    this.efectivoDeclarado.set(this.sesionCaja()?.efectivoEsperado ?? 0);
    this.modalCaja.set('cerrar');
  }

  mostrarReinicio(): void {
    this.efectivoDeclarado.set(this.sesionCaja()?.efectivoEsperado ?? 0);
    this.saldoInicialNuevo.set(0);
    this.contrasenaReinicio.set('');
    this.modalCaja.set('reiniciar');
  }

  cerrarModalCaja(): void {
    if (!this.operandoCaja()) this.modalCaja.set(null);
  }

  async confirmarApertura(): Promise<void> {
    if (await this.cajaStore.abrirCaja(this.saldoInicial())) this.modalCaja.set(null);
  }

  async confirmarCierre(): Promise<void> {
    if (await this.cajaStore.cerrarCaja(this.efectivoDeclarado())) this.modalCaja.set(null);
  }

  async confirmarReinicio(): Promise<void> {
    const reiniciado = await this.cajaStore.reiniciarCaja(
      this.efectivoDeclarado(),
      this.saldoInicialNuevo(),
      this.contrasenaReinicio(),
    );
    if (reiniciado) this.modalCaja.set(null);
  }

  actualizarSaldoInicial(value: number): void {
    this.saldoInicial.set(Number(value));
  }

  actualizarEfectivoDeclarado(value: number): void {
    this.efectivoDeclarado.set(Number(value));
  }

  actualizarSaldoInicialNuevo(value: number): void {
    this.saldoInicialNuevo.set(Number(value));
  }

  actualizarContrasenaReinicio(value: string): void {
    this.contrasenaReinicio.set(value);
  }

  async mostrarHistorial(): Promise<void> {
    this.historialVisible.set(true);
    await this.cajaStore.cargarHistorial();
  }

  cerrarHistorial(): void {
    this.historialVisible.set(false);
    this.cajaStore.cerrarHistorial();
  }

  async verSesionCerrada(id: number): Promise<void> {
    await this.cajaStore.seleccionarSesionHistorial(id);
  }

  async eliminarTurno(id: number): Promise<void> {
    const confirmado = window.confirm(
      '¿Eliminar este turno? Solo se puede borrar si no tiene ventas ni gastos asociados.',
    );
    if (!confirmado) return;
    await this.cajaStore.eliminarTurno(id);
  }

  volverAlHistorial(): void {
    this.cajaStore.sesionHistorial.set(null);
    this.cajaStore.ventasSesionHistorial.set([]);
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatDate(value: Date | null): string {
    if (value === null) return '-';
    return value.toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' });
  }
}
