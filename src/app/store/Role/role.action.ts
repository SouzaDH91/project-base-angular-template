import { createAction, props } from '@ngrx/store';
import { Role } from '../../core/models/role.models';
import { PaginatedResponse } from "../../core/models/pagineted-response.models"; // Importe o seu model de paginação

// --- 1. BUSCAR ROLES (FETCH) ---
export const fetchRoleListData = createAction(
    '[Role Data] Fetch RoleList'
);

// CORREÇÃO AQUI: Mudamos de Role[] para PaginatedResponse<any> para bater com o Reducer e a API
export const fetchRoleListSuccess = createAction(
    '[Role Data] Fetch RoleList Success',
    props<{ roles: PaginatedResponse<any> }>()
);

export const fetchRoleListFailure = createAction(
    '[Role Data] Fetch RoleList Failure',
    props<{ error: string }>()
);


// --- 2. ADICIONAR ROLE (ADD) ---
export const addRole = createAction(
    '[Role Data] Add Role',
    props<{ newData: any }>()
);

export const addRoleSuccess = createAction(
    '[Role Data] Add Role Success',
    props<{ newData: Role }>()
);

export const addRoleFailure = createAction(
    '[Role Data] Add Role Failure',
    props<{ error: string }>()
);


// --- 3. ATUALIZAR ROLE (UPDATE) ---
export const updateRole = createAction(
    '[Role Data] Update Role',
    props<{ id: string, updatedData: any }>()
);

export const updateRoleSuccess = createAction(
    '[Role Data] Update Role Success',
    props<{ updatedData: Role }>()
);

export const updateRoleFailure = createAction(
    '[Role Data] Update Role Failure',
    props<{ error: string }>()
);


// --- 4. DELETAR ROLE (DELETE INDIVIDUAL E MÚLTIPLO) ---
export const deleteRole = createAction(
    '[Role Data] Delete Role',
    props<{ id: string | string[] }>()
);

export const deleteRoleSuccess = createAction(
    '[Role Data] Delete Role Success',
    props<{ ids: string[], message: string }>()
);

export const deleteRoleFailure = createAction(
    '[Role Data] Delete Role Failure',
    props<{ error: string }>()
);