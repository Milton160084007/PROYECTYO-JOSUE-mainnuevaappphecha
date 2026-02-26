import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {
    nombre = '';
    email = '';
    telefono = '';
    password = '';

    loading = false;
    error = '';
    successMsg = '';

    constructor(private api: ApiService, private router: Router) {
        // If user already logged in, redirect them based on their role
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

    onRegister() {
        if (!this.nombre || !this.email || !this.password) {
            this.error = 'Por favor, completa los campos requeridos (Nombre, Correo y Contraseña).';
            this.successMsg = '';
            return;
        }

        if (this.password.length < 6) {
            this.error = 'La contraseña debe tener al menos 6 caracteres.';
            this.successMsg = '';
            return;
        }

        this.loading = true;
        this.error = '';
        this.successMsg = '';

        const data = {
            nombre: this.nombre,
            email: this.email,
            telefono: this.telefono,
            password: this.password
        };

        this.api.registerClient(data).subscribe({
            next: (res: any) => {
                this.loading = false;
                this.successMsg = '¡Registro exitoso! Redirigiendo al inicio de sesión...';

                // Clear form
                this.nombre = '';
                this.email = '';
                this.telefono = '';
                this.password = '';

                setTimeout(() => {
                    this.router.navigate(['/login']);
                }, 2500);
            },
            error: (err: any) => {
                this.loading = false;
                this.error = err.error?.message || 'Ocurrió un error al registrarse. Verifica tus datos e inténtalo de nuevo.';
            }
        });
    }
}
