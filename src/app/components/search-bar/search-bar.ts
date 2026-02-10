import { Component, output } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

@Component({
    selector: 'app-search-bar',
    imports: [ReactiveFormsModule],
    templateUrl: './search-bar.html',
    styleUrl: './search-bar.css',
})
export class SearchBarComponent {
    search = output<{ keyword: string; location: string }>();

    searchForm = new FormGroup({
        keyword: new FormControl(''),
        location: new FormControl(''),
    });

    onSubmit(): void {
        this.search.emit({
            keyword: this.searchForm.value.keyword ?? '',
            location: this.searchForm.value.location ?? '',
        });
    }
}
