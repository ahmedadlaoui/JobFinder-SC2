import { Component, EventEmitter, input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Job } from '../../models/job.model';
import { Store } from '@ngrx/store';
import { FavoritesActions } from '../../store/favorites/favorites.actions';

@Component({
    selector: 'app-job-card',
    imports: [DatePipe],
    templateUrl: './job-card.html',
    styleUrl: './job-card.css',
})
export class JobCardComponent {
    job = input.required<Job>();
    isFavorite = input<boolean>(false);

    @Output() addToFavorite = new EventEmitter<Job>()

    constructor(private store: Store) { }

    getInitials(): string {
        return this.job().organization
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase();
    }

    onFavoriteClick() {
        console.log('test');
        
        this.addToFavorite.emit(this.job())
    }

}
