import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {GlobalComponent} from "../../global-component";
import {Role} from "../models/role.models";

const API_URL = GlobalComponent.API_URL;
const API_VERSION = GlobalComponent.API_VERSION;

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }),
};

@Injectable({ providedIn: 'root' })
export class RoleService {

    private apiUrl = `${API_URL}/${API_VERSION}roles`;

    constructor(private http: HttpClient) { }

    /***
     * Get All Roles
     */
    getAll(search: string | null = null) {
        return this.http.get<Role[]>(`${this.apiUrl}/get?search=${search}`, httpOptions);
    }

    /***
     * Role Register
     */
    register(role: Role) {
        return this.http.post(`${this.apiUrl}/create`, role);
    }

    /***
     * Role Update
     */
    update(id: string, role: Role) {
        return this.http.put(`${this.apiUrl}/update/${id}`, role);
    }

    /***
     * Administrator Delete
     */
    delete(id: string) {
        return this.http.delete(`${this.apiUrl}/delete/${id}`, httpOptions);
    }
}
