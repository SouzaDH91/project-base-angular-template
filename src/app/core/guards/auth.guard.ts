import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

// Auth Services
import { AuthenticationService } from '../services/auth.service';
import { AuthfakeauthenticationService } from '../services/authfake.service';
import { environment } from '../../../environments/environment';

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const authenticationService = inject(AuthenticationService);
    const authFackservice = inject(AuthfakeauthenticationService);

    const currentUser = authenticationService.currentUserValue;
    if (currentUser || sessionStorage.getItem('currentUser')) {
        return true;
    }

    // Não está logado: redireciona para o login com a URL de retorno
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
};