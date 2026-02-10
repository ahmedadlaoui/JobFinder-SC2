import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SearchBarComponent } from '../../components/search-bar/search-bar';
import { FilterSidebarComponent } from '../../components/filter-sidebar/filter-sidebar';
import { JobCardComponent } from '../../components/job-card/job-card';
import { PaginationComponent } from '../../components/pagination/pagination';
import { JobService } from '../../services/job.service';
import { Job } from '../../models/job.model';

@Component({
    selector: 'app-job-search',
    imports: [
        RouterLink,
        SearchBarComponent,
        FilterSidebarComponent,
        JobCardComponent,
        PaginationComponent,
    ],
    templateUrl: './job-search.html',
    styleUrl: './job-search.css',
})
export class JobSearchComponent implements OnInit {

    jobs = signal<Job[]>([]);
    currentPage = signal(1);
    totalPages = signal(1);
    totalJobs = signal(0);
    loading = signal(false);

    private keyword = '';
    private location = '';
    private readonly perPage = 10;

    constructor(private jobService: JobService) { }

    ngOnInit(): void {
        this.loadJobs(1);
    }

    loadJobs(page: number): void {
        this.loading.set(true);
        this.currentPage.set(page);

        this.jobService.getJobs(page, this.keyword, this.location).subscribe({
            next: (response) => {
                this.jobs.set(response.jobs);
                this.totalJobs.set(response.totalCount);
                this.totalPages.set(Math.ceil(response.totalCount / this.perPage));
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Failed to load jobs:', err);
                this.loading.set(false);
            },
        });
    }

    onSearch(event: { keyword: string; location: string }): void {
        this.keyword = event.keyword;
        this.location = event.location;
        this.loadJobs(1);
    }

    onPageChange(page: number): void {
        this.loadJobs(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
