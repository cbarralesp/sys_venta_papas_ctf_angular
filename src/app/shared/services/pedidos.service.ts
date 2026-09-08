import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CrearPedidoCommand, EstadoPedido, PedidoGestion } from '../../features/pedidos/domain/pedido-gestion.model';
import { PedidosRepository } from '../../features/pedidos/domain/pedidos.repository';
import { apiErrorMessage } from './api-error-message';

@Injectable({ providedIn: 'root' })
export class PedidosService {
  private readonly repository = inject(PedidosRepository);
  private readonly _pedidos = signal<PedidoGestion[]>([]);
  private readonly cargaInicial: Promise<boolean>;

  readonly pedidos = this._pedidos.asReadonly();
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.cargaInicial = this.cargar();
  }

  async cargar(): Promise<boolean> {
    if (this.cargando() || this.guardando()) return false;
    this.cargando.set(true);
    this.error.set(null);
    try {
      this._pedidos.set(await firstValueFrom(this.repository.listar()));
      return true;
    } catch (error) {
      this.error.set(apiErrorMessage(error, 'No se pudieron cargar los pedidos. Verifica la conexion.'));
      return false;
    } finally {
      this.cargando.set(false);
    }
  }

  async buscarPorId(id: number): Promise<boolean> {
    await this.cargaInicial;
    try {
      const pedido = await firstValueFrom(this.repository.buscarPorId(id));
      this._pedidos.update((lista) => {
        const existe = lista.some((actual) => actual.id === id);
        return existe
          ? lista.map((actual) => actual.id === id ? pedido : actual)
          : [pedido, ...lista];
      });
      return true;
    } catch (error) {
      this.error.set(apiErrorMessage(error, 'No se pudo consultar el detalle del pedido.'));
      return false;
    }
  }

  async crear(command: CrearPedidoCommand): Promise<boolean> {
    await this.cargaInicial;
    if (this.guardando()) return false;
    this.guardando.set(true);
    this.error.set(null);
    try {
      const pedido = await firstValueFrom(this.repository.crear(command));
      this._pedidos.update((lista) =>
        lista.some((actual) => actual.id === pedido.id) ? lista : [pedido, ...lista],
      );
      return true;
    } catch (error) {
      this.error.set(apiErrorMessage(error, 'No se pudo crear el pedido. Puedes reintentar sin duplicarlo.'));
      return false;
    } finally {
      this.guardando.set(false);
    }
  }

  async actualizarEstado(id: number, estado: EstadoPedido): Promise<boolean> {
    await this.cargaInicial;
    if (this.guardando()) return false;
    const actual = this._pedidos().find((pedido) => pedido.id === id);
    if (!actual) {
      this.error.set('Pedido no encontrado. Actualiza la lista.');
      return false;
    }
    this.guardando.set(true);
    this.error.set(null);
    try {
      const actualizado = await firstValueFrom(
        this.repository.actualizarEstado(id, estado, actual.version ?? 0),
      );
      this._pedidos.update((lista) =>
        lista.map((pedido) => pedido.id === id ? actualizado : pedido),
      );
      return true;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) {
        try {
          this._pedidos.set(await firstValueFrom(this.repository.listar()));
        } catch {
          // Se conserva la lista actual si también falla la recarga.
        }
        this.error.set('El pedido cambió en otra pantalla. Se actualizó la lista.');
      } else {
        this.error.set(apiErrorMessage(error, 'No se pudo actualizar el estado del pedido.'));
      }
      return false;
    } finally {
      this.guardando.set(false);
    }
  }

  async cancelar(id: number, motivo: string): Promise<boolean> {
    await this.cargaInicial;
    if (this.guardando()) return false;
    const actual = this._pedidos().find((pedido) => pedido.id === id);
    if (!actual) return false;
    this.guardando.set(true);
    this.error.set(null);
    try {
      const cancelado = await firstValueFrom(this.repository.cancelar(id, motivo, actual.version ?? 0));
      this._pedidos.update((lista) => lista.map((pedido) => pedido.id === id ? cancelado : pedido));
      return true;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) {
        await this.cargarDespuesDeConflicto();
        this.error.set('El pedido cambió o ya no puede anularse. Se actualizó la lista.');
      } else {
        this.error.set(apiErrorMessage(error, 'No se pudo anular el pedido.'));
      }
      return false;
    } finally {
      this.guardando.set(false);
    }
  }

  private async cargarDespuesDeConflicto(): Promise<void> {
    try {
      this._pedidos.set(await firstValueFrom(this.repository.listar()));
    } catch {
      // Se conserva la lista actual si también falla la recarga.
    }
  }
}
