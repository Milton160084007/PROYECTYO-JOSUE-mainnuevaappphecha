import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
    clientUser: any = null;
    isClientLoggedIn = false;
    submitting = false;

    constructor(
        public cartService: CartService,
        private api: ApiService,
        private router: Router
    ) { }

    ngOnInit() {
        this.checkSession();
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

    addOne(item: any) {
        this.cartService.addItem({
            id: item.producto_id,
            nombre: item.nombre,
            precio_venta: item.precio_unitario,
            tiene_iva: item.tiene_iva
        });
    }

    removeOne(productId: number) {
        this.cartService.removeOne(productId);
    }

    submitOrder() {
        if (this.cartService.orderType === 'LOCAL' && !this.cartService.tableNumber) {
            alert('Por favor, indica tu número de mesa para consumo en local.');
            return;
        }

        this.submitting = true;

        const orderData = {
            usuario_id: this.clientUser.id,
            numero_mesa: this.cartService.orderType === 'LOCAL' ? this.cartService.tableNumber : null,
            tipo_pedido: this.cartService.orderType,
            items_pedido: this.cartService.getItems()
        };

        this.api.createOrder(orderData).subscribe({
            next: () => {
                alert('¡Pedido creado exitosamente!');
                this.cartService.clear();
                this.submitting = false;
                this.router.navigate(['/website/my-orders']);
            },
            error: (err: any) => {
                this.submitting = false;
                alert(err.error?.message || 'Error al procesar el pedido');
            }
        });
    }

    logout() {
        localStorage.removeItem('user');
        this.cartService.clear();
        this.router.navigate(['/welcome']);
    }
}
