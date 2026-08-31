import { PedidoGestion } from './pedido-gestion.model';

export abstract class PedidosRepository {
  abstract obtenerPedidosIniciales(): PedidoGestion[];
}
