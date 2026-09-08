import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuditoriaRepository } from '../domain/auditoria.repository';
import { EventoAuditoria } from '../domain/evento-auditoria.model';
import { AuditoriaStore } from './auditoria.store';

describe('AuditoriaStore', () => {
  const evento: EventoAuditoria = {
    id: 1,
    actor: 'capilla',
    accion: 'PRODUCTO_CREADO',
    recurso: 'producto',
    recursoId: '5',
    detalle: 'Producto creado',
    fecha: '2026-09-07T10:00:00-03:00',
  };
  const repository = { listarRecientes: vi.fn(() => of([evento])) };

  beforeEach(() => {
    vi.clearAllMocks();
    repository.listarRecientes.mockReturnValue(of([evento]));
    TestBed.configureTestingModule({
      providers: [AuditoriaStore, { provide: AuditoriaRepository, useValue: repository }],
    });
  });

  it('consulta los últimos 50 eventos', async () => {
    const store = TestBed.inject(AuditoriaStore);
    await Promise.resolve();
    expect(repository.listarRecientes).toHaveBeenCalledWith(50);
    expect(store.eventos()).toEqual([evento]);
  });

  it('informa el error de lectura sin conservar datos parciales', async () => {
    repository.listarRecientes.mockReturnValue(throwError(() => new Error('fallo')));
    const store = TestBed.inject(AuditoriaStore);
    await Promise.resolve();
    expect(store.eventos()).toEqual([]);
    expect(store.error()).toContain('actividad reciente');
  });
});
