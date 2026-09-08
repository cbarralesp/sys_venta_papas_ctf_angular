export interface ReporteVentasResponseDto {
  desde: string;
  hasta: string;
  totalVentas: number;
  totalPedidos: number;
  promedioDiario: number;
  ticketPromedio: number;
  ventasDiarias: VentaDiariaResponseDto[];
  productosVendidos: ProductoVendidoResponseDto[];
}

export interface VentaDiariaResponseDto {
  fecha: string;
  totalVentas: number;
  cantidadPedidos: number;
}

export interface ProductoVendidoResponseDto {
  productoId: number;
  nombre: string;
  categoria: string;
  icono: string;
  cantidadVendida: number;
  totalGenerado: number;
}
