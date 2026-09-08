export type EstadoPedido = 'Pendiente' | 'En preparación' | 'Listo' | 'Entregado' | 'Cancelado';
export type FormaPagoPedido = 'Efectivo' | 'Transferencia';
export type TipoEntrega = 'Para llevar' | 'En local';

export interface ItemPedidoGestion {
  productoId?: number | null;
  nombre: string;
  categoria?: string;
  cantidad: number;
  precioUnitario: number;
  costoUnitario: number;
  icono?: string;
}

export interface PedidoGestion {
  id: number;
  numero: string;
  sesionCajaId?: number | null;
  items: ItemPedidoGestion[];
  formaPago: FormaPagoPedido;
  tipoEntrega: TipoEntrega;
  notas: string;
  subtotal: number;
  total: number;
  estado: EstadoPedido;
  creadoEn: Date;
  iniciadoPreparacionEn?: Date | null;
  listoEn?: Date | null;
  entregadoEn?: Date | null;
  canceladoEn?: Date | null;
  canceladoPor?: string | null;
  motivoCancelacion?: string | null;
  version?: number;
}

export interface CrearPedidoCommand {
  idempotencyKey: string;
  items: { productoId: number; cantidad: number }[];
  formaPago: FormaPagoPedido;
  tipoEntrega: TipoEntrega;
  notas: string;
}

export type FiltroEstadoPedido = 'Todos' | EstadoPedido;
