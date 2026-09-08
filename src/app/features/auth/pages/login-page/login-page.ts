import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly usuario = signal('');
  readonly contrasena = signal('');
  readonly error = this.authService.error;
  readonly cargando = signal(false);
  readonly contrasenaActualizada = signal(this.route.snapshot.queryParamMap.get('passwordChanged') === '1');

  async ingresar(): Promise<void> {
    if (this.cargando()) return;

    this.error.set(null);

    const usuario = this.usuario().trim();
    const contrasena = this.contrasena().trim();
    if (!usuario || !contrasena) {
      this.error.set('Ingresa usuario y contraseña para continuar.');
      return;
    }

    this.cargando.set(true);

    const ok = await this.authService.login(usuario, contrasena);
    this.cargando.set(false);
    if (ok) {
      await this.router.navigate([this.authService.rutaInicial()]);
    }
  }
}
