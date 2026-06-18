import { Action, createReducer, on } from '@ngrx/store';
import {
    fetchShortcutListData,
    fetchShortcutListSuccess,
    fetchShortcutListFailure,
    addShortcutSuccess,
    updateShortcutSuccess,
    deleteShortcutSuccess
} from './shortcut.action';
import { PaginatedResponse } from "../../core/models/pagineted-response.models";

export interface ShortcutState {
    shortcuts: PaginatedResponse<any>;
    loading: boolean;
    error: any;
}

// CORREÇÃO 1: O estado inicial agora reflete a estrutura do objeto de paginação
export const initialState: ShortcutState = {
    shortcuts: {
        success: false,
        totalItems: 0,
        data: []
    },
    loading: false,
    error: null,
};

export const shortcutReducer = createReducer(
    initialState,

    on(fetchShortcutListData, (state) => {
        return { ...state, loading: true, error: null };
    }),

    on(fetchShortcutListSuccess, (state, { shortcuts }) => ({
        ...state,
        shortcuts: shortcuts, // Salva o objeto completo vindo da API
        loading: false,
        error: null
    })),

    on(fetchShortcutListFailure, (state, { error }) => {
        return { ...state, error, loading: false };
    }),

    on(addShortcutSuccess, (state, { newData }) => {
        return {
            ...state,
            shortcuts: {
                ...state.shortcuts,
                totalItems: state.shortcuts?.totalItems ? state.shortcuts.totalItems + 1 : 1,
                data: [newData, ...(state.shortcuts?.data || [])]
            },
            error: null
        };
    }),

    // CORREÇÃO 2: Atualiza o item mantendo a estrutura do objeto
    on(updateShortcutSuccess, (state, { updatedData }) => {
        return {
            ...state,
            shortcuts: {
                ...state.shortcuts,
                data: (state.shortcuts?.data || []).map((item) =>
                    item.id === updatedData.id ? updatedData : item
                )
            },
            error: null
        };
    }),

    // CORREÇÃO 3: Deleta o item e decrementa o totalItems mantendo a estrutura do objeto
    on(deleteShortcutSuccess, (state, { ids, message }) => { // <-- 'message' adicionada aqui para satisfazer a tipagem
        const currentData = state.shortcuts?.data || [];
        const updatedData = currentData.filter((item) => item.id && !ids.includes(item.id));
        const itemsRemoved = currentData.length - updatedData.length;

        return {
            ...state,
            roles: {
                ...state.shortcuts,
                totalItems: Math.max(0, (state.shortcuts?.totalItems || 0) - itemsRemoved),
                data: updatedData
            },
            error: null
        };
    })
);

export function reducer(state: ShortcutState | undefined, action: Action) {
    return shortcutReducer(state, action);
}