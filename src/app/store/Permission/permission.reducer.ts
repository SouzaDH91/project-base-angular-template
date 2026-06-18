import { Action, createReducer, on } from '@ngrx/store';
import {
    fetchPermissionListData,
    fetchPermissionListSuccess,
    fetchPermissionListFailure,
    loadUserPermissions,
    loadUserPermissionsSuccess,
    loadUserPermissionsFailure, clearUserPermissionsOnLogout
} from './permission.action';
import { PaginatedResponse } from "../../core/models/pagineted-response.models";

export interface PermissionState {
    groupedPermissions: PaginatedResponse<any>;
    userPermissions: string[];
    loading: boolean;
    loaded: boolean;
    error: any;
}

// CORREÇÃO 1: O estado inicial agora reflete a estrutura do objeto de paginação
export const initialState: PermissionState = {
    groupedPermissions: {
        success: false,
        totalItems: 0,
        data: []
    },
    userPermissions: [],
    loading: false,
    loaded: false,
    error: null,
};

export const permissionReducer = createReducer(
    initialState,

    on(fetchPermissionListData, (state) => {
        return { ...state, loading: true, error: null };
    }),

    on(fetchPermissionListSuccess, (state, { groupedPermissions }) => ({
        ...state,
        groupedPermissions: groupedPermissions, // Salva o objeto completo vindo da API
        loading: false,
        error: null
    })),

    on(fetchPermissionListFailure, (state, { error }) => {
        return { ...state, error, loading: false };
    }),

    // --- ESCUTAS DAS PERMISSÕES DO USUÁRIO LOGADO (SIDEBAR / GUARD) ---
    on(loadUserPermissions, (state) => {
        return { ...state, loading: true, loaded: false, error: null };
    }),

    on(loadUserPermissionsSuccess, (state, { permissions }) => ({
        ...state,
        userPermissions: permissions, // Salva o array de strings (claims) vindo do C#
        loading: false,
        loaded: true,
        error: null
    })),

    on(loadUserPermissionsFailure, (state, { error }) => {
        return { ...state, error, loading: false, loaded: true };
    }),

    on(clearUserPermissionsOnLogout, () => {
        return { ...initialState };
    })
);

export function reducer(state: PermissionState | undefined, action: Action) {
    return permissionReducer(state, action);
}