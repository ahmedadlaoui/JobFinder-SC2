import { createReducer, on } from '@ngrx/store';
import { ApplicationsActions } from './applications.actions';
import { initialApplicationsState } from './applications.state';

export const applicationReducer = createReducer(
    initialApplicationsState,

    // Load
    on(ApplicationsActions.loadApplications, (state) => ({
        ...state, loading: true, error: null
    })),
    on(ApplicationsActions.loadApplicationsSuccess, (state, { applications }) => ({
        ...state, applications, loading: false, error: null
    })),
    on(ApplicationsActions.loadApplicationsFailure, (state, { error }) => ({
        ...state, loading: false, error
    })),

    // Add
    on(ApplicationsActions.addApplication, (state) => ({
        ...state, loading: true, error: null
    })),
    on(ApplicationsActions.addApplicationSuccess, (state, { application }) => ({
        ...state,
        applications: [...state.applications, application],
        loading: false, error: null
    })),
    on(ApplicationsActions.addApplicationFailure, (state, { error }) => ({
        ...state, loading: false, error
    })),

    // Update
    on(ApplicationsActions.updateApplication, (state) => ({
        ...state, loading: true, error: null
    })),
    on(ApplicationsActions.updateApplicationSuccess, (state, { application }) => ({
        ...state,
        applications: state.applications.map(a => a.id === application.id ? application : a),
        loading: false, error: null
    })),
    on(ApplicationsActions.updateApplicationFailure, (state, { error }) => ({
        ...state, loading: false, error
    })),

    // Remove
    on(ApplicationsActions.removeApplication, (state) => ({
        ...state, loading: true, error: null
    })),
    on(ApplicationsActions.removeApplicationSuccess, (state, { id }) => ({
        ...state,
        applications: state.applications.filter(a => a.id !== id),
        loading: false, error: null
    })),
    on(ApplicationsActions.removeApplicationFailure, (state, { error }) => ({
        ...state, loading: false, error
    })),
);
