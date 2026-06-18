import { Injectable, inject } from "@angular/core";
import {forkJoin, of} from 'rxjs';
import {catchError, map, mergeMap, tap} from 'rxjs/operators';
import { Actions, createEffect, ofType } from "@ngrx/effects";

// Importe o serviço correto de API que manipula as Roles
import { ShortcutService } from "src/app/core/services/shortcut.service";

// Import das actions específicas que criamos para Roles
import {
    fetchShortcutListData,
    fetchShortcutListSuccess,
    fetchShortcutListFailure,
    addShortcut,
    addShortcutSuccess,
    addShortcutFailure,
    updateShortcut,
    updateShortcutSuccess,
    updateShortcutFailure,
    deleteShortcut,
    deleteShortcutSuccess,
    deleteShortcutFailure
} from "./shortcut.action";
import {ToastService} from "../../core/services/toast.service";
import {error} from "jquery";

@Injectable()
export class ShortcutEffects {
    private actions$ = inject(Actions);
    private restApiService = inject(ShortcutService);
    private toastService = inject(ToastService);

    // --- 1. FETCH (BUSCAR LISTA) ---
    fetchShortcutData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fetchShortcutListData),
            mergeMap(() =>
                // Dica: Ajuste para o método real do seu serviço se não for 'getRoleData'
                this.restApiService.getAll().pipe(
                    map((response) => {
                        //console.log('response ', response);
                        // Se a sua API retorna string JSON como no Ecommerce, mantemos o Parse.
                        // Caso já retorne um objeto direto do HttpClient, use: const shortcuts = response.data;
                        const shortcuts = typeof response === 'string' ? JSON.parse(response) : response;
                        return fetchShortcutListSuccess({ shortcuts });
                    }),
                    catchError((error) => of(fetchShortcutListFailure({ error: error.message || error })))
                )
            ),
        ),
    );

    // --- 2. ADD (CRIAR) ---
    addShortcutData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addShortcut),
            mergeMap(({ newData }) =>
                this.restApiService.register(newData).pipe(
                    map((responseData: any) => {
                        // Extrai o 'data' que o .NET enviou (AutoMapper do ShortcutViewModel)
                        // Usamos o fallback caso a propriedade venha direto em algum cenário
                        const shortcutClean = responseData?.data ? responseData.data : responseData;

                        return addShortcutSuccess({ newData: shortcutClean });
                    }),
                    catchError((error) => of(addShortcutFailure({ error: error.message || error })))
                )
            )
        )
    );

    // --- 3. UPDATE (EDITAR) ---
    updateShortcutData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateShortcut),
            mergeMap(({ id, updatedData }) =>
                this.restApiService.update(id, updatedData).pipe(
                    map((responseData: any) => {
                        // Extrai o 'data' que o .NET enviou (ShortcutViewModel atualizado)
                        // Se por acaso a API já retornar o objeto direto, ele usa o fallback
                        const shortcutUpdatedClean = responseData?.data ? responseData.data : responseData;

                        return updateShortcutSuccess({ updatedData: shortcutUpdatedClean });
                    }),
                    catchError((error) => of(updateShortcutFailure({ error: error.message || error })))
                )
            )
        )
    );

    // --- 4. DELETE (REMOVER INDIVIDUAL OU MÚLTIPLO) ---
    deleteShortcutData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteShortcut),
            mergeMap(({ id }) => {

                // Cenário A: Deleção em Lote (Checkboxes)
                if (Array.isArray(id)) {
                    const deleteRequests = id.map(singleId => this.restApiService.delete(singleId));

                    return forkJoin(deleteRequests).pipe(
                        map((responses: any[]) => {
                            // Coleta a mensagem de sucesso da primeira requisição do lote
                            const successMessage = responses[0]?.data || 'Shortcuts successfully deleted.';

                            return deleteShortcutSuccess({ ids: id, message: successMessage });
                        }),
                        catchError((errorResponse) => {
                            const backendErrors = errorResponse.error?.errors;
                            const errorMessage = backendErrors && backendErrors.length > 0
                                ? backendErrors[0]
                                : 'The selected shortcuts could not be deleted.';
                            return of(deleteShortcutFailure({ error: errorMessage }));
                        })
                    );
                }

                // Cenário B: Deleção Individual (Lixeira da linha)
                return this.restApiService.delete(id).pipe(
                    map((response: any) =>
                        // Passa o ID em formato de array e a mensagem real do .NET (response.data)
                        deleteShortcutSuccess({ ids: [id], message: response.data || 'Shortcut successfully deleted.' })
                    ),
                    catchError((errorResponse) => {
                        //console.log('xxx ', errorResponse);
                        const backendErrors = errorResponse?.errors;

                        const errorMessage = backendErrors && backendErrors.length > 0
                            ? backendErrors[0]
                            : 'The shortcut could not be deleted.';
                        return of(deleteShortcutFailure({ error: errorMessage }));
                    })
                );
            })
        )
    );

    deleteShortcutSuccess$ = createEffect(() =>
            this.actions$.pipe(
                ofType(deleteShortcutSuccess),
                tap(({ message }) => {
                    this.toastService.success(message);
                })
            ),
        { dispatch: false }
    );

    deleteShortcutFailure$ = createEffect(() =>
            this.actions$.pipe(
                ofType(deleteShortcutFailure),
                tap(({ error }) => {
                    this.toastService.error(error);
                })
            ),
        { dispatch: false }
    );
}