import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    imports: [FormsModule],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class LoginComponent {
    email = '';
    password = '';
    errorMessage = '';

    constructor(private router: Router, private authService: AuthService) {
        if (this.authService.isLoggedIn) {
            this.router.navigate(['/jobs']);
        }
    }

    onSubmit(): void {
        if (!this.email || !this.password) return;
        this.errorMessage = '';
        this.authService.login(this.email, this.password).subscribe({
            next: () => this.router.navigate(['/jobs']),
            error: () => this.errorMessage = 'Invalid email or password'
        });
    }
}
