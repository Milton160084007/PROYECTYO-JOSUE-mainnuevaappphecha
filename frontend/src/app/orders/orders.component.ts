import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="module-page">
      <div class="page-header">
        <h2>📋 Pedidos</h2>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="goBack()">← Volver</button>
          <button class="btn btn-primary" (click)="openNewOrder()">+ Nuevo Pedido</button>
        </div>
      </div>

      <div class="filters">
        <select [(ngModel)]="filterEstado" (change)="loadOrders()">
          <option value="">Todos</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="EN_PREPARACION">En Preparación</option>
          <option value="LISTO">Listos</option>
          <option value="ENTREGADO">Entregados</option>
          <option value="CANCELADO">Cancelados</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Usuario</th>
            <th>Cliente</th>
            <th>Mesa</th>
            <th>Tipo</th>
            <th>Subtotal</th>
            <th>IVA</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (o of orders; track o.id) {
            <tr>
              <td>{{ o.id }}</td>
              <td>{{ o.nombre_usuario || '—' }}</td>
              <td>{{ o.nombre_cliente || '—' }}</td>
              <td>{{ o.numero_mesa || '—' }}</td>
              <td>{{ o.tipo_pedido }}</td>
              <td>\${{ o.subtotal }}</td>
              <td>\${{ o.monto_iva }}</td>
              <td><strong>\${{ o.total }}</strong></td>
              <td><span class="badge" [class]="getBadge(o.estado)">{{ o.estado }}</span></td>
              <td>
                <div class="action-btns">
                  @if (o.estado === 'PENDIENTE') {
                    <button class="btn btn-sm btn-primary" (click)="updateStatus(o.id, 'EN_PREPARACION')">▶ Preparar</button>
                    <button class="btn btn-sm btn-danger" (click)="updateStatus(o.id, 'CANCELADO')">✕</button>
                  }
                  @if (o.estado === 'EN_PREPARACION') {
                    <button class="btn btn-sm btn-success" (click)="updateStatus(o.id, 'LISTO')">✓ Listo</button>
                  }
                  @if (o.estado === 'LISTO') {
                    <button class="btn btn-sm btn-success" (click)="updateStatus(o.id, 'ENTREGADO')">🚚 Entregar</button>
                  }
                  @if (o.estado === 'ENTREGADO') {
                    <button class="btn btn-sm btn-primary" (click)="createInvoice(o)">🧾 Facturar</button>
                  }
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>

      @if (orders.length === 0) {
        <div class="empty-state"><span>📋</span><p>No hay pedidos</p></div>
      }

      <!-- New Order Modal -->
      @if (showNewOrder) {
        <div class="modal-overlay" (click)="showNewOrder = false">
          <div class="modal-content modal-lg" (click)="$event.stopPropagation()">
            <h3>Nuevo Pedido</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Tipo de Pedido</label>
                <select [(ngModel)]="newOrder.tipo_pedido">
                  <option value="LOCAL">Local</option>
                  <option value="PARA_LLEVAR">Para Llevar</option>
                  <option value="DOMICILIO">Domicilio</option>
                </select>
              </div>
              <div class="form-group">
                <label>Mesa</label>
                <input type="number" [(ngModel)]="newOrder.numero_mesa" placeholder="Nro. mesa" min="1">
              </div>
            </div>

            <h4>Agregar Productos</h4>
            <div class="product-selector">
              @for (p of menuProducts; track p.id) {
                <div class="selector-item">
                  <span>{{ p.nombre }} — \${{ p.precio_venta }}</span>
                  <div class="qty-controls">
                    <button class="btn btn-sm btn-secondary" (click)="removeFromCart(p)">−</button>
                    <span class="qty">{{ getCartQty(p.id) }}</span>
                    <button class="btn btn-sm btn-primary" (click)="addToCart(p)">+</button>
                  </div>
                </div>
              }
            </div>

            @if (cart.length > 0) {
              <div class="cart-summary">
                <h4>Resumen</h4>
                @for (item of cart; track item.producto_id) {
                  <div class="cart-line">
                    <span>{{ item.nombre }} x{{ item.cantidad }}</span>
                    <span>\${{ (item.precio_unitario * item.cantidad).toFixed(2) }}</span>
                  </div>
                }
                <div class="cart-total">
                  <strong>Total estimado: \${{ getCartTotal().toFixed(2) }}</strong>
                </div>
              </div>
            }

            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="showNewOrder = false">Cancelar</button>
              <button class="btn btn-primary" (click)="submitOrder()" [disabled]="cart.length === 0">Crear Pedido</button>
            </div>
          </div>
        </div>
      }
    </div>
    `,
  styles: [`
      .module-page { padding: 30px; max-width: 1400px; margin: 0 auto; }
      .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
      .header-actions { display: flex; gap: 8px; }
      .filters { margin-bottom: 16px; }
      .filters select { max-width: 250px; }
      .action-btns { display: flex; gap: 4px; flex-wrap: wrap; }
      .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .modal-lg { max-width: 700px; }
      .product-selector { max-height: 250px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px; margin: 12px 0; }
      .selector-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-bottom: 1px solid #f1f5f9; }
      .selector-item:last-child { border: none; }
      .qty-controls { display: flex; align-items: center; gap: 8px; }
      .qty { font-weight: 700; min-width: 24px; text-align: center; }
      .cart-summary { background: #f8fafc; border-radius: 10px; padding: 16px; margin-top: 16px; }
      .cart-summary h4 { margin-bottom: 10px; font-size: 14px; }
      .cart-line { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
      .cart-total { margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0; text-align: right; }
    `]
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  filterEstado = '';
  showNewOrder = false;
  menuProducts: any[] = [];
  cart: any[] = [];
  newOrder: any = { tipo_pedido: 'LOCAL', numero_mesa: null };

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit() {
    this.loadOrders();
    this.loadProducts();
  }

  loadOrders() {
    this.api.getOrders(this.filterEstado || undefined).subscribe({
      next: (r: any) => this.orders = r.records || []
    });
  }

  loadProducts() {
    this.api.getProducts().subscribe({ next: (r: any) => this.menuProducts = r.records || [] });
  }

  openNewOrder() {
    this.showNewOrder = true;
    this.cart = [];
    this.newOrder = { tipo_pedido: 'LOCAL', numero_mesa: null };
  }

  addToCart(p: any) {
    const existing = this.cart.find(c => c.producto_id === p.id);
    if (existing) { existing.cantidad++; }
    else { this.cart.push({ producto_id: p.id, nombre: p.nombre, precio_unitario: parseFloat(p.precio_venta), cantidad: 1, tiene_iva: p.tiene_iva }); }
  }

  removeFromCart(p: any) {
    const existing = this.cart.find(c => c.producto_id === p.id);
    if (existing) {
      existing.cantidad--;
      if (existing.cantidad <= 0) this.cart = this.cart.filter(c => c.producto_id !== p.id);
    }
  }

  getCartQty(productId: number): number {
    return this.cart.find(c => c.producto_id === productId)?.cantidad || 0;
  }

  getCartTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0);
  }

  submitOrder() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const orderData = {
      usuario_id: user.id,
      numero_mesa: this.newOrder.numero_mesa,
      tipo_pedido: this.newOrder.tipo_pedido,
      items_pedido: this.cart
    };
    this.api.createOrder(orderData).subscribe({
      next: () => { this.showNewOrder = false; this.loadOrders(); alert('Pedido creado exitosamente'); },
      error: (err: any) => alert(err.error?.message || 'Error al crear pedido')
    });
  }

  updateStatus(id: number, estado: string) {
    this.api.updateOrderStatus(id, estado).subscribe({ next: () => this.loadOrders() });
  }

  createInvoice(order: any) {
    this.api.createInvoice({ pedido_id: order.id, metodo_pago: 'EFECTIVO' }).subscribe({
      next: (r: any) => alert('Factura creada: ' + r.numero_factura),
      error: (err: any) => alert(err.error?.message || 'Error')
    });
  }

  getBadge(estado: string): string {
    const map: any = { 'PENDIENTE': 'badge-warning', 'EN_PREPARACION': 'badge-info', 'LISTO': 'badge-success', 'ENTREGADO': 'badge-purple', 'CANCELADO': 'badge-danger' };
    return map[estado] || '';
  }

  goBack() { this.router.navigate(['/dashboard']); }
}
