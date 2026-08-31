import { Injectable } from '@angular/core';

import { MovimientoFinanciero } from '../domain/finanzas.model';
import { FinanzasRepository } from '../domain/finanzas.repository';

@Injectable()
export class FinanzasMemoryRepository implements FinanzasRepository {
  obtenerMovimientosIniciales(): MovimientoFinanciero[] {
    const ahora = new Date();
    const hace = (horas: number) => new Date(ahora.getTime() - horas * 60 * 60_000);

    return [
      {
        id: 1,
        fecha: hace(1),
        descripcion: 'Pedido #062',
        categoria: 'Papas fritas',
        tipo: 'Venta',
        formaPago: 'Efectivo',
        monto: 8500,
        costo: 3800,
      },
      {
        id: 2,
        fecha: hace(2),
        descripcion: 'Pedido #061',
        categoria: 'Papas fritas',
        tipo: 'Venta',
        formaPago: 'Transferencia',
        monto: 6000,
        costo: 3000,
      },
      {
        id: 3,
        fecha: hace(3),
        descripcion: 'Pedido #060',
        categoria: 'Handroll',
        tipo: 'Venta',
        formaPago: 'Efectivo',
        monto: 7000,
        costo: 3300,
      },
      {
        id: 4,
        fecha: hace(4),
        descripcion: 'Pedido #059',
        categoria: 'Papas fritas',
        tipo: 'Venta',
        formaPago: 'Transferencia',
        monto: 11500,
        costo: 5600,
      },
      {
        id: 5,
        fecha: hace(6),
        descripcion: 'Pedido #058',
        categoria: 'Handroll',
        tipo: 'Venta',
        formaPago: 'Efectivo',
        monto: 5500,
        costo: 2000,
      },
      {
        id: 6,
        fecha: hace(8),
        descripcion: 'Compra de papas y aceite',
        categoria: 'Insumos',
        tipo: 'Gasto',
        formaPago: 'Efectivo',
        monto: 18000,
        costo: 0,
      },
      {
        id: 7,
        fecha: hace(20),
        descripcion: 'Pedido #056',
        categoria: 'Bebidas',
        tipo: 'Venta',
        formaPago: 'Efectivo',
        monto: 9000,
        costo: 4200,
      },
      {
        id: 8,
        fecha: hace(24),
        descripcion: 'Pago de gas para cocina',
        categoria: 'Servicios',
        tipo: 'Gasto',
        formaPago: 'Transferencia',
        monto: 12000,
        costo: 0,
      },
      {
        id: 9,
        fecha: hace(30),
        descripcion: 'Pedido #055',
        categoria: 'Papas fritas',
        tipo: 'Venta',
        formaPago: 'Efectivo',
        monto: 6000,
        costo: 2600,
      },
      {
        id: 10,
        fecha: hace(48),
        descripcion: 'Arriendo local (proporcional semanal)',
        categoria: 'Arriendo',
        tipo: 'Gasto',
        formaPago: 'Transferencia',
        monto: 35000,
        costo: 0,
      },
      {
        id: 11,
        fecha: hace(70),
        descripcion: 'Compra de bebidas',
        categoria: 'Insumos',
        tipo: 'Gasto',
        formaPago: 'Efectivo',
        monto: 15000,
        costo: 0,
      },
      {
        id: 12,
        fecha: hace(96),
        descripcion: 'Pedido #048',
        categoria: 'Handroll',
        tipo: 'Venta',
        formaPago: 'Transferencia',
        monto: 9500,
        costo: 4300,
      },
    ];
  }
}
