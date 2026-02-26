import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="module-page">
      <div class="page-header">
        <h2>🍽️ Menú del Restaurante</h2>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="goBack()">← Volver</button>
          <button class="btn btn-primary" (click)="showForm.set(true)">+ Nuevo Producto</button>
        </div>
      </div>

      <div class="filters">
        <input type="text" placeholder="Buscar producto..." 
               [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)">
      </div>

      <div class="products-grid">
        @for (p of filteredProducts(); track p.id) {
          <div class="product-card">
            <div class="product-header">
              <span class="product-category">{{ p.nombre_categoria }}</span>
              @if (p.tiene_iva) { <span class="badge badge-info">IVA</span> }
            </div>
            <h3>{{ p.nombre }}</h3>
            <p class="product-desc">{{ p.descripcion || 'Sin descripción' }}</p>
            <div class="product-footer">
              <span class="product-price">\${{ p.precio_venta }}</span>
              <span class="product-time">⏱️ {{ p.tiempo_preparacion || '—' }} min</span>
            </div>
            <div class="product-actions">
              <button class="btn btn-sm btn-secondary" (click)="editProduct(p)">✏️ Editar</button>
              <button class="btn btn-sm btn-danger" (click)="deleteProduct(p.id)">🗑️</button>
            </div>
          </div>
        }
      </div>

      @if (filteredProducts().length === 0) {
        <div class="empty-state"><span>🍽️</span><p>No hay productos en el menú</p></div>
      }

      @if (showForm()) {
        <div class="modal-overlay" (click)="showForm.set(false)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h3>{{ editingId() ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
            <div class="form-group">
              <label>Categoría</label>
              <select [(ngModel)]="form.categoria_id">
                @for (c of categories(); track c.id) {
                  <option [value]="c.id">{{ c.nombre }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Nombre</label>
              <input [(ngModel)]="form.nombre" placeholder="Nombre del producto">
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <textarea [(ngModel)]="form.descripcion" rows="2" placeholder="Descripción"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Precio</label>
                <input type="number" [(ngModel)]="form.precio_venta" step="0.01" min="0">
              </div>
              <div class="form-group">
                <label>Tiempo (min)</label>
                <input type="number" [(ngModel)]="form.tiempo_preparacion" min="0">
              </div>
            </div>
            <div class="form-group">
              <label><input type="checkbox" [(ngModel)]="form.tiene_iva"> Graba IVA</label>
            </div>
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="showForm.set(false); editingId.set(null)">Cancelar</button>
              <button class="btn btn-primary" (click)="saveProduct()">Guardar</button>
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
    .filters { margin-bottom: 20px; }
    .filters input { max-width: 400px; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .product-card { background: white; border-radius: 14px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); transition: all 0.3s; border: 1px solid transparent; }
    .product-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(212,113,14,0.12); border-color: rgba(212,113,14,0.15); }
    .product-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .product-category { font-size: 12px; font-weight: 600; color: #d4710e; text-transform: uppercase; }
    .product-card h3 { font-size: 1.1rem; margin-bottom: 4px; color: #1e293b; }
    .product-desc { font-size: 13px; color: #64748b; margin-bottom: 12px; }
    .product-footer { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .product-price { font-size: 1.3rem; font-weight: 800; color: #10b981; }
    .product-time { font-size: 12px; color: #94a3b8; }
    .product-actions { display: flex; gap: 8px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    textarea { resize: vertical; }
  `]
})
export class MenuComponent implements OnInit {
  products = signal<any[]>([]);
  categories = signal<any[]>([]);
  searchTerm = signal('');
  showForm = signal(false);
  editingId = signal<number | null>(null);

  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.products().filter(p =>
      p.nombre.toLowerCase().includes(term) || (p.nombre_categoria || '').toLowerCase().includes(term)
    );
  });

  form: any = { categoria_id: '', nombre: '', descripcion: '', precio_venta: 0, tiempo_preparacion: 0, tiene_iva: true };

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.api.getAllProducts().subscribe({
      next: (r: any) => this.products.set(r.records || [])
    });
  }

  loadCategories() {
    this.api.getMenuCategories().subscribe({
      next: (r: any) => this.categories.set(r.records || [])
    });
  }

  editProduct(p: any) {
    this.editingId.set(p.id);
    this.form = { ...p };
    this.showForm.set(true);
  }

  saveProduct() {
    const action = this.editingId()
      ? this.api.updateProduct({ ...this.form, id: this.editingId() })
      : this.api.createProduct(this.form);

    action.subscribe({
      next: () => {
        this.showForm.set(false);
        this.editingId.set(null);
        this.loadProducts();
      }
    });
  }

  deleteProduct(id: number) {
    if (confirm('¿Eliminar este producto?')) {
      this.api.deleteProduct(id).subscribe({ next: () => this.loadProducts() });
    }
  }

  goBack() { this.router.navigate(['/dashboard']); }
}
