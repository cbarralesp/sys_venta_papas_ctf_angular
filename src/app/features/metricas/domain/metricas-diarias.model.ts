export interface MetricasDiarias {
  fecha: Date;
  pedidosCreados: number;
  pendientes: number;
  enPreparacion: number;
  listos: number;
  entregados: number;
  cancelados: number;
  totalVentas: number;
  ticketPromedio: number;
  tiempoPromedioPreparacionMin: number;
}
