import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'caja',
    loadComponent: () => import('./features/caja/pages/caja-page/caja-page').then((page) => page.Caja),
    title: 'Caja | Panel del negocio',
  },
  {
    path: 'pedidos',
    loadComponent: () => import('./features/pedidos/pages/pedidos-page/pedidos-page').then((page) => page.Pedidos),
    title: 'Pedidos | Panel del negocio',
  },
  {
    path: 'cocina',
    loadComponent: () => import('./features/cocina/pages/cocina-page/cocina-page').then((page) => page.Cocina),
    title: 'Cocina | Panel del negocio',
  },
  {
    path: 'pantalla',
    loadComponent: () =>
      import('./features/cocina/pages/pantalla-page/pantalla-page').then((page) => page.PantallaCocina),
    title: 'Pantalla | Panel del negocio',
  },
  {
    path: 'productos',
    loadComponent: () =>
      import('./features/productos/pages/productos-page/productos-page').then((page) => page.Productos),
    title: 'Productos y precios | Panel del negocio',
  },
  {
    path: 'finanzas',
    loadComponent: () =>
      import('./features/finanzas/pages/finanzas-page/finanzas-page').then((page) => page.Finanzas),
    title: 'Finanzas | Panel del negocio',
  },
  {
    path: 'reportes',
    loadComponent: () =>
      import('./features/reportes/pages/reportes-page/reportes-page').then((page) => page.Reportes),
    title: 'Reportes | Panel del negocio',
  },
  {
    path: 'ajustes',
    loadComponent: () => import('./features/ajustes/pages/ajustes-page/ajustes-page').then((page) => page.Ajustes),
    title: 'Ajustes | Panel del negocio',
  },
  { path: '', pathMatch: 'full', redirectTo: 'caja' },
  { path: '**', redirectTo: 'caja' },
];
