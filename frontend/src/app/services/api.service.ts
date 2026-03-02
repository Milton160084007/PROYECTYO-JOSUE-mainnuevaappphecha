import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = 'http://localhost:8000/api';

    constructor(private http: HttpClient) { }

    // Auth
    login(credentials: { email: string, password: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/login.php`, credentials);
    }
    registerClient(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register_client.php`, data);
    }

    // Dashboard
    getDashboardStats(): Observable<any> {
        return this.http.get(`${this.apiUrl}/dashboard_stats.php`);
    }
    getReport(type: 'weekly' | 'monthly'): Observable<any> {
        return this.http.get(`${this.apiUrl}/reports.php?type=${type}`);
    }

    // Products
    getProducts(): Observable<any> {
        return this.http.get(`${this.apiUrl}/products.php`);
    }
    getAllProducts(): Observable<any> {
        return this.http.get(`${this.apiUrl}/products.php?all=1`);
    }
    getMenuCategories(): Observable<any> {
        return this.http.get(`${this.apiUrl}/products.php?categories=1`);
    }
    createProduct(product: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/products.php`, product);
    }
    updateProduct(product: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/products.php`, product);
    }
    deleteProduct(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/products.php?id=${id}`);
    }
    createMenuCategory(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/products.php`, { ...data, action: 'create_category' });
    }
    updateMenuCategory(data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/products.php`, { ...data, action: 'update_category' });
    }
    deleteMenuCategory(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/products.php?category_id=${id}`);
    }

    // Orders
    getOrders(estado?: string, usuarioId?: number): Observable<any> {
        let url = `${this.apiUrl}/orders.php`;
        let params = [];
        if (estado) params.push(`estado=${estado}`);
        if (usuarioId) params.push(`usuario_id=${usuarioId}`);
        if (params.length > 0) url += '?' + params.join('&');
        return this.http.get(url);
    }
    getOrderById(id: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/orders.php?id=${id}`);
    }
    createOrder(order: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/orders.php`, order);
    }
    updateOrderStatus(id: number, estado: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/orders.php`, { id, estado });
    }

    // Invoices
    getInvoices(): Observable<any> {
        return this.http.get(`${this.apiUrl}/invoices.php`);
    }
    getInvoiceById(id: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/invoices.php?id=${id}`);
    }
    createInvoice(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/invoices.php`, data);
    }
    anularInvoice(id: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/invoices.php`, { id, anular: true });
    }

    // Clients
    getClients(): Observable<any> {
        return this.http.get(`${this.apiUrl}/clients.php`);
    }
    searchClients(term: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/clients.php?search=${term}`);
    }
    createClient(client: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/clients.php`, client);
    }
    updateClient(client: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/clients.php`, client);
    }
    deleteClient(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/clients.php?id=${id}`);
    }

    // Inventory
    getInventory(): Observable<any> {
        return this.http.get(`${this.apiUrl}/inventory.php`);
    }
    getLowStock(): Observable<any> {
        return this.http.get(`${this.apiUrl}/inventory.php?low_stock=1`);
    }
    getInsumoCategories(): Observable<any> {
        return this.http.get(`${this.apiUrl}/inventory.php?categories=1`);
    }
    createInsumo(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/inventory.php`, data);
    }
    updateInsumo(data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/inventory.php`, data);
    }
    deleteInsumo(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/inventory.php?id=${id}`);
    }

    // Suppliers
    getSuppliers(): Observable<any> {
        return this.http.get(`${this.apiUrl}/suppliers.php`);
    }
    createSupplier(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/suppliers.php`, data);
    }
    updateSupplier(data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/suppliers.php`, data);
    }
    deleteSupplier(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/suppliers.php?id=${id}`);
    }

    // Purchases
    getPurchases(): Observable<any> {
        return this.http.get(`${this.apiUrl}/purchases.php`);
    }
    createPurchase(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/purchases.php`, data);
    }

    // Users
    getUsers(): Observable<any> {
        return this.http.get(`${this.apiUrl}/users.php`);
    }
    getRoles(): Observable<any> {
        return this.http.get(`${this.apiUrl}/users.php?roles=1`);
    }
    createUser(user: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/users.php`, user);
    }
    updateUser(user: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/users.php`, user);
    }
    deleteUser(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/users.php?id=${id}`);
    }
}
