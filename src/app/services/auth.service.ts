import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map, switchMap, tap } from 'rxjs';
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
            tap(user => this.setUser(user))
        );
    }

    register(name: string, email: string, password: string): Observable<User> {
        return this.http.get<User[]>(this.apiUrl, { params: { email } }).pipe(
            map(users => {
                if (users.length > 0) {
                    throw new Error('Email already exists');
                }
            }),
            switchMap(() => this.http.post<User>(this.apiUrl, { name, email, password })),
            tap(user => this.setUser(user))
        );
    }

    updateUser(data: { name: string; email: string }): Observable<User> {
        const id = this.currentUser!.id;
        return this.http.patch<User>(`${this.apiUrl}/${id}`, data).pipe(
            tap(user => this.setUser(user))
        );
    }

    updatePassword(oldPassword: string, newPassword: string): Observable<User> {
        const id = this.currentUser!.id;
        return this.http.get<User[]>(this.apiUrl, {
            params: { id: id.toString(), password: oldPassword }
        }).pipe(
            map(users => {
                if (users.length === 0) {
                    throw new Error('Current password is incorrect');
                }
                return users[0];
            }),
            switchMap(() => this.http.patch<User>(`${this.apiUrl}/${id}`, { password: newPassword })),
            tap(user => this.setUser(user))
        );
    }

    private setUser(user: User): void {
        const { password: _, ...safeUser } = user as User & { password?: string };
        localStorage.setItem('currentUser', JSON.stringify(safeUser));
        this.currentUserSubject.next(safeUser as User);
    }

    logout(): void {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        this.showDropdown = false;
        this.router.navigate(['/login']);
    }
}
