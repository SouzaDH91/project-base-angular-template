import { createAction, props } from '@ngrx/store';
import { User } from '../User/user.models';
import { PaginatedResponse } from "../../core/models/pagineted-response.models"; // Importe o seu model de paginação

// --- 1. BUSCAR ADMINISTRADORES (FETCH) ---
export const fetchAdministratorListData = createAction(
    '[Administrator Data] Fetch AdministratorList'
);

// CORREÇÃO AQUI: Mudamos de User[] para PaginatedResponse<any> para bater com o Reducer e a API
export const fetchAdministratorListSuccess = createAction(
    '[Administrator Data] Fetch AdministratorList Success',
    props<{ administrators: PaginatedResponse<any> }>()
);

export const fetchAdministratorListFailure = createAction(
    '[Administrator Data] Fetch AdministratorList Failure',
    props<{ error: string }>()
);


// --- 2. ADICIONAR ADMINISTRADOR (ADD) ---
export const addAdministrator = createAction(
    '[Administrator Data] Add Administrator',
    props<{ newData: any }>()
);

export const addAdministratorSuccess = createAction(
    '[Administrator Data] Add Administrator Success',
    props<{ newData: User }>()
);

export const addAdministratorFailure = createAction(
    '[Administrator Data] Add Administrator Failure',
    props<{ error: string }>()
);


// --- 3. ATUALIZAR ADMINISTRADOR (UPDATE) ---
export const updateAdministrator = createAction(
    '[Administrator Data] Update Administrator',
    props<{ id: string, updatedData: any }>()
);

export const updateAdministratorSuccess = createAction(
    '[Administrator Data] Update Administrator Success',
    props<{ updatedData: User }>()
);

export const updateAdministratorFailure = createAction(
    '[Administrator Data] Update Administrator Failure',
    props<{ error: string }>()
);


// --- 4. ATUALIZAR STATUS ADMINISTRADOR (UPDATE) ---
export const updateStatusAdministrator = createAction(
    '[Administrator Data] Update Status Administrator',
    props<{ userId: string }>()
);

export const updateStatusAdministratorSuccess = createAction(
    '[Administrator Data] Update Status Administrator Success',
    props<{ userId: string, message: string }>()
);

export const updateStatusAdministratorFailure = createAction(
    '[Administrator Data] Update Status Administrator Failure',
    props<{ error: string }>()
);


// --- 5. RESET PASSWORD ADMINISTRADOR (UPDATE) ---
export const resetPasswordAdministrator = createAction(
    '[Administrator Data] Reset Password Administrator',
    props<{ userId: string }>()
);

export const resetPasswordAdministratorSuccess = createAction(
    '[Administrator Data] Reset Password Administrator Success',
    props<{ userId: string, message: string }>()
);

export const resetPasswordAdministratorFailure = createAction(
    '[Administrator Data] Reset Password Administrator Failure',
    props<{ error: string }>()
);


// --- 6. DELETAR ADMINISTRADOR (DELETE INDIVIDUAL E MÚLTIPLO) ---
export const deleteAdministrator = createAction(
    '[Administrator Data] Delete Administrator',
    props<{ id: string | string[] }>()
);

export const deleteAdministratorSuccess = createAction(
    '[Administrator Data] Delete Administrator Success',
    props<{ id: string | string[] }>()
);

export const deleteAdministratorFailure = createAction(
    '[Administrator Data] Delete Administrator Failure',
    props<{ error: string }>()
);