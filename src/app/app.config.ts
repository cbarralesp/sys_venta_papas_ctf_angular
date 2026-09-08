import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { ProductosApiRepository } from './features/productos/data-access/productos-api.repository';
import { ProductosRepository } from './features/productos/domain/productos.repository';
import { PedidosApiRepository } from './features/pedidos/data-access/pedidos-api.repository';
import { PedidosRepository } from './features/pedidos/domain/pedidos.repository';
import { AuthApiRepository } from './features/auth/data-access/auth-api.repository';
import { AuthRepository } from './features/auth/domain/auth.repository';
import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { FinanzasApiRepository } from './features/finanzas/data-access/finanzas-api.repository';
import { FinanzasRepository } from './features/finanzas/domain/finanzas.repository';
import { SesionCajaApiRepository } from './features/caja/data-access/sesion-caja-api.repository';
import { SesionCajaRepository } from './features/caja/domain/sesion-caja.repository';
import { ReportesApiRepository } from './features/reportes/data-access/reportes-api.repository';
import { ReportesRepository } from './features/reportes/domain/reportes.repository';
import { AjustesApiRepository } from './features/ajustes/data-access/ajustes-api.repository';
import { AjustesRepository } from './features/ajustes/domain/ajustes.repository';
import { NotificadorCocinaBrowser } from './features/cocina/data-access/notificador-cocina-browser';
import { NotificadorCocina } from './features/cocina/domain/notificador-cocina';
import { MetricasDiariasApiRepository } from './features/metricas/data-access/metricas-diarias-api.repository';
import { MetricasDiariasRepository } from './features/metricas/domain/metricas-diarias.repository';
import { UsuariosApiRepository } from './features/usuarios/data-access/usuarios-api.repository';
import { UsuariosRepository } from './features/usuarios/domain/usuarios.repository';
import { AuditoriaApiRepository } from './features/auditoria/data-access/auditoria-api.repository';
import { AuditoriaRepository } from './features/auditoria/domain/auditoria.repository';
import { ImpresorPedidos } from './features/pedidos/domain/impresor-pedidos';
import { ImpresorPedidosBrowser } from './features/pedidos/data-access/impresor-pedidos-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    // Implementación real (HTTP) del contrato ProductosRepository.
    // Cualquier servicio/store que inyecte `ProductosRepository`
    // recibirá este adapter sin conocer que es HTTP por debajo
    // (arquitectura hexagonal: puertos y adapters).
    { provide: ProductosRepository, useClass: ProductosApiRepository },
    { provide: PedidosRepository, useClass: PedidosApiRepository },
    { provide: AuthRepository, useClass: AuthApiRepository },
    { provide: FinanzasRepository, useClass: FinanzasApiRepository },
    { provide: SesionCajaRepository, useClass: SesionCajaApiRepository },
    { provide: ReportesRepository, useClass: ReportesApiRepository },
    { provide: AjustesRepository, useClass: AjustesApiRepository },
    { provide: NotificadorCocina, useClass: NotificadorCocinaBrowser },
    { provide: MetricasDiariasRepository, useClass: MetricasDiariasApiRepository },
    { provide: UsuariosRepository, useClass: UsuariosApiRepository },
    { provide: AuditoriaRepository, useClass: AuditoriaApiRepository },
    { provide: ImpresorPedidos, useClass: ImpresorPedidosBrowser },
  ],
};
