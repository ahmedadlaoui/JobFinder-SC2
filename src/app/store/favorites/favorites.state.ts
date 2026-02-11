


import { Favorite } from '../../models/favorite.model';

export interface FavoritesState {

    favorites: Favorite[];
    loading: boolean;
    error: string | null;

}

export const initialFavoritesState: FavoritesState = {
    favorites: [],
    loading: false,
    error: null,
};