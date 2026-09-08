export interface SesionCajaResponseDto {
  id: number;
  estado: 'ABIERTA' | 'CERRADA';
  abiertaPor: string;
  abiertaEn: string;
  saldoInicial: number;
  cerradaEn: string | null;
  cerradaPor: string | null;
  ventasEfectivo: number;
  ventasTransferencia: number;
  gastosEfectivo: number;
  efectivoEsperado: number;
  efectivoDeclarado: number | null;
  diferencia: number | null;
}
