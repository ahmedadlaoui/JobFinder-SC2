import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Application, CreateApplicationDto } from '../models/application.model';
import { environment } from '../../environments/environment';
import { Job } from '../models/job.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
    private apiUrl = `${environment.jsonServerUrl}/applications`;

    constructor(private http: HttpClient, private authService: AuthService) { }

    getApplications(): Observable<Application[]> {
        const userId = this.authService.currentUser?.id;
        return this.http.get<Application[]>(this.apiUrl, {
            params: { userId: String(userId) }
        });
    }

    addApplication(job: Job): Observable<Application> {
        const dto: CreateApplicationDto = {
            userId: this.authService.currentUser!.id,
            offerId: String(job.id),
            title: job.title,
            company: job.organization,
            location: job.location,
            url: job.applyUri || job.positionUri,
            status: 'pending',
            notes: '',
            dateAdded: new Date().toISOString()
        };
        return this.http.post<Application>(this.apiUrl, dto);
    }

    updateApplication(id: number, changes: Partial<Application>): Observable<Application> {
        return this.http.patch<Application>(`${this.apiUrl}/${id}`, changes);
    }

    removeApplication(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
