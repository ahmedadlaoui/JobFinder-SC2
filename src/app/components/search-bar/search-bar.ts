import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

@Component({
    selector: 'app-search-bar',
    imports: [ReactiveFormsModule],
    templateUrl: './search-bar.html',
    styleUrl: './search-bar.css',
})
export class SearchBarComponent {
    searchForm = new FormGroup({
        keyword: new FormControl(''),
        location: new FormControl(''),
    });
}
