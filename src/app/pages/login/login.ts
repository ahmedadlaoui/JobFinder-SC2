import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class LoginComponent {
    form: FormGroup;
    errorMessage = '';

    constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
        if (this.authService.isLoggedIn) {
            this.router.navigate(['/jobs']);
        }
        this.form = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.errorMessage = '';
        const { email, password } = this.form.value;
        this.authService.login(email, password).subscribe({
            next: () => this.router.navigate(['/jobs']),
            error: () => this.errorMessage = 'Invalid email or password'
        });
    }
}
