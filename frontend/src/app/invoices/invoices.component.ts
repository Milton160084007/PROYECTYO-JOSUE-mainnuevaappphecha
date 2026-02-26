import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="module-page">
      <div class="page-header">
        <h2>🧾 Facturas</h2>
        <button class="btn btn-secondary" (click)="goBack()">← Volver</button>
      </div>
      <table>
        <thead><tr><th>N° Factura</th><th>Pedido</th><th>Cliente</th><th>Subtotal</th><th>IVA</th><th>Total</th><th>Método</th><th>Estado</th><th>Fecha</th></tr></thead>
        <tbody>
          @for (f of invoices; track f.id) {
            <tr [class.anulada]="f.anulada">
              <td><strong>{{ f.numero_factura }}</strong></td>
              <td>#{{ f.pedido_id }}</td>
              <td>{{ f.nombre_cliente || 'Consumidor final' }}</td>
              <td>{{'$'}}{{ f.subtotal }}</td>
              <td>{{'$'}}{{ f.monto_iva }}</td>
              <td><strong>{{'$'}}{{ f.total }}</strong></td>
              <td><span class="badge badge-info">{{ f.metodo_pago }}</span></td>
              <td>@if(f.anulada){<span class="badge badge-danger">ANULADA</span>}@else{<span class="badge badge-success">ACTIVA</span>}</td>
              <td>{{ f.fecha_emision }}</td>
            </tr>
          }
        </tbody>
      </table>
      @if(invoices.length===0){<div class="empty-state"><span>🧾</span><p>No hay facturas</p></div>}
    </div>`,
  styles: [`.module-page{padding:30px;max-width:1400px;margin:0 auto}.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}.anulada td{opacity:.5;text-decoration:line-through}`]
})
export class InvoicesComponent implements OnInit {
  invoices: any[] = [];
  constructor(private api: ApiService, private router: Router) { }
  ngOnInit() { this.loadInvoices(); }
  loadInvoices() { this.api.getInvoices().subscribe({ next: (r: any) => this.invoices = r.records || [] }); }
  goBack() { this.router.navigate(['/dashboard']); }
}
