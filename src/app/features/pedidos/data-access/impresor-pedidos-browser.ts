import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

import { DatosComprobantePedido, ImpresorPedidos } from '../domain/impresor-pedidos';
import { PedidoGestion } from '../domain/pedido-gestion.model';

@Injectable()
export class ImpresorPedidosBrowser implements ImpresorPedidos {
  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  imprimir(pedido: PedidoGestion, datos: DatosComprobantePedido): boolean {
    const ventana = this.document.defaultView?.open('', '_blank', 'popup,width=420,height=720');
    if (!ventana) return false;

    ventana.document.write(this.crearComprobante(pedido, datos));
    ventana.document.close();
    ventana.focus();
    ventana.print();
    return true;
  }

  private crearComprobante(pedido: PedidoGestion, datos: DatosComprobantePedido): string {
    const precio = (valor: number) =>
      new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: datos.moneda,
        maximumFractionDigits: 0,
      }).format(valor);
    const fecha = pedido.creadoEn.toLocaleString('es-CL', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
    const items = pedido.items
      .map(
        (item) => `
      <tr>
        <td>${item.cantidad} x ${this.escapar(item.nombre)}</td>
        <td>${precio(item.precioUnitario * item.cantidad)}</td>
      </tr>`,
      )
      .join('');
    const notas = pedido.notas.trim()
      ? `<section><strong>Notas</strong><p>${this.escapar(pedido.notas)}</p></section>`
      : '';
    const cancelacion =
      pedido.estado === 'Cancelado'
        ? `<p class="cancelado">PEDIDO ANULADO${pedido.motivoCancelacion ? `: ${this.escapar(pedido.motivoCancelacion)}` : ''}</p>`
        : '';

    return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Pedido ${this.escapar(pedido.numero)}</title>
  <style>
    @page { size: 80mm auto; margin: 5mm; }
    * { box-sizing: border-box; }
    body { width: 70mm; margin: 0 auto; color: #171717; font: 13px/1.35 ui-monospace, Consolas, monospace; }
    header { text-align: center; border-bottom: 1px dashed #555; padding-bottom: 10px; }
    h1 { margin: 0; font-size: 20px; }
    header p, section p { margin: 3px 0; }
    .meta { padding: 10px 0; border-bottom: 1px dashed #555; }
    .meta div, .total { display: flex; justify-content: space-between; gap: 12px; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0; }
    td { padding: 4px 0; vertical-align: top; }
    td:last-child { text-align: right; white-space: nowrap; }
    section { border-top: 1px dashed #555; padding: 8px 0; }
    .total { border-top: 2px solid #171717; padding-top: 8px; font-size: 17px; font-weight: 700; }
    .cancelado { border: 2px solid #a31515; color: #a31515; padding: 6px; text-align: center; font-weight: 700; }
    footer { border-top: 1px dashed #555; margin-top: 12px; padding-top: 8px; text-align: center; font-size: 11px; }
  </style>
</head>
<body>
  <header>
    <h1>${this.escapar(datos.nombreNegocio)}</h1>
    <p>${this.escapar(datos.subtituloNegocio)}</p>
  </header>
  <div class="meta">
    <div><strong>Pedido</strong><span>#${this.escapar(pedido.numero)}</span></div>
    <div><span>Fecha</span><span>${this.escapar(fecha)}</span></div>
    <div><span>Entrega</span><span>${this.escapar(pedido.tipoEntrega)}</span></div>
    <div><span>Estado</span><span>${this.escapar(pedido.estado)}</span></div>
  </div>
  ${cancelacion}
  <table><tbody>${items}</tbody></table>
  ${notas}
  <section>
    <div class="meta"><div><span>Pago</span><strong>${this.escapar(pedido.formaPago)}</strong></div></div>
    <div class="total"><span>Total</span><span>${precio(pedido.total)}</span></div>
  </section>
  <footer>Gracias por tu compra</footer>
</body>
</html>`;
  }

  private escapar(valor: string): string {
    return valor
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
}
