import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Favorite } from '../../models/favorite.model';
import { Job } from '../../models/job.model';


export const FavoritesActions = createActionGroup({

    source: 'Favorites',
    events: {
        'Load Favorites': emptyProps(),
        'Load Favorites Success': props<{ favorites: Favorite[] }>(),
        'Load Favorites Failure': props<{ error: string }>(),
        'Add Favorite': props<{ job: Job }>(),
        'Add Favorite Success': props<{ favorite: Favorite }>(),
        'Add Favorite Failure': props<{ error: string }>(),
        'Remove Favorite': props<{ id: number }>(),
        'Remove Favorite Success': props<{ id: number }>(),
        'Remove Favorite Failure': props<{ error: string }>(),
    },


});