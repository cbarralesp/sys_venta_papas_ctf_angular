import { PedidoCocina } from './pedido-cocina.model';

export abstract class CocinaRepository {
  abstract obtenerPedidosIniciales(): PedidoCocina[];
}
