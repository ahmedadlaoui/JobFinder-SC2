import { Routes } from '@angular/router';



export const routes: Routes = [
    { path: '', redirectTo: 'jobs', pathMatch: 'full' },
    {
        path: 'jobs',
        loadComponent: () =>
            import('./pages/job-search/job-search').then((m) => m.JobSearchComponent),
    },
    {
        path: 'favorites',
        loadComponent: () =>
            import('./pages/favorites/favorites').then((m) => m.FavoritesComponent),
    },
];
