import { Component, DestroyRef, HostListener, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { PedidosStore } from '../../application/pedidos.store';
import { ImpresorPedidos } from '../../domain/impresor-pedidos';
import {
  EstadoPedido,
  FiltroEstadoPedido,
  FormaPagoPedido,
  PedidoGestion,
} from '../../domain/pedido-gestion.model';
import { AuthService } from '../../../../shared/services/auth.service';
import { AjustesService } from '../../../../shared/services/ajustes.service';

@Component({
  selector: 'app-pedidos',
  imports: [ReactiveFormsModule],
  providers: [PedidosStore],
  templateUrl: './pedidos-page.html',
  styleUrl: './pedidos-page.scss',
})
export class Pedidos implements OnInit {
  readonly pedidosStore = inject(PedidosStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly ajustesService = inject(AjustesService);
  private readonly impresor = inject(ImpresorPedidos);
  private readonly formBuilder = inject(FormBuilder);

  readonly filtros = this.pedidosStore.filtros;
  readonly filtroEstado = this.pedidosStore.filtroEstado;
  readonly pedidosFiltrados = this.pedidosStore.pedidosFiltrados;
  readonly pedidoSeleccionado = this.pedidosStore.pedidoSeleccionado;
  readonly totalPedidosHoy = this.pedidosStore.totalPedidosHoy;
  readonly errorMetricas = this.pedidosStore.errorMetricas;
  readonly guardando = this.pedidosStore.guardando;
  readonly puedeGestionarEstado = () => this.authService.tieneRol('ADMIN', 'COCINA');
  readonly puedeAnular = (pedido: PedidoGestion) =>
    pedido.estado !== 'Cancelado' &&
    (this.authService.tieneRol('ADMIN') ||
      (this.authService.tieneRol('CAJA') && pedido.estado !== 'Entregado'));
  readonly pedidoPorAnular = signal<PedidoGestion | null>(null);
  readonly errorImpresion = signal<string | null>(null);
  readonly cancelacionForm = this.formBuilder.nonNullable.group({
    motivo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(250)]],
  });

  ngOnInit(): void {
    const intervalId = setInterval(() => void this.pedidosStore.sincronizar(), 5000);
    this.destroyRef.onDestroy(() => clearInterval(intervalId));
  }

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

  async avanzarEstado(id: number): Promise<void> {
    await this.pedidosStore.avanzarEstado(id);
  }

  etiquetaSiguienteEstado(estado: EstadoPedido): string | null {
    return this.pedidosStore.etiquetaSiguienteEstado(estado);
  }

  imprimir(pedido: PedidoGestion): void {
    const ajustes = this.ajustesService.ajustes();
    const abierta = this.impresor.imprimir(pedido, {
      nombreNegocio: ajustes.informacion.nombre,
      subtituloNegocio: ajustes.informacion.subtitulo,
      moneda: ajustes.operativas.moneda,
    });
    this.errorImpresion.set(
      abierta
        ? null
        : 'El navegador bloqueo la ventana de impresion. Habilita las ventanas emergentes e intenta nuevamente.',
    );
  }

  solicitarAnulacion(pedido: PedidoGestion): void {
    if (!this.puedeAnular(pedido)) return;
    this.cancelacionForm.reset({ motivo: '' });
    this.pedidoPorAnular.set(pedido);
  }

  cerrarAnulacion(): void {
    if (!this.guardando()) this.pedidoPorAnular.set(null);
  }

  async confirmarAnulacion(): Promise<void> {
    const pedido = this.pedidoPorAnular();
    if (pedido === null || this.cancelacionForm.invalid) {
      this.cancelacionForm.markAllAsTouched();
      return;
    }
    const motivo = this.cancelacionForm.controls.motivo.value.trim();
    if (await this.pedidosStore.cancelar(pedido.id, motivo)) this.pedidoPorAnular.set(null);
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

  formatearFechaHora(fecha: Date): string {
    return fecha.toLocaleString('es-CL', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  iconoFormaPago(formaPago: FormaPagoPedido): string {
    return formaPago === 'Efectivo' ? '💵' : '🔁';
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.pedidoPorAnular() !== null) {
      this.cerrarAnulacion();
    } else if (this.pedidoSeleccionado() !== null) {
      this.cerrarDetalle();
    }
  }
}
