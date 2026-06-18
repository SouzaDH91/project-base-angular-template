import { Injectable, inject } from "@angular/core";
import {forkJoin, of} from 'rxjs';
import {catchError, map, mergeMap, tap} from 'rxjs/operators';
import { Actions, createEffect, ofType } from "@ngrx/effects";

// Importe o serviço correto de API que manipula as Permissions
import { PermissionService } from "src/app/core/services/permission.service";

// Import das actions específicas que criamos para Roles
import {
    fetchPermissionListData,
    fetchPermissionListSuccess,
    fetchPermissionListFailure, loadUserPermissions, loadUserPermissionsSuccess, loadUserPermissionsFailure
} from "./permission.action";
import {ToastService} from "../../core/services/toast.service";
import {error} from "jquery";

@Injectable()
export class PermissionEffects {
    private actions$ = inject(Actions);
    private restApiService = inject(PermissionService);
    private toastService = inject(ToastService);

    // --- 1. FETCH (BUSCAR LISTA) ---
    fetchPermissionData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fetchPermissionListData),
            mergeMap(() =>
                // Dica: Ajuste para o método real do seu serviço se não for 'getRoleData'
                this.restApiService.getAll().pipe(
                    map((response) => {
                        //console.log('response ', response);
                        // Se a sua API retorna string JSON como no Ecommerce, mantemos o Parse.
                        // Caso já retorne um objeto direto do HttpClient, use: const roles = response.data;
                        const groupedPermissions = typeof response === 'string' ? JSON.parse(response) : response;
                        return fetchPermissionListSuccess({ groupedPermissions });
                    }),
                    catchError((error) => of(fetchPermissionListFailure({ error: error.message || error })))
                )
            ),
        ),
    );

    // --- 2. FETCH PERMISSÕES DO USUÁRIO LOGADO (SIDEBAR / GUARD VELZON) ---
    loadUserPermissions$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadUserPermissions),
            tap(() => console.log('%c NgRx: Action loadUserPermissions detectada no Effect!', 'color: #00ff00')),
            mergeMap(() =>
                this.restApiService.getUserPermissions().pipe(
                    //tap(response => console.log('NgRx: Resposta do C# recebida com sucesso:', response)),
                    map((response) => {
                        const permissions = response?.data || [];
                        return loadUserPermissionsSuccess({ permissions });
                    }),
                    catchError((error) => {
                        // O SEGREDO ESTÁ AQUI: O catchError dentro do pipe interno protege o Effect de morrer!
                        console.error('%c NgRx: Erro crítico detectado DENTRO do Effect:', 'color: #ff0000', error);
                        this.toastService.error('Erro ao carregar permissões de acesso.');
                        return of(loadUserPermissionsFailure({ error: error.message || error }));
                    })
                )
            )
        )
    );
}