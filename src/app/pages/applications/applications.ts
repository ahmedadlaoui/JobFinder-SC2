import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Application } from '../../models/application.model';
import { ApplicationsActions } from '../../store/applications/applications.actions';
import { selectAllApplications, selectApplicationsLoading } from '../../store/applications/applications.selectors';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-applications',
    imports: [RouterLink, AsyncPipe, DatePipe, FormsModule],
    templateUrl: './applications.html',
    styleUrl: './applications.css',
})
export class ApplicationsComponent implements OnInit {
    applications$: Observable<Application[]>;
    loading$: Observable<boolean>;
    editingNoteId: number | null = null;
    noteText = '';

    @HostListener('document:click')
    onDocumentClick() {
        this.authService.closeDropdown();
    }

    constructor(private store: Store, public authService: AuthService) {
        this.applications$ = this.store.select(selectAllApplications);
        this.loading$ = this.store.select(selectApplicationsLoading);
    }

    ngOnInit(): void {
        this.store.dispatch(ApplicationsActions.loadApplications());
    }

    updateStatus(app: Application, status: 'pending' | 'accepted' | 'rejected'): void {
        this.store.dispatch(ApplicationsActions.updateApplication({
            id: app.id,
            changes: { status }
        }));
    }

    removeApplication(id: number): void {
        this.store.dispatch(ApplicationsActions.removeApplication({ id }));
    }

    startEditNote(app: Application): void {
        this.editingNoteId = app.id;
        this.noteText = app.notes || '';
    }

    saveNote(app: Application): void {
        this.store.dispatch(ApplicationsActions.updateApplication({
            id: app.id,
            changes: { notes: this.noteText }
        }));
        this.editingNoteId = null;
        this.noteText = '';
    }

    cancelEditNote(): void {
        this.editingNoteId = null;
        this.noteText = '';
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'pending': return 'Pending';
            case 'accepted': return 'Accepted';
            case 'rejected': return 'Rejected';
            default: return status;
        }
    }
}
