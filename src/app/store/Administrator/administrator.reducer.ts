import { Action, createReducer, on } from '@ngrx/store';
import {
    fetchAdministratorListData,
    fetchAdministratorListSuccess,
    fetchAdministratorListFailure,
    addAdministratorSuccess,
    updateAdministratorSuccess,
    deleteAdministratorSuccess, updateStatusAdministratorSuccess, resetPasswordAdministratorSuccess
} from './administrator.action';
import { User } from '../User/user.models';
import { PaginatedResponse } from "../../core/models/pagineted-response.models";

export interface AdministratorState {
    administrators: PaginatedResponse<any>;
    loading: boolean;
    error: any;
}

// CORREÇÃO 1: O estado inicial agora reflete a estrutura do objeto de paginação
export const initialState: AdministratorState = {
    administrators: {
        success: false,
        totalItems: 0,
        data: []
    },
    loading: false,
    error: null,
};

export const administratorReducer = createReducer(
    initialState,

    on(fetchAdministratorListData, (state) => {
        return { ...state, loading: true, error: null };
    }),

    on(fetchAdministratorListSuccess, (state, { administrators }) => ({
        ...state,
        administrators: administrators, // Salva o objeto completo vindo da API
        loading: false,
        error: null
    })),

    on(fetchAdministratorListFailure, (state, { error }) => {
        return { ...state, error, loading: false };
    }),

    on(addAdministratorSuccess, (state, { newData }) => {
        return {
            ...state,
            administrators: {
                ...state.administrators,
                totalItems: state.administrators?.totalItems ? state.administrators.totalItems + 1 : 1,
                data: [newData, ...(state.administrators?.data || [])]
            },
            error: null
        };
    }),

    // CORREÇÃO 2: Atualiza o item mantendo a estrutura do objeto
    on(updateAdministratorSuccess, (state, { updatedData }) => {
        return {
            ...state,
            administrators: {
                ...state.administrators,
                data: (state.administrators?.data || []).map((admin) =>
                    admin.id === updatedData.id ? updatedData : admin
                )
            },
            error: null
        };
    }),

    on(updateStatusAdministratorSuccess, (state, { userId }) => {
        return {
            ...state,
            administrators: {
                ...state.administrators,
                data: (state.administrators?.data || []).map((admin) => {
                    if (admin.id === userId) {
                        return {
                            ...admin,
                            // Inverte o status de forma segura na Store do NgRx
                            status: admin.status == 0 ? 1 : 0
                        };
                    }
                    return admin;
                })
            },
            error: null
        };
    }),

    on(resetPasswordAdministratorSuccess, (state) => {
        return {
            ...state,
            // Não mexe nos dados, pois nada mudou visualmente na tabela
            error: null
        };
    }),

    // CORREÇÃO 3: Deleta o item e decrementa o totalItems mantendo a estrutura do objeto
    on(deleteAdministratorSuccess, (state, { id }) => {
        const idsToDelete = Array.isArray(id) ? id : [id];
        const updatedData = (state.administrators?.data || []).filter((admin) => admin.id && !idsToDelete.includes(admin.id));

        // Calcula quantos itens foram removidos para atualizar o contador da paginação
        const itemsRemoved = (state.administrators?.data || []).length - updatedData.length;

        return {
            ...state,
            administrators: {
                ...state.administrators,
                totalItems: Math.max(0, (state.administrators?.totalItems || 0) - itemsRemoved),
                data: updatedData
            },
            error: null
        };
    })
);

export function reducer(state: AdministratorState | undefined, action: Action) {
    return administratorReducer(state, action);
}