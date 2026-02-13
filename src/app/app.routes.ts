import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'jobs', pathMatch: 'full' },
    {
        path: 'login',
        loadComponent: () =>
            import('./pages/login/login').then((m) => m.LoginComponent),
    },
    {
        path: 'jobs',
        loadComponent: () =>
            import('./pages/job-search/job-search').then((m) => m.JobSearchComponent),
    },
    {
        path: 'favorites',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./pages/favorites/favorites').then((m) => m.FavoritesComponent),
    },
    {
        path: 'applications',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./pages/applications/applications').then((m) => m.ApplicationsComponent),
    },
];
