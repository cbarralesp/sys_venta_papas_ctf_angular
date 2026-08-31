import { ProductoVendido, VentaDiaria } from './reportes.model';

export abstract class ReportesRepository {
  abstract obtenerVentasDiarias(): VentaDiaria[];
  abstract obtenerProductosVendidos(): ProductoVendido[];
}
