import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-my-orders',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './my-orders.component.html',
    styleUrls: ['./my-orders.component.css']
})
export class MyOrdersComponent implements OnInit {
    orders: any[] = [];
    loading = true;
    clientUser: any = null;

    constructor(private api: ApiService, private router: Router) {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            this.clientUser = JSON.parse(savedUser);
            // Validar si el rol no es cliente
            if (this.clientUser.role_id !== 5) {
                this.router.navigate(['/dashboard']);
            }
        } else {
            this.router.navigate(['/welcome']);
        }
    }

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        if (!this.clientUser) return;
        this.loading = true;
        this.api.getOrders(undefined, this.clientUser.id).subscribe({
            next: (res: any) => {
                this.orders = res.records || [];
                this.loading = false;
            },
            error: (err: any) => {
                console.error('Error cargando pedidos', err);
                this.loading = false;
            }
        });
    }

    getBadge(estado: string): string {
        const map: any = {
            'PENDIENTE': 'badge-warning',
            'EN_PREPARACION': 'badge-info',
            'LISTO': 'badge-success',
            'ENTREGADO': 'badge-purple',
            'CANCELADO': 'badge-danger'
        };
        return map[estado] || 'badge-info';
    }

    logout() {
        localStorage.removeItem('user');
        this.router.navigate(['/welcome']);
    }
}
