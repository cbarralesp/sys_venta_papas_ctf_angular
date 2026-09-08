import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductosService } from './productos.service';
import { ProductosRepository } from '../../features/productos/domain/productos.repository';
import { ProductosApiRepository } from '../../features/productos/data-access/productos-api.repository';
import { API_BASE_URL } from '../config/api.config';

describe('Catalogo HTTP', () => {
  let service: ProductosService;
  let http: HttpTestingController;
  const categorias = [{ id: 42, nombre: 'Vacia', icono: '', totalProductos: 0 }];

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(),
        { provide: ProductosRepository, useClass: ProductosApiRepository }],
    });
    service = TestBed.inject(ProductosService);
    http = TestBed.inject(HttpTestingController);
    http.expectOne(API_BASE_URL + '/categorias').flush(categorias);
    http.expectOne(API_BASE_URL + '/productos').flush([]);
    await Promise.resolve();
  });

  afterEach(() => http.verify());

  it('elimina una categoria vacia usando su ID real', async () => {
    const resultado = service.eliminarCategoria('Vacia');
    const request = http.expectOne(API_BASE_URL + '/categorias/42');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
    expect(await resultado).toBe(true);
    expect(service.categorias()).toEqual([]);
  });

  it('renombra una categoria vacia y recarga el catalogo', async () => {
    const resultado = service.editarCategoria('Vacia', 'Nueva');
    const request = http.expectOne(API_BASE_URL + '/categorias/42');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ nombre: 'Nueva' });
    request.flush({ ...categorias[0], nombre: 'Nueva' });
    await Promise.resolve();
    http.expectOne(API_BASE_URL + '/categorias').flush([{ ...categorias[0], nombre: 'Nueva' }]);
    http.expectOne(API_BASE_URL + '/productos').flush([]);
    expect(await resultado).toBe(true);
    expect(service.categorias()).toEqual(['Nueva']);
  });

  it('conserva el estado ante conflicto y permite reintentar', async () => {
    const resultado = service.eliminarCategoria('Vacia');
    http.expectOne(API_BASE_URL + '/categorias/42').flush(
      { message: 'La categoria tiene productos asociados' }, { status: 409, statusText: 'Conflict' });
    expect(await resultado).toBe(false);
    expect(service.categorias()).toEqual(['Vacia']);
    expect(service.error()).toBe('La categoria tiene productos asociados');
    expect(service.guardando()).toBe(false);
  });

  it('evita enviar dos escrituras simultaneas', async () => {
    const primera = service.eliminarCategoria('Vacia');
    expect(await service.eliminarCategoria('Vacia')).toBe(false);
    http.expectOne(API_BASE_URL + '/categorias/42').flush(null);
    expect(await primera).toBe(true);
  });

  it('conserva el costo al editar desde un formulario que no lo incluye', async () => {
    const producto = { id: 7, nombre: 'Producto', categoriaId: 42, categoriaNombre: 'Vacia',
      precioVenta: 3000, costo: 900, disponible: true, icono: '' };
    const carga = service.recargar();
    http.expectOne(API_BASE_URL + '/categorias').flush(categorias);
    http.expectOne(API_BASE_URL + '/productos').flush([producto]);
    await carga;
    const resultado = service.editarProducto(7, {
      nombre: 'Producto', categoria: 'Vacia', precioVenta: 3500, disponible: true,
    });
    const request = http.expectOne(API_BASE_URL + '/productos/7');
    expect(request.request.body.costo).toBe(900);
    request.flush({ ...producto, precioVenta: 3500 });
    expect(await resultado).toBe(true);
    expect(service.productos()[0].costo).toBe(900);
  });
});
