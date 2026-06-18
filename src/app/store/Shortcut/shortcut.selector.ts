import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ShortcutState } from './shortcut.reducer';
import {fetchShortcutListData} from "./shortcut.action";

// 'Role' deve ser o mesmo nome registrado no seu app.config ou root reducer
export const selectShortcutState = createFeatureSelector<ShortcutState>('Shortcut');

export const selectShortcutData = createSelector(
    selectShortcutState,
    (state: ShortcutState) => state.shortcuts
);

export const selectShortcutLoading = createSelector(
    selectShortcutState,
    (state: ShortcutState) => state.loading
);

export const selectShortcutError = createSelector(
    selectShortcutState,
    (state: ShortcutState) => state.error
);