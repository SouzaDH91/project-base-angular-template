import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Authentication } from 'src/app/store/Authentication/auth.models';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
    constructor(private http: HttpClient) { }
    /***
     * Get All User
     */
    getAll() {
        return this.http.get<Authentication[]>(`api/users`);
    }

    /***
     * Facked User Register
     */
    register(user: Authentication) {
        return this.http.post(`/users/register`, user);
    }
}
