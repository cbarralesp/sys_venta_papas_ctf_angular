import { Injectable } from '@angular/core';

import { CajaRepository } from '../domain/caja.repository';
import { Pedido } from '../domain/pedido.model';

@Injectable()
export class CajaMemoryRepository implements CajaRepository {
  obtenerPedidosIniciales(): Pedido[] {
    return [];
  }

  siguienteNumeroPedido(pedidosActuales: number): string {
    return String(pedidosActuales + 1).padStart(3, '0');
  }
}
