import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ApplicationsState } from './applications.state';

const selectApplicationsState = createFeatureSelector<ApplicationsState>('applications');

export const selectAllApplications = createSelector(
    selectApplicationsState,
    (state) => state.applications
);

export const selectApplicationsLoading = createSelector(
    selectApplicationsState,
    (state) => state.loading
);

export const selectApplicationsError = createSelector(
    selectApplicationsState,
    (state) => state.error
);

export const selectApplicationOfferIdSet = createSelector(
    selectAllApplications,
    (apps) => new Set(apps.map(a => a.offerId))
);

export const selectApplicationOfferIdMap = createSelector(
    selectAllApplications,
    (apps) => {
        const map = new Map<string, number>();
        apps.forEach(a => map.set(a.offerId, a.id));
        return map;
    }
);
