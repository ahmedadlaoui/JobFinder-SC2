import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Job } from '../../models/job.model';

@Component({
    selector: 'app-job-card',
    imports: [DatePipe],
    templateUrl: './job-card.html',
    styleUrl: './job-card.css',
})
export class JobCardComponent {
    job = input.required<Job>();

    getInitials(): string {
        return this.job().organization
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase();
    }
}
