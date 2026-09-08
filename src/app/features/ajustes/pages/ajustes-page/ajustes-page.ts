import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AjustesStore } from '../../application/ajustes.store';
import { UsuariosStore } from '../../../usuarios/application/usuarios.store';
import { RolUsuario, UsuarioAdministracion } from '../../../usuarios/domain/usuario-administracion.model';
import { AuditoriaStore } from '../../../auditoria/application/auditoria.store';
import { AccionAuditoria } from '../../../auditoria/domain/evento-auditoria.model';

@Component({
  selector: 'app-ajustes',
  imports: [ReactiveFormsModule],
  providers: [AjustesStore, UsuariosStore, AuditoriaStore],
  templateUrl: './ajustes-page.html',
  styleUrl: './ajustes-page.scss',
})
export class Ajustes {
  private readonly formBuilder = inject(FormBuilder);
  readonly ajustesStore = inject(AjustesStore);
  readonly usuariosStore = inject(UsuariosStore);
  readonly auditoriaStore = inject(AuditoriaStore);
  readonly usuarioContrasena = signal<UsuarioAdministracion | null>(null);
  readonly confirmacionReinicioDatos = signal('');

  readonly guardadoRecientemente = this.ajustesStore.guardadoRecientemente;
  readonly cargando = this.ajustesStore.cargando;
  readonly guardando = this.ajustesStore.guardando;
  readonly error = this.ajustesStore.error;
  readonly reinicioDatosReciente = this.ajustesStore.reinicioDatosReciente;

  readonly informacionForm = this.formBuilder.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    subtitulo: ['', [Validators.required, Validators.maxLength(150)]],
    icono: ['', [Validators.required, Validators.maxLength(20)]],
  });

  readonly operativasForm = this.formBuilder.nonNullable.group({
    moneda: ['CLP', [Validators.required, Validators.pattern(/^(CLP|USD|EUR)$/)]],
    impuestoPorcentaje: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    tiempoEstimadoPreparacionMin: [10, [Validators.required, Validators.min(1), Validators.max(180)]],
  });

  readonly notificacionesForm = this.formBuilder.nonNullable.group({
    sonidoNuevoPedido: [true],
    alertaPedidoDemorado: [true],
    minutosParaAlertaDemora: [10, [Validators.required, Validators.min(1), Validators.max(180)]],
  });

  readonly usuarioForm = this.formBuilder.nonNullable.group({
    nombreUsuario: ['', [Validators.required, Validators.maxLength(60), Validators.pattern(/^[A-Za-z0-9._-]+$/)]],
    nombreVisible: ['', [Validators.required, Validators.maxLength(100)]],
    contrasena: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    rol: ['CAJA' as RolUsuario, Validators.required],
  });

  readonly contrasenaForm = this.formBuilder.nonNullable.group({
    nuevaContrasena: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
  });

  constructor() {
    effect(() => {
      const ajustes = this.ajustesStore.ajustes();
      this.informacionForm.patchValue(ajustes.informacion, { emitEvent: false });
      this.operativasForm.patchValue({
        ...ajustes.operativas,
        impuestoPorcentaje: 0,
      }, { emitEvent: false });
      this.notificacionesForm.patchValue(ajustes.notificaciones, { emitEvent: false });
    });
  }

  async guardarCambios(): Promise<void> {
    if (this.informacionForm.invalid || this.operativasForm.invalid || this.notificacionesForm.invalid) {
      this.informacionForm.markAllAsTouched();
      this.operativasForm.markAllAsTouched();
      this.notificacionesForm.markAllAsTouched();
      return;
    }
    const actual = this.ajustesStore.ajustes();
    await this.ajustesStore.guardarCambios({
      ...actual,
      informacion: this.informacionForm.getRawValue(),
      operativas: {
        ...this.operativasForm.getRawValue(),
        impuestoPorcentaje: 0,
      },
      notificaciones: this.notificacionesForm.getRawValue(),
    });
  }

  recargar(): void {
    void this.ajustesStore.cargar();
    void this.usuariosStore.cargar();
    void this.auditoriaStore.cargar();
  }

  async crearUsuario(): Promise<void> {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }
    if (await this.usuariosStore.crear(this.usuarioForm.getRawValue())) {
      this.usuarioForm.reset({ nombreUsuario: '', nombreVisible: '', contrasena: '', rol: 'CAJA' });
      await this.auditoriaStore.cargar();
    }
  }

  async actualizarRol(usuario: UsuarioAdministracion, event: Event): Promise<void> {
    const rol = (event.target as HTMLSelectElement).value as RolUsuario;
    const actualizado = await this.usuariosStore.actualizar(usuario.id,
      { nombreVisible: usuario.nombreVisible, rol, activo: usuario.activo });
    if (actualizado) await this.auditoriaStore.cargar();
    else await this.usuariosStore.cargar();
  }

  async actualizarNombreVisible(usuario: UsuarioAdministracion, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const nombreVisible = input.value.trim();
    if (nombreVisible.length === 0 || nombreVisible === usuario.nombreVisible) {
      input.value = usuario.nombreVisible;
      return;
    }

    const actualizado = await this.usuariosStore.actualizar(usuario.id,
      { nombreVisible, rol: usuario.rol, activo: usuario.activo });
    if (actualizado) await this.auditoriaStore.cargar();
    else await this.usuariosStore.cargar();
  }

  async actualizarEstado(usuario: UsuarioAdministracion, event: Event): Promise<void> {
    const activo = (event.target as HTMLInputElement).checked;
    const actualizado = await this.usuariosStore.actualizar(usuario.id,
      { nombreVisible: usuario.nombreVisible, rol: usuario.rol, activo });
    if (actualizado) await this.auditoriaStore.cargar();
    else await this.usuariosStore.cargar();
  }

  seleccionarContrasena(usuario: UsuarioAdministracion): void {
    this.usuarioContrasena.set(usuario);
    this.contrasenaForm.reset({ nuevaContrasena: '' });
  }

  estaBloqueado(usuario: UsuarioAdministracion): boolean {
    return usuario.bloqueadoHasta !== null && new Date(usuario.bloqueadoHasta).getTime() > Date.now();
  }

  bloqueoHasta(usuario: UsuarioAdministracion): string {
    return usuario.bloqueadoHasta === null
      ? ''
      : new Intl.DateTimeFormat('es-CL', { dateStyle: 'short', timeStyle: 'short' })
          .format(new Date(usuario.bloqueadoHasta));
  }

  async restablecerContrasena(): Promise<void> {
    const usuario = this.usuarioContrasena();
    if (!usuario || this.contrasenaForm.invalid) {
      this.contrasenaForm.markAllAsTouched();
      return;
    }
    if (await this.usuariosStore.restablecerContrasena(
      usuario.id, this.contrasenaForm.controls.nuevaContrasena.value)) {
      this.usuarioContrasena.set(null);
      this.contrasenaForm.reset({ nuevaContrasena: '' });
      await this.auditoriaStore.cargar();
    }
  }

  async reiniciarDatosOperativos(): Promise<void> {
    if (this.confirmacionReinicioDatos().trim() !== 'REINICIAR') {
      this.confirmacionReinicioDatos.set(this.confirmacionReinicioDatos().trim());
      return;
    }
    if (await this.ajustesStore.reiniciarDatosOperativos(this.confirmacionReinicioDatos().trim())) {
      this.confirmacionReinicioDatos.set('');
      await this.auditoriaStore.cargar();
    }
  }

  actualizarConfirmacionReinicioDatos(value: string): void {
    this.confirmacionReinicioDatos.set(value);
  }

  etiquetaAccion(accion: AccionAuditoria): string {
    const etiquetas: Record<AccionAuditoria, string> = {
      USUARIO_CREADO: 'Usuario creado',
      USUARIO_ACTUALIZADO: 'Acceso actualizado',
      CONTRASENA_RESTABLECIDA: 'Contraseña restablecida',
      CONTRASENA_CAMBIADA: 'Contraseña cambiada',
      AJUSTES_ACTUALIZADOS: 'Ajustes actualizados',
      DATOS_OPERATIVOS_REINICIADOS: 'Datos reiniciados',
      GASTO_CREADO: 'Gasto registrado',
      GASTO_ELIMINADO: 'Gasto eliminado',
      CAJA_ABIERTA: 'Caja abierta',
      CAJA_CERRADA: 'Caja cerrada',
      CAJA_ELIMINADA: 'Turno eliminado',
      PEDIDO_CANCELADO: 'Pedido anulado',
      PRODUCTO_CREADO: 'Producto creado',
      PRODUCTO_ACTUALIZADO: 'Producto actualizado',
      PRODUCTO_ELIMINADO: 'Producto eliminado',
      CATEGORIA_CREADA: 'Categoría creada',
      CATEGORIA_ACTUALIZADA: 'Categoría actualizada',
      CATEGORIA_ELIMINADA: 'Categoría eliminada',
    };
    return etiquetas[accion];
  }

  fechaAuditoria(fecha: string): string {
    return new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' })
      .format(new Date(fecha));
  }
}
