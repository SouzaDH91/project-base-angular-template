import {Injectable} from '@angular/core';
import {getFirebaseBackend} from '../../authUtils';
import {Authentication} from 'src/app/store/Authentication/auth.models';
import {HttpClient, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {GlobalComponent} from "../../global-component";
import {Store} from '@ngrx/store';
import {loginFailure, logout} from 'src/app/store/Authentication/authentication.actions';

const API_URL = GlobalComponent.API_URL;
const API_VERSION = GlobalComponent.API_VERSION;
const AUTH = 'auth';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  

@Injectable({ providedIn: 'root' })

/**
 * Auth-service Component
 */
export class AuthenticationService {

    user!: Authentication;

    private currentUserSubject: BehaviorSubject<Authentication>;
    public currentUser: Observable<Authentication>;

    constructor(private http: HttpClient, private store: Store) {
        this.currentUserSubject = new BehaviorSubject<Authentication>(JSON.parse(sessionStorage.getItem('currentUser')!));
        this.currentUser = this.currentUserSubject.asObservable();
     }

    /**
     * Performs the register
     * @param email email
     * @param password password
     */
    register(email: string, first_name: string, password: string) {        
        // return getFirebaseBackend()!.registerUser(email, password).then((response: any) => {
        //     const user = response;
        //     return user;
        // });

        // Register Api
        return this.http.post(API_URL + 'signup', {
            email,
            first_name,
            password,
          }, httpOptions).pipe(
            map((response: any) => {
                const user = response;
                return user;
            }),
            catchError((error: HttpErrorResponse) => {
                const errorMessage = 'Login failed'; // Customize the error message as needed
                //this.store.dispatch(loginFailure({ error: errorMessage }));
                return throwError(errorMessage);
            })
        );
    }

    /**
     * Performs the auth
     * @param userName username of user
     * @param password password of user
     */
    login(userName: string, password: string) {
        return this.http.post(`${API_URL}/${API_VERSION}${AUTH}/login`, {
            userName,
            password
        }, httpOptions).pipe(
            map((response: any) => {
                return response;
            }),
            catchError((error: HttpErrorResponse) => {
                //console.log('Objeto completo do erro no Service:', error);

                // O seu backend joga o JSON no corpo da resposta, que o Angular joga dentro de error.error
                // Se por algum motivo error.error não existir, passamos o erro completo.
                const apiError = error.error ? error.error : error;

                return throwError(() => apiError);
            })
        );
    }

    /**
     * Performs the forgot password
     * @param email email of user
     */
    forgotPassword(email: string) {
        return this.http.put(`${API_URL}/${API_VERSION}${AUTH}/forgot-password?email=${email}`, {}, httpOptions).pipe(
            catchError((error: any) => {
                const errorMessage = `Forgot password failed. Error: ${error}`; // Customize the error message as needed
                return throwError(errorMessage);
            })
        );
    }

    /**
     * Performs the resend code
     * @param email email of user
     */
    resendCode(email: string | null) {
        return this.http.put(`${API_URL}/${API_VERSION}${AUTH}/resend-code?email=${email}`, {}, httpOptions).pipe(
            catchError((error: any) => {
                const errorMessage = `Resend code failed. Error: ${error}`; // Customize the error message as needed
                return throwError(errorMessage);
            })
        );
    }

    /**
     * Performs the verify code
     * @param email email of user
     * @param code code of user
     */
    verifyCode(email: string | null, code: string) {
        return this.http.put(`${API_URL}/${API_VERSION}${AUTH}/verify-code-change-password`, {
            email,
            code
        }, httpOptions).pipe(
            catchError((error: any) => {
                const errorMessage = `Verify code failed. Error: ${error}`; // Customize the error message as needed
                return throwError(errorMessage);
            })
        );
    }

    /**
     * Performs the verify code
     * @param code code of user
     * @param email email of user
     */
    resetPassword(code: string, email: string | null) {
        return this.http.put(`${API_URL}/${API_VERSION}${AUTH}/reset-password`, {
            code,
            email
        }, httpOptions).pipe(
            catchError((error: any) => {
                const errorMessage = `Verify code failed. Error: ${error}`; // Customize the error message as needed
                return throwError(errorMessage);
            })
        );
    }

    /**
     * Returns the current user
     */
    public get currentUserValue(): Authentication {
        return this.currentUserSubject.value;
    }

    /**
     * Set user
     */
    setcurrentUserValue(user: Authentication) {
        this.currentUserSubject.next(user);
    }

    /**
     * Logout the user
     */
    logout() {
        this.store.dispatch(logout());
        // logout the user
        // return getFirebaseBackend()!.logout();
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('token');
        this.currentUserSubject.next(null!);

        return of(undefined).pipe(
        
        );

    }

    /**
     * Reset password
     * @param email email
     */
    /*resetPassword(email: string) {
        return getFirebaseBackend()!.forgetPassword(email).then((response: any) => {
            const message = response.data;
            return message;
        });
    }*/

}

