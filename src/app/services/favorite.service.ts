import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Favorite } from '../models/favorite.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
    private apiUrl = `${environment.jsonServerUrl}/favorites`;

    constructor(private http: HttpClient) { }

    getFavorites(): Observable<Favorite[]> {
        return this.http.get<Favorite[]>(this.apiUrl);
    }

    removeFavorite(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
