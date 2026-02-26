import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    email = '';
    password = '';
    loading = false;
    error = '';

    roleId: string = 'admin'; // Default fallback
    pageTitle: string = 'Iniciar Sesión';

    constructor(
        private api: ApiService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        // Si ya hay usuario logueado, ir al dashboard o menu publico
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            if (user.role_id === 5) {
                this.router.navigate(['/website/menu']);
            } else {
                this.router.navigate(['/dashboard']);
            }
        }
    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params['role']) this.roleId = params['role'];
            if (params['title']) this.pageTitle = 'Ingreso ' + params['title'];
        });
    }

    onLogin() {
        if (!this.email || !this.password) {
            this.error = 'Ingrese correo y contraseña';
            return;
        }
        this.loading = true;
        this.error = '';

        this.api.login({ email: this.email, password: this.password }).subscribe({
            next: (res: any) => {
                const userData = {
                    id: res.id,
                    name: res.name,
                    role_id: res.role_id,
                    role_name: res.role_name
                };
                localStorage.setItem('user', JSON.stringify(userData));

                if (userData.role_id === 5) {
                    this.router.navigate(['/website/menu']);
                } else {
                    this.router.navigate(['/dashboard']);
                }
            },
            error: (err: any) => {
                this.loading = false;
                this.error = err.error?.message || 'Error de conexión al servidor';
            }
        });
    }
}
