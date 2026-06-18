import { Injectable, inject } from "@angular/core";
import {forkJoin, of} from 'rxjs';
import {catchError, map, mergeMap, tap} from 'rxjs/operators';
import { Actions, createEffect, ofType } from "@ngrx/effects";

// Importe o serviço correto de API que manipula as Roles
import { RoleService } from "src/app/core/services/role.service";

// Import das actions específicas que criamos para Roles
import {
    fetchRoleListData,
    fetchRoleListSuccess,
    fetchRoleListFailure,
    addRole,
    addRoleSuccess,
    addRoleFailure,
    updateRole,
    updateRoleSuccess,
    updateRoleFailure,
    deleteRole,
    deleteRoleSuccess,
    deleteRoleFailure
} from "./role.action";
import {ToastService} from "../../core/services/toast.service";
import {error} from "jquery";

@Injectable()
export class RoleEffects {
    private actions$ = inject(Actions);
    private restApiService = inject(RoleService);
    private toastService = inject(ToastService);

    // --- 1. FETCH (BUSCAR LISTA) ---
    fetchRoleData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fetchRoleListData),
            mergeMap(() =>
                // Dica: Ajuste para o método real do seu serviço se não for 'getRoleData'
                this.restApiService.getAll().pipe(
                    map((response) => {
                        //console.log('response ', response);
                        // Se a sua API retorna string JSON como no Ecommerce, mantemos o Parse.
                        // Caso já retorne um objeto direto do HttpClient, use: const roles = response.data;
                        const roles = typeof response === 'string' ? JSON.parse(response) : response;
                        return fetchRoleListSuccess({ roles });
                    }),
                    catchError((error) => of(fetchRoleListFailure({ error: error.message || error })))
                )
            ),
        ),
    );

    // --- 2. ADD (CRIAR) ---
    addRoleData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addRole),
            mergeMap(({ newData }) =>
                this.restApiService.register(newData).pipe(
                    map((responseData: any) => {
                        // Extrai o 'data' que o .NET enviou (AutoMapper do RoleViewModel)
                        // Usamos o fallback caso a propriedade venha direto em algum cenário
                        const roleClean = responseData?.data ? responseData.data : responseData;

                        return addRoleSuccess({ newData: roleClean });
                    }),
                    catchError((error) => of(addRoleFailure({ error: error.message || error })))
                )
            )
        )
    );

    // --- 3. UPDATE (EDITAR) ---
    updateRoleData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateRole),
            mergeMap(({ id, updatedData }) =>
                this.restApiService.update(id, updatedData).pipe(
                    map((responseData: any) => {
                        // Extrai o 'data' que o .NET enviou (RoleViewModel atualizado)
                        // Se por acaso a API já retornar o objeto direto, ele usa o fallback
                        const roleUpdatedClean = responseData?.data ? responseData.data : responseData;

                        return updateRoleSuccess({ updatedData: roleUpdatedClean });
                    }),
                    catchError((error) => of(updateRoleFailure({ error: error.message || error })))
                )
            )
        )
    );

    // --- 4. DELETE (REMOVER INDIVIDUAL OU MÚLTIPLO) ---
    deleteRoleData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteRole),
            mergeMap(({ id }) => {

                // Cenário A: Deleção em Lote (Checkboxes)
                if (Array.isArray(id)) {
                    const deleteRequests = id.map(singleId => this.restApiService.delete(singleId));

                    return forkJoin(deleteRequests).pipe(
                        map((responses: any[]) => {
                            // Coleta a mensagem de sucesso da primeira requisição do lote
                            const successMessage = responses[0]?.data || 'Roles successfully deleted.';

                            return deleteRoleSuccess({ ids: id, message: successMessage });
                        }),
                        catchError((errorResponse) => {
                            const backendErrors = errorResponse.error?.errors;
                            const errorMessage = backendErrors && backendErrors.length > 0
                                ? backendErrors[0]
                                : 'The selected roles could not be deleted.';
                            return of(deleteRoleFailure({ error: errorMessage }));
                        })
                    );
                }

                // Cenário B: Deleção Individual (Lixeira da linha)
                return this.restApiService.delete(id).pipe(
                    map((response: any) =>
                        // Passa o ID em formato de array e a mensagem real do .NET (response.data)
                        deleteRoleSuccess({ ids: [id], message: response.data || 'Role successfully deleted.' })
                    ),
                    catchError((errorResponse) => {
                        //console.log('xxx ', errorResponse);
                        const backendErrors = errorResponse?.errors;

                        const errorMessage = backendErrors && backendErrors.length > 0
                            ? backendErrors[0]
                            : 'The role could not be deleted.';
                        return of(deleteRoleFailure({ error: errorMessage }));
                    })
                );
            })
        )
    );

    deleteRoleSuccess$ = createEffect(() =>
            this.actions$.pipe(
                ofType(deleteRoleSuccess),
                tap(({ message }) => {
                    this.toastService.success(message);
                })
            ),
        { dispatch: false }
    );

    deleteRoleFailure$ = createEffect(() =>
            this.actions$.pipe(
                ofType(deleteRoleFailure),
                tap(({ error }) => {
                    this.toastService.error(error);
                })
            ),
        { dispatch: false }
    );
}