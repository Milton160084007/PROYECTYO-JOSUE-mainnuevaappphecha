import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
    selector: 'app-purchases',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './purchases.component.html',
    styleUrls: ['./purchases.component.css']
})
export class PurchasesComponent implements OnInit {
    purchases: any[] = [];
    suppliers: any[] = [];
    products: any[] = [];
    loading = true;

    showModal = false;
    submitLoading = false;

    currentUser: any = null;

    // New Purchase Form
    selectedSupplierId: number | null = null;
    selectedProductId: number | null = null;
    newQuantity: number = 1;
    newCost: number = 0;

    cartItems: any[] = [];
    numFactura: string = '';

    constructor(private api: ApiService, private router: Router) {
        const saved = localStorage.getItem('user');
        if (saved) {
            this.currentUser = JSON.parse(saved);
            if (![1, 6].includes(this.currentUser.role_id)) {
                this.router.navigate(['/dashboard']);
            }
        } else {
            this.router.navigate(['/login']);
        }
    }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.loading = true;

        // Load Purchases
        this.api.getPurchases().subscribe({
            next: (res: any) => {
                this.purchases = res.records || [];
                this.loading = false;
            },
            error: (err) => {
                console.error('Error fetching purchases', err);
                this.loading = false;
            }
        });

        // Load references for new Purchase modal
        this.api.getSuppliers().subscribe({
            next: (res: any) => this.suppliers = res.records || []
        });

        this.api.getInventory().subscribe({
            next: (res: any) => this.products = res.records || []
        });
    }

    openNewPurchaseModal() {
        this.showModal = true;
        this.selectedSupplierId = null;
        this.selectedProductId = null;
        this.cartItems = [];
        this.numFactura = '';
        this.newQuantity = 1;
        this.newCost = 0;
    }

    closeModal() {
        this.showModal = false;
    }

    onProductSelectChange() {
        const p = this.products.find(x => x.id === Number(this.selectedProductId));
        if (p) {
            this.newCost = parseFloat(p.precio_compra) || 0;
        }
    }

    addItemToPurchase() {
        if (!this.selectedProductId || this.newQuantity <= 0 || this.newCost <= 0) {
            alert("Introduce un insumo y valores válidos.");
            return;
        }

        const prod = this.products.find(p => p.id == this.selectedProductId);
        if (!prod) return;

        // Check if exists
        const existing = this.cartItems.find(i => i.insumo_id == this.selectedProductId);
        if (existing) {
            existing.cantidad += this.newQuantity;
            existing.costo_unitario = this.newCost;
        } else {
            this.cartItems.push({
                insumo_id: this.selectedProductId,
                nombre: prod.nombre,
                cantidad: this.newQuantity,
                costo_unitario: this.newCost
            });
        }

        this.selectedProductId = null;
        this.newQuantity = 1;
        this.newCost = 0;
    }

    removeItem(index: number) {
        this.cartItems.splice(index, 1);
    }

    getPurchaseTotal(): number {
        return this.cartItems.reduce((acc, current) => acc + (current.cantidad * current.costo_unitario), 0);
    }

    submitPurchase() {
        if (!this.selectedSupplierId) {
            alert('Debes seleccionar un proveedor.');
            return;
        }

        if (this.cartItems.length === 0) {
            alert('Agrega al menos un insumo a la compra.');
            return;
        }

        const payload = {
            usuario_id: this.currentUser.id,
            proveedor_id: this.selectedSupplierId,
            numero_factura: this.numFactura,
            detalles: this.cartItems
        };

        this.submitLoading = true;
        this.api.createPurchase(payload).subscribe({
            next: () => {
                alert('Compra registrada exitosamente. Se ha actualizado el inventario.');
                this.submitLoading = false;
                this.closeModal();
                this.loadData();
            },
            error: (err) => {
                console.error('Error al guardar compra', err);
                alert(err.error?.message || 'Error al guardar la compra.');
                this.submitLoading = false;
            }
        });
    }

    goBack() {
        this.router.navigate(['/dashboard']);
    }
}
