import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component pages
import { DashboardComponent } from "./dashboard/dashboard.component";
import {AdministratorsComponent} from "./administrators/administrators.component";
import {RolesComponent} from "./roles/roles.component";
import {permissionGuard} from "../core/guards/permission.guard";
import {ShortcutsComponent} from "./shortcuts/shortcuts.component";

const routes: Routes = [
    {
        path: "",
        component: DashboardComponent
    },
    {
        path: "dashboard",
        component: DashboardComponent
    },
    {
        path: "administrators",
        component: AdministratorsComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['List_Admin'] }
    },
    {
        path: "shortcuts",
        component: ShortcutsComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['List_Shortcut'] }
    },
    {
        path: "roles",
        component: RolesComponent,
        canActivate: [permissionGuard],
        data: { permissions: ['List_Role'] }
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
