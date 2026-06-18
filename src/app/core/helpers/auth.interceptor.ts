import { HTTP_INTERCEPTORS, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

// MUDANÇA 1: Usar o cabeçalho padrão de segurança que o ASP.NET Core espera
const TOKEN_HEADER_KEY = 'Authorization';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = req;

    // MUDANÇA 2: Ler em tempo real do sessionStorage a mesma chave 'token' usada no login.
    // Isso garante o sincronismo imediato após o logout/login sem carregar lixo em cache.
    const token = sessionStorage.getItem('token');

    if (token != null) {
      // MUDANÇA 3: Clonar a requisição aplicando o padrão 'Bearer <token>'
      authReq = req.clone({
        headers: req.headers.set(TOKEN_HEADER_KEY, `Bearer ${token}`)
      });

      // Console log temporário para você ver no F12 que o token novo está saindo redondo
      // console.log('Interceptor injetou o token com sucesso:', `Bearer ${token.substring(0, 15)}...`);
    }

    return next.handle(authReq);
  }
}

export const authInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
];