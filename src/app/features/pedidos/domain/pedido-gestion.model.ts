export type EstadoPedido = 'Pendiente' | 'En preparación' | 'Listo' | 'Entregado' | 'Cancelado';
export type FormaPagoPedido = 'Efectivo' | 'Transferencia';
export type TipoEntrega = 'Para llevar' | 'En local';

export interface ItemPedidoGestion {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  costoUnitario: number;
  icono?: string;
}

export interface PedidoGestion {
  id: number;
  numero: string;
  items: ItemPedidoGestion[];
  formaPago: FormaPagoPedido;
  tipoEntrega: TipoEntrega;
  notas: string;
  subtotal: number;
  total: number;
  estado: EstadoPedido;
  creadoEn: Date;
}

export type FiltroEstadoPedido = 'Todos' | EstadoPedido;
