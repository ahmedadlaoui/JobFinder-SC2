import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError } from 'rxjs/operators';
import { ApplicationService } from '../../services/application.service';
import { ApplicationsActions } from './applications.actions';

@Injectable()
export class ApplicationsEffects {
    private actions$ = inject(Actions);
    private applicationService = inject(ApplicationService);

    loadApplications$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ApplicationsActions.loadApplications),
            exhaustMap(() =>
                this.applicationService.getApplications().pipe(
                    map(applications => ApplicationsActions.loadApplicationsSuccess({ applications })),
                    catchError(error => of(ApplicationsActions.loadApplicationsFailure({
                        error: error.message || 'Failed to load applications'
                    })))
                )
            )
        )
    );

    addApplication$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ApplicationsActions.addApplication),
            exhaustMap(({ job }) =>
                this.applicationService.addApplication(job).pipe(
                    map(application => ApplicationsActions.addApplicationSuccess({ application })),
                    catchError(error => of(ApplicationsActions.addApplicationFailure({
                        error: error.message || 'Failed to add application'
                    })))
                )
            )
        )
    );

    updateApplication$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ApplicationsActions.updateApplication),
            exhaustMap(({ id, changes }) =>
                this.applicationService.updateApplication(id, changes).pipe(
                    map(application => ApplicationsActions.updateApplicationSuccess({ application })),
                    catchError(error => of(ApplicationsActions.updateApplicationFailure({
                        error: error.message || 'Failed to update application'
                    })))
                )
            )
        )
    );

    removeApplication$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ApplicationsActions.removeApplication),
            exhaustMap(({ id }) =>
                this.applicationService.removeApplication(id).pipe(
                    map(() => ApplicationsActions.removeApplicationSuccess({ id })),
                    catchError(error => of(ApplicationsActions.removeApplicationFailure({
                        error: error.message || 'Failed to remove application'
                    })))
                )
            )
        )
    );
}
