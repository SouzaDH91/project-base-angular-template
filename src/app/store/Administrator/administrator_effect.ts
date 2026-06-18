import { Injectable, inject } from "@angular/core";
import {forkJoin, of} from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from "@ngrx/effects";

// Importe o serviço correto de API que manipula os administradores
import { AdministratorService } from "src/app/core/services/administrator.service";

// Import das actions específicas que criamos para Administrators
import {
    fetchAdministratorListData,
    fetchAdministratorListSuccess,
    fetchAdministratorListFailure,
    addAdministrator,
    addAdministratorSuccess,
    addAdministratorFailure,
    updateAdministrator,
    updateAdministratorSuccess,
    updateAdministratorFailure,
    deleteAdministrator,
    deleteAdministratorSuccess,
    deleteAdministratorFailure, updateStatusAdministrator, updateStatusAdministratorSuccess,
    updateStatusAdministratorFailure, resetPasswordAdministrator
} from "./administrator.action";

@Injectable()
export class AdministratorEffects {
    private actions$ = inject(Actions);
    private restApiService = inject(AdministratorService);

    // --- 1. FETCH (BUSCAR LISTA) ---
    fetchAdministratorData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fetchAdministratorListData),
            mergeMap(() =>
                // Dica: Ajuste para o método real do seu serviço se não for 'getAdministratorData'
                this.restApiService.getAll().pipe(
                    map((response) => {
                        // Se a sua API retorna string JSON como no Ecommerce, mantemos o Parse.
                        // Caso já retorne um objeto direto do HttpClient, use: const administrators = response.data;
                        const administrators = typeof response === 'string' ? JSON.parse(response) : response;
                        return fetchAdministratorListSuccess({ administrators });
                    }),
                    catchError((error) => of(fetchAdministratorListFailure({ error: error.message || error })))
                )
            ),
        ),
    );

    // --- 2. ADD (CRIAR) ---
    addAdministratorData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addAdministrator),
            mergeMap(({ newData }) =>
                this.restApiService.register(newData).pipe(
                    map((responseData: any) => {
                        // Extrai o 'data' que o .NET enviou (AutoMapper do ApplicationUserViewModel)
                        // Usamos o fallback caso a propriedade venha direto em algum cenário
                        const userClean = responseData?.data ? responseData.data : responseData;

                        return addAdministratorSuccess({ newData: userClean });
                    }),
                    catchError((error) => of(addAdministratorFailure({ error: error.message || error })))
                )
            )
        )
    );

    // --- 3. UPDATE (EDITAR) ---
    updateAdministratorData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateAdministrator),
            mergeMap(({ id, updatedData }) =>
                this.restApiService.update(id, updatedData).pipe(
                    map((responseData: any) => {
                        // Extrai o 'data' que o .NET enviou (ApplicationUserViewModel atualizado)
                        // Se por acaso a API já retornar o objeto direto, ele usa o fallback
                        const userUpdatedClean = responseData?.data ? responseData.data : responseData;

                        return updateAdministratorSuccess({ updatedData: userUpdatedClean });
                    }),
                    catchError((error) => of(updateAdministratorFailure({ error: error.message || error })))
                )
            )
        )
    );

    updateStatusAdministratorData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateStatusAdministrator),
            mergeMap(({ userId }) =>
                this.restApiService.updateStatus(userId).pipe(
                    map((responseData: any) => {
                        // Extrai o 'data' que o .NET enviou (ApplicationUserViewModel atualizado)
                        // Se por acaso a API já retornar o objeto direto, ele usa o fallback
                        const userUpdatedClean = responseData?.data ? responseData.data : responseData;

                        return updateStatusAdministratorSuccess({ userId, message: userUpdatedClean });
                    }),
                    catchError((error) => of(updateStatusAdministratorFailure({ error: error.message || error })))
                )
            )
        )
    );

    resetPasswordAdministratorData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(resetPasswordAdministrator),
            mergeMap(({ userId }) =>
                this.restApiService.resetPassword(userId).pipe(
                    map((responseData: any) => {
                        // Extrai o 'data' que o .NET enviou (ApplicationUserViewModel atualizado)
                        // Se por acaso a API já retornar o objeto direto, ele usa o fallback
                        const userUpdatedClean = responseData?.data ? responseData.data : responseData;

                        return updateStatusAdministratorSuccess({ userId, message: userUpdatedClean });
                    }),
                    catchError((error) => of(updateStatusAdministratorFailure({ error: error.message || error })))
                )
            )
        )
    );

    // --- 4. DELETE (REMOVER INDIVIDUAL OU MÚLTIPLO) ---
    deleteAdministratorData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteAdministrator),
            mergeMap(({ id }) => {
                // Cenário A: Deleção em Lote (Array de IDs vindo dos Checkboxes)
                if (Array.isArray(id)) {
                    // Cria um array de requisições HTTP, uma para cada ID selecionado
                    const deleteRequests = id.map(singleId => this.restApiService.delete(singleId));

                    // Executa todas em paralelo no .NET e aguarda a conclusão de todas
                    return forkJoin(deleteRequests).pipe(
                        map(() => deleteAdministratorSuccess({ id })),
                        catchError((error) => of(deleteAdministratorFailure({ error: error.message || error })))
                    );
                }

                // Cenário B: Deleção Individual (Clique no botão de lixeira da linha)
                return this.restApiService.delete(id).pipe(
                    map(() => deleteAdministratorSuccess({ id })),
                    catchError((error) => of(deleteAdministratorFailure({ error: error.message || error })))
                );
            })
        )
    );
}