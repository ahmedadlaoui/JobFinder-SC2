import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateFavoriteDto, Favorite } from '../models/favorite.model';
import { environment } from '../../environments/environment';
import { Job } from '../models/job.model';

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

    addFavorite(job: Job): Observable<Favorite> {
        const favorite = this.buildFavoriteObject(job);
        return this.http.post<Favorite>(this.apiUrl, favorite)
    }

    buildFavoriteObject(job: Job): CreateFavoriteDto {
        return {
            userId: 1,
            offerId: job.id,
            title: job.title,
            company: job.organization,
            location: job.location
        }
    }
}
