export interface Permission {
    name?: string;
    permission?: string;
    menu?: string;
}

export interface GroupedPermissions {
    permissionName?: string;
    permissions?: Permission[];
}