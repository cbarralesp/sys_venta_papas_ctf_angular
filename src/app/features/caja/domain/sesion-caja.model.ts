export type EstadoSesionCaja = 'ABIERTA' | 'CERRADA';

export interface SesionCaja {
  id: number;
  estado: EstadoSesionCaja;
  abiertaPor: string;
  abiertaEn: Date;
  saldoInicial: number;
  cerradaEn: Date | null;
  cerradaPor: string | null;
  ventasEfectivo: number;
  ventasTransferencia: number;
  gastosEfectivo: number;
  efectivoEsperado: number;
  efectivoDeclarado: number | null;
  diferencia: number | null;
}
