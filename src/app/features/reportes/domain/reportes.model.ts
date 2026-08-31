export type FiltroRangoReporte = 'Semana' | 'Mes';

export interface VentaDiaria {
  fecha: Date;
  totalVentas: number;
  cantidadPedidos: number;
}

export interface ProductoVendido {
  nombre: string;
  categoria: string;
  icono: string;
  cantidadVendida: number;
  totalGenerado: number;
}
