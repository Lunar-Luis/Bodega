import { Venta, Producto } from '../types';
import { formatearUSD, formatearBs, buscarProducto } from './calculos';

const metodoPagoLabel: Record<string, string> = {
  pago_movil: 'Pago Movil',
  efectivo_bs: 'Efectivo Bs',
  efectivo_usd: 'Efectivo $',
};

function nombreProducto(productos: Producto[], id: number): string {
  return buscarProducto(productos, id)?.nombre || `#${id}`;
}

export function descargarRespaldoJSON(ventas: Venta[], config: unknown): void {
  const data = {
    fechaExportacion: new Date().toISOString(),
    ventas,
    config,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `respaldo-bodegaonline-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function formatearFechaHora(fechaISO: string): string {
  const f = new Date(fechaISO);
  const d = f.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const t = f.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
  return `${d} ${t}`;
}

export function exportarPDF(
  ventas: Venta[],
  titulo: string,
  subtitulo: string,
  totalUSD: number,
  totalBs: number,
  productos: Producto[]
): void {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${titulo}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 30px; color: #1f2937; }
  .header { background: #7C3AED; padding: 24px 30px; margin: -30px -30px 24px -30px; }
  .header h1 { font-size: 22px; color: white; margin-bottom: 4px; }
  .header p { font-size: 13px; color: rgba(255,255,255,0.85); }
  .subtitulo { color: #6b7280; font-size: 13px; margin-bottom: 20px; }
  .resumen { display: flex; gap: 20px; margin-bottom: 24px; }
  .resumen-item { background: #F5F3FF; padding: 14px 20px; border-radius: 10px; flex: 1; text-align: center; border: 1px solid #EDE9FE; }
  .resumen-item .valor { font-size: 22px; font-weight: bold; color: #7C3AED; }
  .resumen-item .label { font-size: 11px; color: #6b7280; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { background: #7C3AED; color: white; padding: 9px 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 8px 10px; border-bottom: 1px solid #E2E8F0; }
  tr:nth-child(even) td { background: #FAFAFA; }
  .total-row td { border-top: 2px solid #7C3AED; font-weight: bold; background: #F5F3FF; }
  .total { font-weight: bold; }
  .monto { color: #7C3AED; }
  .footer { margin-top: 24px; font-size: 11px; color: #94A3B8; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 16px; }
</style>
</head>
<body>
  <div class="header">
    <h1>${titulo}</h1>
    <p>${subtitulo}</p>
  </div>

  <div class="resumen">
    <div class="resumen-item">
      <div class="valor">${formatearUSD(totalUSD)}</div>
      <div class="label">Total USD</div>
    </div>
    <div class="resumen-item">
      <div class="valor">${formatearBs(totalBs)}</div>
      <div class="label">Total Bs</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Fecha</th>
        <th>Productos</th>
        <th>Metodo</th>
        <th>USD</th>
        <th>Bs</th>
      </tr>
    </thead>
    <tbody>
      ${ventas.map((v, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${formatearFechaHora(v.fecha)}</td>
          <td>${v.items.map((it) => `${nombreProducto(productos, it.productoId)} x${it.cantidad}`).join(', ')}</td>
          <td>${metodoPagoLabel[v.metodoPago] || v.metodoPago}</td>
          <td class="monto">${formatearUSD(v.totalUSD)}</td>
          <td class="monto">${formatearBs(v.totalBs)}</td>
        </tr>
      `).join('')}
      <tr class="total-row">
        <td colspan="2"></td>
        <td colspan="2" class="total">Total</td>
        <td class="monto">${formatearUSD(totalUSD)}</td>
        <td class="monto">${formatearBs(totalBs)}</td>
      </tr>
    </tbody>
  </table>

  <p class="footer">Generado por BodegaOnline &mdash; ${new Date().toLocaleDateString('es-VE')}</p>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank');
  if (w) {
    w.document.title = titulo;
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
