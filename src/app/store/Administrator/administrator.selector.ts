import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AdministratorState } from './administrator.reducer';

// 'Administrator' deve ser o mesmo nome registrado no seu app.config ou root reducer
export const selectAdminState = createFeatureSelector<AdministratorState>('Administrator');

export const selectAdministratorData = createSelector(
    selectAdminState,
    (state: AdministratorState) => state.administrators
);

export const selectAdminLoading = createSelector(
    selectAdminState,
    (state: AdministratorState) => state.loading
);

export const selectAdminError = createSelector(
    selectAdminState,
    (state: AdministratorState) => state.error
);