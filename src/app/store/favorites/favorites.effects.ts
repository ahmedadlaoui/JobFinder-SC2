import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError } from 'rxjs/operators';
import { FavoriteService } from '../../services/favorite.service';
import { FavoritesActions } from './favorites.actions';


@Injectable()
export class FavoritesEffects {

    private actions$ = inject(Actions);
    private favoriteService = inject(FavoriteService);

    loadFavorites$ = createEffect(() =>

        this.actions$.pipe(
            ofType(FavoritesActions.loadFavorites),

            exhaustMap(() =>
                this.favoriteService.getFavorites().pipe(
                    map((favorites) =>
                        FavoritesActions.loadFavoritesSuccess({ favorites })
                    ),
                    catchError((error) =>
                        of(FavoritesActions.loadFavoritesFailure({
                            error: error.message || 'Failed to load favorites'
                        }))
                    )
                )
            ),
        )

    );

    removeFavorites$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FavoritesActions.removeFavorite),
            exhaustMap(({ id }) =>
                this.favoriteService.removeFavorite(id).pipe(
                    map(() => FavoritesActions.removeFavoriteSuccess({ id })),
                    catchError((error) =>
                        of(FavoritesActions.removeFavoriteFailure({
                            error: error.message || 'Failed to remove favorite'
                        }))
                    )
                )
            ),
        )
    );

    addFavorite$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FavoritesActions.addFavorite),
            exhaustMap(({job})=>
                this.favoriteService.addFavorite(job).pipe(
                    map((favorite)=>FavoritesActions.addFavoriteSuccess({favorite})),
                    catchError((error)=>
                        of(FavoritesActions.addFavoriteFailure({
                            error : error.message || 'Failed to add job to favorites'
                        }))
                    )
                )
                
            )
        )
    );
}