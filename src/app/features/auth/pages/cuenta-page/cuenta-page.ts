import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CuentaStore } from '../../application/cuenta.store';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-cuenta-page',
  imports: [ReactiveFormsModule],
  providers: [CuentaStore],
  templateUrl: './cuenta-page.html',
  styleUrl: './cuenta-page.scss',
})
export class CuentaPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly store = inject(CuentaStore);
  readonly usuario = this.authService.usuario;

  readonly form = this.formBuilder.nonNullable.group({
    contrasenaActual: ['', [Validators.required]],
    nuevaContrasena: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    confirmacion: ['', [Validators.required]],
  });

  async guardar(): Promise<void> {
    if (this.form.invalid || this.form.controls.nuevaContrasena.value !== this.form.controls.confirmacion.value) {
      this.form.markAllAsTouched();
      return;
    }
    const { contrasenaActual, nuevaContrasena } = this.form.getRawValue();
    if (await this.store.cambiarContrasena(contrasenaActual, nuevaContrasena)) {
      this.authService.logout();
      await this.router.navigate(['/login'], { queryParams: { passwordChanged: '1' } });
    }
  }

  contrasenasNoCoinciden(): boolean {
    const { nuevaContrasena, confirmacion } = this.form.getRawValue();
    return confirmacion.length > 0 && nuevaContrasena !== confirmacion;
  }
}
