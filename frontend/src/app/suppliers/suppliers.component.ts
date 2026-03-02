import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suppliers.component.html',
  styles: [`
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .supplier-card { background: white; border-radius: 14px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); transition: all 0.3s; border: 2px solid transparent; }
    .supplier-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
    .supplier-card.highlighted { border-color: #d4710e; }
    .supplier-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .supplier-icon { font-size: 2rem; flex-shrink: 0; }
    .supplier-meta h3 { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0 0 4px; }
    .ruc-badge { font-size: 11px; background: #f0fdf4; color: #166534; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
    .supplier-details { font-size: 13px; color: #475569; display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; padding: 12px; background: #f8fafc; border-radius: 8px; }
    .supplier-purchases { margin-bottom: 14px; }
    .btn-outline { background: transparent; border: 1px solid #d4710e; color: #d4710e; cursor: pointer; border-radius: 6px; padding: 5px 10px; font-size: 12px; }
    .btn-outline:hover { background: #fdf8f0; }
    .purchases-mini { margin-top: 8px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .purchase-row { display: flex; justify-content: space-between; padding: 7px 12px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
    .purchase-row:last-child { border-bottom: none; }
    .total-row { background: #fdf8f0; font-weight: 700; }
    .total-text { color: #d4710e; }
    .no-purchases { font-size: 12px; color: #94a3b8; margin-top: 6px; font-style: italic; }
    .supplier-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .btn-warning { background: #f59e0b; color: white; border: none; cursor: pointer; border-radius: 6px; padding: 4px 8px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  `]
})
export class SuppliersComponent implements OnInit {
  suppliers = signal<any[]>([]);
  showForm = false;
  editingId: number | null = null;
  searchTerm = signal('');
  confirmDeleteId = signal<number | null>(null);
  selectedSupplierId = signal<number | null>(null);
  supplierPurchases = signal<any[]>([]);
  loadingPurchases = signal(false);
  form: any = { nombre_empresa: '', ruc: '', contacto_nombre: '', contacto_telefono: '', contacto_email: '', direccion: '' };

  filteredSuppliers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.suppliers().filter(s =>
      (s.nombre_empresa || '').toLowerCase().includes(term) ||
      (s.ruc || '').toLowerCase().includes(term) ||
      (s.contacto_nombre || '').toLowerCase().includes(term)
    );
  });

  constructor(private api: ApiService, private router: Router) { }
  ngOnInit() { this.loadSuppliers(); }

  loadSuppliers() {
    this.api.getSuppliers().subscribe({ next: (r: any) => this.suppliers.set(r.records || []) });
  }

  openForm() {
    this.editingId = null;
    this.form = { nombre_empresa: '', ruc: '', contacto_nombre: '', contacto_telefono: '', contacto_email: '', direccion: '' };
    this.showForm = true;
  }

  editSupplier(s: any) { this.editingId = s.id; this.form = { ...s }; this.showForm = true; }

  saveSupplier() {
    if (!this.form.nombre_empresa) { alert('El nombre de la empresa es obligatorio.'); return; }
    const action = this.editingId
      ? this.api.updateSupplier({ ...this.form, id: this.editingId })
      : this.api.createSupplier(this.form);
    action.subscribe({
      next: () => { this.showForm = false; this.loadSuppliers(); },
      error: (err: any) => alert('Error: ' + (err.error?.message || ''))
    });
  }

  doDelete(id: number) {
    this.confirmDeleteId.set(null);
    this.api.deleteSupplier(id).subscribe({ next: () => this.loadSuppliers() });
  }

  togglePurchases(supplierId: number) {
    if (this.selectedSupplierId() === supplierId) {
      this.selectedSupplierId.set(null); this.supplierPurchases.set([]); return;
    }
    this.selectedSupplierId.set(supplierId);
    this.loadingPurchases.set(true);
    this.api.getPurchases().subscribe({
      next: (r: any) => {
        const all: any[] = r.records || [];
        this.supplierPurchases.set(all.filter((p: any) => String(p.proveedor_id) === String(supplierId)));
        this.loadingPurchases.set(false);
      },
      error: () => this.loadingPurchases.set(false)
    });
  }

  getTotalInvested(): number {
    return this.supplierPurchases().reduce((acc, p) => acc + parseFloat(p.total || 0), 0);
  }

  goBack() { this.router.navigate(['/dashboard']); }
}
