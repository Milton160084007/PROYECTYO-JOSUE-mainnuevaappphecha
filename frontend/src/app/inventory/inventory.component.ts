import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
    selector: 'app-inventory',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="module-page">
      <div class="page-header">
        <h2>📦 Inventario de Insumos</h2>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="goBack()">← Volver</button>
          <button class="btn btn-primary" (click)="openForm()">+ Nuevo Insumo</button>
        </div>
      </div>

      @if (lowStockItems.length > 0) {
        <div class="alert-banner">
          ⚠️ <strong>{{ lowStockItems.length }}</strong> insumo(s) con stock bajo:
          @for (item of lowStockItems; track item.id) {
            <span class="low-stock-tag">{{ item.nombre }} ({{ item.stock_actual }}/{{ item.stock_minimo }})</span>
          }
        </div>
      }

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Categoría</th>
            <th>Nombre</th>
            <th>Unidad</th>
            <th>Stock Actual</th>
            <th>Stock Mínimo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (i of insumos; track i.id) {
            <tr [class.low-stock-row]="i.stock_actual <= i.stock_minimo">
              <td>{{ i.id }}</td>
              <td>{{ i.nombre_categoria || '—' }}</td>
              <td><strong>{{ i.nombre }}</strong></td>
              <td>{{ i.unidad_medida }}</td>
              <td>{{ i.stock_actual }}</td>
              <td>{{ i.stock_minimo }}</td>
              <td>
                @if (i.stock_actual <= i.stock_minimo) {
                  <span class="badge badge-danger">⚠️ Bajo</span>
                } @else {
                  <span class="badge badge-success">✅ OK</span>
                }
              </td>
              <td>
                <div class="action-btns">
                  <button class="btn btn-sm btn-secondary" (click)="editInsumo(i)">✏️</button>
                  <button class="btn btn-sm btn-danger" (click)="deleteInsumo(i.id)">🗑️</button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>

      @if (showForm) {
        <div class="modal-overlay" (click)="showForm = false">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h3>{{ editingId ? 'Editar' : 'Nuevo' }} Insumo</h3>
            <div class="form-group">
              <label>Categoría</label>
              <select [(ngModel)]="form.categoria_id">
                @for (c of categories; track c.id) {
                  <option [value]="c.id">{{ c.nombre }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Nombre</label>
              <input [(ngModel)]="form.nombre" placeholder="Nombre del insumo">
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <input [(ngModel)]="form.descripcion" placeholder="Descripción">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Unidad de Medida</label>
                <select [(ngModel)]="form.unidad_medida">
                  <option value="kg">Kilogramos</option>
                  <option value="litros">Litros</option>
                  <option value="unidad">Unidades</option>
                  <option value="gramos">Gramos</option>
                </select>
              </div>
              <div class="form-group">
                <label>Stock Mínimo</label>
                <input type="number" [(ngModel)]="form.stock_minimo" step="0.01" min="0">
              </div>
            </div>
            @if (!editingId) {
              <div class="form-group">
                <label>Stock Inicial</label>
                <input type="number" [(ngModel)]="form.stock_actual" step="0.01" min="0">
              </div>
            }
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="showForm = false">Cancelar</button>
              <button class="btn btn-primary" (click)="saveInsumo()">Guardar</button>
            </div>
          </div>
        </div>
      }
    </div>
    `,
    styles: [`
      .module-page { padding: 30px; max-width: 1200px; margin: 0 auto; }
      .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
      .header-actions { display: flex; gap: 8px; }
      .action-btns { display: flex; gap: 4px; }
      .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .alert-banner { background: #fef3c7; color: #92400e; padding: 14px 20px; border-radius: 10px; margin-bottom: 20px; font-size: 14px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
      .low-stock-tag { background: #fde68a; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
      .low-stock-row { background: #fffbeb !important; }
      .low-stock-row td { background: inherit; }
    `]
})
export class InventoryComponent implements OnInit {
    insumos: any[] = [];
    lowStockItems: any[] = [];
    categories: any[] = [];
    showForm = false;
    editingId: number | null = null;
    form: any = { categoria_id: '', nombre: '', descripcion: '', unidad_medida: 'kg', stock_actual: 0, stock_minimo: 0 };

    constructor(private api: ApiService, private router: Router) { }

    ngOnInit() {
        this.loadInsumos();
        this.loadCategories();
        this.loadLowStock();
    }

    loadInsumos() {
        this.api.getInventory().subscribe({ next: (r: any) => this.insumos = r.records || [] });
    }

    loadCategories() {
        this.api.getInsumoCategories().subscribe({ next: (r: any) => this.categories = r.records || [] });
    }

    loadLowStock() {
        this.api.getLowStock().subscribe({ next: (r: any) => this.lowStockItems = r.records || [] });
    }

    openForm() {
        this.editingId = null;
        this.form = { categoria_id: '', nombre: '', descripcion: '', unidad_medida: 'kg', stock_actual: 0, stock_minimo: 0 };
        this.showForm = true;
    }

    editInsumo(i: any) {
        this.editingId = i.id;
        this.form = { ...i };
        this.showForm = true;
    }

    saveInsumo() {
        if (this.editingId) {
            this.api.updateInsumo({ ...this.form, id: this.editingId }).subscribe({ next: () => { this.showForm = false; this.loadInsumos(); this.loadLowStock(); } });
        } else {
            this.api.createInsumo(this.form).subscribe({ next: () => { this.showForm = false; this.loadInsumos(); this.loadLowStock(); } });
        }
    }

    deleteInsumo(id: number) {
        if (confirm('¿Eliminar este insumo?')) {
            this.api.deleteInsumo(id).subscribe({ next: () => { this.loadInsumos(); this.loadLowStock(); } });
        }
    }

    goBack() { this.router.navigate(['/dashboard']); }
}
