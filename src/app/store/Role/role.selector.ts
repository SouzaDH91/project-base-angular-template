import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RoleState } from './role.reducer';

// 'Role' deve ser o mesmo nome registrado no seu app.config ou root reducer
export const selectRoleState = createFeatureSelector<RoleState>('Role');

export const selectRoleData = createSelector(
    selectRoleState,
    (state: RoleState) => state.roles
);

export const selectRoleLoading = createSelector(
    selectRoleState,
    (state: RoleState) => state.loading
);

export const selecRoleError = createSelector(
    selectRoleState,
    (state: RoleState) => state.error
);