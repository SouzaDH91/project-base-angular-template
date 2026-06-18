import { createAction, props } from '@ngrx/store';
import { PaginatedResponse } from "../../core/models/pagineted-response.models"; // Importe o seu model de paginação

// --- 1. BUSCAR PERMISSIONS (FETCH) ---
export const fetchPermissionListData = createAction(
    '[Permission Data] Fetch PermissionList'
);

// CORREÇÃO AQUI: Mudamos de GroupedPermissions[] para PaginatedResponse<any> para bater com o Reducer e a API
export const fetchPermissionListSuccess = createAction(
    '[Permission Data] Fetch PermissionList Success',
    props<{ groupedPermissions: PaginatedResponse<any> }>()
);

export const fetchPermissionListFailure = createAction(
    '[Permission Data] Fetch PermissionList Failure',
    props<{ error: string }>()
);



// --- 2. BUSCAR PERMISSIONS USERS (FETCH) ---
// Gatilho para disparar a busca (geralmente chamado após o Login com sucesso)
export const loadUserPermissions = createAction(
    '[Auth/Permission] Load User Permissions'
);

// Sucesso: Quando o .NET retorna a lista de strings
export const loadUserPermissionsSuccess = createAction(
    '[Auth/Permission] Load User Permissions Success',
    props<{ permissions: string[] }>()
);

// Falha
export const loadUserPermissionsFailure = createAction(
    '[Auth/Permission] Load User Permissions Failure',
    props<{ error: any }>()
);

export const clearUserPermissionsOnLogout = createAction(
    '[Permission/User] Clear Permissions On Logout'
);
