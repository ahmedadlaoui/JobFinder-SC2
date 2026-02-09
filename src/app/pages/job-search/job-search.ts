import { Component } from '@angular/core';
import { SearchBarComponent } from '../../components/search-bar/search-bar';
import { FilterSidebarComponent } from '../../components/filter-sidebar/filter-sidebar';
import { JobCardComponent } from '../../components/job-card/job-card';
import { PaginationComponent } from '../../components/pagination/pagination';

@Component({
    selector: 'app-job-search',
    imports: [
        SearchBarComponent,
        FilterSidebarComponent,
        JobCardComponent,
        PaginationComponent,
    ],
    templateUrl: './job-search.html',
    styleUrl: './job-search.css',
})
export class JobSearchComponent { }
