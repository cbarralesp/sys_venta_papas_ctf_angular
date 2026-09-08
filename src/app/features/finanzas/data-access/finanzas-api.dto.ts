export interface ResumenFinancieroResponseDto {
  desde: string;
  hasta: string;
  totalIngresos: number;
  totalCostos: number;
  totalGastos: number;
  gananciaBruta: number;
  gananciaNeta: number;
  ticketPromedio: number;
  cantidadVentas: number;
  movimientos: MovimientoVentaResponseDto[];
  ventasPorCategoria: CategoriaFinancieraResponseDto[];
  ventasPorFormaPago: PagoFinancieroResponseDto[];
}

export interface MovimientoVentaResponseDto {
  id: string;
  descripcion: string;
  fecha: string;
  formaPago: 'Efectivo' | 'Transferencia';
  monto: number;
  costo: number;
  categoria: string;
  tipo: 'Venta' | 'Gasto';
}

export interface CrearGastoRequestDto {
  descripcion: string;
  categoria: string;
  formaPago: 'Efectivo' | 'Transferencia';
  monto: number;
  fecha: string;
}

export interface CategoriaFinancieraResponseDto {
  categoria: string;
  ingresos: number;
  costos: number;
  ganancia: number;
}

export interface PagoFinancieroResponseDto {
  formaPago: 'Efectivo' | 'Transferencia';
  total: number;
  cantidad: number;
}
