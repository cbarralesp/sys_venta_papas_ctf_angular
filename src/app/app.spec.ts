import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { App } from './app';
import { AuthRepository } from './features/auth/domain/auth.repository';
import { AuthApiRepository } from './features/auth/data-access/auth-api.repository';
import { AuthSessionService } from './shared/services/auth-session.service';
import { AjustesRepository } from './features/ajustes/domain/ajustes.repository';
import { AjustesNegocio } from './features/ajustes/domain/ajustes.model';
import { of } from 'rxjs';

const ajustes: AjustesNegocio = {
  informacion: { nombre: 'Panel del negocio', subtitulo: 'Sistema de ventas', icono: '🍟' },
  operativas: { moneda: 'CLP', impuestoPorcentaje: 0, tiempoEstimadoPreparacionMin: 10 },
  notificaciones: { sonidoNuevoPedido: true, alertaPedidoDemorado: true, minutosParaAlertaDemora: 10 },
  actualizadoEn: new Date(),
  actualizadoPor: 'sistema',
  version: 0,
};

class AjustesRepositoryStub implements AjustesRepository {
  consultar() { return of(ajustes); }
  actualizar() { return of(ajustes); }
  reiniciarDatosOperativos() { return of({ pedidosEliminados: 0, gastosEliminados: 0, turnosEliminados: 0 }); }
}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AuthRepository, useClass: AuthApiRepository },
        { provide: AjustesRepository, useClass: AjustesRepositoryStub },
      ],
    }).compileComponents();
  });

  afterEach(() => sessionStorage.clear());

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the business navigation', async () => {
    TestBed.inject(AuthSessionService).guardar({
      accessToken: 'test-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      usuario: { id: 1, usuario: 'capilla', nombre: 'Administrador', rol: 'ADMIN' },
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('nav')?.textContent).toContain('Productos');
  });

  it('should render only cash desk navigation for CAJA', async () => {
    TestBed.inject(AuthSessionService).guardar({
      accessToken: 'test-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      usuario: { id: 2, usuario: 'caja', nombre: 'Caja', rol: 'CAJA' },
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const navigation = fixture.nativeElement.querySelector('nav')?.textContent ?? '';

    expect(navigation).toContain('Caja');
    expect(navigation).toContain('Pedidos');
    expect(navigation).not.toContain('Productos');
    expect(navigation).not.toContain('Finanzas');
    expect(navigation).not.toContain('Cocina');
  });

  it('should render only kitchen navigation for COCINA', async () => {
    TestBed.inject(AuthSessionService).guardar({
      accessToken: 'test-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      usuario: { id: 3, usuario: 'cocina', nombre: 'Cocina', rol: 'COCINA' },
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const navigation = fixture.nativeElement.querySelector('nav')?.textContent ?? '';

    expect(navigation).toContain('Pedidos');
    expect(navigation).toContain('Cocina');
    expect(navigation).toContain('Pantalla');
    expect(navigation).not.toContain('Caja');
    expect(navigation).not.toContain('Productos');
    expect(navigation).not.toContain('Finanzas');
  });
});
