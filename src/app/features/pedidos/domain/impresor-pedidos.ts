import { PedidoGestion } from './pedido-gestion.model';

export interface DatosComprobantePedido {
  nombreNegocio: string;
  subtituloNegocio: string;
  moneda: string;
}

export abstract class ImpresorPedidos {
  abstract imprimir(pedido: PedidoGestion, datos: DatosComprobantePedido): boolean;
}
