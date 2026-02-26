import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
    selector: 'app-suppliers',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="module-page">
      <div class="page-header">
        <h2>🏢 Proveedores</h2>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="goBack()">← Volver</button>
          <button class="btn btn-primary" (click)="openForm()">+ Nuevo Proveedor</button>
        </div>
      </div>

      <div class="cards-grid">
        @for (s of suppliers; track s.id) {
          <div class="supplier-card">
            <div class="supplier-icon">🏢</div>
            <h3>{{ s.nombre_empresa }}</h3>
            <p class="ruc">RUC: {{ s.ruc || '—' }}</p>
            <div class="supplier-details">
              <div>👤 {{ s.contacto_nombre || '—' }}</div>
              <div>📞 {{ s.contacto_telefono || '—' }}</div>
              <div>📧 {{ s.contacto_email || '—' }}</div>
            </div>
            <div class="supplier-actions">
              <button class="btn btn-sm btn-secondary" (click)="editSupplier(s)">✏️ Editar</button>
              <button class="btn btn-sm btn-danger" (click)="deleteSupplier(s.id)">🗑️</button>
            </div>
          </div>
        }
      </div>

      @if (suppliers.length === 0) {
        <div class="empty-state"><span>🏢</span><p>No hay proveedores registrados</p></div>
      }

      @if (showForm) {
        <div class="modal-overlay" (click)="showForm = false">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h3>{{ editingId ? 'Editar' : 'Nuevo' }} Proveedor</h3>
            <div class="form-group"><label>Empresa</label><input [(ngModel)]="form.nombre_empresa" placeholder="Nombre de la empresa"></div>
            <div class="form-group"><label>RUC</label><input [(ngModel)]="form.ruc" placeholder="RUC"></div>
            <div class="form-group"><label>Contacto</label><input [(ngModel)]="form.contacto_nombre" placeholder="Nombre del contacto"></div>
            <div class="form-row">
              <div class="form-group"><label>Teléfono</label><input [(ngModel)]="form.contacto_telefono" placeholder="Teléfono"></div>
              <div class="form-group"><label>Email</label><input type="email" [(ngModel)]="form.contacto_email" placeholder="Email"></div>
            </div>
            <div class="form-group"><label>Dirección</label><input [(ngModel)]="form.direccion" placeholder="Dirección"></div>
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="showForm = false">Cancelar</button>
              <button class="btn btn-primary" (click)="saveSupplier()">Guardar</button>
            </div>
          </div>
        </div>
      }
    </div>
    `,
    styles: [`
      .module-page { padding: 30px; max-width: 1200px; margin: 0 auto; }
      .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
      .header-actions { display: flex; gap: 8px; }
      .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
      .supplier-card { background: white; border-radius: 14px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); transition: all 0.3s; }
      .supplier-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
      .supplier-icon { font-size: 2rem; margin-bottom: 8px; }
      .supplier-card h3 { font-size: 1.1rem; margin-bottom: 4px; }
      .ruc { font-size: 13px; color: #64748b; margin-bottom: 12px; }
      .supplier-details { font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
      .supplier-actions { display: flex; gap: 8px; }
    `]
})
export class SuppliersComponent implements OnInit {
    suppliers: any[] = [];
    showForm = false;
    editingId: number | null = null;
    form: any = { nombre_empresa: '', ruc: '', contacto_nombre: '', contacto_telefono: '', contacto_email: '', direccion: '' };

    constructor(private api: ApiService, private router: Router) { }

    ngOnInit() { this.loadSuppliers(); }

    loadSuppliers() {
        this.api.getSuppliers().subscribe({ next: (r: any) => this.suppliers = r.records || [] });
    }

    openForm() {
        this.editingId = null;
        this.form = { nombre_empresa: '', ruc: '', contacto_nombre: '', contacto_telefono: '', contacto_email: '', direccion: '' };
        this.showForm = true;
    }

    editSupplier(s: any) {
        this.editingId = s.id;
        this.form = { ...s };
        this.showForm = true;
    }

    saveSupplier() {
        if (this.editingId) {
            this.api.updateSupplier({ ...this.form, id: this.editingId }).subscribe({ next: () => { this.showForm = false; this.loadSuppliers(); } });
        } else {
            this.api.createSupplier(this.form).subscribe({ next: () => { this.showForm = false; this.loadSuppliers(); } });
        }
    }

    deleteSupplier(id: number) {
        if (confirm('¿Eliminar este proveedor?')) {
            this.api.deleteSupplier(id).subscribe({ next: () => this.loadSuppliers() });
        }
    }

    goBack() { this.router.navigate(['/dashboard']); }
}
