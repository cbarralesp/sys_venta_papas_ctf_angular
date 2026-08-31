import { Injectable } from '@angular/core';

import { CocinaRepository } from '../domain/cocina.repository';
import { PedidoCocina } from '../domain/pedido-cocina.model';

@Injectable()
export class CocinaMemoryRepository implements CocinaRepository {
  obtenerPedidosIniciales(): PedidoCocina[] {
    const ahora = new Date();
    const haceMinutos = (minutos: number) => new Date(ahora.getTime() - minutos * 60_000);

    return [
      {
        id: 57,
        numero: '057',
        items: [
          { nombre: 'Papas fritas grandes', cantidad: 2, icono: '🍟' },
          { nombre: 'Bebida', cantidad: 1, icono: '🥤' },
        ],
        solicitadoPor: 'Caja',
        estado: 'Listo',
        horaSolicitud: haceMinutos(20),
        horaInicioPreparacion: haceMinutos(20),
        horaListo: haceMinutos(18),
      },
      {
        id: 58,
        numero: '058',
        items: [{ nombre: 'Handroll camarón', cantidad: 1, icono: '🍙' }],
        solicitadoPor: 'Caja',
        estado: 'Listo',
        horaSolicitud: haceMinutos(15),
        horaInicioPreparacion: haceMinutos(15),
        horaListo: haceMinutos(14),
      },
      {
        id: 59,
        numero: '059',
        items: [{ nombre: 'Papas fritas chicas', cantidad: 1, icono: '🍟' }],
        solicitadoPor: 'Caja',
        estado: 'Listo',
        horaSolicitud: haceMinutos(13),
        horaInicioPreparacion: haceMinutos(13),
        horaListo: haceMinutos(12),
      },
      {
        id: 61,
        numero: '061',
        items: [{ nombre: 'Papas fritas medianas', cantidad: 2, icono: '🍟' }],
        solicitadoPor: 'Caja',
        estado: 'En preparación',
        horaSolicitud: haceMinutos(2),
        horaInicioPreparacion: haceMinutos(2),
        horaListo: null,
      },
      {
        id: 62,
        numero: '062',
        items: [
          { nombre: 'Papas fritas grandes', cantidad: 1, icono: '🍟' },
          { nombre: 'Bebida', cantidad: 1, icono: '🥤' },
        ],
        solicitadoPor: 'Caja',
        estado: 'Pendiente',
        horaSolicitud: haceMinutos(1),
        horaInicioPreparacion: null,
        horaListo: null,
      },
      {
        id: 63,
        numero: '063',
        items: [{ nombre: 'Handroll pollo', cantidad: 2, icono: '🍙' }],
        solicitadoPor: 'Caja',
        estado: 'Pendiente',
        horaSolicitud: ahora,
        horaInicioPreparacion: null,
        horaListo: null,
      },
    ];
  }
}
