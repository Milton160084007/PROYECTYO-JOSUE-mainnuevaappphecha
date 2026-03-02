import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MenuComponent } from './menu/menu.component';
import { OrdersComponent } from './orders/orders.component';
import { KitchenComponent } from './kitchen/kitchen.component';
import { ClientsComponent } from './clients/clients.component';
import { InventoryComponent } from './inventory/inventory.component';
import { SuppliersComponent } from './suppliers/suppliers.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { UsersComponent } from './users/users.component';
import { RegisterComponent } from './website/register/register.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { WebsiteMenuComponent } from './website/menu/menu.component';
import { MyOrdersComponent } from './website/my-orders/my-orders.component';
import { PurchasesComponent } from './purchases/purchases.component';
import { CartComponent } from './website/cart/cart.component';

export const routes: Routes = [
    { path: '', redirectTo: '/welcome', pathMatch: 'full' },
    { path: 'welcome', component: WelcomeComponent },
    { path: 'website/register', component: RegisterComponent },
    { path: 'website/menu', component: WebsiteMenuComponent },
    { path: 'website/my-orders', component: MyOrdersComponent },
    { path: 'website/cart', component: CartComponent },
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'menu', component: MenuComponent },
    { path: 'orders', component: OrdersComponent },
    { path: 'kitchen', component: KitchenComponent },
    { path: 'clients', component: ClientsComponent },
    { path: 'inventory', component: InventoryComponent },
    { path: 'suppliers', component: SuppliersComponent },
    { path: 'purchases', component: PurchasesComponent },
    { path: 'invoices', component: InvoicesComponent },
    { path: 'users', component: UsersComponent },
    { path: '**', redirectTo: '/login' }
];
