import { Application } from '../../models/application.model';

export interface ApplicationsState {
    applications: Application[];
    loading: boolean;
    error: string | null;
}

export const initialApplicationsState: ApplicationsState = {
    applications: [],
    loading: false,
    error: null
};
