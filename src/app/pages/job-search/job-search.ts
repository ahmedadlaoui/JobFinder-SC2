import { Component, HostListener, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { SearchBarComponent } from '../../components/search-bar/search-bar';
import { JobCardComponent } from '../../components/job-card/job-card';
import { PaginationComponent } from '../../components/pagination/pagination';
import { JobService } from '../../services/job.service';
import { Job } from '../../models/job.model';
import { Observable, take } from 'rxjs';
import { map } from 'rxjs/operators';
import { Favorite } from '../../models/favorite.model';
import { Store } from '@ngrx/store';
import { selectAllFavorites, selectFavoriteOfferIdMap } from '../../store/favorites/favorites.selectors';
import { FavoritesActions } from '../../store/favorites/favorites.actions';
import { ApplicationsActions } from '../../store/applications/applications.actions';
import { selectApplicationOfferIdSet } from '../../store/applications/applications.selectors';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-job-search',
    imports: [
        RouterLink,
        AsyncPipe,
        SearchBarComponent,
        JobCardComponent,
        PaginationComponent,
    ],
    templateUrl: './job-search.html',
    styleUrl: './job-search.css',
})
export class JobSearchComponent implements OnInit {

    @HostListener('document:click')
    onDocumentClick() {
        this.authService.closeDropdown();
    }

    jobs = signal<Job[]>([]);
    currentPage = signal(1);
    totalPages = signal(1);
    totalJobs = signal(0);
    loading = signal(false);

    private keyword = '';
    private location = '';
    private readonly perPage = 10;

    favorites$: Observable<Favorite[]>;
    favoriteOfferIds$: Observable<Set<number>>;
    favoriteOfferIdMap$: Observable<Map<number, number>>;
    appliedOfferIds$: Observable<Set<string>>;

    constructor(
        private jobService: JobService,
        private store: Store,
        public authService: AuthService
    ) {
        this.favorites$ = this.store.select(selectAllFavorites);
        this.favoriteOfferIds$ = this.favorites$.pipe(
            map(favs => new Set(favs.map(f => f.offerId)))
        );
        this.favoriteOfferIdMap$ = this.store.select(selectFavoriteOfferIdMap);
        this.appliedOfferIds$ = this.store.select(selectApplicationOfferIdSet);
    }

    ngOnInit(): void {
        this.store.dispatch(FavoritesActions.loadFavorites());
        this.store.dispatch(ApplicationsActions.loadApplications());
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

    onAddJobToFavorite(jobFromChild: Job) {
        this.favoriteOfferIdMap$.pipe(take(1)).subscribe(m => {
            const favId = m.get(jobFromChild.id);
            if (favId !== undefined) {
                this.store.dispatch(FavoritesActions.removeFavorite({ id: favId }));
            } else {
                this.store.dispatch(FavoritesActions.addFavorite({ job: jobFromChild }));
            }
        });
    }

    onApplyToJob(job: Job) {
        this.store.dispatch(ApplicationsActions.addApplication({ job }));
    }
}
