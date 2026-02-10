import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoriteService } from '../../services/favorite.service';
import { Favorite } from '../../models/favorite.model';

@Component({
    selector: 'app-favorites',
    imports: [RouterLink],
    templateUrl: './favorites.html',
    styleUrl: './favorites.css',
})
export class FavoritesComponent implements OnInit {
    favorites = signal<Favorite[]>([]);
    loading = signal(false);

    constructor(private favoriteService: FavoriteService) { }

    ngOnInit(): void {
        this.loadFavorites();
    }

    loadFavorites(): void {
        this.loading.set(true);
        this.favoriteService.getFavorites().subscribe({
            next: (data) => {
                this.favorites.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Failed to load favorites:', err);
                this.loading.set(false);
            },
        });
    }

    removeFavorite(id: number): void {
        this.favoriteService.removeFavorite(id).subscribe({
            next: () => {
                this.favorites.update((list) => list.filter((f) => f.id !== id));
            },
            error: (err) => {
                console.error('Failed to remove favorite:', err);
            },
        });
    }

    getInitials(company: string): string {
        return company
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase();
    }
}
