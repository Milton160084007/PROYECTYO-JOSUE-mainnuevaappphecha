import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
    selector: 'app-clients',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="module-page">
      <div class="page-header">
        <h2>👥 Clientes</h2>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="goBack()">← Volver</button>
          <button class="btn btn-primary" (click)="openForm()">+ Nuevo Cliente</button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Documento</th>
            <th>Número</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (c of clients; track c.id) {
            <tr>
              <td>{{ c.id }}</td>
              <td><span class="badge badge-info">{{ c.tipo_documento }}</span></td>
              <td>{{ c.numero_documento }}</td>
              <td><strong>{{ c.nombre_completo }}</strong></td>
              <td>{{ c.telefono || '—' }}</td>
              <td>{{ c.email || '—' }}</td>
              <td>
                <div class="action-btns">
                  <button class="btn btn-sm btn-secondary" (click)="editClient(c)">✏️</button>
                  <button class="btn btn-sm btn-danger" (click)="deleteClient(c.id)">🗑️</button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>

      @if (clients.length === 0) {
        <div class="empty-state"><span>👥</span><p>No hay clientes registrados</p></div>
      }

      @if (showForm) {
        <div class="modal-overlay" (click)="showForm = false">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h3>{{ editingId ? 'Editar' : 'Nuevo' }} Cliente</h3>
            <div class="form-group">
              <label>Tipo Documento</label>
              <select [(ngModel)]="form.tipo_documento">
                <option value="CEDULA">Cédula</option>
                <option value="RUC">RUC</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </div>
            <div class="form-group">
              <label>Número Documento</label>
              <input [(ngModel)]="form.numero_documento" placeholder="Ej: 1234567890">
            </div>
            <div class="form-group">
              <label>Nombre Completo</label>
              <input [(ngModel)]="form.nombre_completo" placeholder="Nombre completo">
            </div>
            <div class="form-group">
              <label>Dirección</label>
              <input [(ngModel)]="form.direccion" placeholder="Dirección">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Teléfono</label>
                <input [(ngModel)]="form.telefono" placeholder="Teléfono">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="form.email" placeholder="Email">
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="showForm = false">Cancelar</button>
              <button class="btn btn-primary" (click)="saveClient()">Guardar</button>
            </div>
          </div>
        </div>
      }
    </div>
    `,
    styles: [`
      .module-page { padding: 30px; max-width: 1200px; margin: 0 auto; }
      .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
      .header-actions { display: flex; gap: 8px; }
      .action-btns { display: flex; gap: 4px; }
      .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    `]
})
export class ClientsComponent implements OnInit {
    clients: any[] = [];
    showForm = false;
    editingId: number | null = null;
    form: any = { tipo_documento: 'CEDULA', numero_documento: '', nombre_completo: '', direccion: '', telefono: '', email: '' };

    constructor(private api: ApiService, private router: Router) { }

    ngOnInit() { this.loadClients(); }

    loadClients() {
        this.api.getClients().subscribe({ next: (r: any) => this.clients = r.records || [] });
    }

    openForm() {
        this.editingId = null;
        this.form = { tipo_documento: 'CEDULA', numero_documento: '', nombre_completo: '', direccion: '', telefono: '', email: '' };
        this.showForm = true;
    }

    editClient(c: any) {
        this.editingId = c.id;
        this.form = { ...c };
        this.showForm = true;
    }

    saveClient() {
        if (this.editingId) {
            this.api.updateClient({ ...this.form, id: this.editingId }).subscribe({ next: () => { this.showForm = false; this.loadClients(); } });
        } else {
            this.api.createClient(this.form).subscribe({ next: () => { this.showForm = false; this.loadClients(); } });
        }
    }

    deleteClient(id: number) {
        if (confirm('¿Eliminar este cliente?')) {
            this.api.deleteClient(id).subscribe({ next: () => this.loadClients() });
        }
    }

    goBack() { this.router.navigate(['/dashboard']); }
}
