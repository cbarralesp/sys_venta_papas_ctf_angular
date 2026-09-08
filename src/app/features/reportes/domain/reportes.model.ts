export type FiltroRangoReporte = 'Semana' | 'Mes';

export interface VentaDiaria {
  fecha: Date;
  totalVentas: number;
  cantidadPedidos: number;
}

export interface ProductoVendido {
  productoId: number;
  nombre: string;
  categoria: string;
  icono: string;
  cantidadVendida: number;
  totalGenerado: number;
}

export interface ReporteVentas {
  desde: Date;
  hasta: Date;
  totalVentas: number;
  totalPedidos: number;
  promedioDiario: number;
  ticketPromedio: number;
  ventasDiarias: VentaDiaria[];
  productosVendidos: ProductoVendido[];
}
