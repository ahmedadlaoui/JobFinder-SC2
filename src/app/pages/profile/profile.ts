import { Component, HostListener, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-profile',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './profile.html',
    styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
    profileForm!: FormGroup;
    passwordForm!: FormGroup;

    @HostListener('document:click')
    onDocumentClick() {
        this.authService.closeDropdown();
    }

    constructor(
        private fb: FormBuilder,
        public authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        const user = this.authService.currentUser;
        if (!user) {
            this.router.navigate(['/login']);
            return;
        }

        this.profileForm = this.fb.group({
            name: [user.name, Validators.required],
            email: [user.email, [Validators.required, Validators.email]],
        });

        this.passwordForm = this.fb.group({
            oldPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
        });
    }

    onSubmit(): void {
        if (this.profileForm.invalid) return;
        const { name, email } = this.profileForm.value;
        this.authService.updateUser({ name, email }).subscribe({
            next: () => this.profileForm.markAsPristine(),
        });
    }

    onChangePassword(): void {
        if (this.passwordForm.invalid) return;
        const { oldPassword, newPassword } = this.passwordForm.value;
        this.authService.updatePassword(oldPassword, newPassword).subscribe({
            next: () => this.passwordForm.reset(),
            error: (err) => this.passwordForm.get('oldPassword')?.setErrors({ incorrect: true })
        });
    }
}
