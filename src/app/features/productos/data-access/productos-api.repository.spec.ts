import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../../../shared/config/api.config';
import { ProductosApiRepository } from './productos-api.repository';

describe('ProductosApiRepository', () => {
  let repository: ProductosApiRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductosApiRepository, provideHttpClient(), provideHttpClientTesting()],
    });
    repository = TestBed.inject(ProductosApiRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('mapea categoria e identificador al listar productos', async () => {
    const resultado = firstValueFrom(repository.listarProductos());
    const request = http.expectOne(`${API_BASE_URL}/productos`);
    expect(request.request.method).toBe('GET');
    request.flush([productoDto()]);

    expect(await resultado).toEqual([
      {
        id: 1,
        nombre: 'Papas grandes',
        categoriaId: 2,
        categoria: 'Papas fritas',
        icono: '🍟',
        precioVenta: 2000,
        costo: 900,
        disponible: true,
      },
    ]);
  });

  it('envia el contrato esperado al crear y editar productos', async () => {
    const command = {
      nombre: 'Papas grandes',
      categoria: 'Papas fritas',
      precioVenta: 2000,
      disponible: true,
    };
    const crear = firstValueFrom(repository.crearProducto(command));
    const post = http.expectOne(`${API_BASE_URL}/productos`);
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({
      nombre: command.nombre,
      categoriaNombre: command.categoria,
      precioVenta: 2000,
      costo: null,
      disponible: true,
    });
    post.flush(productoDto());
    await crear;

    const editar = firstValueFrom(repository.editarProducto(1, { ...command, costo: 950 }));
    const put = http.expectOne(`${API_BASE_URL}/productos/1`);
    expect(put.request.method).toBe('PUT');
    expect(put.request.body.costo).toBe(950);
    put.flush({ ...productoDto(), costo: 950 });
    expect((await editar).costo).toBe(950);
  });

  it('usa identificadores estables para editar y eliminar categorias', async () => {
    const listar = firstValueFrom(repository.listarCategorias());
    http
      .expectOne(`${API_BASE_URL}/categorias`)
      .flush([{ id: 2, nombre: 'Papas fritas', icono: '🍟', totalProductos: 1 }]);
    expect(await listar).toEqual([{ id: 2, nombre: 'Papas fritas' }]);

    const editar = firstValueFrom(repository.editarCategoria(2, 'Papas premium'));
    const put = http.expectOne(`${API_BASE_URL}/categorias/2`);
    expect(put.request.body).toEqual({ nombre: 'Papas premium' });
    put.flush({ id: 2, nombre: 'Papas premium', icono: '🍟', totalProductos: 1 });
    expect(await editar).toBe('Papas premium');

    const eliminar = firstValueFrom(repository.eliminarCategoria(2));
    const del = http.expectOne(`${API_BASE_URL}/categorias/2`);
    expect(del.request.method).toBe('DELETE');
    del.flush(null);
    await eliminar;
  });
});

function productoDto() {
  return {
    id: 1,
    nombre: 'Papas grandes',
    categoriaId: 2,
    categoriaNombre: 'Papas fritas',
    icono: '🍟',
    precioVenta: 2000,
    costo: 900,
    disponible: true,
  };
}
