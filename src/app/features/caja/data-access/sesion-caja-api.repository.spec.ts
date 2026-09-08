import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../../../shared/config/api.config';
import { SesionCajaApiRepository } from './sesion-caja-api.repository';

describe('SesionCajaApiRepository', () => {
  let repository: SesionCajaApiRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SesionCajaApiRepository, provideHttpClient(), provideHttpClientTesting()],
    });
    repository = TestBed.inject(SesionCajaApiRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('consulta y convierte las fechas de la sesión abierta', async () => {
    const resultado = firstValueFrom(repository.consultarActual());
    const request = http.expectOne(`${API_BASE_URL}/caja/sesion/actual`);
    request.flush({
      id: 3,
      estado: 'ABIERTA',
      abiertaPor: 'caja',
      abiertaEn: '2026-09-06T12:00:00Z',
      saldoInicial: 20000,
      cerradaEn: null,
      cerradaPor: null,
      ventasEfectivo: 5000,
      ventasTransferencia: 3000,
      gastosEfectivo: 1000,
      efectivoEsperado: 24000,
      efectivoDeclarado: null,
      diferencia: null,
    });

    const sesion = await resultado;
    expect(sesion?.abiertaEn).toBeInstanceOf(Date);
    expect(sesion?.efectivoEsperado).toBe(24000);
  });

  it('envía saldo inicial y efectivo declarado', async () => {
    const abrir = firstValueFrom(repository.abrir(15000));
    const postAbrir = http.expectOne(`${API_BASE_URL}/caja/sesion/abrir`);
    expect(postAbrir.request.body).toEqual({ saldoInicial: 15000 });
    postAbrir.flush(respuesta('ABIERTA'));
    await abrir;

    const cerrar = firstValueFrom(repository.cerrar(1, 14700));
    const postCerrar = http.expectOne(`${API_BASE_URL}/caja/sesion/1/cerrar`);
    expect(postCerrar.request.body).toEqual({ efectivoDeclarado: 14700 });
    postCerrar.flush(respuesta('CERRADA'));
    await cerrar;

    const reiniciar = firstValueFrom(repository.reiniciar(1, 14700, 1000, 'torrefuerte'));
    const postReiniciar = http.expectOne(`${API_BASE_URL}/caja/sesion/1/reiniciar`);
    expect(postReiniciar.request.body).toEqual({
      efectivoDeclarado: 14700,
      saldoInicialNuevo: 1000,
      contrasenaActual: 'torrefuerte',
    });
    postReiniciar.flush({ sesionCerrada: respuesta('CERRADA'), sesionAbierta: respuesta('ABIERTA') });
    expect((await reiniciar).sesionAbierta.estado).toBe('ABIERTA');

    const eliminar = firstValueFrom(repository.eliminar(1));
    const deleteTurno = http.expectOne(`${API_BASE_URL}/caja/sesion/1`);
    expect(deleteTurno.request.method).toBe('DELETE');
    deleteTurno.flush(null);
    await eliminar;
  });

  it('consulta historial y detalle convirtiendo sus fechas', async () => {
    const historial = firstValueFrom(repository.listarHistorial(10));
    const getHistorial = http.expectOne(
      (request) =>
        request.url === `${API_BASE_URL}/caja/sesion/historial` &&
        request.params.get('limite') === '10',
    );
    getHistorial.flush([respuesta('CERRADA')]);

    expect((await historial)[0].cerradaEn).toBeInstanceOf(Date);

    const detalle = firstValueFrom(repository.consultarCerrada(1));
    const getDetalle = http.expectOne(`${API_BASE_URL}/caja/sesion/historial/1`);
    getDetalle.flush(respuesta('CERRADA'));

    expect((await detalle).diferencia).toBe(-300);

    const ventas = firstValueFrom(repository.listarVentas(1));
    const getVentas = http.expectOne(`${API_BASE_URL}/caja/sesion/1/ventas`);
    getVentas.flush([pedidoRespuesta()]);

    expect((await ventas)[0].creadoEn).toBeInstanceOf(Date);
  });
});

function respuesta(estado: 'ABIERTA' | 'CERRADA') {
  return {
    id: 1,
    estado,
    abiertaPor: 'caja',
    abiertaEn: '2026-09-06T12:00:00Z',
    saldoInicial: 15000,
    cerradaEn: estado === 'CERRADA' ? '2026-09-06T20:00:00Z' : null,
    cerradaPor: estado === 'CERRADA' ? 'caja' : null,
    ventasEfectivo: 0,
    ventasTransferencia: 0,
    gastosEfectivo: 0,
    efectivoEsperado: 15000,
    efectivoDeclarado: estado === 'CERRADA' ? 14700 : null,
    diferencia: estado === 'CERRADA' ? -300 : null,
  };
}

function pedidoRespuesta() {
  return {
    id: 10,
    numero: '010',
    sesionCajaId: 1,
    items: [{
      productoId: 1,
      nombre: 'Papas',
      categoria: 'Papas fritas',
      icono: '🍟',
      cantidad: 1,
      precioUnitario: 2000,
      costoUnitario: 900,
      subtotal: 2000,
    }],
    formaPago: 'Efectivo',
    tipoEntrega: 'Para llevar',
    notas: '',
    subtotal: 2000,
    total: 2000,
    estado: 'Entregado',
    creadoEn: '2026-09-06T12:30:00Z',
    iniciadoPreparacionEn: null,
    listoEn: null,
    entregadoEn: '2026-09-06T12:40:00Z',
    canceladoEn: null,
    canceladoPor: null,
    motivoCancelacion: null,
    version: 3,
  };
}
