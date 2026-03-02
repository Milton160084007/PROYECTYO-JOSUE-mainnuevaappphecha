import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-kitchen',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kitchen-page">
      <div class="kitchen-header">
        <h1>🔥 Pantalla de Cocina</h1>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="goBack()">← Volver</button>
          <span class="auto-refresh">🔄 Auto-refresh cada 15s</span>
        </div>
      </div>

      <div class="kitchen-grid">
        @for (order of pendingOrders; track order.id) {
          <div class="kitchen-card" [class.preparing]="order.estado === 'EN_PREPARACION'">
            <div class="card-header">
              <span class="order-id">#{{ order.id }}</span>
              <span class="badge" [class]="order.estado === 'PENDIENTE' ? 'badge-warning' : 'badge-info'">
                {{ order.estado === 'PENDIENTE' ? '⏳ PENDIENTE' : '🔥 PREPARANDO' }}
              </span>
            </div>
            <div class="card-body">
              <div class="order-meta">
                <span>🪑 Mesa: {{ order.numero_mesa || 'N/A' }}</span>
                <span>📦 {{ order.tipo_pedido }}</span>
              </div>
              <p class="order-time">{{ order.fecha_creacion }}</p>

              <!-- Toggle detail button -->
              <button class="btn-detail" (click)="toggleDetail(order)">
                {{ order._showDetail ? '▲ Ocultar Detalle' : '▼ Ver Detalle del Pedido' }}
              </button>

              <!-- Order detail items -->
              @if (order._showDetail) {
                @if (order._loadingDetail) {
                  <div class="detail-loading">Cargando detalle...</div>
                } @else if (order._detalles && order._detalles.length > 0) {
                  <div class="detail-section">
                    <div class="detail-title">Productos a preparar:</div>
                    @for (item of order._detalles; track item.producto_id) {
                      <div class="detail-item">
                        <span class="detail-qty">{{ item.cantidad }}x</span>
                        <span class="detail-name">{{ item.nombre_producto || item.nombre }}</span>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="detail-loading">Sin detalle disponible.</div>
                }
              }
            </div>
            <div class="card-actions">
              @if (order.estado === 'PENDIENTE') {
                <button class="btn btn-primary" (click)="startPreparing(order.id)">▶ Comenzar Preparación</button>
              }
              @if (order.estado === 'EN_PREPARACION') {
                <button class="btn btn-success" (click)="markReady(order.id)">✅ Marcar como Listo</button>
              }
            </div>
          </div>
        }
      </div>

      @if (pendingOrders.length === 0) {
        <div class="empty-state"><span>✅</span><p>¡No hay pedidos pendientes! Buen trabajo.</p></div>
      }
    </div>
    `,
  styles: [`
      .kitchen-page { padding: 30px; }
      .kitchen-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
      .kitchen-header h1 { font-size: 1.5rem; }
      .header-actions { display: flex; align-items: center; gap: 12px; }
      .auto-refresh { font-size: 12px; color: #64748b; background: #f1f5f9; padding: 6px 14px; border-radius: 20px; }
      .kitchen-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
      .kitchen-card { background: white; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 5px solid #f59e0b; transition: all 0.3s; }
      .kitchen-card.preparing { border-left-color: #3b82f6; animation: pulse 2s infinite; }
      @keyframes pulse { 0%, 100% { box-shadow: 0 2px 8px rgba(0,0,0,0.08); } 50% { box-shadow: 0 4px 20px rgba(59, 130, 246, 0.2); } }
      .card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #f8fafc; }
      .order-id { font-weight: 800; font-size: 1.2rem; color: #1e293b; }
      .card-body { padding: 16px 20px; }
      .order-meta { display: flex; gap: 16px; font-size: 14px; color: #475569; margin-bottom: 8px; }
      .order-time { font-size: 12px; color: #94a3b8; margin-bottom: 12px; }
      .card-actions { padding: 12px 20px; border-top: 1px solid #e2e8f0; }
      .card-actions .btn { width: 100%; justify-content: center; }

      /* Detail toggle button */
      .btn-detail {
        width: 100%;
        padding: 10px 16px;
        background: #f1f5f9;
        color: #475569;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
        margin-bottom: 4px;
      }
      .btn-detail:hover { background: #e2e8f0; color: #1e293b; }

      /* Detail section */
      .detail-section {
        margin-top: 12px;
        background: #fffbf5;
        border: 1px solid #f0e0c8;
        border-radius: 10px;
        padding: 14px;
      }
      .detail-title {
        font-size: 12px;
        font-weight: 700;
        color: #92400e;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 10px;
      }
      .detail-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
        border-bottom: 1px solid #f0e0c8;
        font-size: 15px;
        color: #1e293b;
      }
      .detail-item:last-child { border-bottom: none; }
      .detail-qty {
        background: #d4710e;
        color: white;
        font-weight: 700;
        font-size: 13px;
        padding: 3px 10px;
        border-radius: 6px;
        min-width: 36px;
        text-align: center;
      }
      .detail-name { font-weight: 500; }
      .detail-loading { margin-top: 10px; font-size: 13px; color: #94a3b8; font-style: italic; text-align: center; padding: 10px; }
    `]
})
export class KitchenComponent implements OnInit, OnDestroy {
  pendingOrders: any[] = [];
  private intervalId: any;

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit() {
    this.loadOrders();
    this.intervalId = setInterval(() => this.loadOrders(), 15000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  loadOrders() {
    this.api.getOrders().subscribe({
      next: (r: any) => {
        const newOrders = (r.records || []).filter((o: any) =>
          o.estado === 'PENDIENTE' || o.estado === 'EN_PREPARACION'
        );
        // Preserve expanded state and loaded details
        newOrders.forEach((o: any) => {
          const existing = this.pendingOrders.find((e: any) => e.id === o.id);
          if (existing) {
            o._showDetail = existing._showDetail;
            o._detalles = existing._detalles;
            o._loadingDetail = false;
          }
        });
        this.pendingOrders = newOrders;
      }
    });
  }

  toggleDetail(order: any) {
    if (order._showDetail) {
      order._showDetail = false;
      return;
    }
    order._showDetail = true;

    // Load details if not already loaded
    if (!order._detalles) {
      order._loadingDetail = true;
      this.api.getOrderById(order.id).subscribe({
        next: (data: any) => {
          order._detalles = data.detalles || [];
          order._loadingDetail = false;
        },
        error: () => {
          order._detalles = [];
          order._loadingDetail = false;
        }
      });
    }
  }

  startPreparing(id: number) {
    this.api.updateOrderStatus(id, 'EN_PREPARACION').subscribe({ next: () => this.loadOrders() });
  }

  markReady(id: number) {
    this.api.updateOrderStatus(id, 'LISTO').subscribe({ next: () => this.loadOrders() });
  }

  goBack() { this.router.navigate(['/dashboard']); }
}
