import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-welcome',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent {

    constructor(private router: Router) {
        // If the user happens to have an active session, let's just route them appropriately
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

    selectRole(roleId: string, roleName: string) {
        // Navigate to the login screen with query parameters
        this.router.navigate(['/login'], { queryParams: { role: roleId, title: roleName } });
    }

}
