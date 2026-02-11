import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-login',
    imports: [FormsModule],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class LoginComponent {
    email = '';
    password = '';

    constructor(private router: Router) { }

    onSubmit(): void {
        if (this.email && this.password) {
            this.router.navigate(['/jobs']);
        }
    }
}
