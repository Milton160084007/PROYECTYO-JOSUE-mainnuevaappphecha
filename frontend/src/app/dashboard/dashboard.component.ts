import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    currentUser: any = null;
    stats: any = {};
    sidebarOpen = true;
    activeModule = 'dashboard';
    menuItems: { icon: string, label: string, route: string }[] = [];

    constructor(private router: Router, private api: ApiService) { }

    ngOnInit() {
        const userData = localStorage.getItem('user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.generateMenu();
            this.loadStats();
        } else {
            this.router.navigate(['/login']);
        }
    }

    generateMenu() {
        const roleId = Number(this.currentUser?.role_id);
        const allItems = [
            { icon: '📊', label: 'Dashboard', route: '/dashboard' },
            { icon: '🍽️', label: 'Menú', route: '/menu' },
            { icon: '📋', label: 'Pedidos', route: '/orders' },
            { icon: '🔥', label: 'Cocina', route: '/kitchen' },
            { icon: '👥', label: 'Clientes', route: '/clients' },
            { icon: '📦', label: 'Inventario', route: '/inventory' },
            { icon: '🏢', label: 'Proveedores', route: '/suppliers' },
            { icon: '🛒', label: 'Compras', route: '/purchases' },
            { icon: '🧾', label: 'Facturas', route: '/invoices' },
            { icon: '👤', label: 'Usuarios', route: '/users' },
        ];

        switch (roleId) {
            case 1:
            case 6: // Algunos sistemas usan 1 o 6 como superadmin/admin, pero por seguridad incluiremos ambos
                this.menuItems = allItems;
                break;
            case 2: // Cajero
                this.menuItems = allItems.filter(i => ['/dashboard', '/orders', '/invoices', '/clients'].includes(i.route));
                break;
            case 3: // Cocina
                this.menuItems = allItems.filter(i => ['/dashboard', '/kitchen'].includes(i.route));
                break;
            case 4: // Mesero
                this.menuItems = allItems.filter(i => ['/dashboard', '/orders', '/clients'].includes(i.route));
                break;
            case 5: // Cliente
                // Para evitar que el cliente entre al dashboard accidentalmente
                this.router.navigate(['/website/menu']);
                break;
            default:
                this.menuItems = [allItems[0]];
        }
    }

    loadStats() {
        this.api.getDashboardStats().subscribe({
            next: (data: any) => this.stats = data,
            error: () => this.stats = {}
        });
    }

    getMenuItems() {
        return this.menuItems;
    }

    navigate(route: string) {
        this.activeModule = route === '/dashboard' ? 'dashboard' : route.replace('/', '');
        this.router.navigate([route]);
    }

    logout() {
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
    }

    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
    }

    getEstadoBadge(estado: string): string {
        const map: any = {
            'PENDIENTE': 'badge-warning',
            'EN_PREPARACION': 'badge-info',
            'LISTO': 'badge-success',
            'ENTREGADO': 'badge-purple',
            'CANCELADO': 'badge-danger'
        };
        return map[estado] || 'badge-info';
    }
}
