import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { UsaJobsResponse, Job, JobSearchResponse } from '../models/job.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class JobService {
    private apiUrl = environment.usajobs.apiUrl;

    constructor(private http: HttpClient) { }

    getJobs(page: number, keyword?: string, location?: string): Observable<JobSearchResponse> {
        let params = new HttpParams()
            .set('SortField', 'opendate')
            .set('SortDirection', 'Desc')
            .set('Page', page.toString())
            .set('ResultsPerPage', '10');

        if (keyword) {
            params = params.set('PositionTitle', keyword);
        }
        if (location) {
            params = params.set('LocationName', location);
        }

        return this.http.get<UsaJobsResponse>(this.apiUrl, { params }).pipe(
            map((res) => this.mapResponse(res))
        );
    }

    private mapResponse(res: UsaJobsResponse): JobSearchResponse {
        const items = res.SearchResult.SearchResultItems ?? [];
        const jobs: Job[] = items.map((item) => {
            const d = item.MatchedObjectDescriptor;
            const pay = d.PositionRemuneration?.[0];
            return {
                id: item.MatchedObjectId,
                title: d.PositionTitle,
                organization: d.OrganizationName,
                location: d.PositionLocationDisplay,
                publicationDate: d.PublicationStartDate,
                positionUri: d.PositionURI,
                applyUri: d.ApplyURI?.[0] ?? d.PositionURI,
                salary: pay ? `$${pay.MinimumRange} - $${pay.MaximumRange} ${pay.Description}` : '',
                summary: d.QualificationSummary,
            };
        });
        return { jobs, totalCount: res.SearchResult.SearchResultCountAll };
    }
}
