import { Injectable, computed, signal } from '@angular/core';

import { EstadoPedido, PedidoGestion } from '../../features/pedidos/domain/pedido-gestion.model';

/**
 * Servicio raíz singleton que actúa como fuente de verdad compartida para todos
 * los pedidos del sistema. Los módulos Caja, Cocina, Pedidos, Finanzas y Reportes
 * leen y escriben a través de este servicio para mantenerse sincronizados.
 */
@Injectable({ providedIn: 'root' })
export class PedidosService {
  private readonly _pedidos = signal<PedidoGestion[]>(this.buildSeedData());

  /** Signal de solo lectura con todos los pedidos del sistema */
  readonly pedidos = this._pedidos.asReadonly();

  /** Próximo ID disponible (max actual + 1) */
  readonly nextId = computed(() => {
    const ids = this._pedidos().map((p) => p.id);
    return ids.length === 0 ? 1 : Math.max(...ids) + 1;
  });

  /** Próximo número de pedido formateado (ej: "063") */
  readonly nextNumero = computed(() => String(this.nextId()).padStart(3, '0'));

  /** Agrega un nuevo pedido al sistema */
  agregar(pedido: PedidoGestion): void {
    this._pedidos.update((lista) => [...lista, pedido]);
  }

  /** Actualiza el estado de un pedido por ID */
  actualizarEstado(id: number, estado: EstadoPedido): void {
    this._pedidos.update((lista) =>
      lista.map((p) => (p.id === id ? { ...p, estado } : p)),
    );
  }

  private buildSeedData(): PedidoGestion[] {
    const ahora = new Date();
    const haceMinutos = (m: number) => new Date(ahora.getTime() - m * 60_000);

    return [
      {
        id: 62,
        numero: '062',
        items: [
          { nombre: 'Papas fritas grandes', cantidad: 1, precioUnitario: 7500, costoUnitario: 1800, icono: '🍟' },
          { nombre: 'Bebida', cantidad: 1, precioUnitario: 1000, costoUnitario: 700, icono: '🥤' },
        ],
        formaPago: 'Efectivo',
        tipoEntrega: 'Para llevar',
        notas: 'Sin sal',
        subtotal: 8500,
        total: 8500,
        estado: 'Pendiente',
        creadoEn: haceMinutos(1),
      },
      {
        id: 61,
        numero: '061',
        items: [
          { nombre: 'Papas fritas medianas', cantidad: 2, precioUnitario: 3000, costoUnitario: 1500, icono: '🍟' },
        ],
        formaPago: 'Transferencia',
        tipoEntrega: 'Para llevar',
        notas: '',
        subtotal: 6000,
        total: 6000,
        estado: 'En preparación',
        creadoEn: haceMinutos(5),
      },
      {
        id: 60,
        numero: '060',
        items: [
          { nombre: 'Handroll pollo', cantidad: 1, precioUnitario: 4000, costoUnitario: 1800, icono: '🍙' },
          { nombre: 'Bebida', cantidad: 1, precioUnitario: 1500, costoUnitario: 700, icono: '🥤' },
        ],
        formaPago: 'Efectivo',
        tipoEntrega: 'En local',
        notas: '',
        subtotal: 7000,
        total: 7000,
        estado: 'Listo',
        creadoEn: haceMinutos(8),
      },
      {
        id: 59,
        numero: '059',
        items: [
          { nombre: 'Papas fritas grandes', cantidad: 2, precioUnitario: 4000, costoUnitario: 1800, icono: '🍟' },
          { nombre: 'Handroll camarón', cantidad: 1, precioUnitario: 3500, costoUnitario: 2000, icono: '🍙' },
        ],
        formaPago: 'Transferencia',
        tipoEntrega: 'Para llevar',
        notas: '',
        subtotal: 11500,
        total: 11500,
        estado: 'Entregado',
        creadoEn: haceMinutos(12),
      },
      {
        id: 58,
        numero: '058',
        items: [{ nombre: 'Handroll camarón', cantidad: 1, precioUnitario: 5500, costoUnitario: 2000, icono: '🍙' }],
        formaPago: 'Efectivo',
        tipoEntrega: 'En local',
        notas: '',
        subtotal: 5500,
        total: 5500,
        estado: 'Entregado',
        creadoEn: haceMinutos(18),
      },
      {
        id: 57,
        numero: '057',
        items: [
          { nombre: 'Papas fritas chicas', cantidad: 1, precioUnitario: 2000, costoUnitario: 900, icono: '🍟' },
          { nombre: 'Bebida', cantidad: 1, precioUnitario: 1500, costoUnitario: 700, icono: '🥤' },
        ],
        formaPago: 'Transferencia',
        tipoEntrega: 'Para llevar',
        notas: 'Cliente canceló el pedido',
        subtotal: 6500,
        total: 6500,
        estado: 'Cancelado',
        creadoEn: haceMinutos(20),
      },
      {
        id: 56,
        numero: '056',
        items: [
          { nombre: 'Papas fritas medianas', cantidad: 1, precioUnitario: 3500, costoUnitario: 1500, icono: '🍟' },
          { nombre: 'Handroll pollo', cantidad: 1, precioUnitario: 4000, costoUnitario: 1800, icono: '🍙' },
          { nombre: 'Bebida', cantidad: 1, precioUnitario: 1500, costoUnitario: 700, icono: '🥤' },
        ],
        formaPago: 'Efectivo',
        tipoEntrega: 'En local',
        notas: '',
        subtotal: 9000,
        total: 9000,
        estado: 'Listo',
        creadoEn: haceMinutos(25),
      },
      {
        id: 55,
        numero: '055',
        items: [
          { nombre: 'Papas fritas grandes', cantidad: 1, precioUnitario: 4500, costoUnitario: 1800, icono: '🍟' },
          { nombre: 'Bebida', cantidad: 1, precioUnitario: 1500, costoUnitario: 700, icono: '🥤' },
        ],
        formaPago: 'Efectivo',
        tipoEntrega: 'Para llevar',
        notas: '',
        subtotal: 6000,
        total: 6000,
        estado: 'Entregado',
        creadoEn: haceMinutos(33),
      },
    ];
  }
}
