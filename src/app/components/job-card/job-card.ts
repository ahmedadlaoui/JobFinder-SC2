import { Component, EventEmitter, input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Job } from '../../models/job.model';
import { Store } from '@ngrx/store';

@Component({
    selector: 'app-job-card',
    imports: [DatePipe],
    templateUrl: './job-card.html',
    styleUrl: './job-card.css',
})
export class JobCardComponent {
    job = input.required<Job>();
    isFavorite = input<boolean>(false);
    isApplied = input<boolean>(false);

    @Output() addToFavorite = new EventEmitter<Job>();
    @Output() applyToJob = new EventEmitter<Job>();

    constructor(private store: Store) { }

    onFavoriteClick() {
        this.addToFavorite.emit(this.job());
    }

    onApplyClick() {
        if (!this.isApplied()) {
            this.applyToJob.emit(this.job());
        }
    }
}
