import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';

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

    // Session
    isClientLoggedIn = false;
    clientUser: any = null;

    constructor(
        private api: ApiService,
        private router: Router,
        public cartService: CartService
    ) { }

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
        this.cartService.clear();
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

    handleOrder(product: any) {
        if (!this.isClientLoggedIn) {
            this.promptLogin();
            return;
        }
        this.cartService.addItem(product);
    }

    getCartCount(): number {
        return this.cartService.getCount();
    }
}
