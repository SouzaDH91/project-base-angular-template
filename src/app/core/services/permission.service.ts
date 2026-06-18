import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {GlobalComponent} from "../../global-component";
import {GroupedPermissions} from "../models/permission.models";
import {Observable} from "rxjs";

const API_URL = GlobalComponent.API_URL;
const API_VERSION = GlobalComponent.API_VERSION;

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }),
};

@Injectable({ providedIn: 'root' })
export class PermissionService {

    private apiUrl = `${API_URL}/${API_VERSION}permissions`;

    constructor(private http: HttpClient) { }

    /***
     * Get All Permissions
     */
    getAll() {
        return this.http.get<GroupedPermissions[]>(`${this.apiUrl}/get-all`, httpOptions);
    }

    getUserPermissions(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/list-permissions-user`, httpOptions);
    }
}
