import { ActionReducerMap } from "@ngrx/store";
import { LayoutState, layoutReducer } from "./layouts/layout-reducers";
import {administratorReducer, AdministratorState} from "./Administrator/administrator.reducer";
import {roleReducer, RoleState} from "./Role/role.reducer";
import {permissionReducer, PermissionState} from "./Permission/permission.reducer";
import {shortcutReducer, ShortcutState} from "./Shortcut/shortcut.reducer";
// import { authenticationReducer, AuthenticationState } from "./Authentication/authentication.reducer";

export interface RootReducerState {
    layout: LayoutState;
    Administrator: AdministratorState;
    Role: RoleState;
    Permission: PermissionState;
    Shortcut: ShortcutState;
    // authentication: AuthenticationState;
}

export const rootReducer: ActionReducerMap<RootReducerState> = {
    layout: layoutReducer,
    Administrator: administratorReducer,
    Role: roleReducer,
    Permission: permissionReducer,
    Shortcut: shortcutReducer,
    // authentication: authenticationReducer,

}