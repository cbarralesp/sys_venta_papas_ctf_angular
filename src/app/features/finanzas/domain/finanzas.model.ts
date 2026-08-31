export type FormaPagoFinanzas = 'Efectivo' | 'Transferencia';

export type TipoMovimiento = 'Venta' | 'Gasto';

export type FiltroPeriodo = 'Hoy' | 'Semana' | 'Mes';

export interface MovimientoFinanciero {
  id: number;
  fecha: Date;
  descripcion: string;
  categoria: string;
  tipo: TipoMovimiento;
  formaPago: FormaPagoFinanzas;
  monto: number;
  costo: number;
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
