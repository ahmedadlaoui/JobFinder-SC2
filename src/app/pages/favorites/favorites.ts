import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Favorite } from '../../models/favorite.model';
import { FavoritesActions } from '../../store/favorites/favorites.actions';
import { selectAllFavorites, selectFavoritesLoading } from '../../store/favorites/favorites.selectors';

@Component({
    selector: 'app-favorites',
    imports: [RouterLink, AsyncPipe],
    templateUrl: './favorites.html',
    styleUrl: './favorites.css',
})
export class FavoritesComponent implements OnInit {
    favorites$: Observable<Favorite[]>;
    loading$: Observable<boolean>;

    constructor(private store: Store) {
        this.favorites$ = this.store.select(selectAllFavorites);
        this.loading$ = this.store.select(selectFavoritesLoading);
    }

    ngOnInit(): void {
        this.store.dispatch(FavoritesActions.loadFavorites());
    }

    removeFavorite(id: number): void {
        this.store.dispatch(FavoritesActions.removeFavorite({ id }));
    }
}
