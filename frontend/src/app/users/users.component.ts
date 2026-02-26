import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="module-page">
      <div class="page-header">
        <h2>👤 Usuarios</h2>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="goBack()">← Volver</button>
          <button class="btn btn-primary" (click)="openForm()">+ Nuevo Usuario</button>
        </div>
      </div>
      <table>
        <thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          @for(u of users; track u.id){
            <tr>
              <td>{{u.id}}</td><td><strong>{{u.nombre}}</strong></td><td>{{u.email}}</td><td>{{u.telefono||'—'}}</td>
              <td><span class="badge badge-purple">{{u.rol_nombre}}</span></td>
              <td>@if(u.activo){<span class="badge badge-success">Activo</span>}@else{<span class="badge badge-danger">Inactivo</span>}</td>
              <td><div class="action-btns"><button class="btn btn-sm btn-secondary" (click)="editUser(u)">✏️</button><button class="btn btn-sm btn-danger" (click)="deleteUser(u.id)">🗑️</button></div></td>
            </tr>
          }
        </tbody>
      </table>
      @if(showForm){
        <div class="modal-overlay" (click)="showForm=false">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h3>{{editingId?'Editar':'Nuevo'}} Usuario</h3>
            <div class="form-group"><label>Nombre</label><input [(ngModel)]="form.nombre" placeholder="Nombre completo"></div>
            <div class="form-group"><label>Email</label><input type="email" [(ngModel)]="form.email" placeholder="Email"></div>
            <div class="form-row">
              <div class="form-group"><label>Teléfono</label><input [(ngModel)]="form.telefono" placeholder="Teléfono"></div>
              <div class="form-group"><label>Rol</label>
                <select [(ngModel)]="form.rol_id">@for(r of roles; track r.id){<option [value]="r.id">{{r.nombre}}</option>}</select>
              </div>
            </div>
            @if(!editingId){<div class="form-group"><label>Contraseña</label><input type="password" [(ngModel)]="form.password" placeholder="Contraseña"></div>}
            <div class="modal-actions"><button class="btn btn-secondary" (click)="showForm=false">Cancelar</button><button class="btn btn-primary" (click)="saveUser()">Guardar</button></div>
          </div>
        </div>
      }
    </div>`,
    styles: [`.module-page{padding:30px;max-width:1200px;margin:0 auto}.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px}.header-actions{display:flex;gap:8px}.action-btns{display:flex;gap:4px}.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}`]
})
export class UsersComponent implements OnInit {
    users: any[] = [];
    roles: any[] = [];
    showForm = false;
    editingId: number | null = null;
    form: any = { nombre: '', email: '', telefono: '', rol_id: 1, password: '' };

    constructor(private api: ApiService, private router: Router) { }

    ngOnInit() { this.loadUsers(); this.loadRoles(); }

    loadUsers() { this.api.getUsers().subscribe({ next: (r: any) => this.users = r.records || [] }); }
    loadRoles() { this.api.getRoles().subscribe({ next: (r: any) => this.roles = r.records || [] }); }

    openForm() {
        this.editingId = null;
        this.form = { nombre: '', email: '', telefono: '', rol_id: 1, password: '' };
        this.showForm = true;
    }

    editUser(u: any) {
        this.editingId = u.id;
        this.form = { ...u };
        this.showForm = true;
    }

    saveUser() {
        if (this.editingId) {
            this.api.updateUser({ ...this.form, id: this.editingId }).subscribe({ next: () => { this.showForm = false; this.loadUsers(); } });
        } else {
            this.api.createUser(this.form).subscribe({ next: () => { this.showForm = false; this.loadUsers(); } });
        }
    }

    deleteUser(id: number) {
        if (confirm('¿Desactivar este usuario?')) {
            this.api.deleteUser(id).subscribe({ next: () => this.loadUsers() });
        }
    }

    goBack() { this.router.navigate(['/dashboard']); }
}
