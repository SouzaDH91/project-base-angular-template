import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PermissionState } from './permission.reducer';

// 'Permission' deve ser o mesmo nome registrado no seu app.config ou root reducer
export const selectPermissionState = createFeatureSelector<PermissionState>('Permission');

export const selectPermissionData = createSelector(
    selectPermissionState,
    (state: PermissionState) => state.groupedPermissions
);

export const selectPermissionLoading = createSelector(
    selectPermissionState,
    (state: PermissionState) => state.loading
);

export const selecPermissionError = createSelector(
    selectPermissionState,
    (state: PermissionState) => state.error
);

// SELETOR PARA A SUA DIRETIVA E SIDEBAR DO VELZON
export const selectUserPermissions = createSelector(
    selectPermissionState,
    (state) => state.userPermissions
);