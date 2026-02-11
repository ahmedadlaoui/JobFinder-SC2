import { createReducer, on } from '@ngrx/store';
import { FavoritesActions } from './favorites.actions';
import { initialFavoritesState } from './favorites.state';

export const favoriteReducer = createReducer(
    initialFavoritesState,

    on(FavoritesActions.loadFavorites, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),

    on(FavoritesActions.loadFavoritesSuccess, (state, { favorites }) => ({
        ...state,
        favorites,
        loading: false,
        error: null,
    })),

    on(FavoritesActions.loadFavoritesFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    })),

    on(FavoritesActions.addFavorite, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),

    on(FavoritesActions.addFavoriteSuccess, (state, { favorite }) => ({
        ...state,
        favorites: [...state.favorites, favorite],
        loading: false,
        error: null,
    })),

    on(FavoritesActions.addFavoriteFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    })),

    on(FavoritesActions.removeFavorite, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),

    on(FavoritesActions.removeFavoriteSuccess, (state, { id }) => ({
        ...state,
        favorites: state.favorites.filter((f) => f.id !== id),
        loading: false,
        error: null,
    })),

    on(FavoritesActions.removeFavoriteFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    })),
)