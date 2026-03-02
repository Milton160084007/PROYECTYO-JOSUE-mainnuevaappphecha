import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="module-page">
      <div class="page-header">
        <h2>📊 Informes</h2>
        <button class="btn btn-secondary" (click)="goBack()">← Volver</button>
      </div>

      <div class="report-buttons">
        <div class="report-card" (click)="loadReport('weekly')">
          <div class="rep-icon">📅</div>
          <div class="rep-info">
            <h3>Informe Semanal</h3>
            <p>Resumen de la semana actual</p>
          </div>
          <button class="btn btn-primary" [disabled]="loading()">
            {{ loading() && activeType() === 'weekly' ? 'Cargando...' : '📄 Generar PDF' }}
          </button>
        </div>

        <div class="report-card" (click)="loadReport('monthly')">
          <div class="rep-icon">🗓️</div>
          <div class="rep-info">
            <h3>Informe Mensual</h3>
            <p>Resumen del mes actual</p>
          </div>
          <button class="btn btn-primary" [disabled]="loading()">
            {{ loading() && activeType() === 'monthly' ? 'Cargando...' : '📄 Generar PDF' }}
          </button>
        </div>
      </div>

      @if (report()) {
        <div class="preview-section">
          <div class="preview-header">
            <h3>Vista previa: {{ report().label }}</h3>
            <button class="btn btn-primary" (click)="openPrintWindow()">🖨️ Imprimir / Guardar PDF</button>
          </div>

          <!-- Resumen ejecutivo -->
          <div class="kpi-grid">
            <div class="kpi-card kpi-green">
              <div class="kpi-label">💰 Ingresos Netos</div>
              <div class="kpi-value">\${{ report().resumen.ingresos_netos | number:'1.2-2' }}</div>
            </div>
            <div class="kpi-card kpi-red">
              <div class="kpi-label">📦 Gastos (Compras)</div>
              <div class="kpi-value">\${{ report().resumen.gastos | number:'1.2-2' }}</div>
            </div>
            <div class="kpi-card" [class.kpi-green]="report().resumen.utilidad_bruta >= 0" [class.kpi-red]="report().resumen.utilidad_bruta < 0">
              <div class="kpi-label">📈 Utilidad Bruta</div>
              <div class="kpi-value">\${{ report().resumen.utilidad_bruta | number:'1.2-2' }}</div>
            </div>
            <div class="kpi-card kpi-blue">
              <div class="kpi-label">📋 Pedidos Totales</div>
              <div class="kpi-value">{{ report().ventas.total_pedidos }}</div>
            </div>
            <div class="kpi-card kpi-purple">
              <div class="kpi-label">🧾 Monto Facturado</div>
              <div class="kpi-value">\${{ report().facturacion.monto_facturado | number:'1.2-2' }}</div>
            </div>
            <div class="kpi-card kpi-amber">
              <div class="kpi-label">👥 Clientes Nuevos</div>
              <div class="kpi-value">{{ report().clientes.nuevos_clientes }}</div>
            </div>
          </div>

          <div class="preview-grid">
            <!-- Ventas por día -->
            <div class="section-card">
              <h4>📆 Ventas por Día</h4>
              <table>
                <thead><tr><th>Fecha</th><th>Pedidos</th><th>Total</th></tr></thead>
                <tbody>
                  @for (d of report().ventas_por_dia; track d.fecha) {
                    <tr>
                      <td>{{ d.fecha | date:'EE dd/MM' }}</td>
                      <td>{{ d.pedidos }}</td>
                      <td><strong>\${{ d.total | number:'1.2-2' }}</strong></td>
                    </tr>
                  }
                  @if (report().ventas_por_dia.length === 0) {
                    <tr><td colspan="3" style="text-align:center;color:#94a3b8">Sin ventas en este período</td></tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Top productos -->
            <div class="section-card">
              <h4>🏆 Top 5 Productos Más Vendidos</h4>
              <table>
                <thead><tr><th>Producto</th><th>Unidades</th><th>Generado</th></tr></thead>
                <tbody>
                  @for (p of report().top_productos; track p.nombre; let i = $index) {
                    <tr>
                      <td>#{{ i+1 }} {{ p.nombre }}</td>
                      <td>{{ p.unidades_vendidas }}</td>
                      <td><strong>\${{ p.total_generado | number:'1.2-2' }}</strong></td>
                    </tr>
                  }
                  @if (report().top_productos.length === 0) {
                    <tr><td colspan="3" style="text-align:center;color:#94a3b8">Sin datos</td></tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Facturación -->
            <div class="section-card">
              <h4>🧾 Facturación</h4>
              <div class="data-list">
                <div class="dl-row"><span>Total facturas:</span><strong>{{ report().facturacion.total_facturas }}</strong></div>
                <div class="dl-row"><span>Monto facturado:</span><strong>\${{ report().facturacion.monto_facturado | number:'1.2-2' }}</strong></div>
                <div class="dl-row"><span>IVA recaudado:</span><strong>\${{ report().facturacion.total_iva | number:'1.2-2' }}</strong></div>
                <div class="dl-row"><span>Efectivo:</span><strong>{{ report().facturacion.pago_efectivo }}</strong></div>
                <div class="dl-row"><span>Tarjeta:</span><strong>{{ report().facturacion.pago_tarjeta }}</strong></div>
                <div class="dl-row"><span>Transferencia:</span><strong>{{ report().facturacion.pago_transferencia }}</strong></div>
                <div class="dl-row"><span>Facturas anuladas:</span><strong style="color:#ef4444">{{ report().facturacion.facturas_anuladas }}</strong></div>
              </div>
            </div>

            <!-- Stock bajo -->
            <div class="section-card">
              <h4>⚠️ Insumos con Stock Bajo</h4>
              @if (report().stock_bajo.length > 0) {
                <table>
                  <thead><tr><th>Insumo</th><th>Stock</th><th>Mínimo</th></tr></thead>
                  <tbody>
                    @for (s of report().stock_bajo; track s.nombre) {
                      <tr class="stock-alert">
                        <td>{{ s.nombre }}</td>
                        <td style="color:#ef4444"><strong>{{ s.stock_actual }} {{ s.unidad_medida }}</strong></td>
                        <td>{{ s.stock_minimo }} {{ s.unidad_medida }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              } @else {
                <p style="color:#10b981;font-weight:600;padding:12px">✅ Todo el inventario está en niveles normales</p>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
    styles: [`
    .module-page { padding: 30px; max-width: 1300px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }

    .report-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
    .report-card {
      background: white; border-radius: 14px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      display: flex; align-items: center; gap: 16px; cursor: pointer; transition: all 0.2s;
      border: 2px solid transparent;
    }
    .report-card:hover { border-color: #d4710e; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(212,113,14,0.15); }
    .rep-icon { font-size: 2.5rem; }
    .rep-info { flex: 1; }
    .rep-info h3 { margin: 0 0 4px; font-size: 1.1rem; color: #1e293b; }
    .rep-info p { margin: 0; font-size: 13px; color: #64748b; }

    .preview-section { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .preview-header h3 { margin: 0; font-size: 1.1rem; color: #1e293b; }

    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .kpi-card { background: white; border-radius: 12px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border-left: 4px solid #e2e8f0; }
    .kpi-green { border-left-color: #10b981; }
    .kpi-red { border-left-color: #ef4444; }
    .kpi-blue { border-left-color: #3b82f6; }
    .kpi-purple { border-left-color: #8b5cf6; }
    .kpi-amber { border-left-color: #f59e0b; }
    .kpi-label { font-size: 12px; color: #64748b; margin-bottom: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .kpi-value { font-size: 1.4rem; font-weight: 800; color: #1e293b; }

    .preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .section-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
    .section-card h4 { margin: 0 0 14px; font-size: 0.95rem; color: #334155; }

    .data-list { display: flex; flex-direction: column; gap: 8px; }
    .dl-row { display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
    .dl-row:last-child { border-bottom: none; }

    .stock-alert td { background: #fef2f2 !important; }

    @media (max-width: 768px) {
      .report-buttons, .preview-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ReportsComponent implements OnInit {
    report = signal<any>(null);
    loading = signal(false);
    activeType = signal<'weekly' | 'monthly'>('weekly');

    constructor(private api: ApiService, private router: Router) { }

    ngOnInit() { }

    loadReport(type: 'weekly' | 'monthly') {
        this.activeType.set(type);
        this.loading.set(true);
        this.report.set(null);
        this.api.getReport(type).subscribe({
            next: (data) => {
                this.report.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading report', err);
                alert('No se pudo generar el informe. Verifica la conexión con el servidor.');
                this.loading.set(false);
            }
        });
    }

    openPrintWindow() {
        const r = this.report();
        if (!r) return;

        const venDia = r.ventas_por_dia.map((d: any) =>
            `<tr><td>${new Date(d.fecha).toLocaleDateString('es-EC', { weekday: 'short', day: '2-digit', month: '2-digit' })}</td><td>${d.pedidos}</td><td>$${parseFloat(d.total).toFixed(2)}</td></tr>`
        ).join('') || '<tr><td colspan="3" style="text-align:center;color:#888">Sin ventas en este período</td></tr>';

        const topProd = r.top_productos.map((p: any, i: number) =>
            `<tr><td>#${i + 1} ${p.nombre}</td><td>${p.unidades_vendidas}</td><td>$${parseFloat(p.total_generado).toFixed(2)}</td></tr>`
        ).join('') || '<tr><td colspan="3" style="text-align:center;color:#888">Sin datos</td></tr>';

        const stockBajo = r.stock_bajo.length > 0
            ? r.stock_bajo.map((s: any) =>
                `<tr><td>${s.nombre}</td><td style="color:#dc2626;font-weight:700">${s.stock_actual} ${s.unidad_medida}</td><td>${s.stock_minimo} ${s.unidad_medida}</td></tr>`
            ).join('')
            : '<tr><td colspan="3" style="color:#059669;font-weight:600">✅ Todo el inventario en niveles normales</td></tr>';

        const margenColor = r.resumen.margen >= 0 ? '#059669' : '#dc2626';
        const utilidadColor = r.resumen.utilidad_bruta >= 0 ? '#059669' : '#dc2626';

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${r.label}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; font-size: 12px; background: white; padding: 30px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 18px; border-bottom: 3px solid #d4710e; margin-bottom: 24px; }
    .brand h1 { font-size: 22px; font-weight: 800; color: #d4710e; }
    .brand p { font-size: 11px; color: #64748b; margin-top: 2px; }
    .report-title { text-align: right; }
    .report-title h2 { font-size: 16px; font-weight: 700; }
    .report-title p { font-size: 11px; color: #64748b; margin-top: 2px; }
    .kpi-row { display: flex; gap: 10px; margin-bottom: 20px; }
    .kpi { flex: 1; background: #f8fafc; border-radius: 8px; padding: 12px; border-left: 3px solid #d4710e; }
    .kpi.green { border-left-color: #10b981; }
    .kpi.red { border-left-color: #ef4444; }
    .kpi.blue { border-left-color: #3b82f6; }
    .kpi.purple { border-left-color: #8b5cf6; }
    .kpi label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; display: block; margin-bottom: 3px; }
    .kpi strong { font-size: 15px; font-weight: 800; }
    .section { margin-bottom: 20px; }
    .section h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f8fafc; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; }
    td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
    .dl { display: flex; flex-direction: column; gap: 4px; }
    .dl-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
    .dl-row:last-child { border-bottom: none; }
    .total-box { background: #fdf8f0; border: 2px solid #d4710e; border-radius: 10px; padding: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .total-box span { font-size: 13px; color: #64748b; }
    .total-box .total-val { font-size: 20px; font-weight: 800; color: ${utilidadColor}; }
    .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
    @media print { body { padding: 15px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <h1>🍽️ Asadero La Mocahua</h1>
      <p>Sistema de Gestión del Restaurante</p>
    </div>
    <div class="report-title">
      <h2>${r.label}</h2>
      <p>Generado el ${new Date().toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    </div>
  </div>

  <!-- KPIs -->
  <div class="kpi-row">
    <div class="kpi green"><label>💰 Ingresos Netos</label><strong>$${parseFloat(r.resumen.ingresos_netos).toFixed(2)}</strong></div>
    <div class="kpi red"><label>📦 Gastos Compras</label><strong>$${parseFloat(r.resumen.gastos).toFixed(2)}</strong></div>
    <div class="kpi" style="border-left-color:${utilidadColor}"><label>📈 Utilidad Bruta</label><strong style="color:${utilidadColor}">$${parseFloat(r.resumen.utilidad_bruta).toFixed(2)}</strong></div>
    <div class="kpi" style="border-left-color:${margenColor}"><label>% Margen</label><strong style="color:${margenColor}">${r.resumen.margen}%</strong></div>
    <div class="kpi blue"><label>📋 Total Pedidos</label><strong>${r.ventas.total_pedidos}</strong></div>
    <div class="kpi purple"><label>👥 Clientes Nuevos</label><strong>${r.clientes.nuevos_clientes}</strong></div>
  </div>

  <!-- Resumen pedidos -->
  <div class="section">
    <h3>📋 Resumen de Pedidos</h3>
    <div class="dl">
      <div class="dl-row"><span>Pedidos entregados:</span><strong>${r.ventas.pedidos_entregados}</strong></div>
      <div class="dl-row"><span>Pedidos cancelados:</span><strong style="color:#dc2626">${r.ventas.pedidos_cancelados}</strong></div>
      <div class="dl-row"><span>Atención en local:</span><strong>${r.ventas.pedidos_local}</strong></div>
      <div class="dl-row"><span>Para llevar:</span><strong>${r.ventas.pedidos_llevar}</strong></div>
      <div class="dl-row"><span>Total facturado:</span><strong>$${parseFloat(r.facturacion.monto_facturado).toFixed(2)}</strong></div>
      <div class="dl-row"><span>IVA recaudado:</span><strong>$${parseFloat(r.facturacion.total_iva).toFixed(2)}</strong></div>
      <div class="dl-row"><span>Facturas emitidas:</span><strong>${r.facturacion.total_facturas}</strong></div>
      <div class="dl-row"><span>Facturas anuladas:</span><strong style="color:#dc2626">${r.facturacion.facturas_anuladas}</strong></div>
    </div>
  </div>

  <div class="two-col">
    <div class="section">
      <h3>📆 Ventas por Día</h3>
      <table><thead><tr><th>Fecha</th><th>Pedidos</th><th>Total</th></tr></thead><tbody>${venDia}</tbody></table>
    </div>
    <div class="section">
      <h3>🏆 Top 5 Productos</h3>
      <table><thead><tr><th>Producto</th><th>Unidades</th><th>Total</th></tr></thead><tbody>${topProd}</tbody></table>
    </div>
  </div>

  <div class="section">
    <h3>⚠️ Insumos con Stock Bajo</h3>
    <table><thead><tr><th>Insumo</th><th>Stock Actual</th><th>Stock Mínimo</th></tr></thead><tbody>${stockBajo}</tbody></table>
  </div>

  <div class="total-box">
    <div>
      <span>Utilidad Bruta del Período</span><br>
      <small style="color:#94a3b8">Ingresos netos − Gastos en compras</small>
    </div>
    <div class="total-val">$${parseFloat(r.resumen.utilidad_bruta).toFixed(2)} <span style="font-size:13px">(${r.resumen.margen}% margen)</span></div>
  </div>

  <div class="footer">
    <p>Asadero La Mocahua — Informe generado automáticamente por el Sistema de Gestión</p>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

        const win = window.open('', '_blank', 'width=900,height=1000');
        if (win) { win.document.write(html); win.document.close(); }
    }

    goBack() { this.router.navigate(['/dashboard']); }
}
