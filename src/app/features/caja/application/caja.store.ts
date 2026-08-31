import { Injectable, computed, inject, signal } from '@angular/core';

import { AjustesService } from '../../../shared/services/ajustes.service';
import { PedidosService } from '../../../shared/services/pedidos.service';
import { ProductosService } from '../../../shared/services/productos.service';
import { FiltroCategoria } from '../../productos/domain/categoria.model';
import { CategoriaProducto, Producto } from '../../productos/domain/producto.model';
import { FormaPago, ItemPedido } from '../domain/pedido.model';

@Injectable()
export class CajaStore {
  private readonly productosService = inject(ProductosService);
  private readonly pedidosService = inject(PedidosService);
  private readonly ajustesService = inject(AjustesService);

  readonly categorias = this.productosService.categorias;
  readonly productos = computed(() =>
    this.productosService.productos().filter((p) => p.disponible),
  );
  readonly categoriaActiva = signal<FiltroCategoria>('Todos');

  readonly carrito = signal<ItemPedido[]>([]);
  readonly nota = signal('');
  readonly formaPago = signal<FormaPago>('Efectivo');

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

  /** Total con impuesto aplicado según los ajustes del negocio */
  readonly total = computed(() => {
    const impuesto = this.ajustesService.ajustes().operativas.impuestoPorcentaje;
    return Math.round(this.subtotal() * (1 + impuesto / 100));
  });

  /** Número del próximo pedido basado en el ID máximo del servicio compartido */
  readonly numeroPedidoActual = computed(() => this.pedidosService.nextNumero());

  /** Total de pedidos registrados hoy */
  readonly pedidosHoy = computed(() => {
    const hoy = new Date();
    return this.pedidosService.pedidos().filter((p) => {
      const d = p.creadoEn;
      return (
        d.getFullYear() === hoy.getFullYear() &&
        d.getMonth() === hoy.getMonth() &&
        d.getDate() === hoy.getDate()
      );
    }).length;
  });

  /** Total de ventas del día (pedidos no cancelados) */
  readonly ventasHoy = computed(() => {
    const hoy = new Date();
    return this.pedidosService
      .pedidos()
      .filter((p) => {
        const d = p.creadoEn;
        return (
          p.estado !== 'Cancelado' &&
          d.getFullYear() === hoy.getFullYear() &&
          d.getMonth() === hoy.getMonth() &&
          d.getDate() === hoy.getDate()
        );
      })
      .reduce((acc, p) => acc + p.total, 0);
  });

  seleccionarCategoria(categoria: FiltroCategoria): void {
    this.categoriaActiva.set(categoria);
  }

  cantidadEnCarrito(productoId: number): number {
    return this.carrito().find((item) => item.productoId === productoId)?.cantidad ?? 0;
  }

  agregarProducto(producto: Producto): void {
    this.carrito.update((items) => {
      const existente = items.find((item) => item.productoId === producto.id);
      if (existente) {
        return items.map((item) =>
          item.productoId === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
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
    this.carrito.update((items) =>
      items.map((item) =>
        item.productoId === productoId ? { ...item, cantidad: item.cantidad + 1 } : item,
      ),
    );
  }

  decrementarItem(productoId: number): void {
    this.carrito.update((items) =>
      items
        .map((item) =>
          item.productoId === productoId ? { ...item, cantidad: item.cantidad - 1 } : item,
        )
        .filter((item) => item.cantidad > 0),
    );
  }

  eliminarItem(productoId: number): void {
    this.carrito.update((items) => items.filter((item) => item.productoId !== productoId));
  }

  limpiarPedido(): void {
    this.carrito.set([]);
    this.nota.set('');
    this.formaPago.set('Efectivo');
  }

  seleccionarFormaPago(formaPago: FormaPago): void {
    this.formaPago.set(formaPago);
  }

  actualizarNota(nota: string): void {
    this.nota.set(nota);
  }

  crearPedido(): void {
    const items = this.carrito();
    if (items.length === 0) return;

    const id = this.pedidosService.nextId();
    const numero = this.pedidosService.nextNumero();
    const subtotal = this.subtotal();
    const total = this.total();

    this.pedidosService.agregar({
      id,
      numero,
      items: items.map((item) => ({
        nombre: item.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        costoUnitario: item.costoUnitario,
        icono: item.icono,
      })),
      formaPago: this.formaPago(),
      tipoEntrega: 'Para llevar',
      notas: this.nota().trim(),
      subtotal,
      total,
      estado: 'Pendiente',
      creadoEn: new Date(),
    });

    this.limpiarPedido();
  }
}
