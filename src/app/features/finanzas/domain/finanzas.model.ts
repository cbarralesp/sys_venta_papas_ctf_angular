export type FormaPagoFinanzas = 'Efectivo' | 'Transferencia';

export type TipoMovimiento = 'Venta' | 'Gasto';

export type FiltroPeriodo = 'Hoy' | 'Semana' | 'Mes';

export interface MovimientoFinanciero {
  id: string;
  fecha: Date;
  descripcion: string;
  categoria: string;
  tipo: TipoMovimiento;
  formaPago: FormaPagoFinanzas;
  monto: number;
  costo: number;
}

export interface ResumenFinanciero {
  desde: Date;
  hasta: Date;
  totalIngresos: number;
  totalCostos: number;
  totalGastos: number;
  gananciaBruta: number;
  gananciaNeta: number;
  cantidadVentas: number;
  movimientos: MovimientoFinanciero[];
  ventasPorCategoria: ResumenPorCategoria[];
  ventasPorFormaPago: ResumenPorFormaPago[];
}

export interface CrearGastoCommand {
  descripcion: string;
  categoria: string;
  formaPago: FormaPagoFinanzas;
  monto: number;
  fecha: Date;
}

export interface ResumenPorCategoria {
  categoria: string;
  ingresos: number;
  costos: number;
  ganancia: number;
}

export interface ResumenPorFormaPago {
  formaPago: FormaPagoFinanzas;
  total: number;
  cantidad: number;
}
