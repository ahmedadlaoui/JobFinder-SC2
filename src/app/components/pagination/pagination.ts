import { Component, input, output, computed } from '@angular/core';

@Component({
    selector: 'app-pagination',
    imports: [],
    templateUrl: './pagination.html',
    styleUrl: './pagination.css',
})
export class PaginationComponent {
    currentPage = input.required<number>();
    totalPages = input.required<number>();
    pageChange = output<number>();

    pages = computed(() => {
        const total = this.totalPages();
        const current = this.currentPage();
        const pages: (number | '...')[] = [];

        if (total <= 7) {
            for (let i = 1; i <= total; i++) pages.push(i);
        } else {
            pages.push(1);

            if (current > 3) pages.push('...');

            const start = Math.max(2, current - 1);
            const end = Math.min(total - 1, current + 1);
            for (let i = start; i <= end; i++) pages.push(i);

            if (current < total - 2) pages.push('...');

            pages.push(total);
        }

        return pages;
    });

    goToPage(page: number | '...'): void {
        if (page === '...') return;
        this.pageChange.emit(page);
    }

    prev(): void {
        if (this.currentPage() > 1) {
            this.pageChange.emit(this.currentPage() - 1);
        }
    }

    next(): void {
        if (this.currentPage() < this.totalPages()) {
            this.pageChange.emit(this.currentPage() + 1);
        }
    }
}
