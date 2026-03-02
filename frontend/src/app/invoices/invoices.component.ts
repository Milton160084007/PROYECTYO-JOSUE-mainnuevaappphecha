import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="module-page">
      <div class="page-header">
        <h2>🧾 Facturas</h2>
        <button class="btn btn-secondary" (click)="goBack()">← Volver</button>
      </div>

      <div class="filters">
        <input type="text" placeholder="Buscar factura, cliente..." [(ngModel)]="searchTerm" (input)="filterInvoices()">
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>N° Factura</th>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Subtotal</th>
              <th>IVA</th>
              <th>Total</th>
              <th>Método</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (f of filtered; track f.id) {
              <tr [class.anulada]="f.anulada">
                <td><strong>{{ f.numero_factura }}</strong></td>
                <td>#{{ f.pedido_id }}</td>
                <td>{{ f.nombre_cliente || 'Consumidor final' }}</td>
                <td>\${{ f.subtotal | number:'1.2-2' }}</td>
                <td>\${{ f.monto_iva | number:'1.2-2' }}</td>
                <td><strong>\${{ f.total | number:'1.2-2' }}</strong></td>
                <td><span class="badge badge-info">{{ f.metodo_pago }}</span></td>
                <td>
                  @if (f.anulada) {
                    <span class="badge badge-danger">ANULADA</span>
                  } @else {
                    <span class="badge badge-success">ACTIVA</span>
                  }
                </td>
                <td>{{ f.fecha_emision | date:'dd/MM/yyyy HH:mm' }}</td>
                <td>
                  <button class="btn btn-sm btn-pdf" (click)="printInvoice(f)" title="Descargar PDF">
                    📄 PDF
                  </button>
                  @if (!f.anulada) {
                    <button class="btn btn-sm btn-danger" (click)="anularFactura(f)" title="Anular factura">
                      ✕ Anular
                    </button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
        @if (filtered.length === 0) {
          <div class="empty-state"><span>🧾</span><p>No hay facturas</p></div>
        }
      </div>
    </div>
  `,
  styles: [`
    .module-page { padding: 30px; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .filters { margin-bottom: 20px; }
    .filters input { max-width: 400px; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
    th { background: #f8fafc; color: #64748b; font-size: 12px; text-transform: uppercase; padding: 12px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #fafafa; }
    .anulada td { opacity: 0.5; text-decoration: line-through; }
    .btn-pdf { background: #6366f1; color: white; border: none; cursor: pointer; margin-right: 4px; }
    .btn-pdf:hover { background: #4f46e5; }
  `]
})
export class InvoicesComponent implements OnInit {
  invoices: any[] = [];
  filtered: any[] = [];
  searchTerm = '';

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit() { this.loadInvoices(); }

  loadInvoices() {
    this.api.getInvoices().subscribe({
      next: (r: any) => {
        this.invoices = r.records || [];
        this.filterInvoices();
      }
    });
  }

  filterInvoices() {
    const term = this.searchTerm.toLowerCase();
    this.filtered = this.invoices.filter(f =>
      (f.numero_factura || '').toLowerCase().includes(term) ||
      (f.nombre_cliente || '').toLowerCase().includes(term) ||
      String(f.pedido_id || '').includes(term)
    );
  }

  anularFactura(f: any) {
    if (confirm(`¿Anular la factura ${f.numero_factura}? Esta acción no se puede deshacer.`)) {
      this.api.anularInvoice(f.id).subscribe({
        next: () => this.loadInvoices(),
        error: (err: any) => alert('Error al anular: ' + (err.error?.message || ''))
      });
    }
  }

  printInvoice(f: any) {
    // Load the full invoice detail to get more info, then open a print window
    this.api.getInvoiceById(f.id).subscribe({
      next: (factura: any) => {
        // Also fetch order details for line items
        this.api.getOrderById(factura.pedido_id).subscribe({
          next: (pedido: any) => this.openPrintWindow(factura, pedido),
          error: () => this.openPrintWindow(factura, null)
        });
      },
      error: () => this.openPrintWindow(f, null)
    });
  }

  private openPrintWindow(f: any, pedido: any) {
    const fecha = f.fecha_emision ? new Date(f.fecha_emision).toLocaleDateString('es-EC', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : '';

    let lineasHtml = '';
    if (pedido && pedido.detalles && pedido.detalles.length > 0) {
      lineasHtml = pedido.detalles.map((d: any) => `
        <tr>
          <td>${d.nombre_producto || d.nombre || ''}</td>
          <td style="text-align:center">${d.cantidad}</td>
          <td style="text-align:right">$${parseFloat(d.precio_unitario || 0).toFixed(2)}</td>
          <td style="text-align:right">$${parseFloat(d.subtotal || (d.cantidad * d.precio_unitario) || 0).toFixed(2)}</td>
        </tr>
      `).join('');
    } else {
      lineasHtml = `<tr><td colspan="4" style="text-align:center;color:#94a3b8">Ver pedido #${f.pedido_id} para detalles</td></tr>`;
    }

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Factura ${f.numero_factura}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; font-size: 13px; padding: 40px; background: white; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 3px solid #d4710e; padding-bottom: 20px; }
    .company h1 { font-size: 26px; font-weight: 800; color: #d4710e; }
    .company p { font-size: 12px; color: #64748b; margin-top: 2px; }
    .invoice-meta { text-align: right; }
    .invoice-meta h2 { font-size: 20px; font-weight: 700; color: #1e293b; }
    .invoice-meta .num { font-size: 16px; font-weight: 600; color: #d4710e; }
    .invoice-meta p { font-size: 12px; color: #64748b; margin-top: 2px; }
    .badges { display: flex; gap: 8px; justify-content: flex-end; margin-top: 6px; }
    .badge { padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; }
    .badge-active { background: #d1fae5; color: #065f46; }
    .badge-anulada { background: #fee2e2; color: #991b1b; }
    .section { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
    .info-box h3 { font-size: 11px; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; letter-spacing: 1px; }
    .info-box p { font-size: 13px; color: #1e293b; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    thead tr { background: #f8fafc; }
    th { padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 1px; border-bottom: 2px solid #e2e8f0; }
    td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
    .totals { width: 320px; margin-left: auto; }
    .totals tr td { font-size: 13px; }
    .totals tr td:first-child { color: #64748b; }
    .totals tr td:last-child { text-align: right; font-weight: 600; }
    .totals .grand-total td { font-size: 18px; font-weight: 800; color: #d4710e; border-top: 2px solid #e2e8f0; padding-top: 10px; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
    @media print {
      body { padding: 20px; }
      button { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company">
      <h1>🍽️ La Mocahua</h1>
      <p>Restaurante & Cafetería</p>
      <p>sistema@lamocahua.com</p>
    </div>
    <div class="invoice-meta">
      <h2>FACTURA</h2>
      <div class="num">${f.numero_factura}</div>
      <p>${fecha}</p>
      <div class="badges">
        <span class="badge ${f.anulada ? 'badge-anulada' : 'badge-active'}">${f.anulada ? 'ANULADA' : 'ACTIVA'}</span>
        <span class="badge" style="background:#e0e7ff;color:#3730a3">${f.metodo_pago || 'EFECTIVO'}</span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="info-box">
      <h3>Cliente</h3>
      <p><strong>${f.nombre_cliente || 'Consumidor Final'}</strong></p>
      ${f.numero_documento ? `<p>CI/RUC: ${f.numero_documento}</p>` : ''}
      ${f.direccion ? `<p>${f.direccion}</p>` : ''}
      ${f.email_cliente ? `<p>${f.email_cliente}</p>` : ''}
    </div>
    <div class="info-box">
      <h3>Datos de la Factura</h3>
      <p>Pedido: <strong>#${f.pedido_id}</strong></p>
      <p>Fecha de emisión: ${fecha}</p>
      ${f.fecha_anulacion ? `<p>Fecha de anulación: ${new Date(f.fecha_anulacion).toLocaleDateString('es-EC')}</p>` : ''}
    </div>
  </div>

  <h3 style="font-size:11px;text-transform:uppercase;color:#94a3b8;letter-spacing:1px;margin-bottom:10px">Detalle de Productos</h3>
  <table>
    <thead>
      <tr>
        <th>Descripción</th>
        <th style="text-align:center">Cantidad</th>
        <th style="text-align:right">Precio Unit.</th>
        <th style="text-align:right">Subtotal</th>
      </tr>
    </thead>
    <tbody>${lineasHtml}</tbody>
  </table>

  <table class="totals">
    <tr>
      <td>Subtotal:</td>
      <td>$${parseFloat(f.subtotal || 0).toFixed(2)}</td>
    </tr>
    ${parseFloat(f.descuento || 0) > 0 ? `<tr><td>Descuento:</td><td>-$${parseFloat(f.descuento).toFixed(2)}</td></tr>` : ''}
    ${parseFloat(f.base_cero || 0) > 0 ? `<tr><td>Base 0%:</td><td>$${parseFloat(f.base_cero).toFixed(2)}</td></tr>` : ''}
    ${parseFloat(f.base_imponible || 0) > 0 ? `<tr><td>Base IVA (${f.porcentaje_iva || 12}%):</td><td>$${parseFloat(f.base_imponible).toFixed(2)}</td></tr>` : ''}
    <tr>
      <td>IVA (${f.porcentaje_iva || 12}%):</td>
      <td>$${parseFloat(f.monto_iva || 0).toFixed(2)}</td>
    </tr>
    <tr class="grand-total">
      <td>TOTAL:</td>
      <td>$${parseFloat(f.total || 0).toFixed(2)}</td>
    </tr>
  </table>

  <div class="footer">
    <p>Gracias por su preferencia — La Mocahua</p>
    <p style="margin-top:4px">Este documento es generado electrónicamente.</p>
  </div>

  <script>
    window.onload = () => { window.print(); }
  </script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=800,height=900');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  }

  goBack() { this.router.navigate(['/dashboard']); }
}
