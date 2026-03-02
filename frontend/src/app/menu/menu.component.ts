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
          <button class="btn btn-primary" (click)="openForm()">+ Nuevo Producto</button>
        </div>
      </div>

      <!-- Category Management Section -->
      <div class="category-section">
        <div class="category-header" (click)="showCategories.set(!showCategories())">
          <h3>📂 Categorías <span class="toggle-icon">{{ showCategories() ? '▲' : '▼' }}</span></h3>
          <button class="btn btn-sm btn-primary" (click)="openCategoryForm(); $event.stopPropagation()">+ Nueva Categoría</button>
        </div>
        @if (showCategories()) {
          <div class="category-list">
            @for (c of categories(); track c.id) {
              <div class="category-chip">
                <div class="category-info">
                  <strong>{{ c.nombre }}</strong>
                  @if (c.descripcion) { <span class="cat-desc">{{ c.descripcion }}</span> }
                </div>
                <div class="category-actions">
                  <button class="btn btn-sm btn-secondary" (click)="editCategory(c)">✏️</button>
                  @if (confirmDeleteCatId() === c.id) {
                    <button class="btn btn-sm btn-warning" (click)="confirmDeleteCatId.set(null)">✕</button>
                    <button class="btn btn-sm btn-danger" (click)="doDeleteCategory(c.id)">✓</button>
                  } @else {
                    <button class="btn btn-sm btn-danger" (click)="confirmDeleteCatId.set(c.id)">🗑️</button>
                  }
                </div>
              </div>
            }
            @if (categories().length === 0) {
              <p class="empty-recipe">No hay categorías registradas.</p>
            }
          </div>
        }
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
              @if (confirmDeleteId() === p.id) {
                <button class="btn btn-sm btn-warning" (click)="confirmDeleteId.set(null)">✕</button>
                <button class="btn btn-sm btn-danger" (click)="doDelete(p.id)">✓ Confirmar</button>
              } @else {
                <button class="btn btn-sm btn-danger" (click)="confirmDeleteId.set(p.id)">🗑️</button>
              }
            </div>
          </div>
        }
      </div>

      @if (filteredProducts().length === 0) {
        <div class="empty-state"><span>🍽️</span><p>No hay productos en el menú</p></div>
      }

      @if (showCategoryForm()) {
        <div class="modal-overlay" (click)="showCategoryForm.set(false)">
          <div class="modal-content modal-small" (click)="$event.stopPropagation()">
            <h3>{{ editingCategoryId() ? 'Editar Categoría' : 'Nueva Categoría' }}</h3>
            <div class="form-group">
              <label>Nombre</label>
              <input [(ngModel)]="categoryForm.nombre" placeholder="Nombre de la categoría">
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <textarea [(ngModel)]="categoryForm.descripcion" rows="2" placeholder="Descripción (opcional)"></textarea>
            </div>
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="showCategoryForm.set(false); editingCategoryId.set(null)">Cancelar</button>
              <button class="btn btn-primary" (click)="saveCategory()">Guardar</button>
            </div>
          </div>
        </div>
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
              <label>Imagen del Producto</label>
              @if (form.url_imagen) {
                <div class="image-preview">
                  <img [src]="form.url_imagen" [alt]="form.nombre || 'Vista previa'">
                  <button class="btn btn-sm btn-danger remove-img-btn" (click)="form.url_imagen = ''">✕ Quitar</button>
                </div>
              }
              <div class="image-picker-grid">
                @for (img of availableImages; track img) {
                  <div class="image-thumb" 
                       [class.selected]="form.url_imagen === img"
                       (click)="form.url_imagen = img">
                    <img [src]="img" alt="">
                    @if (form.url_imagen === img) {
                      <span class="check-badge">✓</span>
                    }
                  </div>
                }
              </div>
            </div>
            <div class="form-group">
              <label><input type="checkbox" [(ngModel)]="form.tiene_iva"> Graba IVA</label>
            </div>

            <div class="recipe-section">
              <h4>Receta (Ingredientes)</h4>
              <div class="recipe-add-row">
                <select [(ngModel)]="tempInsumoId">
                  <option value="">-- Seleccionar Insumo --</option>
                  @for (i of inventoryItems(); track i.id) {
                    <option [value]="i.id">{{ i.nombre }} ({{ i.unidad_medida }})</option>
                  }
                </select>
                <input type="number" [(ngModel)]="tempCantidad" placeholder="Cantidad" min="0.01" step="0.01">
                <button class="btn btn-sm btn-secondary" (click)="addRecipeItem()">Agregar</button>
              </div>
              
              <ul class="recipe-list" *ngIf="form.receta && form.receta.length > 0">
                @for (r of form.receta; track r.insumo_id; let idx = $index) {
                  <li>
                    <span>{{ getInsumoName(r.insumo_id) }} - {{ r.cantidad }}</span>
                    <button class="btn btn-sm btn-danger" (click)="removeRecipeItem(idx)">❌</button>
                  </li>
                }
              </ul>
              <p *ngIf="!form.receta || form.receta.length === 0" class="empty-recipe">No hay ingredientes asignados.</p>
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
    .product-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .btn-warning { background: #f59e0b; color: white; border: none; cursor: pointer; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    textarea { resize: vertical; }
    .category-section { background: #f8fafc; border-radius: 14px; padding: 16px 20px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
    .category-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none; }
    .category-header h3 { margin: 0; font-size: 1rem; color: #334155; }
    .toggle-icon { font-size: 12px; margin-left: 6px; color: #94a3b8; }
    .category-list { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
    .category-chip { background: white; border-radius: 10px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); min-width: 220px; flex: 1; max-width: 400px; border: 1px solid #e2e8f0; transition: all 0.2s; }
    .category-chip:hover { border-color: rgba(212,113,14,0.3); box-shadow: 0 2px 8px rgba(212,113,14,0.08); }
    .category-info { display: flex; flex-direction: column; gap: 2px; }
    .category-info strong { font-size: 14px; color: #1e293b; }
    .cat-desc { font-size: 12px; color: #64748b; }
    .category-actions { display: flex; gap: 4px; flex-shrink: 0; }
    .modal-small { max-width: 420px; }
    .recipe-section { margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0; }
    .recipe-section h4 { margin-top: 0; margin-bottom: 10px; font-size: 1rem; color: #334155; }
    .recipe-add-row { display: flex; gap: 8px; margin-bottom: 10px; }
    .recipe-add-row select { flex: 2; }
    .recipe-add-row input { flex: 1; min-width: 80px; }
    .recipe-list { list-style: none; padding: 0; margin: 0; }
    .recipe-list li { display: flex; justify-content: space-between; padding: 6px; background: #f8fafc; margin-bottom: 4px; border-radius: 4px; font-size: 14px; align-items: center; }
    .empty-recipe { font-size: 13px; color: #94a3b8; font-style: italic; margin: 0; }
    .image-preview { margin-bottom: 10px; position: relative; display: inline-block; }
    .image-preview img { width: 100%; max-height: 160px; object-fit: cover; border-radius: 10px; border: 2px solid #e2e8f0; }
    .remove-img-btn { position: absolute; top: 6px; right: 6px; font-size: 11px; padding: 2px 8px; }
    .image-picker-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(75px, 1fr)); gap: 8px; max-height: 200px; overflow-y: auto; padding: 4px; }
    .image-thumb { width: 75px; height: 75px; border-radius: 8px; overflow: hidden; cursor: pointer; border: 3px solid transparent; transition: all 0.2s; position: relative; }
    .image-thumb:hover { border-color: #94a3b8; transform: scale(1.05); }
    .image-thumb.selected { border-color: #d4710e; box-shadow: 0 0 0 2px rgba(212,113,14,0.3); }
    .image-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .check-badge { position: absolute; top: 2px; right: 2px; background: #d4710e; color: white; font-size: 10px; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
  `]
})
export class MenuComponent implements OnInit {
  products = signal<any[]>([]);
  categories = signal<any[]>([]);
  inventoryItems = signal<any[]>([]);
  searchTerm = signal('');
  showForm = signal(false);
  editingId = signal<number | null>(null);
  confirmDeleteId = signal<number | null>(null);
  showCategories = signal(false);
  showCategoryForm = signal(false);
  editingCategoryId = signal<number | null>(null);
  confirmDeleteCatId = signal<number | null>(null);
  categoryForm: any = { nombre: '', descripcion: '' };

  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.products().filter(p =>
      p.nombre.toLowerCase().includes(term) || (p.nombre_categoria || '').toLowerCase().includes(term)
    );
  });

  availableImages: string[] = [
    'assets/images/menu-item-1.jpeg',
    'assets/images/menu-item-2.jpeg',
    'assets/images/menu-item-3.jpeg',
    'assets/images/menu-item-4.jpeg',
    'assets/images/menu-item-5.jpeg',
    'assets/images/menu-item-6.jpeg',
    'assets/images/menu-item-7.jpeg',
    'assets/images/menu-item-8.jpeg',
    'assets/images/menu-item-9.jpeg',
    'assets/images/menu-item-10.jpeg',
    'assets/images/menu-item-11.jpeg',
    'assets/images/menu-item-12.jpeg',
    'assets/images/menu-item-13.jpeg',
  ];

  form: any = { categoria_id: '', nombre: '', descripcion: '', precio_venta: 0, tiempo_preparacion: 0, tiene_iva: true, url_imagen: '', receta: [] };

  tempInsumoId: string | number = '';
  tempCantidad: number | null = null;

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
    this.loadInventory();
  }

  loadInventory() {
    this.api.getInventory().subscribe({
      next: (r: any) => this.inventoryItems.set(r.records || [])
    });
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

  openForm() {
    this.editingId.set(null);
    this.form = { categoria_id: '', nombre: '', descripcion: '', precio_venta: 0, tiempo_preparacion: 0, tiene_iva: true, url_imagen: '', receta: [] };
    this.tempInsumoId = '';
    this.tempCantidad = null;
    this.showForm.set(true);
  }

  editProduct(p: any) {
    this.editingId.set(p.id);
    this.form = { ...p };
    if (!this.form.receta) this.form.receta = [];
    this.tempInsumoId = '';
    this.tempCantidad = null;
    this.showForm.set(true);
  }

  getInsumoName(id: number): string {
    const item = this.inventoryItems().find(i => i.id == id);
    return item ? `${item.nombre} (${item.unidad_medida})` : 'Desconocido';
  }

  addRecipeItem() {
    if (!this.tempInsumoId || !this.tempCantidad || this.tempCantidad <= 0) return;

    if (!this.form.receta) this.form.receta = [];

    // Check if duplicate
    const existing = this.form.receta.find((r: any) => r.insumo_id == this.tempInsumoId);
    if (existing) {
      existing.cantidad += this.tempCantidad;
    } else {
      this.form.receta.push({
        insumo_id: this.tempInsumoId,
        cantidad: this.tempCantidad
      });
    }

    this.tempInsumoId = '';
    this.tempCantidad = null;
  }

  removeRecipeItem(index: number) {
    this.form.receta.splice(index, 1);
  }

  saveProduct() {
    const isEditing = !!this.editingId();
    const action = isEditing
      ? this.api.updateProduct({ ...this.form, id: this.editingId() })
      : this.api.createProduct(this.form);

    action.subscribe({
      next: () => {
        this.showForm.set(false);
        this.editingId.set(null);
        this.loadProducts();
      },
      error: (err) => {
        console.error("Error saving product", err);
        alert(`No se pudo ${isEditing ? 'actualizar' : 'crear'} el producto. ` + (err.error?.message || ""));
      }
    });
  }

  doDelete(id: number) {
    this.confirmDeleteId.set(null);
    this.api.deleteProduct(id).subscribe({
      next: () => this.loadProducts(),
      error: (err) => {
        console.error("Error deleting product", err);
        alert("No se pudo eliminar el producto. " + (err.error?.message || ""));
      }
    });
  }

  openCategoryForm() {
    this.editingCategoryId.set(null);
    this.categoryForm = { nombre: '', descripcion: '' };
    this.showCategoryForm.set(true);
  }

  editCategory(c: any) {
    this.editingCategoryId.set(c.id);
    this.categoryForm = { nombre: c.nombre, descripcion: c.descripcion || '' };
    this.showCategoryForm.set(true);
  }

  saveCategory() {
    const isEditing = !!this.editingCategoryId();
    const action = isEditing
      ? this.api.updateMenuCategory({ ...this.categoryForm, id: this.editingCategoryId() })
      : this.api.createMenuCategory(this.categoryForm);

    action.subscribe({
      next: () => {
        this.showCategoryForm.set(false);
        this.editingCategoryId.set(null);
        this.loadCategories();
        this.loadProducts();
      },
      error: (err) => {
        console.error('Error saving category', err);
        alert(`No se pudo ${isEditing ? 'actualizar' : 'crear'} la categoría. ` + (err.error?.message || ''));
      }
    });
  }

  doDeleteCategory(id: number) {
    this.confirmDeleteCatId.set(null);
    this.api.deleteMenuCategory(id).subscribe({
      next: () => {
        this.loadCategories();
        this.loadProducts();
      },
      error: (err) => {
        console.error('Error deleting category', err);
        alert('No se pudo eliminar la categoría. ' + (err.error?.message || ''));
      }
    });
  }

  goBack() { this.router.navigate(['/dashboard']); }
}
