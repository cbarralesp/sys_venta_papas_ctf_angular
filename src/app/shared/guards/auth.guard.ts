import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { AuthRole } from '../../features/auth/domain/auth.model';

/**
 * Guard funcional que protege todas las rutas de la aplicación.
 * Redirige a /login si el usuario no está autenticado.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.autenticado()) return true;

  return router.createUrlTree(['/login']);
};

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const roles = (route.data['roles'] ?? []) as AuthRole[];

  if (roles.length === 0 || authService.tieneRol(...roles)) return true;

  return router.createUrlTree([authService.rutaInicial()]);
};
 
