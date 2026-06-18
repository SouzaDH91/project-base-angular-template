import { createAction, props } from '@ngrx/store';
import { Shortcut } from '../../core/models/shortcut.models';
import { PaginatedResponse } from "../../core/models/pagineted-response.models"; // Importe o seu model de paginação

// --- 1. BUSCAR SHORTCUTS (FETCH) ---
export const fetchShortcutListData = createAction(
    '[Shortcut Data] Fetch ShortcutList'
);

// CORREÇÃO AQUI: Mudamos de Shortcut[] para PaginatedResponse<any> para bater com o Reducer e a API
export const fetchShortcutListSuccess = createAction(
    '[Shortcut Data] Fetch ShortcutList Success',
    props<{ shortcuts: PaginatedResponse<any> }>()
);

export const fetchShortcutListFailure = createAction(
    '[Shortcut Data] Fetch ShortcutList Failure',
    props<{ error: string }>()
);


// --- 2. ADICIONAR SHORTCUT (ADD) ---
export const addShortcut = createAction(
    '[Shortcut Data] Add Shortcut',
    props<{ newData: any }>()
);

export const addShortcutSuccess = createAction(
    '[Shortcut Data] Add Shortcut Success',
    props<{ newData: Shortcut }>()
);

export const addShortcutFailure = createAction(
    '[Shortcut Data] Add Shortcut Failure',
    props<{ error: string }>()
);


// --- 3. ATUALIZAR SHORTCUT (UPDATE) ---
export const updateShortcut = createAction(
    '[Shortcut Data] Update Shortcut',
    props<{ id: string, updatedData: any }>()
);

export const updateShortcutSuccess = createAction(
    '[Shortcut Data] Update Shortcut Success',
    props<{ updatedData: Shortcut }>()
);

export const updateShortcutFailure = createAction(
    '[Shortcut Data] Update Shortcut Failure',
    props<{ error: string }>()
);


// --- 4. DELETAR SHORTCUT (DELETE INDIVIDUAL E MÚLTIPLO) ---
export const deleteShortcut = createAction(
    '[Shortcut Data] Delete Shortcut',
    props<{ id: string | string[] }>()
);

export const deleteShortcutSuccess = createAction(
    '[Shortcut Data] Delete Shortcut Success',
    props<{ ids: string[], message: string }>()
);

export const deleteShortcutFailure = createAction(
    '[Shortcut Data] Delete Shortcut Failure',
    props<{ error: string }>()
);