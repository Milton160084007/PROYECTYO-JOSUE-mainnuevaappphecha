import { Injectable } from '@angular/core';

export interface CartItem {
    producto_id: number;
    nombre: string;
    precio_unitario: number;
    cantidad: number;
    tiene_iva: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cart: CartItem[] = [];
    orderType: string = 'LOCAL';
    tableNumber: number | null = null;

    constructor() {
        // Restore cart from sessionStorage on init
        const saved = sessionStorage.getItem('cart');
        if (saved) {
            try { this.cart = JSON.parse(saved); } catch { this.cart = []; }
        }
    }

    private persist() {
        sessionStorage.setItem('cart', JSON.stringify(this.cart));
    }

    getItems(): CartItem[] {
        return this.cart;
    }

    addItem(product: any) {
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
        this.persist();
    }

    removeOne(productId: number) {
        const existing = this.cart.find(c => c.producto_id === productId);
        if (existing) {
            existing.cantidad--;
            if (existing.cantidad <= 0) {
                this.cart = this.cart.filter(c => c.producto_id !== productId);
            }
            this.persist();
        }
    }

    getCount(): number {
        return this.cart.reduce((sum, item) => sum + item.cantidad, 0);
    }

    getTotal(): number {
        return this.cart.reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0);
    }

    clear() {
        this.cart = [];
        this.orderType = 'LOCAL';
        this.tableNumber = null;
        sessionStorage.removeItem('cart');
    }
}
