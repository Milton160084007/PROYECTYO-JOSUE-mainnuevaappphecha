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
      .order-time { font-size: 12px; color: #94a3b8; }
      .card-actions { padding: 12px 20px; border-top: 1px solid #e2e8f0; }
      .card-actions .btn { width: 100%; justify-content: center; }
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
        this.pendingOrders = (r.records || []).filter((o: any) =>
          o.estado === 'PENDIENTE' || o.estado === 'EN_PREPARACION'
        );
      }
    });
  }

  startPreparing(id: number) {
    this.api.updateOrderStatus(id, 'EN_PREPARACION').subscribe({ next: () => this.loadOrders() });
  }

  markReady(id: number) {
    this.api.updateOrderStatus(id, 'LISTO').subscribe({ next: () => this.loadOrders() });
  }

  goBack() { this.router.navigate(['/dashboard']); }
}
