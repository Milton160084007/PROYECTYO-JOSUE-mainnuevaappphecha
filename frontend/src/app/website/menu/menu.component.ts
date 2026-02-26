import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-website-menu',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css']
})
export class WebsiteMenuComponent implements OnInit {
    products: any[] = [];
    filteredProducts: any[] = [];
    categories: any[] = [];
    selectedCategory: number | null = null;
    loading = true;

    // Cart and Session Logic
    isClientLoggedIn = false;
    clientUser: any = null;
    cart: any[] = [];
    showCartModal = false;
    tableNumber: number | null = null;
    orderType: string = 'LOCAL';

    constructor(private api: ApiService, private router: Router) { }

    ngOnInit(): void {
        this.checkSession();
        this.loadData();
    }

    checkSession() {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            if (user.role_id === 5) {
                this.isClientLoggedIn = true;
                this.clientUser = user;
            }
        }
    }

    logout() {
        localStorage.removeItem('user');
        this.isClientLoggedIn = false;
        this.clientUser = null;
        this.cart = [];
    }

    loadData() {
        this.loading = true;
        this.api.getMenuCategories().subscribe({
            next: (res: any) => this.categories = res.records || res,
            error: (err) => console.error('Error cargando categorías', err)
        });

        this.api.getProducts().subscribe({
            next: (res: any) => {
                this.products = res.records || res;
                this.filteredProducts = [...this.products];
                this.loading = false;
            },
            error: (err) => {
                console.error('Error cargando menú', err);
                this.loading = false;
            }
        });
    }

    filterByCategory(categoryId: number | null) {
        this.selectedCategory = categoryId;
        if (categoryId === null) {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(p => p.categoria_id == categoryId);
        }
    }

    promptLogin() {
        if (confirm('Para realizar un pedido, por favor inicia sesión o regístrate. ¿Ir ahora?')) {
            this.router.navigate(['/login'], { queryParams: { role: 'cliente', title: 'Cliente' } });
        }
    }

    // Cart Operations
    handleOrder(product: any) {
        if (!this.isClientLoggedIn) {
            this.promptLogin();
            return;
        }

        const existing = this.cart.find(c => c.producto_id === product.id);
        if (existing) {
            existing.cantidad++;
        } else {
            this.cart.push({
                producto_id: product.id,
                nombre: product.nombre,
                precio_unitario: parseFloat(product.precio_venta),
                cantidad: 1,
                tiene_iva: product.tiene_iva
            });
        }
        // Opcional: mostrar una notificacion "Producto agregado"
    }

    removeFromCart(productId: number) {
        const existing = this.cart.find(c => c.producto_id === productId);
        if (existing) {
            existing.cantidad--;
            if (existing.cantidad <= 0) {
                this.cart = this.cart.filter(c => c.producto_id !== productId);
            }
        }
    }

    getCartCount(): number {
        return this.cart.reduce((sum, item) => sum + item.cantidad, 0);
    }

    getCartTotal(): number {
        return this.cart.reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0);
    }

    submitOrder() {
        if (this.orderType === 'LOCAL' && !this.tableNumber) {
            alert('Por favor, indica tu número de mesa para consumo en local.');
            return;
        }

        const orderData = {
            usuario_id: this.clientUser.id,
            numero_mesa: this.orderType === 'LOCAL' ? this.tableNumber : null,
            tipo_pedido: this.orderType,
            items_pedido: this.cart
        };

        this.api.createOrder(orderData).subscribe({
            next: () => {
                alert('¡Pedido creado exitosamente!');
                this.cart = [];
                this.showCartModal = false;
                this.router.navigate(['/website/my-orders']);
            },
            error: (err: any) => alert(err.error?.message || 'Error al procesar el pedido')
        });
    }
}
