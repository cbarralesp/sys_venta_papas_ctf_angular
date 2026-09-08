import { Injectable, computed, inject, signal } from '@angular/core';

import { PedidosService } from '../../../shared/services/pedidos.service';
import { ProductosService } from '../../../shared/services/productos.service';
import { MetricasDiariasService } from '../../../shared/services/metricas-diarias.service';
import { FiltroCategoria } from '../../productos/domain/categoria.model';
import { Producto } from '../../productos/domain/producto.model';
import { PedidoGestion } from '../../pedidos/domain/pedido-gestion.model';
import { FormaPago, ItemPedido } from '../domain/pedido.model';
import { SesionCajaRepository } from '../domain/sesion-caja.repository';
import { SesionCaja } from '../domain/sesion-caja.model';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../../shared/services/api-error-message';

@Injectable()
export class CajaStore {
  private static readonly CANTIDAD_MAXIMA_PRODUCTO = 99;
  private static readonly TIPO_ENTREGA_PREDETERMINADO = 'Para llevar';
  private readonly productosService = inject(ProductosService);
  private readonly pedidosService = inject(PedidosService);
  private readonly metricasService = inject(MetricasDiariasService);
  private readonly sesionCajaRepository = inject(SesionCajaRepository);

  readonly sesionCaja = signal<SesionCaja | null>(null);
  readonly turnoEsDeHoy = computed(() => {
    const sesion = this.sesionCaja();
    return sesion === null || this.esMismoDiaLocal(sesion.abiertaEn, new Date());
  });
  readonly cargandoCaja = signal(false);
  readonly operandoCaja = signal(false);
  readonly errorCaja = signal<string | null>(null);
  readonly historialCaja = signal<SesionCaja[]>([]);
  readonly sesionHistorial = signal<SesionCaja | null>(null);
  readonly ventasSesionHistorial = signal<PedidoGestion[]>([]);
  readonly cargandoHistorial = signal(false);
  readonly errorHistorial = signal<string | null>(null);

  readonly categorias = this.productosService.categorias;
  readonly productos = computed(() =>
    this.productosService.productos().filter((p) => p.disponible),
  );
  readonly categoriaActiva = signal<FiltroCategoria>('Todos');

  readonly carrito = signal<ItemPedido[]>([]);
  readonly nota = signal('');
  readonly formaPago = signal<FormaPago>('Efectivo');
  readonly avisoCarrito = signal<string | null>(null);
  readonly guardando = this.pedidosService.guardando;
  readonly error = this.pedidosService.error;
  readonly errorMetricas = this.metricasService.error;
  private idempotencyKey = crypto.randomUUID();

  constructor() {
    void this.cargarSesionCaja();
    void this.metricasService.cargar();
  }

  readonly filtros = computed<readonly FiltroCategoria[]>(() => [
    'Todos' as FiltroCategoria,
    ...this.categorias(),
  ]);

  readonly productosFiltrados = computed(() => {
    const categoria = this.categoriaActiva();
    return categoria === 'Todos'
      ? this.productos()
      : this.productos().filter((p) => p.categoria === categoria);
  });

  readonly totalItems = computed(() =>
    this.carrito().reduce((total, item) => total + item.cantidad, 0),
  );

  readonly subtotal = computed(() =>
    this.carrito().reduce((total, item) => total + item.precioUnitario * item.cantidad, 0),
  );

  readonly pedidosHoy = computed(() => this.metricasService.metricas().pedidosCreados);
  readonly ventasHoy = computed(() => this.metricasService.metricas().totalVentas);
  readonly ticketPromedioHoy = computed(() => this.metricasService.metricas().ticketPromedio);

  seleccionarCategoria(categoria: FiltroCategoria): void {
    this.categoriaActiva.set(categoria);
  }

  cantidadEnCarrito(productoId: number): number {
    return this.carrito().find((item) => item.productoId === productoId)?.cantidad ?? 0;
  }

  agregarProducto(producto: Producto): void {
    if (this.cantidadEnCarrito(producto.id) >= CajaStore.CANTIDAD_MAXIMA_PRODUCTO) {
      this.informarCantidadMaxima(producto.nombre);
      return;
    }
    this.avisoCarrito.set(null);
    this.carrito.update((items) => {
      const existente = items.find((item) => item.productoId === producto.id);
      if (existente) {
        return items.map((item) =>
          item.productoId === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item,
        );
      }
      return [
        ...items,
        {
          productoId: producto.id,
          nombre: producto.nombre,
          icono: producto.icono,
          precioUnitario: producto.precioVenta,
          costoUnitario: producto.costo ?? 0,
          cantidad: 1,
        },
      ];
    });
  }

  incrementarItem(productoId: number): void {
    const item = this.carrito().find((actual) => actual.productoId === productoId);
    if (!item) return;
    if (item.cantidad >= CajaStore.CANTIDAD_MAXIMA_PRODUCTO) {
      this.informarCantidadMaxima(item.nombre);
      return;
    }
    this.avisoCarrito.set(null);
    this.carrito.update((items) =>
      items.map((item) =>
        item.productoId === productoId ? { ...item, cantidad: item.cantidad + 1 } : item,
      ),
    );
  }

  decrementarItem(productoId: number): void {
    this.avisoCarrito.set(null);
    this.carrito.update((items) =>
      items
        .map((item) =>
          item.productoId === productoId ? { ...item, cantidad: item.cantidad - 1 } : item,
        )
        .filter((item) => item.cantidad > 0),
    );
  }

  eliminarItem(productoId: number): void {
    this.avisoCarrito.set(null);
    this.carrito.update((items) => items.filter((item) => item.productoId !== productoId));
  }

  limpiarPedido(): void {
    this.carrito.set([]);
    this.nota.set('');
    this.formaPago.set('Efectivo');
    this.avisoCarrito.set(null);
  }

  seleccionarFormaPago(formaPago: FormaPago): void {
    this.formaPago.set(formaPago);
  }

  actualizarNota(nota: string): void {
    this.nota.set(nota);
  }

  async crearPedido(): Promise<boolean> {
    if (this.sesionCaja() === null) {
      this.errorCaja.set('Debes abrir la caja antes de registrar pedidos.');
      return false;
    }
    if (!this.turnoEsDeHoy()) {
      this.errorCaja.set('El turno abierto pertenece a otro día. Reinicia la caja antes de vender.');
      return false;
    }
    const items = this.carrito();
    if (items.length === 0) return false;

    const creado = await this.pedidosService.crear({
      idempotencyKey: this.idempotencyKey,
      items: items.map((item) => ({ productoId: item.productoId, cantidad: item.cantidad })),
      formaPago: this.formaPago(),
      tipoEntrega: CajaStore.TIPO_ENTREGA_PREDETERMINADO,
      notas: this.nota().trim(),
    });
    if (creado) {
      this.idempotencyKey = crypto.randomUUID();
      this.limpiarPedido();
      void this.metricasService.cargar();
    }
    return creado;
  }

  async cargarSesionCaja(): Promise<void> {
    if (this.cargandoCaja()) return;
    this.cargandoCaja.set(true);
    this.errorCaja.set(null);
    try {
      this.sesionCaja.set(await firstValueFrom(this.sesionCajaRepository.consultarActual()));
    } catch (error) {
      this.errorCaja.set(apiErrorMessage(error, 'No fue posible consultar el estado de la caja.'));
    } finally {
      this.cargandoCaja.set(false);
    }
  }

  async abrirCaja(saldoInicial: number): Promise<boolean> {
    if (this.operandoCaja() || saldoInicial < 0) return false;
    this.operandoCaja.set(true);
    this.errorCaja.set(null);
    try {
      this.sesionCaja.set(await firstValueFrom(this.sesionCajaRepository.abrir(saldoInicial)));
      return true;
    } catch (error) {
      await this.cargarSesionCaja();
      this.errorCaja.set(apiErrorMessage(
        error,
        'No fue posible abrir la caja. Puede existir otra sesión abierta.',
      ));
      return false;
    } finally {
      this.operandoCaja.set(false);
    }
  }

  async cerrarCaja(efectivoDeclarado: number): Promise<boolean> {
    const sesion = this.sesionCaja();
    if (sesion === null || this.operandoCaja() || efectivoDeclarado < 0) return false;
    this.operandoCaja.set(true);
    this.errorCaja.set(null);
    try {
      const cerrada = await firstValueFrom(
        this.sesionCajaRepository.cerrar(sesion.id, efectivoDeclarado),
      );
      this.sesionCaja.set(null);
      this.historialCaja.update((historial) => [
        cerrada,
        ...historial.filter((item) => item.id !== cerrada.id),
      ]);
      this.limpiarPedido();
      return true;
    } catch (error) {
      this.errorCaja.set(apiErrorMessage(
        error,
        'No fue posible cerrar la caja. Actualiza e intenta nuevamente.',
      ));
      return false;
    } finally {
      this.operandoCaja.set(false);
    }
  }

  async reiniciarCaja(
    efectivoDeclarado: number,
    saldoInicialNuevo: number,
    contrasenaActual: string,
  ): Promise<boolean> {
    const sesion = this.sesionCaja();
    if (
      sesion === null ||
      this.operandoCaja() ||
      efectivoDeclarado < 0 ||
      saldoInicialNuevo < 0 ||
      contrasenaActual.trim().length === 0
    ) {
      return false;
    }
    this.operandoCaja.set(true);
    this.errorCaja.set(null);
    try {
      const reinicio = await firstValueFrom(
        this.sesionCajaRepository.reiniciar(
          sesion.id,
          efectivoDeclarado,
          saldoInicialNuevo,
          contrasenaActual,
        ),
      );
      this.sesionCaja.set(reinicio.sesionAbierta);
      this.historialCaja.update((historial) => [
        reinicio.sesionCerrada,
        ...historial.filter((item) => item.id !== reinicio.sesionCerrada.id),
      ]);
      this.limpiarPedido();
      void this.metricasService.cargar();
      return true;
    } catch (error) {
      this.errorCaja.set(apiErrorMessage(
        error,
        'No fue posible reiniciar el turno. Revisa la clave y los pedidos pendientes.',
      ));
      return false;
    } finally {
      this.operandoCaja.set(false);
    }
  }

  async cargarHistorial(): Promise<boolean> {
    if (this.cargandoHistorial()) return false;
    this.cargandoHistorial.set(true);
    this.errorHistorial.set(null);
    try {
      this.historialCaja.set(await firstValueFrom(this.sesionCajaRepository.listarHistorial()));
      return true;
    } catch (error) {
      this.errorHistorial.set(apiErrorMessage(error, 'No fue posible cargar los turnos cerrados.'));
      return false;
    } finally {
      this.cargandoHistorial.set(false);
    }
  }

  async seleccionarSesionHistorial(id: number): Promise<boolean> {
    if (this.cargandoHistorial()) return false;
    this.cargandoHistorial.set(true);
    this.errorHistorial.set(null);
    try {
      this.sesionHistorial.set(
        await firstValueFrom(this.sesionCajaRepository.consultarCerrada(id)),
      );
      this.ventasSesionHistorial.set(
        await firstValueFrom(this.sesionCajaRepository.listarVentas(id)),
      );
      return true;
    } catch (error) {
      this.errorHistorial.set(apiErrorMessage(error, 'No fue posible consultar el detalle del turno.'));
      return false;
    } finally {
      this.cargandoHistorial.set(false);
    }
  }

  async eliminarTurno(id: number): Promise<boolean> {
    if (this.cargandoHistorial() || this.operandoCaja()) return false;
    const esTurnoActual = this.sesionCaja()?.id === id;
    this.cargandoHistorial.set(true);
    this.errorHistorial.set(null);
    this.errorCaja.set(null);
    try {
      await firstValueFrom(this.sesionCajaRepository.eliminar(id));
      this.historialCaja.update((historial) => historial.filter((sesion) => sesion.id !== id));
      if (this.sesionHistorial()?.id === id) {
        this.sesionHistorial.set(null);
        this.ventasSesionHistorial.set([]);
      }
      if (this.sesionCaja()?.id === id) {
        this.sesionCaja.set(null);
        this.limpiarPedido();
      }
      return true;
    } catch (error) {
      const mensaje = apiErrorMessage(
        error,
        'No fue posible eliminar el turno. Solo se permiten turnos sin movimientos.',
      );
      if (esTurnoActual) this.errorCaja.set(mensaje);
      else this.errorHistorial.set(mensaje);
      return false;
    } finally {
      this.cargandoHistorial.set(false);
    }
  }

  cerrarHistorial(): void {
    this.sesionHistorial.set(null);
    this.ventasSesionHistorial.set([]);
    this.errorHistorial.set(null);
  }

  private informarCantidadMaxima(nombreProducto: string): void {
    this.avisoCarrito.set(`La cantidad maxima para ${nombreProducto} es 99.`);
  }

  private esMismoDiaLocal(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }
}
