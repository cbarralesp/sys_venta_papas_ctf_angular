import { Pedido } from './pedido.model';

export abstract class CajaRepository {
  abstract obtenerPedidosIniciales(): Pedido[];
  abstract siguienteNumeroPedido(pedidosActuales: number): string;
}
