import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {GlobalComponent} from "../../global-component";
import {User} from "../../store/User/user.models";

const API_URL = GlobalComponent.API_URL;
const API_VERSION = GlobalComponent.API_VERSION;
const ADMIN = 'administrators';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }),
};

@Injectable({ providedIn: 'root' })
export class AdministratorService {

    constructor(private http: HttpClient) { }

    /***
     * Get All administrators
     */
    getAll(search: string | null = null) {
        return this.http.get<User[]>(`${API_URL}/${API_VERSION}${ADMIN}/get?search=${search}`, httpOptions);
    }

    /***
     * Administrator Register
     */
    register(user: User) {
        return this.http.post(`${API_URL}/${API_VERSION}${ADMIN}/create`, user);
    }

    /***
     * Administrator Update
     */
    update(id: string, user: User) {
        return this.http.put(`${API_URL}/${API_VERSION}${ADMIN}/update/${id}`, user);
    }

    /***
     * Administrator Update Status
     */
    updateStatus(userId: string) {
        return this.http.put(`${API_URL}/${API_VERSION}${ADMIN}/update-status/${userId}`, null, httpOptions);
    }

    /***
     * Administrator Reset Password
     */
    resetPassword(id: string) {
        return this.http.put(`${API_URL}/${API_VERSION}${ADMIN}/reset-password/${id}`, null, httpOptions);
    }

    /***
     * Administrator Delete
     */
    delete(id: string) {
        return this.http.delete(`${API_URL}/${API_VERSION}${ADMIN}/delete/${id}`, httpOptions);
    }
}
