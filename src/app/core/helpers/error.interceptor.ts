import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    private router = inject(Router);
    private authenticationService = inject(AuthenticationService);

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError(err => {

                if (err.status === 401) {
                    console.warn('ErrorInterceptor: Identificado status 401. Redirecionando...');

                    // 1. Executa o logout para limpar o sessionStorage/localStorage
                    this.authenticationService.logout();

                    // 2. MUDANÇA CRÍTICA: Em vez de usar location.reload() que quebra o ciclo de vida do Angular,
                    // nós apenas navegamos o usuário de volta para a tela de login de forma limpa.
                    this.router.navigate(['/auth/login']);
                }

                // Mantém a formatação do erro estruturada que seu front já espera
                const error = err.error || { errors: [err.statusText || 'Erro desconhecido'] };
                return throwError(() => error);
            })
        );
    }
}