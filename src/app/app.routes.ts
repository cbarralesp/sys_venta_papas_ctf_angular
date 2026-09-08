import { Routes } from '@angular/router';

import { authGuard, roleGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login-page/login-page').then((m) => m.LoginPage),
    title: 'Ingresar | Panel del negocio',
  },
  {
    path: 'caja',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'CAJA'] },
    loadComponent: () => import('./features/caja/pages/caja-page/caja-page').then((page) => page.Caja),
    title: 'Caja | Panel del negocio',
  },
  {
    path: 'pedidos',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'CAJA', 'COCINA'] },
    loadComponent: () => import('./features/pedidos/pages/pedidos-page/pedidos-page').then((page) => page.Pedidos),
    title: 'Pedidos | Panel del negocio',
  },
  {
    path: 'cocina',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'COCINA'] },
    loadComponent: () => import('./features/cocina/pages/cocina-page/cocina-page').then((page) => page.Cocina),
    title: 'Cocina | Panel del negocio',
  },
  {
    path: 'pantalla',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'COCINA'] },
    loadComponent: () =>
      import('./features/cocina/pages/pantalla-page/pantalla-page').then((page) => page.PantallaCocina),
    title: 'Pantalla | Panel del negocio',
  },
  {
    path: 'productos',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./features/productos/pages/productos-page/productos-page').then((page) => page.Productos),
    title: 'Productos y precios | Panel del negocio',
  },
  {
    path: 'finanzas',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./features/finanzas/pages/finanzas-page/finanzas-page').then((page) => page.Finanzas),
    title: 'Finanzas | Panel del negocio',
  },
  {
    path: 'reportes',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./features/reportes/pages/reportes-page/reportes-page').then((page) => page.Reportes),
    title: 'Reportes | Panel del negocio',
  },
  {
    path: 'ajustes',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('./features/ajustes/pages/ajustes-page/ajustes-page').then((page) => page.Ajustes),
    title: 'Ajustes | Panel del negocio',
  },
  {
    path: 'cuenta',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/auth/pages/cuenta-page/cuenta-page').then((page) => page.CuentaPage),
    title: 'Mi cuenta | Panel del negocio',
  },
  { path: '', pathMatch: 'full', redirectTo: 'caja' },
  { path: '**', redirectTo: 'caja' },
];
