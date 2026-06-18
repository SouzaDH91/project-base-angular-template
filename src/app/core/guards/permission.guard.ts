import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {Store} from "@ngrx/store";
import {selectPermissionState, selectUserPermissions} from "../../store/Permission/permission.selector";
import {filter, map, timeout} from "rxjs/operators";
import {catchError, of, take} from "rxjs";
import {ToastService} from "../services/toast.service";
import {loadUserPermissions} from "../../store/Permission/permission.action";

export const permissionGuard: CanActivateFn = (route, state) => {
    const store = inject(Store);
    const router = inject(Router);
    const toastService = inject(ToastService);

    const expectedPermissions = route.data['permissions'] as string[];

    if (!expectedPermissions || expectedPermissions.length === 0) {
        return true;
    }

    store.select(selectPermissionState).pipe(take(1)).subscribe(permissionState => {
        if (!permissionState.loaded && !permissionState.loading) {
            // SAÍDA DE EMERGÊNCIA: Se ninguém disparou a busca ainda, a própria Guard acorda o Effect!
            store.dispatch(loadUserPermissions());
        }
    });

    return store.select(selectPermissionState).pipe(
        filter(permissionState => permissionState.loaded),
        take(1),
        // SAÍDA DE SEGURANÇA MÁXIMA: Se a API falhar ou sumir por 2 segundos, não trava a tela!
        timeout(2000),
        map(permissionState => {
            if (permissionState.error) {
                router.navigate(['/auth/login']);
                return false;
            }

            const myPermissions = permissionState.userPermissions || [];
            const hasAccess = expectedPermissions.some(p => myPermissions.includes(p));

            if (hasAccess) return true;

            setTimeout(() => {
                // 1. Exibe o Toast de erro
                toastService.error('Você não tem permissão para acessar esta página.');

                // 2. Redireciona para a rota raiz/Home
                router.navigate(['/']);
            }, 0);

            return false;
        }),
        catchError(() => {
            console.warn('Guard: O NgRx demorou demais para responder. Evitando tela branca infinita.');
            router.navigate(['/']); // Joga o usuário para a Home seguro em vez de travar
            return of(false);
        })
    );
};
