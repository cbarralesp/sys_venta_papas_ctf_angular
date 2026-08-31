import { MovimientoFinanciero } from './finanzas.model';

export abstract class FinanzasRepository {
  abstract obtenerMovimientosIniciales(): MovimientoFinanciero[];
}
