import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = `${environment.jsonServerUrl}/users`;
    private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
    currentUser$ = this.currentUserSubject.asObservable();
    showDropdown = false;

    constructor(private http: HttpClient, private router: Router) { }

    private getStoredUser(): User | null {
        const stored = localStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
    }

    get currentUser(): User | null {
        return this.currentUserSubject.value;
    }

    get isLoggedIn(): boolean {
        return !!this.currentUser;
    }

    toggleDropdown(): void {
        this.showDropdown = !this.showDropdown;
    }

    closeDropdown(): void {
        this.showDropdown = false;
    }

    login(email: string, password: string): Observable<User> {
        return this.http.get<User[]>(this.apiUrl, {
            params: { email, password }
        }).pipe(
            map(users => {
                if (users.length === 0) {
                    throw new Error('Invalid email or password');
                }
                return users[0];
            }),
            tap(user => {
                const { password: _, ...safeUser } = user as User & { password?: string };
                localStorage.setItem('currentUser', JSON.stringify(safeUser));
                this.currentUserSubject.next(safeUser as User);
            })
        );
    }

    logout(): void {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        this.showDropdown = false;
        this.router.navigate(['/login']);
    }
}
