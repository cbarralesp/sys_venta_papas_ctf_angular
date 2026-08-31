export type FormaPago = 'Efectivo' | 'Transferencia';

export interface ItemPedido {
  productoId: number;
  nombre: string;
  icono: string;
  precioUnitario: number;
  costoUnitario: number;
  cantidad: number;
}

export interface Pedido {
  id: number;
  numero: string;
  items: ItemPedido[];
  subtotal: number;
  formaPago: FormaPago;
  nota: string;
  creadoEn: Date;
}
