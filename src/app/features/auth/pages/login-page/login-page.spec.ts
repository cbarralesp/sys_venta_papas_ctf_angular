import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../../shared/services/auth.service';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let authService: {
    error: ReturnType<typeof signal<string | null>>;
    login: ReturnType<typeof vi.fn>;
    rutaInicial: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authService = {
      error: signal<string | null>(null),
      login: vi.fn().mockResolvedValue(true),
      rutaInicial: vi.fn().mockReturnValue('/caja'),
    };
    router = { navigate: vi.fn().mockResolvedValue(true) };

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: () => null,
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
  });

  it('muestra error local cuando faltan credenciales', async () => {
    await fixture.componentInstance.ingresar();

    expect(authService.login).not.toHaveBeenCalled();
    expect(authService.error()).toBe('Ingresa usuario y contraseña para continuar.');
  });

  it('envia credenciales normalizadas y navega al modulo inicial', async () => {
    fixture.componentInstance.usuario.set(' capilla ');
    fixture.componentInstance.contrasena.set(' torrefuerte ');

    await fixture.componentInstance.ingresar();

    expect(authService.login).toHaveBeenCalledWith('capilla', 'torrefuerte');
    expect(router.navigate).toHaveBeenCalledWith(['/caja']);
  });
});
