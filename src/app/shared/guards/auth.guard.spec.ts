import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { authGuard, roleGuard } from './auth.guard';
import { AuthRole } from '../../features/auth/domain/auth.model';
import { AuthService } from '../services/auth.service';

describe('authentication and role guards', () => {
  const auth = {
    authenticated: false,
    role: null as AuthRole | null,
    autenticado: () => auth.authenticated,
    tieneRol: (...roles: AuthRole[]) => auth.role !== null && roles.includes(auth.role),
    rutaInicial: () => auth.role === 'COCINA' ? '/cocina' : '/caja',
  };
  const router = {
    createUrlTree: (commands: string[]) => commands,
  };

  beforeEach(() => {
    auth.authenticated = false;
    auth.role = null;
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('redirects an unauthenticated user to login', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

    expect(result).toEqual(['/login']);
  });

  it('allows a user whose role is accepted', () => {
    auth.authenticated = true;
    auth.role = 'CAJA';
    const route = { data: { roles: ['ADMIN', 'CAJA'] } } as unknown as ActivatedRouteSnapshot;

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(route, {} as RouterStateSnapshot),
    );

    expect(result).toBe(true);
  });

  it('redirects CAJA away from administrative routes', () => {
    auth.authenticated = true;
    auth.role = 'CAJA';
    const route = { data: { roles: ['ADMIN'] } } as unknown as ActivatedRouteSnapshot;

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(route, {} as RouterStateSnapshot),
    );

    expect(result).toEqual(['/caja']);
  });

  it('redirects COCINA away from cash desk routes', () => {
    auth.authenticated = true;
    auth.role = 'COCINA';
    const route = { data: { roles: ['ADMIN', 'CAJA'] } } as unknown as ActivatedRouteSnapshot;

    const result = TestBed.runInInjectionContext(() =>
      roleGuard(route, {} as RouterStateSnapshot),
    );

    expect(result).toEqual(['/cocina']);
  });
});
