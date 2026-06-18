import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {GlobalComponent} from "../../global-component";
// @ts-ignore
import {Shortcut} from "../models/shortcut.models";

const API_URL = GlobalComponent.API_URL;
const API_VERSION = GlobalComponent.API_VERSION;

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }),
};

@Injectable({ providedIn: 'root' })
export class ShortcutService {

    private apiUrl = `${API_URL}/${API_VERSION}shortcuts`;

    constructor(private http: HttpClient) { }

    /***
     * Get All Shortcuts
     */
    getAll(search: string | null = null) {
        return this.http.get<Shortcut[]>(`${this.apiUrl}/get?search=${search}`, httpOptions);
    }

    /***
     * Get Shortcut By Id
     */
    getById(id: string | null = null) {
        return this.http.get<Shortcut[]>(`${this.apiUrl}/get/${id}`, httpOptions);
    }

    /***
     * Shortcut Register
     */
    register(shortcut: Shortcut) {
        return this.http.post(`${this.apiUrl}/create`, shortcut);
    }

    /***
     * Shortcut Update
     */
    update(id: string, shortcut: Shortcut) {
        return this.http.put(`${this.apiUrl}/update/${id}`, shortcut);
    }

    /***
     * Shortcut Delete
     */
    delete(id: string) {
        return this.http.delete(`${this.apiUrl}/delete/${id}`, httpOptions);
    }
}
