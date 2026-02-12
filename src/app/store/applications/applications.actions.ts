import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Application } from '../../models/application.model';
import { Job } from '../../models/job.model';

export const ApplicationsActions = createActionGroup({
    source: 'Applications',
    events: {
        'Load Applications': emptyProps(),
        'Load Applications Success': props<{ applications: Application[] }>(),
        'Load Applications Failure': props<{ error: string }>(),

        'Add Application': props<{ job: Job }>(),
        'Add Application Success': props<{ application: Application }>(),
        'Add Application Failure': props<{ error: string }>(),

        'Update Application': props<{ id: number; changes: Partial<Application> }>(),
        'Update Application Success': props<{ application: Application }>(),
        'Update Application Failure': props<{ error: string }>(),

        'Remove Application': props<{ id: number }>(),
        'Remove Application Success': props<{ id: number }>(),
        'Remove Application Failure': props<{ error: string }>(),
    },
});
