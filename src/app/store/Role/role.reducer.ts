import { Action, createReducer, on } from '@ngrx/store';
import {
    fetchRoleListData,
    fetchRoleListSuccess,
    fetchRoleListFailure,
    addRoleSuccess,
    updateRoleSuccess,
    deleteRoleSuccess
} from './role.action';
import { Role } from '../../core/models/role.models';
import { PaginatedResponse } from "../../core/models/pagineted-response.models";

export interface RoleState {
    roles: PaginatedResponse<any>;
    loading: boolean;
    error: any;
}

// CORREÇÃO 1: O estado inicial agora reflete a estrutura do objeto de paginação
export const initialState: RoleState = {
    roles: {
        success: false,
        totalItems: 0,
        data: []
    },
    loading: false,
    error: null,
};

export const roleReducer = createReducer(
    initialState,

    on(fetchRoleListData, (state) => {
        return { ...state, loading: true, error: null };
    }),

    on(fetchRoleListSuccess, (state, { roles }) => ({
        ...state,
        roles: roles, // Salva o objeto completo vindo da API
        loading: false,
        error: null
    })),

    on(fetchRoleListFailure, (state, { error }) => {
        return { ...state, error, loading: false };
    }),

    on(addRoleSuccess, (state, { newData }) => {
        return {
            ...state,
            roles: {
                ...state.roles,
                totalItems: state.roles?.totalItems ? state.roles.totalItems + 1 : 1,
                data: [newData, ...(state.roles?.data || [])]
            },
            error: null
        };
    }),

    // CORREÇÃO 2: Atualiza o item mantendo a estrutura do objeto
    on(updateRoleSuccess, (state, { updatedData }) => {
        return {
            ...state,
            roles: {
                ...state.roles,
                data: (state.roles?.data || []).map((item) =>
                    item.id === updatedData.id ? updatedData : item
                )
            },
            error: null
        };
    }),

    // CORREÇÃO 3: Deleta o item e decrementa o totalItems mantendo a estrutura do objeto
    on(deleteRoleSuccess, (state, { ids, message }) => { // <-- 'message' adicionada aqui para satisfazer a tipagem
        const currentData = state.roles?.data || [];
        const updatedData = currentData.filter((item) => item.id && !ids.includes(item.id));
        const itemsRemoved = currentData.length - updatedData.length;

        return {
            ...state,
            roles: {
                ...state.roles,
                totalItems: Math.max(0, (state.roles?.totalItems || 0) - itemsRemoved),
                data: updatedData
            },
            error: null
        };
    })
);

export function reducer(state: RoleState | undefined, action: Action) {
    return roleReducer(state, action);
}