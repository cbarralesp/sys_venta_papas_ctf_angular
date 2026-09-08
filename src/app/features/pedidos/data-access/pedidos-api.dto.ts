export interface PedidoResponseDto {
  id: number;
  numero: string;
  sesionCajaId: number | null;
  items: PedidoItemResponseDto[];
  formaPago: 'Efectivo' | 'Transferencia';
  tipoEntrega: 'Para llevar' | 'En local';
  notas: string;
  subtotal: number;
  total: number;
  estado: 'Pendiente' | 'En preparación' | 'Listo' | 'Entregado' | 'Cancelado';
  creadoEn: string;
  iniciadoPreparacionEn: string | null;
  listoEn: string | null;
  entregadoEn: string | null;
  canceladoEn: string | null;
  canceladoPor: string | null;
  motivoCancelacion: string | null;
  version: number;
}

export interface PedidoItemResponseDto {
  productoId: number | null;
  nombre: string;
  categoria: string;
  icono: string;
  cantidad: number;
  precioUnitario: number;
  costoUnitario: number;
  subtotal: number;
}
