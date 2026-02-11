
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FavoritesState } from './favorites.state';

const selectFavoritesState = createFeatureSelector<FavoritesState>('favorites');

export const selectAllFavorites = createSelector(
    selectFavoritesState,
    (state: FavoritesState) => state.favorites
);

export const selectFavoritesLoading = createSelector(
    selectFavoritesState,
    (state: FavoritesState) => state.loading
);

export const selectFavoritesError = createSelector(
    selectFavoritesState,
    (state: FavoritesState) => state.error
);

export const selectFavoritesCount = createSelector(
    selectAllFavorites,
    (favorites) => favorites.length
);

export const selectFavoriteOfferIdMap = createSelector(
    selectAllFavorites,
    (favorites) => {
        const map = new Map<number, number>();
        favorites.forEach(f => map.set(f.offerId, f.id));
        return map;
    }
);