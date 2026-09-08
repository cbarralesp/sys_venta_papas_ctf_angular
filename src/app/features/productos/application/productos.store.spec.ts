import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProductosService } from '../../../shared/services/productos.service';
import { Producto } from '../domain/producto.model';
import { ProductosStore } from './productos.store';

describe('ProductosStore', () => {
  const productos = signal<Producto[]>([]);
  const categorias = signal<string[]>([]);
  const service = {
    productos,
    categorias,
    error: signal<string | null>(null),
    cargando: signal(false),
    guardando: signal(false),
    recargar: vi.fn(async () => undefined),
    crearCategoria: vi.fn(async () => true),
    editarCategoria: vi.fn(async () => true),
    eliminarCategoria: vi.fn(async () => true),
    crearProducto: vi.fn(async () => true),
    editarProducto: vi.fn(async () => true),
    eliminarProducto: vi.fn(async () => true),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    categorias.set(['Papas', 'Bebidas']);
    productos.set([
      {
        id: 1,
        nombre: 'Papas',
        categoria: 'Papas',
        categoriaId: 1,
        precioVenta: 2000,
        costo: 900,
        disponible: true,
        icono: '',
      },
      {
        id: 2,
        nombre: 'Bebida',
        categoria: 'Bebidas',
        categoriaId: 2,
        precioVenta: 1500,
        costo: 500,
        disponible: true,
        icono: '',
      },
    ]);
    service.crearCategoria.mockResolvedValue(true);
    service.eliminarCategoria.mockResolvedValue(true);
    TestBed.configureTestingModule({
      providers: [ProductosStore, { provide: ProductosService, useValue: service }],
    });
  });

  it('filtra y cuenta productos por categoría', () => {
    const store = TestBed.inject(ProductosStore);
    store.seleccionarCategoria('Bebidas');
    expect(store.productosFiltrados().map((producto) => producto.id)).toEqual([2]);
    expect(store.contarPorCategoria('Todos')).toBe(2);
  });

  it('impide eliminar una categoría que todavía tiene productos', async () => {
    const store = TestBed.inject(ProductosStore);
    expect(await store.eliminarCategoria('Papas')).toBe(false);
    expect(service.eliminarCategoria).not.toHaveBeenCalled();
  });

  it('selecciona una categoría creada y confirmada por el servicio', async () => {
    const store = TestBed.inject(ProductosStore);
    expect(await store.crearCategoria('Combos')).toBe(true);
    expect(store.categoriaActiva()).toBe('Combos');
  });
});
