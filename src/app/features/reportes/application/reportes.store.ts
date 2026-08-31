import { Injectable, computed, inject, signal } from '@angular/core';

import { PedidosService } from '../../../shared/services/pedidos.service';
import { FiltroRangoReporte, ProductoVendido, VentaDiaria } from '../domain/reportes.model';
import { ReportesRepository } from '../domain/reportes.repository';

const DIAS_POR_RANGO: Record<FiltroRangoReporte, number> = {
  Semana: 7,
  Mes: 30,
};

@Injectable()
export class ReportesStore {
  private readonly repository = inject(ReportesRepository);
  private readonly pedidosService = inject(PedidosService);

  readonly rango = signal<FiltroRangoReporte>('Semana');
  readonly rangos: readonly FiltroRangoReporte[] = ['Semana', 'Mes'];

  /**
   * Ventas diarias: datos históricos del seed + el día de hoy calculado
   * en tiempo real desde el servicio de pedidos (pedidos Entregados).
   */
  readonly ventasDiarias = computed<VentaDiaria[]>(() => {
    const historico = this.repository.obtenerVentasDiarias();
    const pedidosEntregados = this.pedidosService.pedidos().filter((p) => p.estado === 'Entregado');

    if (pedidosEntregados.length === 0) return historico;

    // Agrupa pedidos entregados por día (clave: YYYY-MM-DD)
    const porDia = new Map<string, { totalVentas: number; cantidadPedidos: number; fecha: Date }>();
    for (const p of pedidosEntregados) {
      const fecha = p.creadoEn;
      const clave = `${fecha.getFullYear()}-${fecha.getMonth()}-${fecha.getDate()}`;
      const actual = porDia.get(clave) ?? { totalVentas: 0, cantidadPedidos: 0, fecha };
      actual.totalVentas += p.total;
      actual.cantidadPedidos += 1;
      porDia.set(clave, actual);
    }

    // Reemplaza (o agrega) los días del seed que coincidan con datos en vivo
    const hoy = new Date();
    const clavesEnVivo = new Set(porDia.keys());
    const resultado = historico.filter((v) => {
      const d = v.fecha;
      const clave = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      return !clavesEnVivo.has(clave);
    });

    for (const [, datos] of porDia.entries()) {
      resultado.push({ fecha: datos.fecha, totalVentas: datos.totalVentas, cantidadPedidos: datos.cantidadPedidos });
    }

    return resultado.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

    void hoy; // supress unused warning — hoy se usa conceptualmente para separar datos
  });

  /**
   * Productos vendidos: combinación de datos históricos del seed más
   * lo generado en tiempo real por pedidos Entregados del servicio.
   */
  readonly productosVendidos = computed<ProductoVendido[]>(() => {
    const pedidosEntregados = this.pedidosService.pedidos().filter((p) => p.estado === 'Entregado');

    if (pedidosEntregados.length === 0) return this.repository.obtenerProductosVendidos();

    // Agrupa por nombre de producto
    const mapa = new Map<string, ProductoVendido>();
    for (const p of pedidosEntregados) {
      for (const item of p.items) {
        const actual = mapa.get(item.nombre) ?? {
          nombre: item.nombre,
          categoria: this.categoriaDesdeNombre(item.nombre),
          icono: item.icono ?? '🍽️',
          cantidadVendida: 0,
          totalGenerado: 0,
        };
        actual.cantidadVendida += item.cantidad;
        actual.totalGenerado += item.cantidad * item.precioUnitario;
        mapa.set(item.nombre, actual);
      }
    }

    return [...mapa.values()];
  });

  readonly ventasEnRango = computed(() => {
    const dias = DIAS_POR_RANGO[this.rango()];
    return this.ventasDiarias().slice(-dias);
  });

  readonly totalVentas = computed(() =>
    this.ventasEnRango().reduce((total, venta) => total + venta.totalVentas, 0),
  );

  readonly totalPedidos = computed(() =>
    this.ventasEnRango().reduce((total, venta) => total + venta.cantidadPedidos, 0),
  );

  readonly promedioDiario = computed(() => {
    const dias = this.ventasEnRango().length;
    return dias === 0 ? 0 : Math.round(this.totalVentas() / dias);
  });

  readonly ticketPromedio = computed(() => {
    const pedidos = this.totalPedidos();
    return pedidos === 0 ? 0 : Math.round(this.totalVentas() / pedidos);
  });

  readonly mejorDia = computed(() => {
    const ventas = this.ventasEnRango();
    if (ventas.length === 0) return null;
    return ventas.reduce((mejor, actual) => (actual.totalVentas > mejor.totalVentas ? actual : mejor));
  });

  readonly montoMaximoDiario = computed(() =>
    this.ventasEnRango().reduce((maximo, venta) => Math.max(maximo, venta.totalVentas), 0),
  );

  readonly productosOrdenados = computed<ProductoVendido[]>(() =>
    [...this.productosVendidos()].sort((a, b) => b.totalGenerado - a.totalGenerado),
  );

  readonly totalGeneradoProductos = computed(() =>
    this.productosVendidos().reduce((total, producto) => total + producto.totalGenerado, 0),
  );

  seleccionarRango(rango: FiltroRangoReporte): void {
    this.rango.set(rango);
  }

  porcentajeDelMaximo(monto: number): number {
    const maximo = this.montoMaximoDiario();
    return maximo === 0 ? 0 : Math.round((monto / maximo) * 100);
  }

  porcentajeDelTotalProductos(total: number): number {
    const totalGeneral = this.totalGeneradoProductos();
    return totalGeneral === 0 ? 0 : Math.round((total / totalGeneral) * 100);
  }

  private categoriaDesdeNombre(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('papa')) return 'Papas fritas';
    if (n.includes('handroll')) return 'Handroll';
    if (n.includes('bebida')) return 'Bebidas';
    return 'Otros';
  }
}
